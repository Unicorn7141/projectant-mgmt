"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserInfo = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  mustChangePassword: boolean;
  roles: string[];
};

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "authenticated">(
    "idle",
  );
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("currentUser");

    if (savedToken && savedUser) {
      const parsedUser: UserInfo = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(parsedUser);
      if (parsedUser.mustChangePassword) {
        setStatus("authenticated");
      } else {
        router.push("/dashboard");
      }
    }
  }, [router]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      if (data.user.mustChangePassword) {
        setStatus("authenticated");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "שגיאה לא ידועה");
      setStatus("idle");
    }
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setStatus("idle");
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
  }

  const BackgroundEffects = () => (
    <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none bg-[#030014]">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-purple-600/20 blur-[140px] rounded-full" />
      <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 blur-[120px] rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  );

  return (
    <div
      className="relative min-h-screen w-full text-slate-200 selection:bg-purple-500/30 font-sans"
      dir="rtl"
    >
      <BackgroundEffects />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        {status === "loading" && (
          <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
            <div className="rounded-[32px] border border-white/10 bg-[#0a0a16]/60 backdrop-blur-2xl p-12 text-center shadow-[0_0_80px_-20px_rgba(168,85,247,0.3)]">
              <div className="relative mx-auto w-20 h-20 mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_15px_rgba(168,85,247,1)]" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
                טוען את סביבת העבודה
              </h2>
              <p className="text-slate-400 text-sm font-medium tracking-wide">
                מאתחל את סביבת העבודה המאובטחת שלך...
              </p>
            </div>
          </div>
        )}

        {status === "idle" && (
          <div className="w-full max-w-xl text-center">
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                </span>
                סביבת עבודה מאובטחת
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6">
                פרויקטור <br />
                <br />
                <span className="bg-gradient-to-b from-white via-white to-purple-400/50 bg-clip-text text-transparent">
                  ניהול פרויקטים ופרויקטנטים
                </span>
              </h1>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[#0a0a16]/40 backdrop-blur-2xl p-8 md:p-12 shadow-[0_0_80px_-20px_rgba(168,85,247,0.15)]">
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="text"
                  placeholder="שם משתמש או אימייל"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all placeholder:text-slate-600 text-white text-right"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="סיסמה"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all placeholder:text-slate-600 text-white text-right"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] mt-2"
                >
                  כניסה לסביבת העבודה
                </button>
              </form>

              <div className="mt-4 text-center text-xs text-slate-500">
                התקנה חדשה? <Link href="/setup" className="text-purple-400 hover:text-purple-300">אתחל משתמש ADMIN ראשון</Link>
              </div>

              {error && (
                <div className="mt-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {status === "authenticated" && user && (
          <ForcePasswordChange
            user={user}
            token={token!}
            onDone={(updated) => {
              setUser(updated);
              localStorage.setItem("currentUser", JSON.stringify(updated));
              router.push("/dashboard");
            }}
            onLogout={handleLogout}
          />
        )}
      </main>
    </div>
  );
}

function ForcePasswordChange({
  user,
  token,
  onDone,
  onLogout,
}: {
  user: UserInfo;
  token: string;
  onDone: (u: UserInfo) => void;
  onLogout: () => void;
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "שגיאה בעדכון הסיסמה");

      const updated = { ...user, mustChangePassword: false };
      onDone(updated);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div
      className="w-full max-w-md animate-in fade-in zoom-in duration-500"
      dir="rtl"
    >
      <div className="rounded-[32px] border border-purple-900/30 bg-[#08080a]/80 backdrop-blur-xl p-10 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight text-center">
          עדכון אבטחה
        </h2>
        <p className="text-sm text-slate-400 mb-8 text-center leading-relaxed">
          שלום {user.firstName}, עליך לעדכן את הסיסמה הזמנית שלך לפני הכניסה
          למערכת.
        </p>

        <form onSubmit={handleChange} className="space-y-4">
          <input
            type="password"
            placeholder="סיסמה נוכחית"
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-3.5 text-white text-right focus:outline-none focus:ring-2 focus:ring-purple-600/50"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="סיסמה חדשה"
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-3.5 text-white text-right focus:outline-none focus:ring-2 focus:ring-purple-600/50"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white font-bold text-sm shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all"
          >
            עדכן סיסמה
          </button>
          <button
            onClick={onLogout}
            type="button"
            className="w-full mt-2 text-xs text-slate-600 hover:text-white transition-colors"
          >
            התנתק
          </button>
        </form>
      </div>
    </div>
  );
}
