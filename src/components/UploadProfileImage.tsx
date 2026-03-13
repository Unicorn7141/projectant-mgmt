"use client";

import { useCallback, useState } from "react";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { useDropzone } from "@uploadthing/react";
import { useUploadThing } from "@/lib/uploadthing";

export function UploadProfileImage({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const { startUpload, permittedFileInfo } = useUploadThing("profileImage", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        onChange(res[0].url);
      }
      setUploading(false);
    },
    onUploadError: () => {
      setUploading(false);
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setUploading(true);
      startUpload(acceptedFiles);
    },
    [startUpload],
  );

  const fileTypes = permittedFileInfo?.config
    ? Object.keys(permittedFileInfo.config)
    : [];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: fileTypes.length
      ? generateClientDropzoneAccept(fileTypes)
      : undefined,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 cursor-pointer transition-all ${
          isDragActive
            ? "border-purple-500/60 bg-purple-500/5"
            : "border-white/10 hover:border-purple-500/30 bg-white/[0.02]"
        }`}
      >
        <input {...getInputProps()} />
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
            ? "מעלה תמונה..."
            : isDragActive
              ? "שחרר כאן..."
              : "גרור תמונה או לחץ לבחירה"}
        </p>
        <p className="text-[10px] text-slate-600 mt-1">PNG, JPG עד 4MB</p>
      </div>
    </div>
  );
}
