"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HaloLogo from "@/app/components/HaloLogo";

export default function RegisterPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/signin");
    } else {
      const data = await res.json();
      setError(data.error ?? "Registration failed");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f1629]">
      <div className="w-full max-w-sm rounded-2xl bg-white px-8 py-10 shadow-2xl">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <HaloLogo size={52} />
          <span className="text-2xl font-semibold tracking-wide text-[#0f172a]">Halo</span>
          <p className="text-sm text-[#64748b]">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            className="mt-1 rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2563eb] transition-colors"
          >
            Create account
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
