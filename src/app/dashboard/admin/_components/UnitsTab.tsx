"use client";

import { Trash2 } from "lucide-react";
import { EmptyState } from "./SimpleModal";

type Unit = {
  id: number;
  name: string;
  company: { name: string };
};

export function UnitsTab({
  units,
  onDelete,
  onNew,
}: {
  units: Unit[];
  onDelete: (id: number) => void;
  onNew: () => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-400">{units.length} גפים</p>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all"
        >
          + גף חדש
        </button>
      </div>

      <div className="grid gap-3">
        {units.length === 0 ? (
          <EmptyState text="אין גפים" />
        ) : (
          units.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0a0a16]/40 px-5 py-4"
            >
              <div>
                <p className="text-white font-medium">{u.name}</p>
                <p className="text-xs text-slate-500">{u.company.name}</p>
              </div>
              <button
                onClick={() => onDelete(u.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
