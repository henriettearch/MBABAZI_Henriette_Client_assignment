

"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (form.password !== form.confirmPassword) {
      setMessageType("error");
      setMessage("Passwords do not match. Please try again.");
      return;
    }

    if (form.password.length < 6) {
      setMessageType("error");
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            first_name: form.firstName.trim(),
            last_name: form.lastName.trim(),
            phone: form.phone.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Registration could not be completed. Please try again.");
      }

      setMessageType("success");

      if (data.session) {
        setMessage(
          "Congratulations! Your FreshMart account has been created successfully. You can now log in."
        );
      } else {
        setMessage(
          "Your registration was successful! Please check your email for a verification link before logging in."
        );
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
      setMessageType("error");
      setMessage(
        error.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { name: "firstName", label: "First Name", type: "text" },
    { name: "lastName", label: "Last Name", type: "text" },
    { name: "email", label: "Email Address", type: "email" },
    { name: "phone", label: "Phone Number", type: "tel" },
    { name: "password", label: "Password", type: "password" },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
    },
  ];

  return (
    <main className="min-h-screen bg-white">

      {/* Navigation */}
      <nav className="bg-white shadow-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-green-800">
              🛒 FRESH<span className="text-orange-500">MART</span>
            </h1>
            <p className="text-sm text-gray-500">
              Supermarket & Loyalty Club
            </p>
          </div>

          <a
            href="/login"
            className="bg-green-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700"
          >
            Login
          </a>
        </div>
      </nav>

      {/* Main section */}
      <section className="bg-gradient-to-br from-green-950 via-green-800 to-green-700">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 p-6 md:p-12 items-center">

          {/* Welcome section */}
          <div className="text-white py-8">
            <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
              FRESHMART LOYALTY CLUB
            </span>

            <h2 className="text-5xl md:text-6xl font-extrabold mt-8 leading-tight">
              Shop More.
              <span className="block text-orange-400">
                Earn More!
              </span>
            </h2>

            <p className="text-green-100 text-lg mt-6 leading-relaxed">
              Welcome to FreshMart! Join our customer loyalty
              program and turn your everyday shopping into
              exciting rewards.
            </p>

            {/* Shopping categories */}
            <div className="grid grid-cols-3 gap-3 mt-10">
              {[
                ["🥬", "Fresh Produce"],
                ["🥖", "Bakery"],
                ["🥛", "Groceries"],
                ["🛒", "Shop"],
                ["⭐", "Earn Points"],
                ["🎁", "Get Rewards"],
              ].map(([emoji, label]) => (
                <div
                  key={label}
                  className="bg-white/10 rounded-xl p-4 text-center border border-white/20"
                >
                  <div className="text-3xl">{emoji}</div>
                  <p className="text-sm font-semibold mt-2">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 border-l-4 border-orange-400 pl-4">
              <p className="text-orange-300 font-bold text-xl">
                Fresh Choices. Greater Rewards.
              </p>
              <p className="text-green-100 text-sm mt-1">
                Your shopping experience just got better!
              </p>
            </div>
          </div>

          {/* Registration form */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-green-800 text-white text-center p-7">
              <h2 className="text-3xl font-extrabold">
                Create Account
              </h2>
              <p className="text-green-100 mt-2">
                Become a FreshMart loyalty member today!
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 md:p-8 space-y-4"
            >
              {fields.map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="block text-gray-800 font-bold text-sm mb-2"
                  >
                    {field.label}
                  </label>

                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    required
                    autoComplete={
                      field.name === "confirmPassword"
                        ? "new-password"
                        : field.name === "password"
                        ? "new-password"
                        : field.name === "email"
                        ? "email"
                        : field.name === "firstName"
                        ? "given-name"
                        : field.name === "lastName"
                        ? "family-name"
                        : "tel"
                    }
                    className="w-full bg-gray-50 border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-green-700 focus:ring-2 focus:ring-green-100 outline-none transition"
                  />
                </div>
              ))}

              {message && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`text-sm font-semibold ${
                    messageType === "error"
                      ? "text-red-600"
                      : "text-green-800"
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-extrabold py-4 rounded-lg text-lg shadow-md transition"
              >
                {loading
                  ? "CREATING ACCOUNT..."
                  : "CREATE MY ACCOUNT →"}
              </button>

              <p className="text-center text-gray-600 text-sm">
                By registering, you agree to our membership terms.
              </p>

              <p className="text-center text-gray-700">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-green-800 font-bold hover:text-orange-500"
                >
                  Login here
                </a>
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-950 text-white p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-4 text-sm">
          <p>© 2026 FreshMart Supermarket</p>
          <p>
            Secure Shopping | Customer Rewards | Better Experience
          </p>
        </div>
      </footer>

    </main>
  );
}
