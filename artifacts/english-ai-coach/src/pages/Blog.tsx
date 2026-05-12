import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

const articles = [
  { id: 1, title: "10 Idioms Every Vietnamese Learner Should Know", category: "Vocabulary", readingTime: "5 min read", date: "Oct 12, 2023" },
  { id: 2, title: "Mastering the 'th' Sound: A Practical Guide", category: "Pronunciation", readingTime: "8 min read", date: "Oct 05, 2023" },
  { id: 3, title: "How AI is Changing Language Learning", category: "Technology", readingTime: "4 min read", date: "Sep 28, 2023" },
  { id: 4, title: "Common Grammar Mistakes to Avoid", category: "Grammar", readingTime: "6 min read", date: "Sep 15, 2023" },
];

export default function Blog() {
  return (
    <div className="py-24 max-w-5xl mx-auto px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Blog</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Tips, tricks, and updates from the English AI Coach team.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {articles.map((article) => (
          <Card key={article.id} className="hover:border-primary/50 transition-colors cursor-pointer group">
            <CardHeader>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">{article.category}</span>
                <span className="text-xs text-muted-foreground">{article.readingTime}</span>
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">{article.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{article.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
