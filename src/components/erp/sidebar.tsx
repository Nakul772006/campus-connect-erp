import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, BookOpen, CalendarCheck, Receipt, Megaphone,
  CalendarRange, User, Users, FileEdit, ClipboardList, ScrollText,
  GraduationCap, LogOut, Sun, Moon, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

const studentNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/marks", label: "Marks", icon: BookOpen },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/timetable", label: "Timetable", icon: CalendarRange },
  { to: "/fees", label: "Fees", icon: Receipt },
  { to: "/notices", label: "Notices", icon: Megaphone },
  { to: "/profile", label: "Profile", icon: User },
];

const facultyNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/marks", label: "Manage Marks", icon: FileEdit },
  { to: "/admin/attendance", label: "Manage Attendance", icon: ClipboardList },
  { to: "/admin/notices", label: "Manage Notices", icon: ScrollText },
  { to: "/admin/timetable", label: "Manage Timetable", icon: CalendarRange },
  { to: "/notices", label: "Notice Board", icon: Megaphone },
  { to: "/profile", label: "Profile", icon: User },
];

export function ErpSidebar() {
  const { role, signOut, user } = useAuth();
  const { theme, toggle } = useTheme();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const items = role === "faculty" ? facultyNav : studentNav;

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/login" });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-30 flex size-10 items-center justify-center rounded-md bg-sidebar text-sidebar-foreground shadow-card lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-md bg-gradient-gold text-gold-foreground">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold leading-none">Vidyalaya</div>
              <div className="text-xs text-sidebar-foreground/60">{role === "faculty" ? "Faculty Portal" : "Student Portal"}</div>
            </div>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden"><X className="size-5" /></button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {items.map((item) => {
            const active = path === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-gradient-gold text-gold-foreground shadow-card"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 flex items-center gap-3 rounded-md px-3 py-2 text-xs">
            <div className="flex size-8 items-center justify-center rounded-full bg-sidebar-accent font-semibold uppercase">
              {user?.email?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{user?.email}</div>
              <div className="text-sidebar-foreground/60 capitalize">{role}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={toggle} className="flex flex-1 items-center justify-center gap-2 rounded-md bg-sidebar-accent px-3 py-2 text-xs hover:opacity-90">
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <button onClick={handleLogout} className="flex items-center justify-center gap-2 rounded-md bg-destructive px-3 py-2 text-xs text-destructive-foreground hover:opacity-90">
              <LogOut className="size-4" /> Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
