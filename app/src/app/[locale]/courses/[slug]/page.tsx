import { ContentService } from '@/lib/content';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from '@/i18n/routing';
import { StartLearningButton } from '@/components/course/StartLearningButton';
import { CheckCircle, PlayCircle, Lock } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await ContentService.getCourseBySlug(slug);

  if (!course) {
    return {
      title: 'Course Not Found',
    };
  }

  return {
    title: `${course.title} | Superteam Academy`,
    description: course.description,
    openGraph: {
      images: course.image ? [course.image] : [],
    },
  };
}

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  if (!slug) notFound();
  const course = await ContentService.getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Cover Image */}
          <div className="w-full md:w-1/3 aspect-video relative rounded-lg overflow-hidden bg-gray-900 border border-[#2E2E36]">
               {course.image ? (
                   <Image 
                       src={course.image} 
                       alt={course.title} 
                       fill
                       className="object-cover"
                       sizes="(max-width: 768px) 100vw, 33vw"
                       priority
                   />
               ) : (
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] to-transparent opacity-60" />
               )}
          </div>

          {/* Details */}
          <div className="flex-1">
              <div className="flex gap-2 mb-4">
                  {course.tags?.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
              </div>
              <h1 className="text-4xl font-bold mb-4 text-white">{course.title}</h1>
              <p className="text-gray-400 text-lg mb-6">{course.description}</p>
              
              <div className="flex items-center gap-6 mb-8 text-sm text-gray-500">
                  <span>{course.difficulty}</span>
                  <span>{course.duration}</span>
                  <div className="flex items-center gap-2">
                       {/* Avatar */}
                       <span>By Superteam</span>
                  </div>
              </div>

              <StartLearningButton 
                 courseSlug={course.slug} 
                 firstLessonId={course.modules[0]?.lessons[0]?.id || 'intro'} 
              />
          </div>
      </div>

      {/* Curriculum */}
      <div className="max-w-3xl">
          <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
          <Accordion type="single" collapsible className="w-full" defaultValue={course.modules[0]?.id || ""}>
              {course.modules.length === 0 && <div className="text-gray-500 italic">No modules available yet.</div>}
              {course.modules.map((module, index) => (
                  <AccordionItem key={module.id || `module-${index}`} value={module.id || `module-${index}`} className="border-[#2E2E36] mb-4 overflow-hidden rounded-lg border">
                      <AccordionTrigger className="px-6 bg-[#16161c] hover:no-underline hover:bg-[#1E1E24]">
                          <span className="font-semibold">{index + 1}. {module.title}</span>
                          <span className="text-xs text-gray-500 ml-auto mr-4">{module.lessons.length} lessons</span>
                      </AccordionTrigger>
                      <AccordionContent className="bg-[#0A0A0F px-0 pb-0">
                          {module.lessons.map(lesson => (
                              <Link 
                                key={lesson.id} 
                                href={`/courses/${course.slug}/lessons/${lesson.id}`}
                                className="flex items-center gap-3 p-4 hover:bg-[#1E1E24] border-t border-[#2E2E36] transition-colors"
                              >
                                  <PlayCircle className="h-4 w-4 text-[#9945FF]" />
                                  <span className="text-gray-300">{lesson.title}</span>
                                  <div className="ml-auto text-xs text-gray-500 bg-[#2E2E36] px-2 py-1 rounded">
                                      {lesson.type} • {lesson.xp} XP
                                  </div>
                              </Link>
                          ))}
                      </AccordionContent>
                  </AccordionItem>
              ))}
          </Accordion>
      </div>
    </div>
  );
}
