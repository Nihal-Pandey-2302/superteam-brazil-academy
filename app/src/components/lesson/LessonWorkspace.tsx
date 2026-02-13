'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { EditorSkeleton } from '@/components/editor/EditorSkeleton';
// Lazy load CodeEditor
const CodeEditor = dynamic(() => import('@/components/editor/CodeEditor').then(mod => mod.CodeEditor), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});
import { Button } from '@/components/ui/button';
import { runCode, ExecutionResult } from '@/lib/runner';
import { Play, Loader2, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIAssistant } from './AIAssistant';

interface LessonWorkspaceProps {
  initialCode: string;
  testCode: string;
  onSuccess?: () => void;
}

export function LessonWorkspace({ initialCode, testCode, onSuccess, lessonTitle = "", lessonContent = "" }: LessonWorkspaceProps & { lessonTitle?: string, lessonContent?: string }) {
  const [code, setCode] = useState(initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [showAI, setShowAI] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      // In a real implementation, we would get transpiled code from Monaco worker to save bandwidth
      // But our runner handles transpilation for now.
      const result = await runCode(code, testCode);
      setOutput(result);
      
      // Check if all tests passed
      const allPassed = result.tests && result.tests.length > 0 && result.tests.every(t => t.passed);
      if (allPassed && onSuccess) {
          onSuccess();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
       {/* Toolbar */}
       <div className="flex items-center justify-between border-b border-[#2E2E36] bg-[#0A0A0F] p-4">
         <div className="text-sm text-gray-400">main.ts</div>
         <div className="flex gap-2">
           <Button 
             variant={showAI ? "secondary" : "ghost"}
             size="sm"
             onClick={() => setShowAI(!showAI)}
             className={cn("mr-2", showAI ? "bg-[#9945FF]/10 text-[#9945FF]" : "text-gray-400 hover:text-white")}
           >
             <Sparkles className="mr-2 h-4 w-4" />
             AI Helper
           </Button>
           <Button 
             variant="default" 
             size="sm" 
             onClick={handleRun} 
             disabled={isRunning}
             className="bg-green-600 hover:bg-green-700 text-white"
            >
             {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
             Run Code
           </Button>
         </div>
       </div>

       {/* Editor & Output Split */}
       <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
         {/* Editor */}
         <div className={cn("border-r border-[#2E2E36] transition-all", showAI ? "w-full md:w-1/3" : "w-full md:w-1/2")}>
            <CodeEditor 
                code={code} 
                onChange={(val) => setCode(val || '')} 
                language="typescript" 
            />
         </div>

         {/* Output Panel (Hidden on mobile if AI is open, or stacked? keeping it simple for now) */}
         <div className={cn("flex flex-col bg-[#0A0A0F] transition-all", showAI ? "w-full md:w-1/3" : "w-full md:w-1/2")}>
            <div className="flex-none border-b border-[#2E2E36] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Console Output
            </div>
            <div className="flex-grow overflow-auto p-4 font-mono text-sm text-gray-300">
                {output?.logs.map((log, i) => (
                    <div key={i} className="mb-1 border-b border-gray-800 pb-1 last:border-0">{log}</div>
                ))}
                {!output && <div className="text-gray-600 italic">Run code to see output...</div>}
                
                {output?.error && (
                    <div className="mt-4 text-red-500 font-bold">
                        Error: {output.error}
                    </div>
                )}
            </div>

            {/* Test Results */}
             <div className="flex-none border-t border-[#2E2E36] bg-[#0F0F14] p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Tests</div>
                {output?.tests?.map((test, i) => (
                    <div key={i} className={cn("flex items-center gap-2 text-sm", test.passed ? "text-green-500" : "text-red-500")}>
                        {test.passed ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <span>{test.message}</span>
                    </div>
                ))}
                 {!output?.tests && <div className="text-gray-600 text-sm">No tests run.</div>}
            </div>
         </div>

         {/* AI Panel */}
         {showAI && (
             <div className="w-full md:w-1/3 h-full absolute right-0 top-0 md:static z-10 md:z-0">
                 <AIAssistant 
                    code={code} 
                    lessonContext={lessonTitle}
                    lessonContent={lessonContent}
                 />
             </div>
         )}
       </div>
    </div>
  );
}
