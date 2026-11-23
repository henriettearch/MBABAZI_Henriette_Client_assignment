
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Login failed. Please try again.");
      }

      setMessage("Welcome back to FreshMart! Login successful.");

      // Redirect to homepage for now.
      // We can create a customer dashboard next.
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (error) {
      setMessage(
        error.message || "Login failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-950 via-green-800 to-green-700 p-6">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        <div className="bg-green-800 text-white text-center p-8">
          <h1 className="text-3xl font-extrabold">
            🛒 FRESH<span className="text-orange-400">MART</span>
          </h1>

          <p className="text-green-100 mt-3">
            Welcome back to our Loyalty Club!
          </p>
        </div>

        <div className="p-8">

          <h2 className="text-3xl font-extrabold text-green-900 text-center mb-2">
            Login
          </h2>

          <p className="text-gray-600 text-center mb-8">
            Sign in to access your FreshMart account.
          </p>

          {message && (
            <p
              role="status"
              aria-live="polite"
              className="mb-5 text-center font-semibold text-sm text-green-700"
            >
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label
                htmlFor="email"
                className="block text-gray-800 font-bold mb-2"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
                className="w-full bg-gray-50 border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-green-700 outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-gray-800 font-bold mb-2"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full bg-gray-50 border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-green-700 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-extrabold py-4 rounded-lg text-lg transition"
            >
              {loading ? "LOGGING IN..." : "LOGIN →"}
            </button>

          </form>

          <p className="text-center text-gray-700 mt-7">
            Don't have an account?{" "}
            <a
              href="/"
              className="text-green-800 font-bold hover:text-orange-500"
            >
              Create Account
            </a>
          </p>

        </div>
      </div>
    </main>
  );
}