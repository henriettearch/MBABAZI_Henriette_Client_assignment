


"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    if (form.password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            phone: form.phone,
          },
        },
      });

      if (error) throw error;

      if (data.user && !data.session) {
        setMessage(
          "Registration successful! Please check your email to confirm your account."
        );
      } else {
        setMessage("Welcome to FreshMart! Your account has been created.");
      }

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

    } catch (error) {
      setMessage(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { label: "First Name", name: "firstName", type: "text" },
    { label: "Last Name", name: "lastName", type: "text" },
    { label: "Email Address", name: "email", type: "email" },
    { label: "Phone Number", name: "phone", type: "tel" },
    { label: "Password", name: "password", type: "password" },
    { label: "Confirm Password", name: "confirmPassword", type: "password" },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-blue-900 to-purple-900 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-extrabold text-indigo-800 text-center mb-2">
          Create Account
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Join our Customer Loyalty Points System
        </p>

        {message && (
          <p
            role="status"
            className="mb-5 text-center font-semibold text-indigo-700"
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="block text-sm font-bold text-gray-800 mb-2"
              >
                {field.label}
              </label>

              <input
                id={field.name}
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-blue-50 border-2 border-indigo-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200"
                placeholder={`Enter your ${field.label.toLowerCase()}`}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-700 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-lg transition duration-300"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-700 mt-6">
          Already have an account?{" "}
          <a
            href="/"
            className="text-indigo-700 font-bold hover:text-purple-700"
          >
            Login
          </a>
        </p>
      </div>
    </main>
  );
}
