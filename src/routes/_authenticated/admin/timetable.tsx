import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card, Loading } from "@/components/erp/page-header";

export const Route = createFileRoute("/_authenticated/admin/timetable")({ component: Page });
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Page() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ branch: "CSE", year: 1, day_of_week: 1, period: 1, start_time: "09:00", end_time: "10:00", subject_id: "", room: "" });
  const { data: subjects } = useQuery({ queryKey: ["tt-subjects"], queryFn: async () => (await supabase.from("subjects").select("id, code, name")).data ?? [] });
  const { data, isLoading } = useQuery({ queryKey: ["tt"], queryFn: async () => (await supabase.from("timetable").select("*, subjects(code, name)").order("day_of_week").order("period")).data ?? [] });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("timetable").upsert(form as any, { onConflict: "branch,year,section,day_of_week,period" });
    if (error) return toast.error(error.message);
    toast.success("Slot saved");
    qc.invalidateQueries({ queryKey: ["tt"] });
  };
  const del = async (id: string) => {
    await supabase.from("timetable").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["tt"] });
  };

  return (
    <>
      <PageHeader title="Manage Timetable" subtitle="Build the weekly class schedule." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Add slot">
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="Branch" className="erp-input" />
              <input type="number" min={1} max={5} value={form.year} onChange={(e) => setForm({ ...form, year: +e.target.value })} className="erp-input" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: +e.target.value })} className="erp-input">
                {DAYS.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
              </select>
              <input type="number" min={1} max={10} value={form.period} onChange={(e) => setForm({ ...form, period: +e.target.value })} placeholder="Period" className="erp-input" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="erp-input" />
              <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="erp-input" />
            </div>
            <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="erp-input">
              <option value="">Subject</option>
              {subjects?.map((s: any) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
            </select>
            <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="Room" className="erp-input" />
            <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Save slot</button>
          </form>
        </Card>
        <div className="lg:col-span-2">
          <Card title="All slots">
            {isLoading ? <Loading /> : (
              <ul className="divide-y text-sm">
                {data?.map((r: any) => (
                  <li key={r.id} className="flex items-center justify-between py-2">
                    <span>{r.branch} Y{r.year} · {DAYS[r.day_of_week - 1]} P{r.period} · {r.start_time?.slice(0, 5)}–{r.end_time?.slice(0, 5)} · <b>{r.subjects?.code}</b> {r.room && `· ${r.room}`}</span>
                    <button onClick={() => del(r.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
      <style>{`.erp-input{width:100%;border-radius:.375rem;border:1px solid var(--color-border);background:var(--color-background);padding:.5rem .75rem;font-size:.875rem;outline:none}`}</style>
    </>
  );
}
