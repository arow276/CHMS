"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function FileUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("file", file);

      const res = await fetch("/api/import/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Upload failed");
        setUploading(false);
        return;
      }

      router.push(`/import/${data.jobId}`);
    } catch (err) {
      setError(String(err));
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }

  return (
    <div className="max-w-xl">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
          dragOver
            ? "border-amber-500 bg-amber-500/5"
            : file
              ? "border-green-600 bg-green-900/10"
              : "border-zinc-700 hover:border-zinc-500"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.tsv,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
          }}
        />

        {file ? (
          <div>
            <div className="text-white font-medium">{file.name}</div>
            <div className="text-xs text-zinc-500 mt-1">
              {(file.size / 1024).toFixed(1)} KB
            </div>
            <button
              type="button"
              className="text-xs text-zinc-400 hover:text-white mt-2 underline"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
            >
              Choose a different file
            </button>
          </div>
        ) : (
          <div>
            <div className="text-zinc-400">
              Drop your file here or click to browse
            </div>
            <div className="text-xs text-zinc-600 mt-2">
              CSV, Excel (.xlsx, .xls), TSV
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        disabled={!file || uploading}
        onClick={handleUpload}
        className="mt-4 w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium rounded-lg transition-colors"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">&#8987;</span>
            Analyzing with AI...
          </span>
        ) : (
          "Upload & Analyze"
        )}
      </button>

      {uploading && (
        <p className="text-xs text-zinc-500 mt-2 text-center">
          AI is analyzing your file structure, detecting column types, and
          suggesting the best mapping for your church data...
        </p>
      )}

      {/* What to expect */}
      <div className="mt-8 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">
          What happens next?
        </h3>
        <ol className="space-y-2 text-xs text-zinc-500">
          <li className="flex gap-2">
            <span className="text-amber-500 font-bold">1.</span>
            AI analyzes your file and detects column types (names, emails, phone numbers, etc.)
          </li>
          <li className="flex gap-2">
            <span className="text-amber-500 font-bold">2.</span>
            Columns are mapped to Shepherd fields with confidence scores
          </li>
          <li className="flex gap-2">
            <span className="text-amber-500 font-bold">3.</span>
            Categories from your church (statuses, group types) are detected and mapped
          </li>
          <li className="flex gap-2">
            <span className="text-amber-500 font-bold">4.</span>
            You review and adjust the mappings before importing
          </li>
          <li className="flex gap-2">
            <span className="text-amber-500 font-bold">5.</span>
            Data is imported — existing records are updated, not duplicated
          </li>
        </ol>
      </div>
    </div>
  );
}
