export default function About() {
  return (
    <div className="py-24 max-w-3xl mx-auto px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">About Us</h1>
        <p className="text-xl text-muted-foreground">Our mission is to democratize English learning in Vietnam.</p>
      </div>

      <div className="prose prose-invert max-w-none">
        <h2>The Story</h2>
        <p>
          We realized that traditional English learning methods often fail to provide enough speaking practice or personalized feedback. 
          That's why we built English AI Coach — a platform that combines the effectiveness of 1-on-1 tutoring with the scale of AI.
        </p>

        <h2>Our Mission</h2>
        <p>
          To help 1 million Vietnamese speakers become fluent in English by 2030, opening up global opportunities for career and personal growth.
        </p>

        <h2>The Team</h2>
        <p>
          We are a team of language enthusiasts, educators, and engineers passionate about creating the best learning experience possible.
        </p>
      </div>
    </div>
  );
}
