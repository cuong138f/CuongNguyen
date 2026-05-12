import { useGetDashboardSummary, useGetMyActivity, useGetDailyChallenge } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Flame, BookOpen, Star, Activity, Medal } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: activity, isLoading: isActivityLoading } = useGetMyActivity({ limit: 5 });
  const { data: dailyChallenge, isLoading: isChallengeLoading } = useGetDailyChallenge();

  const skillData = [
    { subject: 'Vocabulary', A: 80, fullMark: 100 },
    { subject: 'Grammar', A: 65, fullMark: 100 },
    { subject: 'Speaking', A: 45, fullMark: 100 },
    { subject: 'Listening', A: 70, fullMark: 100 },
    { subject: 'Reading', A: 85, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Xin chào, {summary?.user?.displayName || "Học Viên"}!
          </h1>
          <p className="text-muted-foreground mt-1">Hãy tiếp tục hành trình học tiếng Anh của bạn.</p>
        </div>
      </header>

      {isSummaryLoading || !summary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl bg-muted/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Chuỗi ngày</CardTitle>
              <Flame className="w-5 h-5 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.currentStreak} Days</div>
              <p className="text-xs text-muted-foreground mt-1">Keep it burning!</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tổng XP</CardTitle>
              <Star className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.totalXp}</div>
              <p className="text-xs text-muted-foreground mt-1">+{summary.todayXp} hôm nay</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Từ đã học</CardTitle>
              <BookOpen className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.wordsLearned}</div>
              <p className="text-xs text-muted-foreground mt-1">{summary.wordsDueReview} cần ôn tập</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cấp độ</CardTitle>
              <Trophy className="w-5 h-5 text-accent drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.level}</div>
              <p className="text-xs text-muted-foreground mt-1">{summary.xpToNextLevel} XP lên cấp tiếp</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-white/5 bg-card/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Biểu đồ kỹ năng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Skills" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-white/5 bg-card/40 relative overflow-hidden border-primary/20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
            <CardHeader>
              <CardTitle className="text-lg">Thử thách hôm nay</CardTitle>
            </CardHeader>
            <CardContent>
              {isChallengeLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : dailyChallenge ? (
                <div>
                  <h3 className="font-bold text-lg mb-2">{dailyChallenge.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{dailyChallenge.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-yellow-400 flex items-center gap-1">
                      <Star className="w-4 h-4" /> {dailyChallenge.xpReward} XP
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${dailyChallenge.isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-secondary text-muted-foreground'}`}>
                      {dailyChallenge.isCompleted ? 'Hoàn thành' : 'Chưa làm'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">Không có thử thách hôm nay.</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card/40">
            <CardHeader>
              <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isActivityLoading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                ) : activity?.length ? (
                  activity.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Medal className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</span>
                          <span className="text-xs font-medium text-yellow-500">+{item.xpEarned} XP</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">Chưa có hoạt động nào.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
