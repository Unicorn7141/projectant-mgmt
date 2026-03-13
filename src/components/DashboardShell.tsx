"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  UserCircle,
} from "lucide-react";

type UserInfo = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  mustChangePassword: boolean;
  roles: string[];
  profileImage?: string | null;
};

const roleLabels: Record<string, string> = {
  ADMIN: "מנהל",
  MENTOR: "מנחה",
  STUDENT: "סטודנט",
};

const navItems = [
  {
    name: "סקירה כללית",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MENTOR", "STUDENT"],
  },
  {
    name: "ניהול מערכת",
    href: "/dashboard/admin",
    icon: Settings,
    roles: ["ADMIN"],
  },
  {
    name: "סטודנטים",
    href: "/dashboard/students",
    icon: Users,
    roles: ["ADMIN", "MENTOR"],
  },
  {
    name: "פרויקטים",
    href: "/dashboard/projects",
    icon: FolderKanban,
    roles: ["ADMIN", "MENTOR", "STUDENT"],
  },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "סקירה כללית",
  "/dashboard/admin": "ניהול מערכת",
  "/dashboard/students": "סטודנטים",
  "/dashboard/projects": "פרויקטים",
};

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    const token = localStorage.getItem("authToken");

    if (!savedUser || !token) {
      router.push("/login");
      return;
    }

    const parsed: UserInfo = JSON.parse(savedUser);
    if (parsed.mustChangePassword) {
      router.push("/login");
      return;
    }

    // טעינת נתונים עדכניים מה-DB
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((freshUser) => {
        localStorage.setItem("currentUser", JSON.stringify(freshUser));
        setUser(freshUser);
      })
      .catch(() => {
        // אם ה-token פג תוקף
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        router.push("/login");
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  const handleProfileImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    const token = localStorage.getItem("authToken");
    if (!file || !token || !user) return;

    setUploadingProfile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("saveToProfile", "true");

      const res = await fetch("/api/upload/profile-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = (await res.json()) as {
        message?: string;
        user?: UserInfo;
      };

      if (!res.ok || !data.user) {
        throw new Error(data.message || "Upload failed");
      }

      setUser(data.user);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
    } catch (error) {
      console.error("Profile image upload failed", error);
      alert("העלאת התמונה נכשלה");
    } finally {
      setUploadingProfile(false);
      e.target.value = "";
    }
  };

  if (!user) return null;

  const filtered = navItems.filter((item) =>
    item.roles.some((r) => user.roles.includes(r)),
  );

  const pageTitle = pageTitles[pathname] ?? "דשבורד";

  return (
    <div
      className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden"
      dir="rtl"
    >
      {/* Sidebar */}
      <aside
        className={`relative flex flex-col border-l border-white/5 bg-[#0a0a16]/60 backdrop-blur-xl transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-white/5">
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tighter text-white">
              פרויקטור
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
          >
            {isCollapsed ? (
              <ChevronLeft size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3 mt-2">
          {filtered.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={18} className="shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span>התנתקות</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between px-8 border-b border-white/5 bg-[#0a0a16]/40 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingProfile}
                className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 transition hover:border-purple-400/40 disabled:cursor-wait disabled:opacity-70"
                title="העלה תמונת פרופיל"
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.firstName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
                    <UserCircle size={18} className="text-white" />
                  </div>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-[9px] text-white">
                  {uploadingProfile ? "...מעלה" : "עריכה"}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageUpload}
              />
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-slate-500 tracking-widest">
                {user.roles.map((r) => roleLabels[r] ?? r).join(", ")}
              </p>
            </div>
          </div>
          <h2 className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
            {pageTitle}
          </h2>
        </header>

        {/* Background effects */}
        <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-purple-600/10 blur-[140px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
