"use client";

import { useState } from "react";

export default function SetupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "שגיאה באתחול");
      setSuccess(
        `המערכת אותחלה בהצלחה. שם המשתמש: ${data.user.username} | סיסמה זמנית: ${data.defaultPassword}`,
      );
    } catch (err: any) {
      setError(err.message || "שגיאה באתחול המערכת");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 placeholder:text-slate-600";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#030014] text-slate-100" dir="rtl">
      <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-[#0a0a16]/50 backdrop-blur-2xl p-8 shadow-[0_0_80px_-20px_rgba(168,85,247,0.15)]">
        <h1 className="text-3xl font-bold text-white mb-2">אתחול מערכת</h1>
        <p className="text-slate-400 mb-6">
          השתמש במסך הזה רק בהתקנה ראשונית כדי ליצור משתמש ADMIN ראשון.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="שם פרטי"
              className={inputClass}
              required
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="שם משפחה"
              className={inputClass}
              required
            />
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="אימייל"
            type="email"
            className={inputClass}
            required
          />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="שם משתמש"
            className={inputClass}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50"
          >
            {loading ? "מאתחל..." : "צור משתמש ADMIN ראשון"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}
