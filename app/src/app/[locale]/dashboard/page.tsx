"use client";

import { useGamification } from '@/context/GamificationContext';
import { StreakCalendar } from '@/components/gamification/StreakCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContentService, Course } from '@/lib/content';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';

export default function DashboardPage() {
  const { xp, level, streak, achievements, refreshUser, completedLessons } = useGamification();
  const [courses, setCourses] = useState<Course[]>([]);
  
  useEffect(() => {
    // Refresh user data on dashboard mount to ensure we have latest profile info
    refreshUser?.();
  }, []);

  useEffect(() => {
      // In a client component, we should ideally fetch via an API route to not expose DB logic,
      // OR since ContentService is updated to use Mongoose, we can't call it directly in client component.
      // We need a lightweight fetch. For MVP, let's assume we can fetch course metadata via API or pass from server component.
      // Actually, let's just make this a Client Component that fetches via the existing /api/courses route? 
      // We haven't built /api/courses yet. Let's do it right:
      // We will assume a `fetch('/api/courses')` works or we pass data from a Server Component wrapper.
      // But for now, to move fast, I will fetch via a new API route I'll create.
      
      fetch('/api/courses').then(res => res.json()).then(data => setCourses(data.courses)).catch(console.error);
  }, []);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats */}
        <div className="space-y-8">
            <Card className="bg-[#0A0A0F] border-[#2E2E36]">
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#9945FF] to-[#14F195] p-1 mb-4">
                        <div className="w-full h-full rounded-full bg-[#0A0A0F] flex items-center justify-center text-3xl">
                            👨‍🚀
                        </div>
                    </div>
                    <h2 className="text-xl font-bold">Solanaut</h2>
                    <div className="text-gray-400">Level {level}</div>
                    
                    <div className="grid grid-cols-2 gap-4 w-full mt-6">
                         <div className="text-center p-3 bg-[#1E1E24] rounded-lg">
                             <div className="text-2xl font-bold text-[#9945FF]">{xp}</div>
                             <div className="text-xs uppercase text-gray-500">Total XP</div>
                         </div>
                         <div className="text-center p-3 bg-[#1E1E24] rounded-lg">
                             <div className="text-2xl font-bold text-yellow-500">{achievements.length}</div>
                             <div className="text-xs uppercase text-gray-500">Badges</div>
                         </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#0A0A0F] border-[#2E2E36]">
                 <CardContent className="pt-6">
                    <StreakCalendar streak={streak} />
                 </CardContent>
            </Card>
        </div>

        {/* Right Column: Progress */}
        <div className="lg:col-span-2 space-y-8">
            <h1 className="text-3xl font-bold">My Courses</h1>
            
            <div className="grid md:grid-cols-2 gap-4">
                {courses.length > 0 ? courses.map(course => {
                    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
                    // This is an approximation. Ideally we check specific lesson IDs of this course.
                    // But since we don't have the full tree of IDs easily without iterating, we'll iterate.
                    let completedCount = 0;
                    course.modules.forEach(m => {
                        m.lessons.forEach(l => {
                            if (completedLessons.includes(l.id)) {
                                completedCount++;
                            }
                        });
                    });

                    const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

                    return (
                        <Link href={`/courses/${course.slug}`} key={course.id}>
                            <Card className="bg-[#0A0A0F] border-[#2E2E36] hover:border-[#9945FF] transition-colors cursor-pointer group">
                                 <CardHeader>
                                     <CardTitle className="group-hover:text-[#9945FF] transition-colors">{course.title}</CardTitle>
                                 </CardHeader>
                                 <CardContent>
                                     <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                                     <div className="w-full bg-[#1E1E24] h-2 rounded-full overflow-hidden">
                                         <div className="bg-[#14F195] h-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                     </div>
                                     <div className="flex justify-between text-xs text-gray-500 mt-2">
                                         <span>{percent}% Complete</span>
                                         <span>{percent === 100 ? "Completed" : "Continue"} →</span>
                                     </div>
                                 </CardContent>
                            </Card>
                        </Link>
                    );
                }) : (
                    <div className="text-gray-500 col-span-2 text-center py-12">Loading courses...</div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
