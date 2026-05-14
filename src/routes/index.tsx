import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { GraduationCap, BookOpen, CalendarCheck, Receipt, Megaphone, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Vidyalaya ERP — Modern College Management Portal" },
      { name: "description", content: "Secure portal for students and faculty to manage marks, attendance, timetable, fees and notices." },
    ],
  }),
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && user) navigate({ to: "/dashboard" }); }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-5 lg:px-12">
        <div className="flex items-center gap-2 text-primary-foreground">
          <div className="flex size-9 items-center justify-center rounded-md bg-gold text-gold-foreground">
            <GraduationCap className="size-5" />
          </div>
          <span className="font-display text-xl font-semibold">Vidyalaya</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="rounded-md px-4 py-2 text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground">Sign in</Link>
          <Link to="/signup" className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-gold-foreground hover:opacity-90">Create account</Link>
        </div>
      </header>

      <section className="relative bg-gradient-hero px-6 pb-24 pt-32 text-primary-foreground lg:px-12 lg:pb-32 lg:pt-40">
        <div className="mx-auto max-w-5xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
            <ShieldCheck className="size-3.5" /> Secure college portal
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-tight md:text-7xl">
            Run your college on a <span className="text-gold">single, elegant</span> platform.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-primary-foreground/80">
            One portal for marks, attendance, timetables, fees and notices — secure
            for students, powerful for faculty, beautiful for everyone.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/signup" className="rounded-md bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground shadow-elegant hover:opacity-90">
              Get started
            </Link>
            <Link to="/login" className="rounded-md border border-primary-foreground/30 px-6 py-3 text-sm font-semibold hover:bg-primary-foreground/10">
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: BookOpen, t: "Marks & Grades", d: "Faculty publish marks instantly. Students download official marksheets as PDF." },
            { icon: CalendarCheck, t: "Attendance", d: "Daily attendance with subject-wise percentages and at-a-glance trends." },
            { icon: Receipt, t: "Fees", d: "Semester-wise fee status, due dates and full payment history." },
            { icon: Megaphone, t: "Notices", d: "Targeted announcements by branch and year. Search and filter." },
            { icon: GraduationCap, t: "Timetable", d: "Weekly schedule with subjects, faculty and rooms." },
            { icon: ShieldCheck, t: "Role-based access", d: "Bcrypt-hashed passwords and row-level security on every record." },
          ].map((f) => (
            <div key={f.t} className="rounded-2xl border bg-card p-6 shadow-card transition-shadow hover:shadow-elegant">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t bg-card px-6 py-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Vidyalaya ERP</span>
          <div className="flex gap-6"><Link to="/login">Sign in</Link><Link to="/signup">Sign up</Link></div>
        </div>
      </footer>
    </div>
  );
}
