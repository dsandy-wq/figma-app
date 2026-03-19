"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BASE_PATH } from "@/lib/basePath";

const STAGES = ["Invited", "Registered", "Profile Complete", "Employer Confirmed", "Nursery Enquiry Sent", "Arrangement Pending", "Contracts Sent", "Active", "Offboarding"];

export default function NewEmployeePage() {
  const router = useRouter();
  const [error, setError]   = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const body = {
      firstName:    form.get("firstName") as string,
      lastName:     form.get("lastName") as string,
      email:        form.get("email") as string,
      employerName: form.get("employerName") as string,
      stage:        form.get("stage") as string,
    };

    if (!body.firstName.trim() || !body.lastName.trim()) {
      setError("First and last name are required.");
      setSaving(false);
      return;
    }

    const res = await fetch(`${BASE_PATH}/api/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Something went wrong.");
      setSaving(false);
      return;
    }

    router.push("/admin/employees");
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-[#0f172a]">Add Employee</h1>
      <form onSubmit={handleSubmit} className="rounded-xl bg-white p-8 shadow-sm space-y-5">
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {[
          { label: "First Name *",  name: "firstName",    placeholder: "e.g. Oliver",             required: true  },
          { label: "Last Name *",   name: "lastName",     placeholder: "e.g. Bennett",            required: true  },
          { label: "Email",         name: "email",        placeholder: "oliver@company.co.uk",    required: false },
          { label: "Employer Name", name: "employerName", placeholder: "e.g. TechNova Ltd",       required: false },
        ].map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-[#0f172a] mb-1">{f.label}</label>
            <input name={f.name} placeholder={f.placeholder} required={f.required}
              className="w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]" />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-[#0f172a] mb-1">Stage</label>
          <select name="stage" className="w-full rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]">
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <button type="submit" disabled={saving}
          className="rounded-lg bg-[#3b82f6] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2563eb] disabled:opacity-60">
          {saving ? "Saving…" : "Add Employee"}
        </button>
      </form>
    </div>
  );
}
