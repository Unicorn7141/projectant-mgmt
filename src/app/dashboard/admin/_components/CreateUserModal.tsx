"use client";

import { useState } from "react";
import { Modal } from "./SimpleModal";
import { ProfileImageInput } from "@/components/ProfileImageInput";

type Department = {
  id: number;
  name: string;
  unit: { name: string };
};

export function CreateUserModal({
  token,
  departments,
  onClose,
  onCreated,
}: {
  token: string;
  departments: Department[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("MENTOR");
  const [departmentId, setDepartmentId] = useState("");
  const [college, setCollege] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/user/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          username: username.trim() || null,
          roleNames: [role],
          departmentId: departmentId ? Number(departmentId) : null,
          ...(role === "STUDENT" && {
            college: college.trim() || null,
            profileImage: profileImage.trim() || null,
          }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(
        `משתמש נוצר בהצלחה!\nשם משתמש: ${data.user.username}\nסיסמה זמנית: ${data.defaultPassword}`,
      );
      setTimeout(() => onCreated(), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40";
  const selectClass =
    "w-full bg-[#0a0a16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40";

  return (
    <Modal title="משתמש חדש" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">שם פרטי</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              שם משפחה
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">אימייל</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs text-slate-400">שם משתמש</label>
            <span className="text-[10px] text-slate-600">
              {username.trim()
                ? "ידני"
                : `אוטומטי: ${firstName && lastName ? `${firstName}.${lastName}`.toLowerCase().replace(/\s+/g, "") : "—"}`}
            </span>
          </div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="השאר ריק ליצירה אוטומטית"
            className={inputClass + " placeholder:text-slate-700"}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">תפקיד</label>
          <div className="flex gap-2">
            {["ADMIN", "MENTOR", "STUDENT"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  role === r
                    ? r === "ADMIN"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : r === "MENTOR"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-white/[0.02] text-slate-500 border-white/10 hover:border-white/20"
                }`}
              >
                {r === "ADMIN" ? "מנהל" : r === "MENTOR" ? "מנחה" : "סטודנט"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">מחלקה</label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className={selectClass}
          >
            <option value="">ללא מחלקה</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} / {d.unit.name}
              </option>
            ))}
          </select>
        </div>

        {role === "STUDENT" && (
          <>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                מוסד לימודים
              </label>
              <input
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="שם האוניברסיטה / מכללה"
                className={inputClass + " placeholder:text-slate-700"}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                תמונת פרופיל
              </label>
              <ProfileImageInput
                value={profileImage}
                onChange={setProfileImage}
                allowUpload={true}
              />
            </div>
          </>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium whitespace-pre-line">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !!success}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? "יוצר..." : "צור משתמש"}
        </button>
      </form>
    </Modal>
  );
}
