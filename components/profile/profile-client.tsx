"use client";

import { useActionState, useState } from "react";
import { User, KeyRound, AlertCircle, CheckCircle2, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { changePasswordAction, deleteAccountAction } from "@/actions/auth";
import { updateProfileAction } from "@/actions/profile";
import { AuthCard, SubmitButton } from "@/components/auth/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type ProfileUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  provider: string;
  emailVerified: Date | null;
  title: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  website: string | null;
};

export function ProfileClient({ user }: { user: ProfileUser }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [profileState, profileAction] = useActionState(updateProfileAction, null);
  const [passwordState, passwordAction] = useActionState(changePasswordAction, null);

  async function handleDelete() {
    setDeleting(true);
    await deleteAccountAction();
    setDeleting(false);
  }

  function initials(name: string) {
    return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your personal information and security.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" /> Personal information
          </CardTitle>
          <CardDescription>Used as defaults when filling your resumes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="text-lg">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">{user.name}</p>
                {user.role === "ADMIN" ? (
                  <Badge className="gap-1">
                    <ShieldCheck className="h-3 w-3" /> Admin
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <form action={profileAction} className="space-y-4">
            {profileState?.error ? (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" /> {profileState.error}
              </div>
            ) : null}
            {profileState?.success ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> {profileState.message}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" defaultValue={user.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Professional title</Label>
                <Input id="title" name="title" defaultValue={user.title ?? ""} placeholder="Full-Stack Developer" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={user.phone ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" defaultValue={user.location ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Photo URL</Label>
                <Input id="image" name="image" defaultValue={user.image ?? ""} placeholder="https://…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input id="linkedin" name="linkedin" defaultValue={user.linkedin ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input id="github" name="github" defaultValue={user.github ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio</Label>
                <Input id="portfolio" name="portfolio" defaultValue={user.portfolio ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" defaultValue={user.website ?? ""} />
              </div>
            </div>

            <SubmitButton>Save changes</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-blue-500" /> Change password
          </CardTitle>
          <CardDescription>
            {user.provider === "GOOGLE"
              ? "Your account uses Google sign-in. You can still set a password."
              : "Update your account password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={passwordAction} className="space-y-4">
            {passwordState?.error ? (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" /> {passwordState.error}
              </div>
            ) : null}
            {passwordState?.success ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> {passwordState.message}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="current">Current password</Label>
                <Input id="current" name="current" type="password" autoComplete="current-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New password</Label>
                <Input id="new" name="new" type="password" autoComplete="new-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new">Confirm new</Label>
                <Input id="confirm-new" name="confirm" type="password" autoComplete="new-password" />
              </div>
            </div>
            <SubmitButton>Update password</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-4 w-4" /> Danger zone
          </CardTitle>
          <CardDescription>Permanently delete your account and all resumes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            Delete account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete account?</DialogTitle>
            <DialogDescription>
              This permanently removes your account, resumes, and data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
