"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import HaloLogo from "@/app/components/HaloLogo";

function SignInForm() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [banner, setBanner]     = useState("");
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("approved") === "1") setBanner("Account approved — you can now sign in.");
    if (searchParams.get("error") === "invalid-token") setBanner("That approval link is invalid or has already been used.");
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.ok) {
      router.push("/dashboard");
    } else if (result?.error === "pending-approval") {
      setError("Your account is awaiting approval. You'll be able to sign in once approved.");
    } else {
      setError("Invalid email or password.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f1629]">
      <div className="w-full max-w-sm rounded-2xl bg-white px-8 py-10 shadow-2xl">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <HaloLogo size={52} />
          <span className="text-2xl font-semibold tracking-wide text-[#0f172a]">Halo</span>
          <p className="text-sm text-[#64748b]">Sign in to your account</p>
        </div>

        {banner && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {banner}
          </div>
        )}

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
            placeholder="Password"
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
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#64748b]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-[#3b82f6] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
