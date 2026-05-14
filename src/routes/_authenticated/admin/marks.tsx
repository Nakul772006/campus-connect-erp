import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card, Loading } from "@/components/erp/page-header";

export const Route = createFileRoute("/_authenticated/admin/marks")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const [studentId, setStudentId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [examType, setExamType] = useState("internal_1");
  const [marks, setMarks] = useState("");
  const [max, setMax] = useState("100");

  const { data: students } = useQuery({ queryKey: ["adm-students"], queryFn: async () => (await supabase.from("students").select("id, roll_number, profiles:user_id(full_name)")).data ?? [] });
  const { data: subjects } = useQuery({ queryKey: ["adm-subjects"], queryFn: async () => (await supabase.from("subjects").select("id, code, name")).data ?? [] });
  const { data: existing, isLoading } = useQuery({
    queryKey: ["all-marks"],
    queryFn: async () => (await supabase.from("marks").select("*, students(roll_number), subjects(code)").order("created_at", { ascending: false }).limit(50)).data ?? [],
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !subjectId) return toast.error("Select student & subject");
    const { error } = await supabase.from("marks").upsert({
      student_id: studentId, subject_id: subjectId,
      exam_type: examType as any, marks_obtained: Number(marks), max_marks: Number(max),
    }, { onConflict: "student_id,subject_id,exam_type" });
    if (error) return toast.error(error.message);
    toast.success("Marks saved");
    setMarks("");
    qc.invalidateQueries({ queryKey: ["all-marks"] });
  };

  return (
    <>
      <PageHeader title="Manage Marks" subtitle="Upload or update student exam scores." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Add / Update">
          <form onSubmit={submit} className="space-y-3">
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="erp-input">
              <option value="">Select student</option>
              {students?.map((s: any) => <option key={s.id} value={s.id}>{s.roll_number} — {s.profiles?.full_name}</option>)}
            </select>
            <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="erp-input">
              <option value="">Select subject</option>
              {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
            </select>
            <select value={examType} onChange={(e) => setExamType(e.target.value)} className="erp-input">
              <option value="internal_1">Internal 1</option>
              <option value="internal_2">Internal 2</option>
              <option value="midterm">Midterm</option>
              <option value="final">Final</option>
              <option value="assignment">Assignment</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="Obtained" className="erp-input" required />
              <input type="number" value={max} onChange={(e) => setMax(e.target.value)} placeholder="Max" className="erp-input" required />
            </div>
            <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Save</button>
          </form>
        </Card>
        <Card title="Recent entries">
          {isLoading ? <Loading /> : (
            <ul className="divide-y text-sm">
              {existing?.map((m: any) => (
                <li key={m.id} className="flex justify-between py-2">
                  <span>{m.students?.roll_number} · {m.subjects?.code} · <span className="capitalize text-muted-foreground">{m.exam_type.replace("_", " ")}</span></span>
                  <span className="font-semibold">{m.marks_obtained}/{m.max_marks}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <style>{`.erp-input{width:100%;border-radius:.375rem;border:1px solid var(--color-border);background:var(--color-background);padding:.5rem .75rem;font-size:.875rem;outline:none}`}</style>
    </>
  );
}
