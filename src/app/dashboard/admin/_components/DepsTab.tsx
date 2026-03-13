"use client";

import { Trash2 } from "lucide-react";
import { EmptyState } from "./SimpleModal";

type Department = {
  id: number;
  name: string;
  unit: { name: string; company: { name: string } };
};

export function DepsTab({
  departments,
  onDelete,
  onNew,
}: {
  departments: Department[];
  onDelete: (id: number) => void;
  onNew: () => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-400">{departments.length} מחלקות</p>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all"
        >
          + מחלקה חדשה
        </button>
      </div>

      <div className="grid gap-3">
        {departments.length === 0 ? (
          <EmptyState text="אין מחלקות" />
        ) : (
          departments.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0a0a16]/40 px-5 py-4"
            >
              <div>
                <p className="text-white font-medium">{d.name}</p>
                <p className="text-xs text-slate-500">
                  {d.unit.name} / {d.unit.company.name}
                </p>
              </div>
              <button
                onClick={() => onDelete(d.id)}
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
