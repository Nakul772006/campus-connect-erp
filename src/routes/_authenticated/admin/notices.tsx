import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader, Card, Loading } from "@/components/erp/page-header";

export const Route = createFileRoute("/_authenticated/admin/notices")({ component: Page });

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const { data, isLoading } = useQuery({ queryKey: ["adm-notices"], queryFn: async () => (await supabase.from("notices").select("*").order("created_at", { ascending: false })).data ?? [] });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return toast.error("Title and body required");
    const { error } = await supabase.from("notices").insert({ title: title.trim(), body: body.trim(), audience: audience as any, created_by: user?.id });
    if (error) return toast.error(error.message);
    toast.success("Notice posted");
    setTitle(""); setBody("");
    qc.invalidateQueries({ queryKey: ["adm-notices"] });
  };
  const del = async (id: string) => {
    if (!confirm("Delete notice?")) return;
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["adm-notices"] });
  };

  return (
    <>
      <PageHeader title="Manage Notices" subtitle="Post announcements to the college." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="New notice">
          <form onSubmit={submit} className="space-y-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" maxLength={200} className="erp-input" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Notice details..." rows={6} maxLength={2000} className="erp-input" />
            <select value={audience} onChange={(e) => setAudience(e.target.value)} className="erp-input">
              <option value="all">Everyone</option>
              <option value="students">Students only</option>
              <option value="faculty">Faculty only</option>
            </select>
            <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Post notice</button>
          </form>
        </Card>
        <Card title="All notices">
          {isLoading ? <Loading /> : (
            <ul className="space-y-2">
              {data?.map((n: any) => (
                <li key={n.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <div className="font-medium">{n.title}</div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                  </div>
                  <button onClick={() => del(n.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
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
