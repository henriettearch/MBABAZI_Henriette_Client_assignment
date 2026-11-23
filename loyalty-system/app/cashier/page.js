
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function CashierDashboard() {
  const [cashier, setCashier] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const { data: { session }, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Please log in to access the cashier dashboard.");
      }

      setCashier(session.user);

      const response = await fetch(
        "/api/backend/customers/",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load customers.");
      }

      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function searchCustomers(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: { session } } =
        await supabase.auth.getSession();

      if (!session) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `/api/backend/customers/?search=${encodeURIComponent(search)}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed.");
      }

      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const totalPoints = customers.reduce(
    (total, customer) => total + (customer.loyalty_points || 0),
    0
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f7f4",
      fontFamily: "Arial, sans-serif"
    }}>
      <header style={{
        background: "#176b3a",
        color: "white",
        padding: "22px 5%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h1>FreshMart</h1>
          <p>Cashier Dashboard</p>
        </div>

        <button onClick={logout} style={{
          padding: "10px 18px",
          border: "none",
          borderRadius: "7px",
          cursor: "pointer"
        }}>
          Logout
        </button>
      </header>

      <main style={{
        maxWidth: "1100px",
        margin: "auto",
        padding: "35px 20px"
      }}>
        <h2>Welcome, Cashier!</h2>

        <p style={{ color: "#666" }}>
          {cashier?.email || "Loading cashier account..."}
        </p>

        {error && (
          <p style={{ color: "red" }}>{error}</p>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          margin: "30px 0"
        }}>
          <div style={cardStyle}>
            <h3>Total Customers</h3>
            <h1>{customers.length}</h1>
          </div>

          <div style={cardStyle}>
            <h3>Points in Results</h3>
            <h1>{totalPoints}</h1>
          </div>

          <div style={cardStyle}>
            <h3>Staff Account</h3>
            <p>{cashier ? "Logged in" : "Checking..."}</p>
          </div>
        </div>

        <section style={cardStyle}>
          <h2>Customer Management</h2>
          <p>Search customers by name, email or phone number.</p>

          <form onSubmit={searchCustomers}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              style={{
                width: "100%",
                padding: "13px",
                margin: "15px 0",
                border: "1px solid #ccc",
                borderRadius: "7px"
              }}
            />

            <button type="submit" style={buttonStyle}>
              Search Customers
            </button>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                loadDashboard();
              }}
              style={{
                ...buttonStyle,
                background: "#555",
                marginLeft: "10px"
              }}
            >
              Show All
            </button>
          </form>

          {loading ? (
            <p>Loading customers...</p>
          ) : (
            <div style={{ overflowX: "auto", marginTop: "20px" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse"
              }}>
                <thead>
                  <tr style={{ background: "#e7f3e9" }}>
                    <th style={cellStyle}>Customer</th>
                    <th style={cellStyle}>Email</th>
                    <th style={cellStyle}>Phone</th>
                    <th style={cellStyle}>Loyalty Points</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td style={cellStyle}>
                        {customer.first_name} {customer.last_name}
                      </td>
                      <td style={cellStyle}>{customer.email}</td>
                      <td style={cellStyle}>
                        {customer.phone || "N/A"}
                      </td>
                      <td style={cellStyle}>
                        {customer.loyalty_points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {customers.length === 0 && (
                <p>No customers found.</p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: "24px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  marginBottom: "20px"
};

const buttonStyle = {
  background: "#176b3a",
  color: "white",
  padding: "12px 20px",
  border: "none",
  borderRadius: "7px",
  cursor: "pointer"
};

const cellStyle = {
  padding: "13px",
  borderBottom: "1px solid #eee",
  textAlign: "left"
};

