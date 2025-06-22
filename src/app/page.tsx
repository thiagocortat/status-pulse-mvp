"use client"

import { useSession } from "@supabase/auth-helpers-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  if (session) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 text-center">
      <h1 className="text-4xl font-bold">Status Pulse</h1>
      <p className="max-w-md text-lg">
        Monitoramento de serviços em tempo real para garantir a continuidade do
        seu negócio.
      </p>
      <a href="/login" className="bg-black text-white px-6 py-2 rounded">
        Login
      </a>
    </main>
  );
}
