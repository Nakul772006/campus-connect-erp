import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader, Card, Loading, EmptyState } from "@/components/erp/page-header";

export const Route = createFileRoute("/_authenticated/marks")({ component: MarksPage });

function MarksPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["marks", user?.id],
    queryFn: async () => {
      const { data: student } = await supabase.from("students").select("*, profiles!inner(full_name)").eq("user_id", user!.id).maybeSingle();
      if (!student) return null;
      const { data: marks } = await supabase
        .from("marks")
        .select("*, subjects(code, name)")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false });
      return { student, marks: marks ?? [] };
    },
  });

  const downloadPdf = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Vidyalaya — Official Marksheet", 14, 18);
    doc.setFontSize(11);
    doc.text(`Name: ${data.student.profiles?.full_name ?? "—"}`, 14, 28);
    doc.text(`Roll No: ${data.student.roll_number}`, 14, 34);
    doc.text(`Branch: ${data.student.branch}   Year: ${data.student.year}   Sem: ${data.student.semester}`, 14, 40);
    autoTable(doc, {
      startY: 48,
      head: [["Subject", "Code", "Exam", "Obtained", "Max", "%"]],
      body: data.marks.map((m: any) => [
        m.subjects?.name, m.subjects?.code, m.exam_type,
        m.marks_obtained, m.max_marks,
        `${Math.round((Number(m.marks_obtained) / Number(m.max_marks)) * 100)}%`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [21, 79, 51] },
    });
    doc.save(`marksheet-${data.student.roll_number}.pdf`);
    toast.success("Marksheet downloaded");
  };

  if (isLoading) return <Loading />;
  if (!data) return <EmptyState title="No student profile found" />;

  return (
    <>
      <PageHeader
        title="My Marks"
        subtitle="All exam scores published by faculty."
        actions={
          <button onClick={downloadPdf} disabled={data.marks.length === 0}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
            <Download className="size-4" /> Download PDF
          </button>
        }
      />
      <Card>
        {data.marks.length === 0 ? <EmptyState title="No marks published yet" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3">Subject</th><th>Code</th><th>Exam</th><th className="text-right">Score</th><th className="text-right pr-2">%</th>
                </tr>
              </thead>
              <tbody>
                {data.marks.map((m: any) => {
                  const pct = Math.round((Number(m.marks_obtained) / Number(m.max_marks)) * 100);
                  return (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{m.subjects?.name}</td>
                      <td className="text-muted-foreground">{m.subjects?.code}</td>
                      <td className="capitalize text-muted-foreground">{m.exam_type.replace("_", " ")}</td>
                      <td className="text-right">{m.marks_obtained} / {m.max_marks}</td>
                      <td className={`pr-2 text-right font-semibold ${pct >= 75 ? "text-[var(--color-success)]" : pct >= 40 ? "text-gold" : "text-destructive"}`}>{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
