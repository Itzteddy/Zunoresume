import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default async function TemplatesLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user ? { name: user.name, email: user.email } : null} />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
}
