import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarCheck, Receipt, Megaphone, Users, ClipboardList, FileEdit, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader, StatCard, Card, Loading, EmptyState } from "@/components/erp/page-header";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

function Dashboard() {
  const { user, role } = useAuth();
  return role === "faculty" ? <FacultyDash /> : <StudentDash userId={user!.id} />;
}

function StudentDash({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["student-dash", userId],
    queryFn: async () => {
      const { data: student } = await supabase.from("students").select("*").eq("user_id", userId).maybeSingle();
      if (!student) return null;
      const [{ data: marks }, { data: attendance }, { data: fees }, { data: notices }] = await Promise.all([
        supabase.from("marks").select("marks_obtained, max_marks").eq("student_id", student.id),
        supabase.from("attendance").select("status").eq("student_id", student.id),
        supabase.from("fees").select("amount, amount_paid, status").eq("student_id", student.id),
        supabase.from("notices").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      const totalMarks = marks?.reduce((a, m) => a + Number(m.marks_obtained), 0) ?? 0;
      const maxMarks = marks?.reduce((a, m) => a + Number(m.max_marks), 0) ?? 0;
      const avg = maxMarks ? Math.round((totalMarks / maxMarks) * 100) : 0;
      const present = attendance?.filter((a) => a.status === "present").length ?? 0;
      const attPct = attendance?.length ? Math.round((present / attendance.length) * 100) : 0;
      const due = fees?.reduce((a, f) => a + (Number(f.amount) - Number(f.amount_paid)), 0) ?? 0;
      return { student, avg, attPct, due, notices: notices ?? [] };
    },
  });

  if (isLoading) return <Loading />;
  if (!data) return <EmptyState title="Profile not set up" hint="Contact admin to complete your student profile." />;

  return (
    <>
      <PageHeader title={`Welcome, ${data.student.roll_number}`} subtitle={`${data.student.branch} · Year ${data.student.year} · Sem ${data.student.semester}`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Average Score" value={`${data.avg}%`} icon={BookOpen} accent="primary" />
        <StatCard label="Attendance" value={`${data.attPct}%`} icon={CalendarCheck} accent={data.attPct >= 75 ? "success" : "warning"} />
        <StatCard label="Fees Due" value={`₹${data.due.toLocaleString("en-IN")}`} icon={Receipt} accent={data.due > 0 ? "destructive" : "success"} />
        <StatCard label="Notices" value={data.notices.length} icon={Megaphone} accent="gold" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card title="Latest Notices" action={<Link to="/notices" className="text-sm text-primary hover:underline">See all</Link>}>
          {data.notices.length === 0 ? <EmptyState title="No notices yet" /> : (
            <ul className="space-y-3">
              {data.notices.map((n) => (
                <li key={n.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium">{n.title}</div>
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">{n.audience}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Quick links">
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: "/marks", label: "View marks", icon: BookOpen },
              { to: "/attendance", label: "View attendance", icon: CalendarCheck },
              { to: "/timetable", label: "View timetable", icon: GraduationCap },
              { to: "/fees", label: "Fee history", icon: Receipt },
            ].map((q) => (
              <Link key={q.to} to={q.to} className="flex items-center gap-3 rounded-lg border p-3 hover:border-primary hover:bg-primary/5">
                <q.icon className="size-4 text-primary" />
                <span className="text-sm font-medium">{q.label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function FacultyDash() {
  const { data, isLoading } = useQuery({
    queryKey: ["faculty-dash"],
    queryFn: async () => {
      const [{ count: students }, { count: subjects }, { count: notices }, { data: recent }] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }),
        supabase.from("subjects").select("*", { count: "exact", head: true }),
        supabase.from("notices").select("*", { count: "exact", head: true }),
        supabase.from("notices").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      return { students: students ?? 0, subjects: subjects ?? 0, notices: notices ?? 0, recent: recent ?? [] };
    },
  });
  if (isLoading) return <Loading />;
  if (!data) return null;
  return (
    <>
      <PageHeader title="Faculty Dashboard" subtitle="College-wide overview & quick actions." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Students" value={data.students} icon={Users} accent="primary" />
        <StatCard label="Subjects" value={data.subjects} icon={BookOpen} accent="gold" />
        <StatCard label="Notices Posted" value={data.notices} icon={Megaphone} accent="success" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {[
          { to: "/admin/marks", label: "Upload Marks", icon: FileEdit, c: "Record exam scores per student & subject" },
          { to: "/admin/attendance", label: "Mark Attendance", icon: ClipboardList, c: "Daily attendance entry" },
          { to: "/admin/notices", label: "Post Notice", icon: Megaphone, c: "Targeted to all / branch / year" },
        ].map((q) => (
          <Link key={q.to} to={q.to} className="rounded-2xl border bg-card p-6 shadow-card transition-shadow hover:shadow-elegant">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><q.icon className="size-5" /></div>
            <h3 className="mt-3 font-display text-lg font-semibold">{q.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{q.c}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <Card title="Recent notices" action={<Link to="/admin/notices" className="text-sm text-primary hover:underline">Manage</Link>}>
          {data.recent.length === 0 ? <EmptyState title="No notices yet" /> : (
            <ul className="space-y-3">
              {data.recent.map((n) => (
                <li key={n.id} className="rounded-lg border p-3">
                  <div className="font-medium">{n.title}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
