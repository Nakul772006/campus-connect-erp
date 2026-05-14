import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader, Card, Loading } from "@/components/erp/page-header";

export const Route = createFileRoute("/_authenticated/profile")({ component: Page });

function Page() {
  const { user, role } = useAuth();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const [{ data: p }, { data: s }, { data: f }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
        supabase.from("students").select("*").eq("user_id", user!.id).maybeSingle(),
        supabase.from("faculty").select("*").eq("user_id", user!.id).maybeSingle(),
      ]);
      return { profile: p, student: s, faculty: f };
    },
  });
  if (isLoading || !data) return <Loading />;

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    const path = `${user!.id}/avatar-${Date.now()}.${file.name.split(".").pop()}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { setSaving(false); return toast.error(upErr.message); }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user!.id);
    setSaving(false);
    toast.success("Photo updated");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  const onSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    await supabase.from("profiles").update({
      full_name: String(fd.get("full_name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
    }).eq("id", user!.id);
    setSaving(false);
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your personal information." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex size-28 items-center justify-center overflow-hidden rounded-full bg-gradient-gold text-3xl font-semibold text-gold-foreground">
                {data.profile?.avatar_url
                  ? <img src={data.profile.avatar_url} alt="" className="size-full object-cover" />
                  : data.profile?.full_name?.[0] ?? "?"}
              </div>
              <label className="absolute bottom-0 right-0 flex size-9 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card hover:opacity-90">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={saving} />
              </label>
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">{data.profile?.full_name}</h3>
            <p className="text-sm text-muted-foreground">{data.profile?.email}</p>
            <span className="mt-2 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium capitalize text-primary">{role}</span>
          </div>
        </Card>
        <div className="lg:col-span-2 space-y-6">
          <Card title="Personal info">
            <form onSubmit={onSave} className="space-y-4">
              <Field label="Full name"><input name="full_name" defaultValue={data.profile?.full_name ?? ""} className="erp-input" /></Field>
              <Field label="Phone"><input name="phone" defaultValue={data.profile?.phone ?? ""} className="erp-input" /></Field>
              <button disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Save changes</button>
            </form>
          </Card>
          {data.student && (
            <Card title="Academic info">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <Info label="Roll Number" value={data.student.roll_number} />
                <Info label="Branch" value={data.student.branch} />
                <Info label="Year" value={String(data.student.year)} />
                <Info label="Semester" value={String(data.student.semester)} />
              </dl>
            </Card>
          )}
          {data.faculty && (
            <Card title="Faculty info">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <Info label="Employee ID" value={data.faculty.employee_id} />
                <Info label="Department" value={data.faculty.department} />
              </dl>
            </Card>
          )}
        </div>
      </div>
      <style>{`.erp-input{margin-top:.25rem;width:100%;border-radius:.375rem;border:1px solid var(--color-border);background:var(--color-background);padding:.5rem .75rem;font-size:.875rem;outline:none}.erp-input:focus{box-shadow:0 0 0 2px var(--color-ring)}`}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-medium">{label}</span>{children}</label>;
}
function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>;
}
