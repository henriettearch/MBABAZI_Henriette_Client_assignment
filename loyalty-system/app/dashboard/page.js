
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const { data: { user }, error } =
        await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      setUser(user);
      setLoading(false);
    }

    checkUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-green-800 font-bold">
          Loading your dashboard...
        </p>
      </main>
    );
  }

  const firstName = user.user_metadata?.first_name || "Customer";

  return (
    <main className="min-h-screen bg-green-50">
      <nav className="bg-green-900 text-white p-6 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold">
          FRESH<span className="text-orange-400">MART</span>
        </h1>

        <button
          onClick={handleLogout}
          className="bg-orange-500 px-5 py-2 rounded-lg font-bold"
        >
          Logout
        </button>
      </nav>

      <section className="max-w-6xl mx-auto p-8">
        <h2 className="text-3xl font-extrabold text-green-900">
          Welcome, {firstName}!
        </h2>

        <p className="text-gray-600 mt-3">
          Welcome to your FreshMart Customer Loyalty Dashboard.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold text-green-900">
              My Loyalty Points
            </h3>
            <p className="text-3xl font-extrabold mt-4 text-orange-500">
              0
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold text-green-900">
              My Rewards
            </h3>
            <p className="mt-4 text-gray-600">
              No rewards available yet.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold text-green-900">
              My Account
            </h3>
            <p className="mt-4 text-gray-600 break-all">
              {user.email}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
