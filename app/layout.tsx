import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/hooks/use-theme";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans-family",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Zuno — AI-Powered Resume Builder",
    template: "%s · Zuno",
  },
  description:
    "Create professional, ATS-friendly resumes with AI-powered writing, smart templates and real-time resume analysis.",
  keywords: [
    "resume builder", "AI resume", "ATS friendly resume", "professional resume",
    "resume templates", "job application", "cover letter", "career",
  ],
  openGraph: {
    title: "Zuno — AI-Powered Resume Builder",
    description:
      "Create professional, ATS-friendly resumes with AI-powered writing, smart templates and real-time resume analysis.",
    type: "website",
    siteName: "Zuno",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zuno — AI-Powered Resume Builder",
    description:
      "Create professional, ATS-friendly resumes with AI-powered writing, smart templates and real-time resume analysis.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("zuno_theme")?.value;
  const initialTheme =
    themeCookie === "light" || themeCookie === "dark" || themeCookie === "system"
      ? themeCookie
      : "system";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased ${initialTheme === "dark" ? "dark" : ""}`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider initialTheme={initialTheme as "light" | "dark" | "system"}>
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
