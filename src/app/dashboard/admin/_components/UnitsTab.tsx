"use client";

import { Pencil, Trash2 } from "lucide-react";
import { EmptyState } from "./SimpleModal";

type Unit = {
  id: number;
  name: string;
  companyId: number;
  company: { name: string };
};

export function UnitsTab({
  units,
  onDelete,
  onEdit,
  onNew,
}: {
  units: Unit[];
  onDelete: (id: number) => void;
  onEdit: (unit: Unit) => void;
  onNew: () => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-400">{units.length} יחידות</p>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all"
        >
          + יחידה חדשה
        </button>
      </div>

      <div className="grid gap-3">
        {units.length === 0 ? (
          <EmptyState text="אין יחידות" />
        ) : (
          units.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0a0a16]/40 px-5 py-4"
            >
              <div>
                <p className="text-white font-medium">{u.name}</p>
                <p className="text-xs text-slate-500">{u.company.name} / {u.name}</p>
              </div>
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
