import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader, Card, Loading, EmptyState, StatCard } from "@/components/erp/page-header";
import { CalendarCheck, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/attendance")({ component: Page });

function Page() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["attendance", user?.id],
    queryFn: async () => {
      const { data: student } = await supabase.from("students").select("id").eq("user_id", user!.id).maybeSingle();
      if (!student) return null;
      const { data: rows } = await supabase.from("attendance").select("*, subjects(code, name)").eq("student_id", student.id).order("date", { ascending: false });
      return rows ?? [];
    },
  });
  if (isLoading) return <Loading />;
  if (!data) return <EmptyState title="No student profile" />;
  const total = data.length;
  const present = data.filter((r: any) => r.status === "present").length;
  const pct = total ? Math.round((present / total) * 100) : 0;
  // group by subject
  const bySub: Record<string, { name: string; total: number; present: number }> = {};
  data.forEach((r: any) => {
    const k = r.subjects?.code ?? "—";
    bySub[k] ??= { name: r.subjects?.name ?? "—", total: 0, present: 0 };
    bySub[k].total++;
    if (r.status === "present") bySub[k].present++;
  });
  return (
    <>
      <PageHeader title="Attendance" subtitle="Subject-wise breakdown and history." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Overall" value={`${pct}%`} icon={CalendarCheck} accent={pct >= 75 ? "success" : "warning"} />
        <StatCard label="Classes Held" value={total} icon={CalendarCheck} accent="primary" />
        <StatCard label="Absences" value={total - present} icon={AlertTriangle} accent={total - present > 0 ? "destructive" : "success"} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="By Subject">
          {Object.keys(bySub).length === 0 ? <EmptyState title="No records" /> : (
            <ul className="space-y-3">
              {Object.entries(bySub).map(([code, s]) => {
                const p = Math.round((s.present / s.total) * 100);
                return (
                  <li key={code}>
                    <div className="flex justify-between text-sm"><span className="font-medium">{s.name} <span className="text-muted-foreground">({code})</span></span><span className="font-semibold">{p}%</span></div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-gradient-gold" style={{ width: `${p}%` }} /></div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card title="Recent">
          {data.length === 0 ? <EmptyState title="No records" /> : (
            <ul className="divide-y text-sm">
              {data.slice(0, 12).map((r: any) => (
                <li key={r.id} className="flex justify-between py-2">
                  <span>{r.date} · {r.subjects?.code}</span>
                  <span className={`capitalize ${r.status === "present" ? "text-[var(--color-success)]" : "text-destructive"}`}>{r.status}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
