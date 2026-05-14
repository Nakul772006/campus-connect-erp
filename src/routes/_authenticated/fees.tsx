import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader, Card, Loading, EmptyState, StatCard } from "@/components/erp/page-header";
import { Receipt, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/fees")({ component: Page });

function Page() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["fees", user?.id],
    queryFn: async () => {
      const { data: s } = await supabase.from("students").select("id").eq("user_id", user!.id).maybeSingle();
      if (!s) return [];
      const { data: rows } = await supabase.from("fees").select("*").eq("student_id", s.id).order("created_at", { ascending: false });
      return rows ?? [];
    },
  });
  if (isLoading) return <Loading />;
  const total = data?.reduce((a, f) => a + Number(f.amount), 0) ?? 0;
  const paid = data?.reduce((a, f) => a + Number(f.amount_paid), 0) ?? 0;
  const due = total - paid;
  return (
    <>
      <PageHeader title="Fees" subtitle="Payment status and history." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total" value={`₹${total.toLocaleString("en-IN")}`} icon={Receipt} accent="primary" />
        <StatCard label="Paid" value={`₹${paid.toLocaleString("en-IN")}`} icon={CheckCircle2} accent="success" />
        <StatCard label="Due" value={`₹${due.toLocaleString("en-IN")}`} icon={AlertCircle} accent={due > 0 ? "destructive" : "success"} />
      </div>
      <div className="mt-6">
        <Card>
          {!data || data.length === 0 ? <EmptyState title="No fee records" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-xs uppercase text-muted-foreground"><th className="pb-2">Description</th><th>Sem</th><th>Due</th><th className="text-right">Amount</th><th className="text-right pr-2">Status</th></tr></thead>
                <tbody>
                  {data.map((f: any) => (
                    <tr key={f.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{f.description}</td>
                      <td>{f.semester}</td>
                      <td className="text-muted-foreground">{f.due_date ?? "—"}</td>
                      <td className="text-right">₹{Number(f.amount).toLocaleString("en-IN")}</td>
                      <td className="pr-2 text-right">
                        <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${f.status === "paid" ? "bg-[var(--color-success)]/15 text-[var(--color-success)]" : f.status === "overdue" ? "bg-destructive/10 text-destructive" : "bg-gold/15 text-gold"}`}>{f.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
