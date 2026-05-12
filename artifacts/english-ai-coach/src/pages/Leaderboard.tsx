import { useGetLeaderboard } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Flame } from "lucide-react";

export default function Leaderboard() {
  const { data: allTime, isLoading: isAllTimeLoading } = useGetLeaderboard({ period: 'alltime' });
  const { data: weekly, isLoading: isWeeklyLoading } = useGetLeaderboard({ period: 'weekly' });

  const renderList = (entries: typeof allTime, isLoading: boolean) => {
    if (isLoading) {
      return [...Array(10)].map((_, i) => <Skeleton key={i} className="h-16 w-full mb-2" />);
    }

    if (!entries?.length) {
      return <div className="text-center py-12 text-muted-foreground">No ranking data available.</div>;
    }

    return (
      <div className="space-y-2">
        {entries.map((entry) => (
          <div 
            key={entry.userId} 
            className={`flex items-center p-4 rounded-xl ${entry.isCurrentUser ? 'bg-primary/20 border border-primary/30' : 'bg-card'}`}
          >
            <div className="w-8 font-bold text-lg text-muted-foreground flex justify-center mr-4">
              {entry.rank === 1 ? <Trophy className="text-yellow-500" /> : 
               entry.rank === 2 ? <Medal className="text-gray-400" /> :
               entry.rank === 3 ? <Medal className="text-amber-700" /> :
               entry.rank}
            </div>
            
            <Avatar className="h-10 w-10 mr-4">
              <AvatarImage src={entry.avatarUrl || ''} />
              <AvatarFallback>{entry.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="font-semibold flex items-center gap-2">
                {entry.displayName} 
                {entry.isCurrentUser && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">You</span>}
              </div>
              <div className="text-xs text-muted-foreground">Level {entry.level}</div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="font-bold">{entry.xp} XP</div>
              </div>
              <div className="flex items-center gap-1 text-orange-500 w-12 justify-end">
                <Flame className="w-4 h-4" /> {entry.streak}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground mt-2">Compete with other learners and climb the ranks.</p>
      </header>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="mb-6 w-full grid grid-cols-2">
          <TabsTrigger value="weekly">This Week</TabsTrigger>
          <TabsTrigger value="alltime">All Time</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly">
          {renderList(weekly, isWeeklyLoading)}
        </TabsContent>
        <TabsContent value="alltime">
          {renderList(allTime, isAllTimeLoading)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
