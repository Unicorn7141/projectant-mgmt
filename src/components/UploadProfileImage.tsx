"use client";

import { useCallback, useState } from "react";

export function UploadProfileImage({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Missing auth token");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("saveToProfile", "false");

      const res = await fetch("/api/upload/profile-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = (await res.json()) as { url?: string; message?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.message || "Upload failed");
      }

      onChange(data.url);
    },
    [onChange],
  );

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (!file) return;
      setUploading(true);
      try {
        await uploadFile(file);
      } finally {
        setUploading(false);
      }
    },
    [uploadFile],
  );

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadFile(file);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 cursor-pointer transition-all ${
        dragging
          ? "border-purple-500/60 bg-purple-500/5"
          : "border-white/10 hover:border-purple-500/30 bg-white/[0.02]"
      }`}
    >
      <input
        type="file"
        accept="image/*"
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
          <span className="text-2xl text-slate-600">👤</span>
        </div>
      )}
      <p className="text-xs text-slate-400 text-center">
        {uploading
          ? "מעלה..."
          : dragging
            ? "שחרר כאן..."
            : "גרור תמונה או לחץ לבחירה"}
      </p>
      <p className="text-[10px] text-slate-600 mt-1">PNG, JPG עד 4MB</p>
    </label>
  );
}
