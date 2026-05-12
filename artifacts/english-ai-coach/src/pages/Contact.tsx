import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
  return (
    <div className="py-24 max-w-xl mx-auto px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground">Have a question or feedback? We'd love to hear from you.</p>
      </div>

      <form className="space-y-6 bg-card p-8 rounded-xl border">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <Input id="name" placeholder="John Doe" />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <Input id="email" type="email" placeholder="john@example.com" />
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium">Message</label>
          <Textarea id="message" placeholder="How can we help?" rows={5} />
        </div>

        <Button type="submit" className="w-full" size="lg">Send Message</Button>
      </form>
    </div>
  );
}
