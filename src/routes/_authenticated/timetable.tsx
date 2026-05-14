import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader, Card, Loading, EmptyState } from "@/components/erp/page-header";

export const Route = createFileRoute("/_authenticated/timetable")({ component: Page });
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Page() {
  const { user, role } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["timetable", user?.id, role],
    queryFn: async () => {
      let q = supabase.from("timetable").select("*, subjects(code, name), faculty(employee_id, profiles:user_id(full_name))").order("day_of_week").order("period");
      if (role === "student") {
        const { data: s } = await supabase.from("students").select("branch, year, section").eq("user_id", user!.id).maybeSingle();
        if (s) q = q.eq("branch", s.branch).eq("year", s.year);
      }
      const { data: rows } = await q;
      return rows ?? [];
    },
  });
  if (isLoading) return <Loading />;
  return (
    <>
      <PageHeader title="Timetable" subtitle="Weekly class schedule." />
      <Card>
        {!data || data.length === 0 ? <EmptyState title="No schedule yet" hint="Faculty hasn't set up a timetable." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-xs uppercase text-muted-foreground"><th className="pb-2">Day</th><th>Period</th><th>Time</th><th>Subject</th><th>Room</th></tr></thead>
              <tbody>
                {data.map((r: any) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-2 font-medium">{DAYS[r.day_of_week - 1]}</td>
                    <td>{r.period}</td>
                    <td className="text-muted-foreground">{r.start_time?.slice(0, 5)}–{r.end_time?.slice(0, 5)}</td>
                    <td>{r.subjects?.name ?? "—"} <span className="text-muted-foreground">({r.subjects?.code})</span></td>
                    <td>{r.room ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
