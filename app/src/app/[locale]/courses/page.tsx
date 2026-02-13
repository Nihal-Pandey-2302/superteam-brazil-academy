import { ContentService, Course } from '@/lib/content';
import { CourseCard } from '@/components/course/CourseCard';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Courses - Superteam Academy',
  description: 'Explore our comprehensive Solana development courses.',
};

export default async function CoursesPage() {
  const courses = await ContentService.getCourses();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-[#14F195]">Explore Courses</h1>
        <p className="text-gray-400">Master Solana development with our curated learning paths.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <CourseCard key={course.id} course={course} priority={index < 2} />
        ))}
      </div>
    </div>
  );
}
