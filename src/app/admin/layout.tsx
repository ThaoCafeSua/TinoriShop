import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import SessionProvider from "@/components/SessionProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Login page doesn't need auth
  // We'll check dynamically; pages that need auth redirect
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
