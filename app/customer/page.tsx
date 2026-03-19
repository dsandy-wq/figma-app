import Link from "next/link";
import HaloLogo from "@/app/components/HaloLogo";
import { ArrowLeft } from "lucide-react";

export default function CustomerPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <HaloLogo size={48} />
      <h1 className="mt-4 text-2xl font-semibold text-white">Sales</h1>
      <p className="mt-2 text-sm text-[#64748b] max-w-xs">
        Sandy&apos;s workspace — lead pipeline, outreach, and customer acquisition coming soon.
      </p>
      <Link
        href="/"
        className="mt-8 flex items-center gap-2 rounded-lg border border-[#1e3a5f] px-4 py-2 text-sm text-[#64748b] hover:text-white hover:border-[#334155] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to gate
      </Link>
    </main>
  );
}
