import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPage,
  head: () => ({ meta: [{ title: "Reset password — Vidyalaya ERP" }] }),
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email for the reset link.");
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl bg-card p-8 shadow-elegant">
        <Link to="/" className="flex items-center gap-2 text-primary"><GraduationCap className="size-5" /><span className="font-display font-semibold">Vidyalaya</span></Link>
        <h1 className="font-display text-2xl font-semibold">Forgot password</h1>
        <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          {loading && <Loader2 className="size-4 animate-spin" />} Send reset link
        </button>
        <Link to="/login" className="block text-center text-sm text-primary hover:underline">Back to sign in</Link>
      </form>
    </div>
  );
}
