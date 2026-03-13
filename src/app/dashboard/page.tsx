"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Users, GraduationCap, ArrowUpRight } from "lucide-react";

type UserInfo = {
  id: number;
  firstName: string;
  lastName: string;
  roles: string[];
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  if (!user) return null;

  const stats = [
    {
      name: "פרויקטים פעילים",
      value: "0",
      icon: FolderKanban,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      name: "סטודנטים",
      value: "0",
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      name: "בחינות קרובות",
      value: "0",
      icon: GraduationCap,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
  ];

  return (
    <div className="max-w-6xl w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          שלום, {user.firstName} 👋
        </h1>
        <p className="text-slate-400">
          ברוך הבא לסביבת העבודה שלך. הנה סיכום עדכני של הפעילות.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`rounded-3xl border ${stat.border} bg-[#0a0a16]/40 p-6 backdrop-blur-xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg}`}>
                <stat.icon size={22} className={stat.color} />
              </div>
              <button className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-600 hover:text-slate-300">
                <ArrowUpRight size={16} />
              </button>
            </div>
            <p className="text-sm font-medium text-slate-400">{stat.name}</p>
            <p className="text-4xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-[#0a0a16]/40 p-8 backdrop-blur-xl">
          <h3 className="text-base font-bold text-white mb-6">פעילות אחרונה</h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4">
              <FolderKanban size={24} className="text-slate-600" />
            </div>
            <p className="text-sm text-slate-400">אין פעילות אחרונה</p>
            <p className="text-xs text-slate-600 mt-1">
              פעולות חדשות יופיעו כאן
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0a0a16]/40 p-8 backdrop-blur-xl">
          <h3 className="text-base font-bold text-white mb-6">פעולות מהירות</h3>
          <div className="space-y-3">
            {user.roles.includes("ADMIN") && (
              <>
                <QuickAction label="הוסף משתמש חדש" href="/dashboard/admin" />
                <QuickAction
                  label="נהל יחידות ומחלקות"
                  href="/dashboard/admin"
                />
              </>
            )}
            {user.roles.includes("MENTOR") && (
              <>
                <QuickAction
                  label="פתח פרויקט חדש"
                  href="/dashboard/projects"
                />
                <QuickAction label="הוסף סטודנט" href="/dashboard/students" />
              </>
            )}
            {user.roles.includes("STUDENT") && (
              <QuickAction label="הפרויקטים שלי" href="/dashboard/projects" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ label, href }: { label: string; href: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-3.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all group"
    >
      <span>{label}</span>
      <ArrowUpRight
        size={15}
        className="text-slate-600 group-hover:text-purple-400 transition-colors"
      />
    </button>
  );
}
