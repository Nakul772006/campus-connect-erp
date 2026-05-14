export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; accent?: "gold" | "primary" | "success" | "warning" | "destructive" }) {
  const colors = {
    gold: "bg-gold/15 text-gold",
    primary: "bg-primary/10 text-primary",
    success: "bg-[var(--color-success)]/15 text-[var(--color-success)]",
    warning: "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
    destructive: "bg-destructive/10 text-destructive",
  }[accent ?? "primary"];
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card transition-shadow hover:shadow-elegant">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={`flex size-9 items-center justify-center rounded-lg ${colors}`}>
          <Icon className="size-4" />
        </div>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}

export function Card({ title, action, children }: { title?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/30 px-6 py-10 text-center">
      <p className="font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex h-40 items-center justify-center">
      <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
