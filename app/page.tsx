import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import HaloLogo from "@/app/components/HaloLogo";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f1629]">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <HaloLogo size={64} />
        </div>
        <h1 className="text-3xl font-semibold text-white tracking-wide">Halo</h1>
        <p className="mt-2 text-[#64748b]">Internal operations platform</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signin" className="rounded-lg bg-[#3b82f6] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2563eb] transition-colors">
            Sign in
          </Link>
          <Link href="/register" className="rounded-lg border border-[#334155] bg-[#1e2d45] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#243552] transition-colors">
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}
