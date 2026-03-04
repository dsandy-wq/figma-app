"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

type CalendarEvent = {
  id: string;
  type: string;
  priority: string;
  assignedTo: string;
  clientName: string;
  isDeferred: boolean;
  date: string;
  originalDue: string;
};

const priorityColor: Record<string, string> = {
  HIGH:   "bg-red-100 text-red-700 border-red-200",
  MEDIUM: "bg-orange-100 text-orange-700 border-orange-200",
  LOW:    "bg-green-100 text-green-700 border-green-200",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function formatDayNum(date: Date): string {
  return date.getDate().toString();
}

export default function CalendarPage() {
  const [events, setEvents]         = useState<CalendarEvent[]>([]);
  const [weekStart, setWeekStart]   = useState<Date>(() => startOfWeek(new Date()));
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    fetch("/api/calendar")
      .then((r) => r.json())
      .then((data) => { setEvents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  const eventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.date), day));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">Task Calendar</h1>
          <p className="mt-1 text-sm text-[#64748b]">Pending interventions and deferred tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            className="rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-sm text-[#64748b] hover:bg-[#f8fafc]"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              className="rounded-lg border border-[#e2e8f0] p-1.5 text-[#64748b] hover:bg-[#f8fafc]"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="w-36 text-center text-sm font-medium text-[#0f172a]">
              {formatMonthYear(weekStart)}
            </span>
            <button
              onClick={() => setWeekStart(addDays(weekStart, 7))}
              className="rounded-lg border border-[#e2e8f0] p-1.5 text-[#64748b] hover:bg-[#f8fafc]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-[#64748b]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]" /> Active task
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={10} className="text-[#f59e0b]" />
          <span>Deferred</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" /> HIGH
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange-400" /> MEDIUM
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" /> LOW
        </span>
      </div>

      {/* Week grid */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#f1f5f9]">
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today);
            return (
              <div key={i} className={`px-3 py-3 text-center border-r border-[#f1f5f9] last:border-r-0 ${isToday ? "bg-[#eff6ff]" : ""}`}>
                <p className="text-xs font-medium text-[#64748b]">{DAYS[i]}</p>
                <p className={`mt-0.5 text-lg font-bold ${isToday ? "text-[#3b82f6]" : "text-[#0f172a]"}`}>
                  {formatDayNum(day)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Event cells */}
        <div className="grid grid-cols-7 min-h-[480px]">
          {weekDays.map((day, i) => {
            const dayEvents = eventsForDay(day);
            const isToday = isSameDay(day, today);
            return (
              <div
                key={i}
                className={`border-r border-[#f8fafc] last:border-r-0 p-2 space-y-1.5 ${isToday ? "bg-[#fafcff]" : ""}`}
              >
                {loading ? (
                  <div className="h-4 w-full animate-pulse rounded bg-[#f1f5f9]" />
                ) : dayEvents.length === 0 ? null : (
                  dayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className={`rounded-lg border px-2 py-1.5 text-xs ${priorityColor[ev.priority] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
                    >
                      <div className="flex items-center gap-1 font-medium truncate">
                        {ev.isDeferred && <Clock size={9} className="shrink-0 text-[#f59e0b]" />}
                        <span className="truncate">{ev.clientName}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[10px] opacity-75">{ev.type}</p>
                      <p className="truncate text-[10px] opacity-60">{ev.assignedTo}</p>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming list — all events in next 30 days */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="border-b border-[#f1f5f9] px-6 py-4">
          <h2 className="font-semibold text-[#0f172a]">Upcoming (30 days)</h2>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-[#64748b]">Loading…</div>
        ) : events.length === 0 ? (
          <div className="p-6 text-sm text-[#64748b]">No pending tasks.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#f1f5f9] text-left text-[#64748b]">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Assigned</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} className="border-b border-[#f8fafc] last:border-0 hover:bg-[#f8fafc]">
                  <td className="px-6 py-3 text-[#0f172a] font-medium">
                    {new Date(ev.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                  </td>
                  <td className="px-6 py-3 text-[#0f172a]">{ev.clientName}</td>
                  <td className="px-6 py-3 text-[#64748b]">{ev.type}</td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor[ev.priority] ?? "bg-gray-100 text-gray-600"}`}>
                      {ev.priority.charAt(0) + ev.priority.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[#64748b]">{ev.assignedTo}</td>
                  <td className="px-6 py-3">
                    {ev.isDeferred ? (
                      <span className="flex items-center gap-1 text-[#f59e0b] text-xs font-medium">
                        <Clock size={12} /> Deferred
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-[#3b82f6]">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
