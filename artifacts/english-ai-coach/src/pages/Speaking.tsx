import { useListSpeakingSessions, useCreateSpeakingSession } from "@workspace/api-client-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Mic, Circle, Square } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListSpeakingSessionsQueryKey } from "@workspace/api-client-react";

export default function Speaking() {
  const { data: sessions, isLoading } = useListSpeakingSessions();
  const createSession = useCreateSpeakingSession();
  const queryClient = useQueryClient();
  const [isRecording, setIsRecording] = useState(false);
  const [targetText, setTargetText] = useState("The quick brown fox jumps over the lazy dog.");

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate submission for now
      createSession.mutate({ data: { targetText } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSpeakingSessionsQueryKey() });
        }
      });
    } else {
      setIsRecording(true);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Speaking Practice</h1>
        <p className="text-muted-foreground mt-2">Improve your pronunciation with AI feedback.</p>
      </header>

      <div className="flex-1 flex flex-col gap-8">
        <Card className="flex-1 flex flex-col items-center justify-center p-8 bg-card/50 border-primary/20">
          <h2 className="text-2xl font-medium text-center mb-12">{targetText}</h2>
          
          <div className="relative">
            {isRecording && (
              <div className="absolute -inset-4 rounded-full border border-red-500/50 animate-ping" />
            )}
            <Button 
              size="lg" 
              className={`rounded-full w-24 h-24 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
              onClick={toggleRecording}
              disabled={createSession.isPending}
            >
              {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            {isRecording ? "Recording... Click to stop" : "Click to start recording"}
          </p>
        </Card>

        <div>
          <h3 className="text-xl font-bold mb-4">Previous Sessions</h3>
          <div className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
            ) : sessions?.length === 0 ? (
              <p className="text-muted-foreground">No sessions yet. Start practicing!</p>
            ) : (
              sessions?.map(session => (
                <Card key={session.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium line-clamp-1">{session.targetText}</p>
                      <p className="text-sm text-muted-foreground mt-1">{new Date(session.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`font-bold ${session.score && session.score >= 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                        {session.score || '--'}/100
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
