"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BASE_PATH } from "@/lib/basePath";

const STAGES = ["Signed Up", "Profile Complete", "Verification Pending", "Documents Requested", "Documents Submitted", "Approved", "Agreement Sent", "Live"];

export default function NewNurseryPage() {
  const router = useRouter();
  const [error, setError]   = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const body = {
      name:         form.get("name") as string,
      contactName:  form.get("contactName") as string,
      contactEmail: form.get("contactEmail") as string,
      ofstedNumber: form.get("ofstedNumber") as string,
      stage:        form.get("stage") as string,
    };

    if (!body.name.trim()) { setError("Name is required."); setSaving(false); return; }

    const res = await fetch(`${BASE_PATH}/api/nurseries`, {
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

    router.push("/admin/nurseries");
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-[#0f172a]">Add Nursery</h1>
      <form onSubmit={handleSubmit} className="rounded-xl bg-white p-8 shadow-sm space-y-5">
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        {[
          { label: "Nursery Name *",  name: "name",         placeholder: "e.g. Bright Stars Nursery", required: true  },
          { label: "Contact Name",    name: "contactName",  placeholder: "e.g. Helen Ward",           required: false },
          { label: "Contact Email",   name: "contactEmail", placeholder: "helen@nursery.co.uk",        required: false },
          { label: "Ofsted Number",   name: "ofstedNumber", placeholder: "e.g. EY123456",             required: false },
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
          {saving ? "Saving…" : "Add Nursery"}
        </button>
      </form>
    </div>
  );
}
