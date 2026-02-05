"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { ChatInterface } from "@/app/components/ChatInterface";
import { TamboWrapper } from "@/app/components/TamboWrapper";
import { ThemeToggle } from "@/app/components/ThemeToggle";

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
        <header className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-6 px-6 shadow-lg">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">🏥 Medical Report Generator</h1>
              <p className="text-purple-100">
                Describe your clinical findings in natural language
              </p>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <ChatInterface />
      </main>
    </TamboWrapper>
  );
}
