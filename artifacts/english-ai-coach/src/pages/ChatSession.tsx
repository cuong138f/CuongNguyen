import { useGetChatMessages, useSendChatMessage } from "@workspace/api-client-react";
import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";

export default function ChatSession() {
  const { id } = useParams();
  const sessionId = Number(id);
  
  const { data: messages, isLoading } = useGetChatMessages(sessionId, {
    query: { enabled: !!sessionId }
  });
  
  const sendMessage = useSendChatMessage();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !sessionId) return;
    const content = input;
    setInput("");
    
    sendMessage.mutate({ data: { content }, id: sessionId }, {
      onSuccess: () => {
        // Query will refetch and update list
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      <header className="h-16 flex items-center px-6 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/chat">
          <Button variant="ghost" size="icon" className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="font-bold text-lg">AI Conversation</h2>
          <p className="text-xs text-muted-foreground">Practicing English</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-[70%] rounded-2xl rounded-tl-sm" />
            <Skeleton className="h-16 w-[70%] ml-auto rounded-2xl rounded-tr-sm" />
          </div>
        ) : (
          messages?.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div 
                className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-br-sm' 
                    : 'bg-card border border-white/10 rounded-bl-sm'
                }`}
              >
                <p className="text-sm md:text-base whitespace-pre-wrap">{msg.content}</p>
              </div>
              
              {msg.grammarErrors && msg.grammarErrors.length > 0 && (
                <div className="mt-2 w-full bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2 text-destructive mb-2 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    Correction
                  </div>
                  <ul className="space-y-2">
                    {msg.grammarErrors.map((err, idx) => (
                      <li key={idx} className="bg-background/50 rounded p-2">
                        <div className="line-through text-muted-foreground">{err.original}</div>
                        <div className="text-green-500 font-medium">{err.corrected}</div>
                        <div className="text-muted-foreground mt-1 text-xs">
                          {err.explanation}
                          {err.explanationVi && <div className="mt-1 text-[10px] text-muted-foreground/70">{err.explanationVi}</div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t bg-card/50 backdrop-blur-sm sticky bottom-0">
        <form 
          className="flex gap-2 max-w-4xl mx-auto" 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-background border-white/10"
            disabled={sendMessage.isPending}
          />
          <Button type="submit" disabled={!input.trim() || sendMessage.isPending} className="px-8 shrink-0">
            {sendMessage.isPending ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
