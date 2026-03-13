"use client";

import { useState } from "react";
import { X, Layers } from "lucide-react";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a16] p-8 shadow-2xl"
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4">
        <Layers size={22} className="text-slate-600" />
      </div>
      <p className="text-slate-400 text-sm">{text}</p>
    </div>
  );
}

type Field = {
  key: string;
  label: string;
  type?: string;
  options?: { value: number; label: string }[];
};

export function SimpleCreateModal({
  title,
  fields,
  onClose,
  onSubmit,
}: {
  title: string;
  fields: Field[];
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs text-slate-400 mb-1">
              {field.label}
            </label>
            {field.type === "select" ? (
              <select
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.key]: e.target.value }))
                }
                required
                className="w-full bg-[#0a0a16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                <option value="">בחר...</option>
                {field.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.key]: e.target.value }))
                }
                required
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            )}
          </div>
        ))}
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? "שומר..." : "צור"}
        </button>
      </form>
    </Modal>
  );
}
