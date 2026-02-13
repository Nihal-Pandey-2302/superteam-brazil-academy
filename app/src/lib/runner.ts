export interface TestResult {
  passed: boolean;
  message: string;
}

export interface ExecutionResult {
  logs: string[];
  error?: string;
  tests?: TestResult[];
}

export async function runCode(code: string, testCode?: string): Promise<ExecutionResult> {
  const logs: string[] = [];
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  try {
    // Capture logs
    console.log = (...args) => {
      logs.push(args.map(arg => String(arg)).join(' '));
    };
    console.error = (...args) => {
      logs.push(`Error: ${args.map(arg => String(arg)).join(' ')}`);
    };

    // Very basic TS -> JS transform (removing types) if we don't have full compiler
    // In a real app, we'd use swc-wasm or babel here. 
    // For now, assuming standard JS/TS that modern browsers might parse or simple strip.
    // Actually, we need transpilation.
    // We will assume the code passed here is ALREADY transpiled by Monaco or a helper.
    // BUT, the runner needs to handle it.
    
    // Changing approach: The runner will receive TS, but we will use a dynamic import of typescript to transpile.
    const ts = (await import('typescript')).default;
    const js = ts.transpile(code, { 
        target: ts.ScriptTarget.ES2020, 
        module: ts.ModuleKind.CommonJS 
    });

    // Create a function to run the code
    // We inject a mock 'require' if needed for imports, but for now we assume standalone logic.
    // We can inject 'expect' for tests.
    
    const context = {};
    
    // Execute user code
    // eslint-disable-next-line no-new-func
    new Function('console', 'require', js)(console, () => ({}));

    // Execute tests if provided
    const testResults: TestResult[] = [];
    if (testCode) {
        // Simple assertion logic
        const expect = (actual: any) => ({
            toBe: (expected: any) => {
                if (actual !== expected) throw new Error(`Expected ${expected} but got ${actual}`);
            },
            toBeTruthy: () => {
                if (!actual) throw new Error(`Expected truthy but got ${actual}`);
            }
        });

        // Wrap test code
        const testJs = ts.transpile(testCode, { target: ts.ScriptTarget.ES2020 });
        
        try {
            // eslint-disable-next-line no-new-func
            new Function('console', 'expect', testJs)(console, expect);
             testResults.push({ passed: true, message: "Test passed" });
        } catch (e: any) {
            testResults.push({ passed: false, message: e.message });
        }
    }

    return { logs, tests: testResults };
  } catch (err: any) {
    return { logs, error: err.message };
  } finally {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  }
}
