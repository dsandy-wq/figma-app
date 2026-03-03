import Link from "next/link";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Home</h1>
      <div className="mt-4 flex gap-3">
        <Link className="rounded bg-black px-4 py-2 text-white" href="/dashboard">
          Dashboard
        </Link>
        <Link className="rounded border px-4 py-2" href="/account">
          Account
        </Link>
      </div>
    </main>
  );
}
