import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, Card, Loading, EmptyState } from "@/components/erp/page-header";

export const Route = createFileRoute("/_authenticated/admin/students")({ component: Page });

function Page() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["all-students"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*, profiles:user_id(full_name, email, phone)").order("roll_number");
      return data ?? [];
    },
  });
  const filtered = (data ?? []).filter((s: any) =>
    !q || s.roll_number.toLowerCase().includes(q.toLowerCase()) ||
    s.profiles?.full_name?.toLowerCase().includes(q.toLowerCase()) ||
    s.branch.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <>
      <PageHeader title="Students" subtitle="Search and view all enrolled students." />
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, roll, branch..."
          className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <Card>
        {isLoading ? <Loading /> : filtered.length === 0 ? <EmptyState title="No students" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-xs uppercase text-muted-foreground"><th className="pb-2">Roll</th><th>Name</th><th>Branch</th><th>Year</th><th>Email</th></tr></thead>
              <tbody>
                {filtered.map((s: any) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="py-2 font-medium">{s.roll_number}</td>
                    <td>{s.profiles?.full_name ?? "—"}</td>
                    <td>{s.branch}</td>
                    <td>{s.year}</td>
                    <td className="text-muted-foreground">{s.profiles?.email}</td>
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
