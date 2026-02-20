import { prisma } from "@/lib/prisma";

export default async function Home() {
  await prisma.user.upsert({
  where: { email: "test@example.com" },
  update: { name: "Test User" },
  create: { email: "test@example.com", name: "Test User" },
});

  const users = await prisma.user.findMany();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Database Working ✅</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </main>
  );
}