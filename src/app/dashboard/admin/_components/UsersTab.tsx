"use client";

import { Pencil, Trash2, UserCircle } from "lucide-react";
import { EmptyState } from "./SimpleModal";

type UserRow = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  isActive: boolean;
  roles: string[];
  department: string | null;
  unit: string | null;
  company: string | null;
  createdBy: string | null;
  college?: string | null;
  profileImage?: string | null;
};

const roleBadge: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-400 border border-red-500/20",
  MENTOR: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  STUDENT: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};

const roleLabels: Record<string, string> = {
  ADMIN: "מנהל",
  MENTOR: "מנחה",
  STUDENT: "סטודנט",
};

export function UsersTab({
  users,
  loading,
  onEdit,
  onDelete,
  onNew,
}: {
  users: UserRow[];
  loading: boolean;
  onEdit: (u: UserRow) => void;
  onDelete: (id: number) => void;
  onNew: () => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-400">{users.length} משתמשים</p>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all"
        >
          + משתמש חדש
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0a0a16]/40 overflow-hidden">
        <table className="w-full text-sm text-right">
          <thead>
            <tr className="border-b border-white/5 text-slate-400 text-xs">
              <th className="px-4 py-3 font-medium">משתמש</th>
              <th className="px-4 py-3 font-medium">שם משתמש</th>
              <th className="px-4 py-3 font-medium">תפקיד</th>
              <th className="px-4 py-3 font-medium">מחלקה</th>
              <th className="px-4 py-3 font-medium">מוסד</th>
              <th className="px-4 py-3 font-medium">נוצר ע"י</th>
              <th className="px-4 py-3 font-medium">סטטוס</th>
              <th className="px-4 py-3 font-medium">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-500">
                  טוען...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState text="אין משתמשים" />
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.profileImage ? (
                        <img
                          src={u.profileImage}
                          alt={u.firstName}
                          className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <UserCircle size={16} className="text-slate-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300 text-xs">
                    {u.username}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <span
                          key={r}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleBadge[r]}`}
                        >
                          {roleLabels[r] ?? r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs">
                    {u.department ? (
                      <span>
                        {u.department}
                        <span className="text-slate-500"> / {u.unit}</span>
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {u.college ?? <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {u.createdBy ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      }`}
                    >
                      {u.isActive ? "פעיל" : "מושבת"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(u)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(u.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
