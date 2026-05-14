import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { GraduationCap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Vidyalaya ERP" }] }),
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
});

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!loading && user) navigate({ to: "/dashboard" }); }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-gradient-hero p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-md bg-gold text-gold-foreground"><GraduationCap className="size-5" /></div>
          <span className="font-display text-xl font-semibold">Vidyalaya</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-semibold leading-tight">Welcome back to your portal.</h2>
          <p className="mt-3 text-primary-foreground/80">Marks, attendance, schedules and notices — all in one place.</p>
        </div>
        <p className="text-sm text-primary-foreground/60">© {new Date().getFullYear()} Vidyalaya ERP</p>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="font-display text-3xl font-semibold">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">Use your registered college email.</p>
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </label>
            <label className="block">
              <span className="flex justify-between text-sm font-medium">
                Password
                <Link to="/forgot-password" className="text-xs font-normal text-primary hover:underline">Forgot?</Link>
              </span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </label>
          </div>
          <button disabled={submitting} type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {submitting && <Loader2 className="size-4 animate-spin" />} Sign in
          </button>
          <p className="text-center text-sm text-muted-foreground">
            New here? <Link to="/signup" className="font-medium text-primary hover:underline">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
