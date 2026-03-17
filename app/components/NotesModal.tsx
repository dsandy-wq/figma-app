"use client";

import { useEffect, useState, useRef } from "react";
import { X, Send, FileText } from "lucide-react";
import { BASE_PATH } from "@/lib/basePath";

type Note = {
  id:         string;
  content:    string;
  authorName: string;
  createdAt:  string;
};

type Props = {
  entityId:   string;
  entityType: string;
  entityName: string;
  onClose:    () => void;
};

const entityColor: Record<string, string> = {
  employer: "bg-purple-100 text-purple-700",
  nursery:  "bg-teal-100 text-teal-700",
  employee: "bg-sky-100 text-sky-700",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function NotesModal({ entityId, entityType, entityName, onClose }: Props) {
  const [notes,       setNotes]       = useState<Note[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [newNote,     setNewNote]     = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`${BASE_PATH}/api/notes?entityId=${entityId}&entityType=${entityType}`)
      .then((r) => r.json())
      .then((data) => { setNotes(data); setLoading(false); });
  }, [entityId, entityType]);

  useEffect(() => {
    // Focus textarea when modal opens
    textareaRef.current?.focus();
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newNote.trim() || submitting) return;
    setSubmitting(true);

    const res = await fetch(`${BASE_PATH}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityId, entityType, content: newNote }),
    });

    if (res.ok) {
      onClose();
    }
    setSubmitting(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl" style={{ maxHeight: "80vh" }}>

        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#f1f5f9] px-6 py-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-[#64748b]" />
              <span className="text-xs font-medium text-[#64748b]">Notes</span>
            </div>
            <h2 className="font-semibold text-[#0f172a] text-lg leading-tight">{entityName}</h2>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${entityColor[entityType] ?? "bg-gray-100 text-gray-600"}`}>
              {entityType}
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Notes list — scrollable middle section */}
        <div className="px-6 py-4 space-y-4" style={{ overflowY: "auto", maxHeight: "380px", minHeight: "120px" }}>
          {loading ? (
            <p className="text-center text-sm text-[#94a3b8] py-8">Loading…</p>
          ) : notes.length === 0 ? (
            <p className="text-center text-sm text-[#94a3b8] py-8">No notes yet. Add the first one below.</p>
          ) : (
            notes.map((n) => (
              <div key={n.id} className="rounded-xl border border-[#f1f5f9] bg-[#f8fafc] p-4">
                <p className="text-sm text-[#0f172a] whitespace-pre-wrap leading-relaxed">{n.content}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-[#94a3b8]">
                  <span className="font-medium text-[#64748b]">{n.authorName}</span>
                  <span>·</span>
                  <span>{formatDate(n.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add note form */}
        <form onSubmit={handleSubmit} className="border-t border-[#f1f5f9] px-6 py-4">
          <textarea
            ref={textareaRef}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e as never); }}
            placeholder="Add a note…"
            rows={3}
            className="w-full resize-none rounded-xl border border-[#e2e8f0] px-4 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-[#94a3b8]">⌘↵ to submit</span>
            <button
              type="submit"
              disabled={!newNote.trim() || submitting}
              className="flex items-center gap-1.5 rounded-lg bg-[#0f172a] px-4 py-2 text-xs font-medium text-white disabled:opacity-40 hover:bg-[#1e293b] transition-colors"
            >
              <Send size={12} />
              {submitting ? "Saving…" : "Add note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
