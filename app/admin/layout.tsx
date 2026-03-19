import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import TopBar from "@/app/components/TopBar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin");

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <TopBar userName={session.user?.name ?? session.user?.email} />
      <main className="ml-64 mt-16 p-8">
        {children}
      </main>
    </div>
  );
}
