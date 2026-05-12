import { useListVocabulary } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Volume2 } from "lucide-react";

export default function Vocabulary() {
  const { data: words, isLoading } = useListVocabulary();

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Vocabulary Bank</h1>
        <p className="text-muted-foreground mt-2">Manage and review the words you've learned.</p>
      </header>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Words</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="mastered">Mastered</TabsTrigger>
          <TabsTrigger value="difficult">Difficult</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading ? (
              [...Array(8)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
            ) : words?.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Your vocabulary bank is empty.
              </div>
            ) : (
              words?.map((word) => (
                <Card key={word.id} className="group relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{word.word}</h3>
                      <button className="text-muted-foreground hover:text-primary transition-colors">
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{word.partOfSpeech} • {word.pronunciation}</p>
                    <p className="text-sm line-clamp-2">{word.definition}</p>
                    <div className={`absolute top-0 right-0 w-2 h-full ${
                      word.status === 'mastered' ? 'bg-green-500' :
                      word.status === 'difficult' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} />
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
