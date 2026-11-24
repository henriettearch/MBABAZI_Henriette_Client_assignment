
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function CashierDashboard() {
  const [cashier, setCashier] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Safely handle JSON and HTML responses
  async function getResponseData(response) {
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON API response:", text.slice(0, 300));

      throw new Error(
        `The server returned an unexpected response (HTTP ${response.status}). Check the API URL and Django server.`
      );
    }

    return await response.json();
  }

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Please log in to access the cashier dashboard.");
      }

      setCashier(session.user);

      const response = await fetch("/api/backend/customers/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data.error || data.detail || "Unable to load customers."
        );
      }

      setCustomers(data);
    } catch (err) {
      console.error("Dashboard loading error:", err);
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
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `/api/backend/customers/?search=${encodeURIComponent(search)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(data.error || data.detail || "Search failed.");
      }

      setCustomers(data);
    } catch (err) {
      console.error("Customer search error:", err);
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
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>FreshMart</h1>
          <p style={styles.headerSubtitle}>Cashier Dashboard</p>
        </div>

        <button onClick={logout} style={styles.logoutButton}>
          Logout
        </button>
      </header>

      <main style={styles.main}>
        <h2 style={styles.welcome}>Welcome, Cashier!</h2>

        <p style={styles.email}>
          {cashier?.email || "Loading cashier account..."}
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Total Customers</h3>
            <h1 style={styles.number}>{customers.length}</h1>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Points in Results</h3>
            <h1 style={styles.number}>{totalPoints}</h1>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Staff Account</h3>
            <p style={styles.staffStatus}>
              {cashier ? "Logged in" : "Checking..."}
            </p>
          </div>
        </div>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Customer Management</h2>

          <p style={styles.description}>
            Search customers by name, email or phone number.
          </p>

          <form onSubmit={searchCustomers}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              style={styles.input}
            />

            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.searchButton}>
                Search Customers
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  loadDashboard();
                }}
                style={styles.showAllButton}
              >
                Show All
              </button>
            </div>
          </form>

          {loading ? (
            <p style={styles.loading}>Loading customers...</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.cell}>Customer</th>
                    <th style={styles.cell}>Email</th>
                    <th style={styles.cell}>Phone</th>
                    <th style={styles.cell}>Loyalty Points</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} style={styles.tableRow}>
                      <td style={styles.cell}>
                        {customer.first_name} {customer.last_name}
                      </td>
                      <td style={styles.cell}>{customer.email}</td>
                      <td style={styles.cell}>
                        {customer.phone || "N/A"}
                      </td>
                      <td style={styles.points}>
                        {customer.loyalty_points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {customers.length === 0 && (
                <p style={styles.empty}>No customers found.</p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f2",
    fontFamily: "Arial, sans-serif",
    color: "#172b1d",
  },
  header: {
    background: "#14532d",
    color: "#ffffff",
    padding: "22px 5%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  },
  logo: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    margin: "5px 0 0",
    color: "#e0f2e5",
  },
  logoutButton: {
    padding: "11px 20px",
    background: "#ffffff",
    color: "#991b1b",
    border: "1px solid #ffffff",
    borderRadius: "7px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  main: {
    maxWidth: "1100px",
    margin: "auto",
    padding: "35px 20px",
  },
  welcome: {
    color: "#14532d",
    fontSize: "27px",
    marginBottom: "8px",
  },
  email: {
    color: "#475569",
    fontSize: "15px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    margin: "30px 0",
  },
  card: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #dce8df",
    boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
    marginBottom: "20px",
  },
  cardTitle: {
    color: "#475569",
    fontSize: "16px",
    marginTop: 0,
  },
  number: {
    color: "#15803d",
    fontSize: "36px",
    marginBottom: 0,
  },
  staffStatus: {
    color: "#15803d",
    fontWeight: "bold",
    fontSize: "18px",
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    padding: "14px",
    borderRadius: "8px",
    margin: "20px 0",
  },
  sectionTitle: {
    color: "#14532d",
    fontSize: "22px",
  },
  description: {
    color: "#475569",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    margin: "15px 0",
    border: "1px solid #94a3b8",
    borderRadius: "7px",
    background: "#ffffff",
    color: "#172b1d",
    fontSize: "15px",
    outlineColor: "#15803d",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  searchButton: {
    background: "#15803d",
    color: "#ffffff",
    padding: "12px 20px",
    border: "none",
    borderRadius: "7px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  showAllButton: {
    background: "#334155",
    color: "#ffffff",
    padding: "12px 20px",
    border: "none",
    borderRadius: "7px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  loading: {
    color: "#334155",
    padding: "20px 0",
  },
  tableWrapper: {
    overflowX: "auto",
    marginTop: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#ffffff",
  },
  tableHeader: {
    background: "#dcfce7",
    color: "#14532d",
  },
  tableRow: {
    background: "#ffffff",
    color: "#172b1d",
  },
  cell: {
    padding: "14px",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "left",
    color: "#172b1d",
    whiteSpace: "nowrap",
  },
  points: {
    padding: "14px",
    borderBottom: "1px solid #e2e8f0",
    color: "#15803d",
    fontWeight: "bold",
  },
  empty: {
    color: "#475569",
    padding: "15px",
  },
};
