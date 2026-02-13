import { Course } from '@/lib/content';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, BarChart } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface CourseCardProps {
  course: Course;
  priority?: boolean;
}

export function CourseCard({ course, priority = false }: CourseCardProps) {
  return (
    <Card className="flex flex-col h-full hover:border-[#9945FF]/50 transition-colors">
      <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-900 relative">
        {course.image ? (
            <Image 
                src={course.image} 
                alt={course.title} 
                fill
                priority={priority}
                className="object-cover transition-transform hover:scale-105 duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        ) : (
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] to-transparent opacity-60" />
        )}
        <div className="absolute bottom-4 left-4 right-4">
             <h3 className="text-xl font-bold text-white mb-2 drop-shadow-md">{course.title}</h3>
             <div className="flex gap-2">
                 {course.tags?.map(tag => (
                     <Badge key={tag} variant="secondary" className="text-xs backdrop-blur-sm bg-black/50">{tag}</Badge>
                 ))}
             </div>
        </div>
      </div>
      <CardContent className="flex-grow pt-4">
        <p className="text-gray-400 text-sm line-clamp-2">{course.description}</p>
        
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
                <BarChart className="h-3 w-3" />
                <span>{course.difficulty}</span>
            </div>
            <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{course.duration}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="default">
          <Link href={`/courses/${course.slug}`}>
            Start Learning
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
