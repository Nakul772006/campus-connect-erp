import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { GraduationCap, Loader2, BookUser, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Create account — Vidyalaya ERP" }] }),
});

const studentSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  role: z.literal("student"),
  roll_number: z.string().trim().min(2).max(40),
  branch: z.string().trim().min(2).max(40),
  year: z.coerce.number().int().min(1).max(5),
});
const facultySchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  role: z.literal("faculty"),
  employee_id: z.string().trim().min(2).max(40),
  department: z.string().trim().min(2).max(40),
});

function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "faculty">("student");
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = role === "student" ? studentSchema : facultySchema;
    const parsed = schema.safeParse({ ...form, role });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: parsed.data.full_name },
      },
    });
    if (error) { setSubmitting(false); return toast.error(error.message); }
    if (!data.user) { setSubmitting(false); return toast.error("Signup failed."); }
    // Sign in immediately if session not auto-set (email confirm off)
    if (!data.session) {
      await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    }
    // Insert role
    const { error: roleErr } = await supabase.from("user_roles").insert({ user_id: data.user.id, role });
    if (roleErr) console.error(roleErr);
    // Insert profile-specific row
    if (role === "student") {
      const s = parsed.data as z.infer<typeof studentSchema>;
      await supabase.from("students").insert({
        user_id: data.user.id, roll_number: s.roll_number, branch: s.branch, year: s.year, semester: 1,
      });
    } else {
      const f = parsed.data as z.infer<typeof facultySchema>;
      await supabase.from("faculty").insert({
        user_id: data.user.id, employee_id: f.employee_id, department: f.department,
      });
    }
    setSubmitting(false);
    toast.success("Account created!");
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
          <h2 className="font-display text-4xl font-semibold leading-tight">Join your college portal.</h2>
          <p className="mt-3 text-primary-foreground/80">Sign up as a student or faculty member to get started.</p>
        </div>
        <p className="text-sm text-primary-foreground/60">© {new Date().getFullYear()} Vidyalaya ERP</p>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-5">
          <div>
            <h1 className="font-display text-3xl font-semibold">Create account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Choose your role to continue.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(["student", "faculty"] as const).map((r) => {
              const Icon = r === "student" ? BookUser : Briefcase;
              const active = role === r;
              return (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-medium capitalize transition-all ${
                    active ? "border-primary bg-primary/5 text-primary shadow-card" : "hover:border-primary/40"
                  }`}>
                  <Icon className="size-4" /> {r}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <Field label="Full name"><input required onChange={upd("full_name")} className="erp-input" /></Field>
            <Field label="Email"><input required type="email" onChange={upd("email")} className="erp-input" /></Field>
            <Field label="Password"><input required type="password" minLength={6} onChange={upd("password")} className="erp-input" /></Field>

            {role === "student" ? (
              <>
                <Field label="Roll number"><input required onChange={upd("roll_number")} className="erp-input" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Branch"><input required placeholder="CSE" onChange={upd("branch")} className="erp-input" /></Field>
                  <Field label="Year"><input required type="number" min={1} max={5} defaultValue={1} onChange={upd("year")} className="erp-input" /></Field>
                </div>
              </>
            ) : (
              <>
                <Field label="Employee ID"><input required onChange={upd("employee_id")} className="erp-input" /></Field>
                <Field label="Department"><input required placeholder="Computer Science" onChange={upd("department")} className="erp-input" /></Field>
              </>
            )}
          </div>

          <button disabled={submitting} type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {submitting && <Loader2 className="size-4 animate-spin" />} Create account
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Already registered? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
      <style>{`.erp-input{margin-top:.25rem;width:100%;border-radius:.375rem;border:1px solid var(--color-border);background:var(--color-background);padding:.5rem .75rem;font-size:.875rem;outline:none}.erp-input:focus{box-shadow:0 0 0 2px var(--color-ring)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-medium">{label}</span>{children}</label>;
}
