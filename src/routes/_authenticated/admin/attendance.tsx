import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card, Loading } from "@/components/erp/page-header";

export const Route = createFileRoute("/_authenticated/admin/attendance")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, "present" | "absent">>({});

  const { data: students, isLoading } = useQuery({ queryKey: ["adm-students2"], queryFn: async () => (await supabase.from("students").select("id, roll_number, profiles:user_id(full_name)").order("roll_number")).data ?? [] });
  const { data: subjects } = useQuery({ queryKey: ["adm-subjects2"], queryFn: async () => (await supabase.from("subjects").select("id, code, name")).data ?? [] });

  const save = async () => {
    if (!subjectId) return toast.error("Pick a subject");
    const rows = Object.entries(marks).map(([student_id, status]) => ({ student_id, subject_id: subjectId, date, status }));
    if (rows.length === 0) return toast.error("Mark at least one");
    const { error } = await supabase.from("attendance").upsert(rows as any, { onConflict: "student_id,subject_id,date" });
    if (error) return toast.error(error.message);
    toast.success(`Saved ${rows.length} entries`);
    setMarks({});
    qc.invalidateQueries({ queryKey: ["attendance"] });
  };

  return (
    <>
      <PageHeader title="Manage Attendance" subtitle="Mark present / absent per subject per day." />
      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="erp-input max-w-xs">
            <option value="">Select subject</option>
            {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="erp-input max-w-xs" />
          <button onClick={save} className="ml-auto rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Save attendance</button>
        </div>
        {isLoading ? <Loading /> : (
          <ul className="divide-y">
            {students?.map((s: any) => (
              <li key={s.id} className="flex items-center justify-between py-2.5">
                <span className="text-sm"><b>{s.roll_number}</b> · {s.profiles?.full_name}</span>
                <div className="flex gap-2">
                  {(["present", "absent"] as const).map((st) => (
                    <button key={st} onClick={() => setMarks((m) => ({ ...m, [s.id]: st }))}
                      className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                        marks[s.id] === st
                          ? st === "present" ? "bg-[var(--color-success)] text-white" : "bg-destructive text-destructive-foreground"
                          : "border hover:bg-accent"
                      }`}>{st}</button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <style>{`.erp-input{border-radius:.375rem;border:1px solid var(--color-border);background:var(--color-background);padding:.5rem .75rem;font-size:.875rem;outline:none}`}</style>
    </>
  );
}
