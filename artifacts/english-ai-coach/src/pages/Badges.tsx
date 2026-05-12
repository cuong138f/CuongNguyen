import { useListBadges } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Badges() {
  const { data: badges, isLoading } = useListBadges();

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="text-muted-foreground mt-2">Earn badges as you progress in your learning journey.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading ? (
          [...Array(10)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
        ) : (
          badges?.map((badge) => (
            <Card key={badge.id} className={`text-center transition-all ${badge.isEarned ? 'border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'opacity-60 grayscale'}`}>
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <div className="text-4xl mb-4" dangerouslySetInnerHTML={{ __html: badge.icon }} />
                <h3 className="font-bold text-sm mb-1">{badge.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
                {badge.isEarned && badge.earnedAt && (
                  <p className="text-[10px] text-primary mt-3 font-medium">
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
