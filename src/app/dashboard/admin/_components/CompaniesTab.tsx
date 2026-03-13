"use client";

import { Trash2 } from "lucide-react";
import { EmptyState } from "./SimpleModal";

type Company = {
  id: number;
  name: string;
};

export function CompaniesTab({
  companies,
  onDelete,
  onNew,
}: {
  companies: Company[];
  onDelete: (id: number) => void;
  onNew: () => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-slate-400">{companies.length} יחידות</p>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all"
        >
          + יחידה חדשה
        </button>
      </div>

      <div className="grid gap-3">
        {companies.length === 0 ? (
          <EmptyState text="אין יחידות" />
        ) : (
          companies.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0a0a16]/40 px-5 py-4"
            >
              <span className="text-white font-medium">{c.name}</span>
              <button
                onClick={() => onDelete(c.id)}
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
