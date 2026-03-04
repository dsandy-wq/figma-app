"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle, Mail, Phone, FileWarning, Scale, StickyNote, X, Send } from "lucide-react";

type Client = { name: string; amount: string; daysOverdue: number; stage: number };
type Note   = { text: string; timestamp: Date };

const clients: Client[] = [
  { name: "Acme Corp",  amount: "£1,200", daysOverdue: 14, stage: 3 },
  { name: "Falcon Ltd", amount: "£750",   daysOverdue: 8,  stage: 3 },
];

const COMMS = [
  { id: "reminder", label: "Payment Reminder",  icon: Mail,        style: "border-blue-200   bg-blue-50   text-blue-700",   sentStyle: "border-blue-600   bg-blue-600   text-white"   },
  { id: "overdue",  label: "Overdue Notice",     icon: FileWarning, style: "border-orange-200 bg-orange-50 text-orange-700", sentStyle: "border-orange-500 bg-orange-500 text-white"   },
  { id: "final",    label: "Final Demand",       icon: Mail,        style: "border-red-200    bg-red-50    text-red-700",    sentStyle: "border-red-600    bg-red-600    text-white"    },
  { id: "phone",    label: "Log Phone Call",     icon: Phone,       style: "border-[#e2e8f0]  bg-[#f8fafc] text-[#475569]", sentStyle: "border-[#475569]  bg-[#475569]  text-white"    },
  { id: "legal",    label: "Refer to Recovery",  icon: Scale,       style: "border-purple-200 bg-purple-50 text-purple-700", sentStyle: "border-purple-700 bg-purple-700 text-white"   },
] as const;

const STAGES = ["Initial Invoice","7-Day Reminder","Overdue Notice","Phone Follow-up","Final Demand","Legal / Recovery"];

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// ── Notes modal ──────────────────────────────────────────────────────────────
function NotesModal({
  clientName, notes, onAdd, onClose,
}: {
  clientName: string;
  notes: Note[];
  onAdd: (text: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [notes]);

  function submit() {
    const t = draft.trim();
    if (!t) return;
    onAdd(t);
    setDraft("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="flex w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f1f5f9] px-6 py-4">
          <div>
            <p className="font-semibold text-[#0f172a]">{clientName}</p>
            <p className="text-xs text-[#64748b]">Notes history</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#94a3b8] hover:bg-[#f1f5f9]">
            <X size={16} />
          </button>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto max-h-80 px-6 py-4 space-y-3">
          {notes.length === 0 ? (
            <p className="text-center text-sm text-[#94a3b8]">No notes yet.</p>
          ) : (
            notes.map((n, i) => (
              <div key={i} className="rounded-lg bg-[#f8fafc] px-4 py-3">
                <p className="text-xs text-[#94a3b8] mb-1">{fmtDate(n.timestamp)} at {fmtTime(n.timestamp)}</p>
                <p className="text-sm text-[#0f172a]">{n.text}</p>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Add note */}
        <div className="border-t border-[#f1f5f9] px-6 py-4 flex gap-2">
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }}}
            placeholder="Add a note…"
            className="flex-1 resize-none rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
          />
          <button
            onClick={submit}
            disabled={!draft.trim()}
            className="self-end rounded-lg bg-[#3b82f6] px-3 py-2 text-white hover:bg-[#2563eb] disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CreditControlPage() {
  // sentAt: "clientName::commId" → Date
  const [sentAt,     setSentAt]     = useState<Record<string, Date>>({});
  // notes: clientName → Note[]
  const [notes,      setNotes]      = useState<Record<string, Note[]>>({});
  // which client's notes modal is open
  const [notesOpen,  setNotesOpen]  = useState<string | null>(null);

  function handleSend(clientName: string, commId: string) {
    const key = `${clientName}::${commId}`;
    if (sentAt[key]) return;
    setSentAt((prev) => ({ ...prev, [key]: new Date() }));
  }

  function addNote(clientName: string, text: string) {
    setNotes((prev) => ({
      ...prev,
      [clientName]: [...(prev[clientName] ?? []), { text, timestamp: new Date() }],
    }));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a]">Credit Control</h1>

      {/* Stage reference strip */}
      <div className="rounded-xl bg-white px-6 py-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#64748b]">Recovery Stages</p>
        <div className="flex items-center">
          {STAGES.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f1f5f9] text-xs font-bold text-[#64748b]">{i + 1}</div>
                <p className="mt-1 max-w-[72px] text-center text-[10px] leading-tight text-[#64748b]">{s}</p>
              </div>
              {i < STAGES.length - 1 && <div className="mx-1 mb-4 h-px w-8 bg-[#e2e8f0]" />}
            </div>
          ))}
        </div>
      </div>

      {/* Client table */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#f1f5f9] text-left text-[#64748b]">
              <th className="px-6 py-3 font-medium">Client</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Days Overdue</th>
              <th className="px-6 py-3 font-medium">Stage</th>
              <th className="px-6 py-3 font-medium">Issue Comms</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.name} className="border-b border-[#f8fafc] last:border-0 align-top hover:bg-[#fafcff]">
                <td className="px-6 py-4 font-medium text-[#0f172a]">{c.name}</td>
                <td className="px-6 py-4 font-semibold text-[#ef4444]">{c.amount}</td>
                <td className="px-6 py-4 text-[#64748b]">{c.daysOverdue} days</td>
                <td className="px-6 py-4 text-[#64748b]">Step {c.stage} — {STAGES[c.stage - 1]}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {COMMS.map((comm) => {
                      const key  = `${c.name}::${comm.id}`;
                      const date = sentAt[key];
                      const Icon = comm.icon;
                      return date ? (
                        <div
                          key={comm.id}
                          className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${comm.sentStyle}`}
                        >
                          <CheckCircle size={13} className="shrink-0 mt-0.5" />
                          <div className="leading-tight">
                            <p>{comm.label}</p>
                            <p className="font-bold tracking-wide">Completed · {fmtDate(date)}</p>
                          </div>
                        </div>
                      ) : (
                        <button
                          key={comm.id}
                          onClick={() => handleSend(c.name, comm.id)}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80 ${comm.style}`}
                        >
                          <Icon size={12} />
                          {comm.label}
                        </button>
                      );
                    })}

                    {/* Notes button */}
                    <button
                      onClick={() => setNotesOpen(c.name)}
                      className="flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-medium text-[#0f172a] hover:bg-[#f8fafc]"
                    >
                      <StickyNote size={12} />
                      Notes
                      {(notes[c.name]?.length ?? 0) > 0 && (
                        <span className="ml-0.5 rounded-full bg-[#3b82f6] px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {notes[c.name].length}
                        </span>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes modal */}
      {notesOpen && (
        <NotesModal
          clientName={notesOpen}
          notes={notes[notesOpen] ?? []}
          onAdd={(text) => addNote(notesOpen, text)}
          onClose={() => setNotesOpen(null)}
        />
      )}
    </div>
  );
}
