import { useListChatSessions, useCreateChatSession } from "@workspace/api-client-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquarePlus, MessageSquare } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListChatSessionsQueryKey } from "@workspace/api-client-react";

export default function Chat() {
  const { data: sessions, isLoading } = useListChatSessions();
  const createSession = useCreateChatSession();
  const [topic, setTopic] = useState("");
  const queryClient = useQueryClient();

  const handleCreate = () => {
    if (!topic.trim()) return;
    createSession.mutate({ data: { topic } }, {
      onSuccess: () => {
        setTopic("");
        queryClient.invalidateQueries({ queryKey: getListChatSessionsQueryKey() });
      }
    });
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Chat Practice</h1>
        <p className="text-muted-foreground mt-2">Practice natural conversations with your AI English coach.</p>
      </header>

      <div className="flex gap-4 mb-8">
        <Input 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What do you want to talk about? (e.g. Ordering food)"
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <Button onClick={handleCreate} disabled={createSession.isPending} className="shrink-0 gap-2">
          <MessageSquarePlus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : sessions?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No chat sessions yet. Start a new conversation above!
          </div>
        ) : (
          sessions?.map((session) => (
            <Link key={session.id} href={`/chat/${session.id}`}>
              <Card className="hover:border-primary/50 cursor-pointer transition-colors hover:bg-secondary/50">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium line-clamp-1">{session.topic}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {session.messageCount} messages • {new Date(session.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
