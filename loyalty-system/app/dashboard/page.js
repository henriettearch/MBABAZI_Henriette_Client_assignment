
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const products = [
  { id: 1, name: "Fresh Tomatoes", category: "Vegetables", size: "250g", price: 1800, image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600" },
  { id: 2, name: "Fresh Carrots", category: "Vegetables", size: "1kg", price: 2000, image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=600" },
  { id: 3, name: "Fresh Spinach", category: "Vegetables", size: "1kg", price: 1200, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600" },
  { id: 4, name: "Green Pepper", category: "Vegetables", size: "1 piece", price: 1100, image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600" },
  { id: 5, name: "Sweet Bananas", category: "Fruits", size: "1 piece", price: 1100, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600" },
  { id: 6, name: "Red Apples", category: "Fruits", size: "1 piece", price: 1000, image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600" },
  { id: 7, name: "Fresh Avocado", category: "Fruits", size: "1 piece", price: 1100, image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600" },
  { id: 8, name: "Fresh Oranges", category: "Fruits", size: "1 piece", price: 800, image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=600" },
  { id: 9, name: "Potato Chips", category: "Snacks", size: "Small packet", price: 1500, image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600" },
  { id: 10, name: "Chocolate Donut", category: "Snacks", size: "1 piece", price: 1700, image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600" },
  { id: 11, name: "Chocolate Croissant", category: "Snacks", size: "1 piece", price: 3500, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600" },
  { id: 12, name: "Instant Noodles", category: "Snacks", size: "70g", price: 1100, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600" },
  { id: 13, name: "Whole Milk", category: "Milk", size: "1 litre", price: 2800, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600" },
  { id: 14, name: "Fresh Milk", category: "Milk", size: "500ml", price: 1500, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600" },
  { id: 15, name: "Vanilla Ice Cream", category: "Ice Cream", size: "250ml", price: 4300, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600" },
  { id: 16, name: "Chocolate Ice Cream", category: "Ice Cream", size: "500ml", price: 7800, image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600" },
  { id: 17, name: "Strawberry Ice Cream", category: "Ice Cream", size: "500ml", price: 7300, image: "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=600" },
];

const categories = ["All", "Vegetables", "Fruits", "Snacks", "Milk", "Ice Cream"];

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Selected payment method
  const [paymentMethod, setPaymentMethod] = useState("cash");

  useEffect(() => {
    async function loadCustomer() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("loyalty_points")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) setPoints(profile.loyalty_points ?? 0);

      setLoading(false);
    }

    loadCustomer();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  }

  function updateQuantity(id, change) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  const filteredProducts =
    category === "All"
      ? products
      : products.filter((item) => item.category === category);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const money = (amount) => `${amount.toLocaleString("en-RW")} RWF`;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-green-50">
        <p className="font-semibold text-green-900">Loading FreshMart...</p>
      </main>
    );
  }

  const firstName = user?.user_metadata?.first_name || "Customer";

  return (
    <main className="min-h-screen bg-slate-50 text-gray-800">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-green-900">
              Fresh<span className="text-orange-500">Mart</span>
            </h1>
            <p className="text-xs text-gray-500">Fresh choices. Greater rewards.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-500">Your loyalty points</p>
              <p className="font-extrabold text-green-800">{points} points</p>
            </div>

            <button
              onClick={() => setCartOpen(!cartOpen)}
              className="rounded-xl bg-green-800 hover:bg-green-900 text-white px-4 py-3 font-bold"
            >
              Cart ({cartCount})
            </button>

            <button
              onClick={handleLogout}
              className="border border-gray-300 rounded-xl px-4 py-3 font-semibold hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-8">
        <section className="rounded-3xl overflow-hidden bg-green-950 text-white relative min-h-64 flex items-center">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600"
            alt="Fresh vegetables and fruits in a supermarket"
            className="absolute inset-0 w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-950 via-green-950/80 to-transparent" />

          <div className="relative p-8 md:p-12 max-w-2xl">
            <p className="text-green-300 font-bold uppercase tracking-widest text-sm">
              Welcome to FreshMart
            </p>
            <h2 className="text-3xl md:text-5xl font-black mt-3 leading-tight">
              Fresh choices,
              <span className="text-orange-400"> greater rewards!</span>
            </h2>
            <p className="text-green-50 mt-4">
              Welcome back, {firstName}. Shop your everyday essentials and earn loyalty points.
            </p>
            <button
              onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}
              className="mt-6 bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-xl font-bold"
            >
              Shop now
            </button>
          </div>
        </section>

        <section id="shop" className="mt-10">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
            <div>
              <p className="text-sm text-green-700 font-bold uppercase tracking-widest">
                Our supermarket
              </p>
              <h2 className="text-3xl font-black text-gray-900 mt-1">
                Shop our products
              </h2>
            </div>
            <p className="text-sm text-gray-500">Prices shown in Rwandan francs</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full px-5 py-2.5 font-semibold border ${
                  category === item
                    ? "bg-green-800 border-green-800 text-white"
                    : "bg-white border-gray-200 text-gray-700 hover:border-green-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                <div className="h-52 bg-gray-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                    {product.category}
                  </p>
                  <h3 className="text-lg font-extrabold text-gray-900 mt-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{product.size}</p>

                  <div className="mt-auto pt-5 flex justify-between items-center gap-2">
                    <p className="text-lg font-black text-green-900">
                      {money(product.price)}
                    </p>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-green-800 hover:bg-green-900 text-white rounded-lg px-4 py-2.5 text-sm font-bold"
                    >
                      Add +
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {cartOpen && (
          <section className="mt-10 bg-white border border-gray-200 shadow-lg rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-green-900">Shopping cart</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="text-gray-500 hover:text-gray-900 font-semibold"
              >
                Close
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-gray-500">Your cart is empty. Start shopping!</p>
            ) : (
              <>
                <div className="divide-y">
                  {cart.map((item) => (
                    <div key={item.id} className="py-4 flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-sm text-gray-500">{money(item.price)} each</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-9 h-9 rounded-lg bg-gray-100 font-bold"
                        >
                          −
                        </button>
                        <span className="font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-9 h-9 rounded-lg bg-gray-100 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <p className="font-bold text-green-900">
                        {money(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-5 mt-3 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order total</p>
                    <p className="text-2xl font-black text-green-900">{money(total)}</p>
                  </div>

                  {/* Payment method selection */}
                  <div className="flex flex-col gap-3 w-full sm:w-auto">
                    <label className="font-semibold text-gray-700">
                      Choose your payment method
                    </label>

                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="border border-gray-300 rounded-xl px-4 py-3 bg-white"
                    >
                      <option value="cash">Cash payment</option>
                      <option value="online">Online payment</option>
                    </select>

                    <button
                      onClick={() => {
                        if (paymentMethod === "cash") {
                          alert("You selected cash payment. Please pay at the cashier.");
                        } else {
                          alert("You selected online payment. Online payment processing will be connected once a payment provider is integrated.");
                        }
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-7 py-3 font-bold"
                    >
                      Continue to payment
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        <section className="mt-10 rounded-2xl bg-green-900 text-white p-7 flex flex-wrap justify-between items-center gap-5">
          <div>
            <p className="text-green-300 text-sm font-bold uppercase">Your FreshMart account</p>
            <h3 className="text-xl font-bold mt-1">{user.email}</h3>
            <p className="text-green-100 text-sm mt-2">
              Keep shopping and earning loyalty points.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl px-6 py-4">
            <p className="text-sm text-green-100">Available points</p>
            <p className="text-3xl font-black text-orange-300">{points}</p>
          </div>
        </section>
      </div>

      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} FreshMart. All rights reserved.
      </footer>
    </main>
  );
}
