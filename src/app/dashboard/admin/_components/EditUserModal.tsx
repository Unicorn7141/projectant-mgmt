"use client";

import { useState } from "react";
import { Modal } from "./SimpleModal";
import { ProfileImageInput } from "@/components/ProfileImageInput";

type Department = {
  id: number;
  name: string;
  unit: { name: string };
};

type UserRow = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  departmentId: number | null;
  roles: string[];
  college?: string | null;
  profileImage?: string | null;
};

export function EditUserModal({
  token,
  user,
  departments,
  onClose,
  onSaved,
}: {
  token: string;
  user: UserRow;
  departments: Department[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [isActive, setIsActive] = useState(user.isActive);
  const [role, setRole] = useState(user.roles[0] ?? "STUDENT");
  const [college, setCollege] = useState(user.college ?? "");
  const [profileImage, setProfileImage] = useState(user.profileImage ?? "");
  const [departmentId, setDepartmentId] = useState(
    user.departmentId?.toString() ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isStudent = role === "STUDENT";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/user/edit", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          firstName,
          lastName,
          email,
          isActive,
          roles: [role],
          departmentId: departmentId ? Number(departmentId) : null,
          college: isStudent ? college.trim() || null : null,
          profileImage: isStudent ? profileImage.trim() || null : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess("השינויים נשמרו בהצלחה");
      setTimeout(() => onSaved(), 1500);
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
    <Modal title="עריכת משתמש" onClose={onClose}>
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

        {isStudent && (
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

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <span className="text-sm text-slate-300">משתמש פעיל</span>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              isActive ? "bg-purple-600" : "bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                isActive ? "right-1" : "left-1"
              }`}
            />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !!success}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? "שומר..." : "שמור שינויים"}
        </button>
      </form>
    </Modal>
  );
}
