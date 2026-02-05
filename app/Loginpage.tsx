"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { ChatInterface } from "@/app/components/ChatInterface";
import { TamboWrapper } from "@/app/components/TamboWrapper";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/auth/login");
      } else {
        setAuthed(true);
      }
      setChecking(false);
    };
    check();
  }, [router]);

  if (checking) {
    return (
      <main className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Checking authentication…</p>
      </main>
    );
  }

  if (!authed) return null;

  return (
    <TamboWrapper>
      <main className="h-screen bg-gradient-to-br from-purple-600 to-indigo-700">
        <ChatInterface />
      </main>
    </TamboWrapper>
  );
}
