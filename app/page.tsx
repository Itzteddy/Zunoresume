import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { TemplateShowcase } from "@/components/landing/TemplateShowcase";
import { AiSection } from "@/components/landing/AiSection";
import { HowItWorks, CTA } from "@/components/landing/HowItWorks";
import { Footer } from "@/components/landing/Footer";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user ? { name: user.name, email: user.email } : null} />
      <main className="flex-1">
        <Hero />
        <Features />
        <TemplateShowcase />
        <AiSection />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
