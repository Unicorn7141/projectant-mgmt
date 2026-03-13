"use client";

import { useCallback, useState } from "react";
import { UserCircle } from "lucide-react";

export function ProfileImageInput({
  value,
  onChange,
  allowUpload = true,
}: {
  value: string;
  onChange: (url: string) => void;
  allowUpload?: boolean;
}) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState(value);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    await uploadFile(file);
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("authToken");
      const res = await fetch("/api/upload/profile-image", {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      if (data.url) onChange(data.url);
    } catch {
      // אפשר לחבר כאן טוסט / הודעת שגיאה לפי הצורך
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {allowUpload && (
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              mode === "upload"
                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                : "bg-white/[0.02] text-slate-500 border-white/10"
            }`}
          >
            העלאה
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              mode === "url"
                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                : "bg-white/[0.02] text-slate-500 border-white/10"
            }`}
          >
            URL
          </button>
        </div>
      )}

      {mode === "upload" && allowUpload ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 cursor-pointer transition-all ${
            dragging
              ? "border-purple-500/60 bg-purple-500/5"
              : "border-white/10 hover:border-purple-500/30 bg-white/[0.02]"
          }`}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileInput}
          />
          {value ? (
            <img
              src={value}
              alt="profile"
              className="w-16 h-16 rounded-full object-cover border border-white/10 mb-2"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2">
              <UserCircle size={28} className="text-slate-600" />
            </div>
          )}
          <p className="text-xs text-slate-400 text-center">
            {uploading
              ? "מעלה..."
              : dragging
                ? "שחרר כאן..."
                : "גרור תמונה או לחץ לבחירה"}
          </p>
          <p className="text-[10px] text-slate-600 mt-1">PNG, JPG, WEBP עד 4MB</p>
        </label>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                onChange(e.target.value);
              }}
              placeholder="https://..."
              className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 placeholder:text-slate-700"
            />
          </div>
          {value && (
            <img
              src={value}
              alt="preview"
              className="w-12 h-12 rounded-full object-cover border border-white/10"
            />
          )}
        </div>
      )}
    </div>
  );
}
