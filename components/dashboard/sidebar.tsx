"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, LayoutTemplate, ScanSearch, Sparkles,
  User, Settings, ShieldCheck, LogOut, Menu, X, FilePlus2, Sun, Moon,
  ChevronDown, Home,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { useTheme } from "@/hooks/use-theme";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type NavUser = {
  name: string;
  email: string;
  image: string | null;
  role: "USER" | "ADMIN";
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resumes", label: "My Resumes", icon: FileText },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/analyze", label: "Resume Analyzer", icon: ScanSearch },
  { href: "/assistant", label: "AI Assistant", icon: Sparkles },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

function SidebarNav({ user, onNavigate }: { user: NavUser; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-gradient-to-r from-blue-600/15 to-cyan-500/10 text-blue-600 dark:text-blue-400"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className={cn("h-4 w-4", active && "text-blue-600 dark:text-blue-400")} />
            {item.label}
          </Link>
        );
      })}
      {user.role === "ADMIN" ? (
        <Link
          href="/admin"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith("/admin")
              ? "bg-gradient-to-r from-blue-600/15 to-cyan-500/10 text-blue-600 dark:text-blue-400"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <ShieldCheck className="h-4 w-4" />
          Admin
        </Link>
      ) : null}
    </nav>
  );
}

export function DashboardShell({ user, children }: { user: NavUser; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-card/50 px-4 py-6 lg:flex">
        <Link href="/" className="flex items-center gap-2 px-2">
          <Logo />
        </Link>

        <div className="mt-6">
          <SidebarNav user={user} />
        </div>

        <div className="mt-auto space-y-2 border-t border-border pt-4">
          <Button asChild variant="gradient" className="w-full">
            <Link href="/templates">
              <FilePlus2 className="h-4 w-4" />
              New Resume
            </Link>
          </Button>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" className="w-full justify-start text-muted-foreground">
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-card px-4 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <Logo />
              </Link>
              <Button variant="ghost" size="iconSm" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-6 flex-1 overflow-y-auto">
              <SidebarNav user={user} onNavigate={() => setOpen(false)} />
            </div>
            <div className="space-y-2 border-t border-border pt-4">
              <Button asChild variant="gradient" className="w-full" onClick={() => setOpen(false)}>
                <Link href="/templates">
                  <FilePlus2 className="h-4 w-4" />
                  New Resume
                </Link>
              </Button>
              <form action={logoutAction}>
                <Button type="submit" variant="ghost" className="w-full justify-start text-muted-foreground">
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </form>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden text-sm text-muted-foreground md:block">
            <span className="font-semibold text-foreground">
              {NAV_ITEMS.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))?.label ?? "Dashboard"}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-accent">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image ?? undefined} alt={user.name} />
                    <AvatarFallback>{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="truncate text-sm font-semibold">{user.name}</span>
                    <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                {user.role === "ADMIN" ? (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <ShieldCheck className="h-4 w-4" /> Admin
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Home className="h-4 w-4" /> Homepage
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-2 text-destructive"
                    onClick={() => startTransition(() => logoutAction())}
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
