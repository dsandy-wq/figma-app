import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Account</h1>

      {!session ? (
        <>
          <p className="mt-2">You are not signed in.</p>
          <Link
            className="inline-block mt-4 rounded bg-black px-4 py-2 text-white"
            href="/signin"
          >
            Sign in
          </Link>
        </>
      ) : (
        <>
          <p className="mt-2">
            Signed in as <b>{session.user?.email}</b>
          </p>

          <div className="mt-4 flex gap-3">
            <Link className="rounded bg-black px-4 py-2 text-white" href="/">
              Home
            </Link>

            <Link className="rounded border px-4 py-2" href="/api/auth/signout">
              Sign out
            </Link>
          </div>
        </>
      )}
    </main>
  );
}