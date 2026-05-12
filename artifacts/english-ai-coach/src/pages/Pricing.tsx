import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "wouter";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for getting started",
    features: ["Basic lessons", "10 AI chats / day", "Standard vocabulary bank"],
    cta: "Start Free",
    popular: false
  },
  {
    name: "Pro",
    price: "199,000",
    currency: "VND",
    period: "/month",
    description: "Accelerate your learning",
    features: ["Unlimited AI chats", "Advanced pronunciation feedback", "Spaced repetition system", "Priority support"],
    cta: "Upgrade to Pro",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams and schools",
    features: ["Custom curriculum", "Team analytics", "API access", "Dedicated account manager"],
    cta: "Contact Us",
    popular: false
  }
];

export default function Pricing() {
  return (
    <div className="py-24 max-w-6xl mx-auto px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Choose the plan that fits your learning style.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col ${plan.popular ? 'border-primary shadow-[0_0_30px_rgba(59,130,246,0.15)] relative' : ''}`}>
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                MOST POPULAR
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4 flex items-baseline text-4xl font-extrabold">
                {plan.price !== "Custom" && plan.price !== "0" && <span className="text-xl font-medium text-muted-foreground mr-1">₫</span>}
                {plan.price}
                {plan.period && <span className="text-xl font-medium text-muted-foreground ml-1">{plan.period}</span>}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={plan.popular ? "default" : "outline"} size="lg">
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
