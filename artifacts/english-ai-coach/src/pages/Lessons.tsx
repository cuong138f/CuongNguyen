import { useListLessons } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Star, Clock } from "lucide-react";

export default function Lessons() {
  const { data: lessons, isLoading } = useListLessons();

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Lessons</h1>
        <p className="text-muted-foreground mt-2">Structured curriculum to level up your English.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)
        ) : (
          lessons?.map((lesson) => (
            <Card key={lesson.id} className={`flex flex-col ${lesson.isCompleted ? 'border-primary/50 bg-primary/5' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="text-4xl mb-2">{lesson.coverEmoji || '📚'}</div>
                  {lesson.isCompleted && (
                    <div className="bg-primary/20 text-primary text-xs px-2 py-1 rounded font-medium">
                      Completed
                    </div>
                  )}
                </div>
                <CardTitle className="line-clamp-1">{lesson.title}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{lesson.description}</p>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" /> {lesson.xpReward} XP</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {lesson.estimatedMinutes} min</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/lessons/${lesson.id}`} className="w-full">
                  <Button className="w-full" variant={lesson.isCompleted ? "secondary" : "default"}>
                    {lesson.isCompleted ? 'Review Lesson' : 'Start Lesson'}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
