"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { LessonWorkspace } from '@/components/lesson/LessonWorkspace';
import { QuizWorkspace } from '@/components/lesson/QuizWorkspace';
import { ChevronLeft, CheckCircle, Loader2, Menu, X, PlayCircle, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useGamification } from '@/context/GamificationContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { ProgressService } from '@/services/progress';
import { SolanaService } from '@/services/solana';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../../../../components/ui/sheet";
import { ScrollArea } from '../../../../../../components/ui/scroll-area';
import { VideoPlayer } from '@/components/lesson/VideoPlayer';

// Define minimal types for component props (Client Component needs this)
interface LessonData {
  id: string;
  title: string;
  slug: string;
  type: 'video' | 'text' | 'challenge' | 'quiz';
  content: string;
  videoUrl?: string; // YouTube/Arweave/etc
  xp: number;
  initialCode?: string;
  testCode?: string;
  questions?: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

interface CourseData {
  title: string;
  slug: string;
  modules: {
      title: string;
      lessons: LessonData[]
  }[];
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { addXP, completedLessons, refreshUser } = useGamification(); 
  const { connected, publicKey: walletPublicKey } = useWallet(); 

  const [course, setCourse] = useState<CourseData | null>(null);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check completion status against global state
  useEffect(() => {
    if (lesson && completedLessons.includes(lesson.id)) {
        setIsCompleted(true);
    }
  }, [lesson, completedLessons]);

  useEffect(() => {
    if (!params.slug || !params.id) return;

    setLoading(true);
    fetch(`/api/courses/${params.slug}/lessons/${params.id}`)
      .then(res => {
          if (!res.ok) throw new Error("Failed to fetch lesson");
          return res.json();
      })
      .then(data => {
          setCourse(data.course);
          setLesson(data.lesson);
      })
      .catch(err => {
          console.error(err);
          toast.error("Failed to load lesson content");
      })
      .finally(() => setLoading(false));
  }, [params.slug, params.id]);

  const getNavigation = () => {
      if (!course || !lesson) return { prev: null, next: null };
      
      const allLessons: LessonData[] = course.modules.flatMap(m => m.lessons);
      const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
      
      return {
          prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
          next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
      };
  };

  const { prev, next } = getNavigation();

  const handleComplete = async () => {
    if (!lesson || !walletPublicKey || isCompleted) return;
    
    setCompleting(true);
    try {
        await ProgressService.completeLesson(walletPublicKey.toString(), lesson.id, lesson.xp);
        addXP(lesson.xp); 
        await refreshUser(); // Update global state
        setIsCompleted(true);
        toast.success(`Lesson completed! +${lesson.xp} XP`);
        
        if (next && course) {
            setTimeout(() => {
                router.push(`/courses/${course.slug}/lessons/${next.id}`);
            }, 1000);
        } else if (course) {
             toast.success("Course Completed! Minting Credential...");
             // Fire and forget credential minting
             SolanaService.mintCredential(walletPublicKey.toString(), course.title, course.slug)
                .then(sig => {
                    if (sig) toast.success("Credential Minted on Solana!", { description: "Check your wallet" });
                });

             setTimeout(() => {
                router.push(`/courses`); 
             }, 2500);
        }
    } catch (error) {
        console.error(error);
        toast.error("Failed to complete lesson");
    } finally {
        setCompleting(false);
    }
  };

  if (loading) {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-[#0A0A0F]">
              <Loader2 className="h-8 w-8 animate-spin text-[#9945FF]" />
          </div>
      );
  }

  if (!lesson || !course) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0A0A0F] text-white">
              <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
              <Button asChild>
                  <Link href="/courses">Back to Courses</Link>
              </Button>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        {/* Header */}
        <div className="flex-none h-14 border-b border-[#2E2E36] flex items-center px-4 justify-between bg-[#0A0A0F]">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="text-gray-400 hover:text-white mr-2">
                    <Link href={`/courses/${course.slug}`}>
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                
                <Sheet>
                    <SheetTrigger asChild>
                         <Button variant="outline" size="sm" className="hidden md:flex gap-2 border-[#2E2E36] bg-[#1E1E24] hover:bg-[#2E2E36] text-gray-300">
                             <Menu className="h-4 w-4" />
                             <span className="truncate max-w-[200px]">{lesson.title}</span>
                         </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-[#0A0A0F] border-r border-[#2E2E36] p-0 w-[300px]">
                        <SheetHeader className="p-4 border-b border-[#2E2E36]">
                            <SheetTitle className="text-white text-left">{course.title}</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100vh-80px)]">
                            <div className="p-4 space-y-6">
                                {course.modules.map((module, i) => (
                                    <div key={i} className="space-y-2">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">{module.title}</h3>
                                        <div className="space-y-1">
                                            {module.lessons.map((l) => (
                                                <Link 
                                                    key={l.id} 
                                                    href={`/courses/${course.slug}/lessons/${l.id}`}
                                                    className={cn(
                                                        "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors",
                                                        l.id === lesson.id 
                                                            ? "bg-[#9945FF]/10 text-[#9945FF] font-medium" 
                                                            : "text-gray-400 hover:bg-[#1E1E24] hover:text-white"
                                                    )}
                                                >
                                                    {l.id === lesson.id ? <PlayCircle className="h-4 w-4" /> : <div className="w-4" />} 
                                                    <span className="truncate">{l.title}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
                
                {/* Mobile Title */}
                <span className="md:hidden font-semibold text-sm truncate max-w-[150px]">{lesson.title}</span>
            </div>

             <div className="flex items-center gap-2">
                 {prev && (
                     <Button variant="ghost" size="sm" asChild className="hidden md:flex text-gray-400 hover:text-white">
                         <Link href={`/courses/${course.slug}/lessons/${prev.id}`}>
                             <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                         </Link>
                     </Button>
                 )}

                 <div className="hidden md:flex text-xs font-bold text-[#14F195] bg-[#14F195]/10 px-3 py-1 rounded-full uppercase tracking-wider mx-2">
                    {lesson.xp} XP
                </div>
                
                {['text', 'video'].includes(lesson.type) ? (
                    !isCompleted ? (
                        <Button 
                            size="sm" 
                            onClick={handleComplete} 
                            disabled={completing}
                            className="bg-[#14F195] text-black hover:bg-[#10c479]"
                        >
                            {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark Complete"}
                        </Button>
                    ) : (
                        <Button size="sm" variant="ghost" disabled className="text-[#14F195] bg-[#14F195]/10 border border-[#14F195]/20">
                            <CheckCircle className="h-4 w-4 mr-2" /> Completed
                        </Button>
                    )
                ) : null}

                {next && (
                     <Button variant="ghost" size="sm" asChild className="text-gray-400 hover:text-white ml-2">
                         <Link href={`/courses/${course.slug}/lessons/${next.id}`}>
                              Next <ChevronLeft className="h-4 w-4 ml-1 rotate-180" />
                         </Link>
                     </Button>
                 )}
            </div>
        </div>

        <div className="flex-grow flex overflow-hidden">
            {/* Sidebar (Desktop Persistent) - Optional based on user request "always dropped down", 
                but using Sheet for "pull up when I want" (Toggle). 
                To make it "Always showing", we can add a persistent sidebar column on large screens. 
            */}
             
             {/* Content Panel */}
            <div className={`
                ${lesson.type === 'challenge' || lesson.type === 'quiz' ? 'w-full md:w-1/2 lg:w-[40%]' : 'w-full max-w-4xl mx-auto'} 
                border-r border-[#2E2E36] overflow-y-auto bg-[#0A0A0F] custom-scrollbar
            `}>
                <div className="p-8 pb-20">
                    <h2 className="text-3xl font-bold mb-6 text-white">{lesson.title}</h2>
                    
                    {lesson.type === 'video' && lesson.videoUrl && (
                        <div className="mb-8">
                            <VideoPlayer url={lesson.videoUrl} onEnded={() => !isCompleted && handleComplete()} />
                        </div>
                    )}

                    <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-a:text-[#9945FF] prose-code:text-[#14F195] max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {lesson.content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>

            {/* Workspace Panel (only for interactive types) */}
            {(lesson.type === 'challenge' || lesson.type === 'quiz') && (
                <div className="hidden md:flex flex-col w-1/2 lg:w-[60%] bg-[#0A0A0F] h-full border-l border-[#2E2E36]">
                     {lesson.type === 'challenge' ? (
                        <LessonWorkspace 
                            initialCode={lesson.initialCode || ''} 
                            testCode={lesson.testCode || ''}
                            onSuccess={handleComplete}
                            lessonTitle={lesson.title}
                            lessonContent={lesson.content}
                        />
                    ) : lesson.type === 'quiz' ? (
                        <div className="h-full">
                            <QuizWorkspace 
                                questions={lesson.questions || []}
                                onComplete={() => handleComplete()}
                            />
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    </div>
  );
}


