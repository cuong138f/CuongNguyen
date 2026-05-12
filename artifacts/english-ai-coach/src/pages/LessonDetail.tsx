import { useGetLesson } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function LessonDetail() {
  const { id } = useParams();
  const { data: lesson, isLoading } = useGetLesson(Number(id), { 
    query: { enabled: !!id } 
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-12 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!lesson) {
    return <div className="p-12 text-center">Lesson not found.</div>;
  }

  return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto">
      <Link href="/lessons">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Lessons
        </Button>
      </Link>

      <header className="mb-8">
        <div className="text-6xl mb-4">{lesson.coverEmoji || '📚'}</div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">{lesson.title}</h1>
        <p className="text-xl text-muted-foreground">{lesson.description}</p>
      </header>

      <div className="prose prose-invert max-w-none mb-12">
        {lesson.content}
      </div>

      <div className="bg-card border rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to test your knowledge?</h2>
        <Button size="lg" className="w-full md:w-auto">Start Exercises</Button>
      </div>
    </div>
  );
}
