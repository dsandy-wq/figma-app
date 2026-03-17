"use client";

import { useState } from "react";
import { BASE_PATH } from "@/lib/basePath";
import Link from "next/link";
import HaloLogo from "@/app/components/HaloLogo";
import { CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [error, setError]       = useState("");
  const [pending, setPending]   = useState(false);

  async function handleSubmit(e: import("react").FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const res = await fetch(`${BASE_PATH}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    if (res.ok) {
      setPending(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "Registration failed");
    }
  }

  if (pending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f1629]">
        <div className="w-full max-w-sm rounded-2xl bg-white px-8 py-10 shadow-2xl text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-[#0f172a] mb-2">Request sent</h2>
          <p className="text-sm text-[#64748b] mb-6">
            Your account request has been submitted. You&apos;ll receive an email once it&apos;s been approved.
          </p>
          <Link href="/signin" className="text-sm font-medium text-[#3b82f6] hover:underline">
            Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f1629]">
      <div className="w-full max-w-sm rounded-2xl bg-white px-8 py-10 shadow-2xl">
        <div className="mb-8 flex flex-col items-center gap-3">
          <HaloLogo size={52} />
          <span className="text-2xl font-semibold tracking-wide text-[#0f172a]">Halo</span>
          <p className="text-sm text-[#64748b]">Create an account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0f172a] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0f172a] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-sm text-[#0f172a] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20"
          />
          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">{error}</p>
          )}
          <button
            type="submit"
            className="mt-1 rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2563eb] transition-colors"
          >
            Request access
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#64748b]">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-[#3b82f6] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
