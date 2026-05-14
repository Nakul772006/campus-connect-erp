import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card, Loading, EmptyState } from "@/components/erp/page-header";

export const Route = createFileRoute("/_authenticated/notices")({ component: Page });

function Page() {
  const [q, setQ] = useState("");
  const [aud, setAud] = useState<string>("all");
  const { data, isLoading } = useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const { data } = await supabase.from("notices").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const filtered = (data ?? []).filter((n: any) =>
    (aud === "all" || n.audience === aud) &&
    (q === "" || n.title.toLowerCase().includes(q.toLowerCase()) || n.body.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <>
      <PageHeader title="Notice Board" subtitle="Announcements from the college." />
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notices..."
            className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select value={aud} onChange={(e) => setAud(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="all">All audiences</option>
          <option value="students">Students</option>
          <option value="faculty">Faculty</option>
        </select>
      </div>
      {isLoading ? <Loading /> : filtered.length === 0 ? <EmptyState title="No notices match" /> : (
        <div className="space-y-4">
          {filtered.map((n: any) => (
            <Card key={n.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold">{n.title}</h3>
                  <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs capitalize text-gold">{n.audience}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm">{n.body}</p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
