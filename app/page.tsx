import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import HaloLogo from "@/app/components/HaloLogo";
import { BarChart3, Users } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f1629]">
      <div className="w-full max-w-2xl px-6">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center gap-3">
          <HaloLogo size={56} />
          <h1 className="text-3xl font-semibold tracking-wide text-white">Halo</h1>
          <p className="text-[#64748b]">Internal platform — select your workspace</p>
        </div>

        {/* Gate tiles */}
        <div className="grid grid-cols-2 gap-6">
          <Link
            href="/admin"
            className="group flex flex-col gap-4 rounded-2xl border border-[#1e3a5f] bg-[#0f2744] p-8 transition-all hover:border-[#3b82f6] hover:bg-[#0f2f5e] hover:shadow-lg hover:shadow-[#3b82f6]/10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e3a5f] group-hover:bg-[#1d4ed8] transition-colors">
              <BarChart3 className="h-6 w-6 text-[#3b82f6] group-hover:text-white transition-colors" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Operations</h2>
              <p className="mt-1 text-sm text-[#64748b]">
                Client journeys, interventions, finance and lifecycle management.
              </p>
            </div>
            <span className="text-xs font-medium text-[#3b82f6] group-hover:underline">
              Go to Admin →
            </span>
          </Link>

          <Link
            href="/customer"
            className="group flex flex-col gap-4 rounded-2xl border border-[#1e3a5f] bg-[#0f2744] p-8 transition-all hover:border-[#8b5cf6] hover:bg-[#1a0f40] hover:shadow-lg hover:shadow-[#8b5cf6]/10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e3a5f] group-hover:bg-[#7c3aed] transition-colors">
              <Users className="h-6 w-6 text-[#8b5cf6] group-hover:text-white transition-colors" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Sales</h2>
              <p className="mt-1 text-sm text-[#64748b]">
                Lead pipeline, outreach, and customer acquisition.
              </p>
            </div>
            <span className="text-xs font-medium text-[#8b5cf6] group-hover:underline">
              Go to Customer →
            </span>
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-[#334155]">
          Signed in as {session.user?.email}
        </p>
      </div>
    </main>
  );
}
