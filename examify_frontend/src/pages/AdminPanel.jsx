import React, { useEffect, useState } from "react";
import { useApiClient } from "../lib/useApiClient";
import AppShell from "../components/AppShell";

export default function AdminPanel() {
  const { apiFetch } = useApiClient();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // user id
  const [form, setForm] = useState({
    plan: "",
    duration_months: 1,
    credits_delta: 0,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const r = await apiFetch("/api/admin/users/");
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          throw new Error(d.detail || "Access denied");
        }
        const d = await r.json();
        if (a) setUsers(d.users || []);
      } catch (e) {
        if (a) setError(e?.message || "Could not load admin panel.");
      }
    })();
    return () => {
      a = false;
    };
  }, [apiFetch]);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.full_name || "").toLowerCase().includes(q) ||
      String(u.id).includes(q)
    );
  });

  const startEdit = (u) => {
    setEditing(u.id);
    setForm({ plan: u.plan, duration_months: 1, credits_delta: 0 });
    setMsg("");
  };

  const saveUser = async () => {
    setSaving(true);
    setMsg("");
    try {
      const body = { user_id: editing };
      if (form.plan) body.plan = form.plan;
      if (form.duration_months) body.duration_months = form.duration_months;
      if (form.credits_delta) body.credits_delta = form.credits_delta;

      const r = await apiFetch("/api/admin/users/update/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("Update failed");
      const d = await r.json();
      setMsg(`Updated: ${d.plan} plan, ${d.credits_remaining} credits`);
      // Refresh user in list
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editing
            ? {
                ...u,
                plan: d.plan,
                plan_expiry: d.plan_expiry,
                credits_remaining: d.credits_remaining,
              }
            : u,
        ),
      );
    } catch (e) {
      setMsg(`Error: ${e?.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (error)
    return (
      <AppShell>
        <div className="p-8">{error}</div>
      </AppShell>
    );

  return (
    <AppShell>
      <div className="mx-auto max-w-[1000px] px-4 py-6 md:px-6">
        <header className="mb-6">
          <p
            className="text-xs uppercase tracking-[0.15em]"
            style={{ color: "var(--text-muted)" }}
          >
            Admin Panel
          </p>
          <h1 className="font-display text-3xl">User Management</h1>
        </header>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or ID..."
          className="mb-4 w-full rounded-xl border px-4 py-3 outline-none"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
            color: "var(--text)",
          }}
        />

        <div className="space-y-3">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="rounded-2xl border p-4"
              style={{
                borderColor:
                  editing === u.id ? "var(--accent)" : "var(--border)",
                backgroundColor: "var(--surface)",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                    style={{ backgroundColor: "var(--surface-2)" }}
                  >
                    {(u.full_name || "U")
                      .split(" ")
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div>
                    <p className="font-semibold">{u.full_name || "Unknown"}</p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {u.email} · ID: {u.id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold capitalize"
                    style={{
                      backgroundColor:
                        u.plan === "premium"
                          ? "var(--star-filled)"
                          : u.plan === "pro"
                            ? "var(--accent)"
                            : "var(--surface-2)",
                      color:
                        u.plan === "premium" || u.plan === "pro"
                          ? "#111"
                          : "var(--text)",
                    }}
                  >
                    {u.plan}
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>
                    {u.credits_remaining === -1 ? "∞" : u.credits_remaining} cr
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>
                    Lv.{u.level} · {u.xp}XP
                  </span>
                  <button
                    onClick={() =>
                      editing === u.id ? setEditing(null) : startEdit(u)
                    }
                    className="rounded-lg border px-3 py-1 text-xs transition hover:border-[var(--accent)]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {editing === u.id ? "Close" : "Edit"}
                  </button>
                </div>
              </div>

              {editing === u.id && (
                <div
                  className="mt-4 grid gap-3 rounded-xl border p-4 sm:grid-cols-4"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--surface-2)",
                  }}
                >
                  <div>
                    <label
                      className="mb-1 block text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Plan
                    </label>
                    <select
                      value={form.plan}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, plan: e.target.value }))
                      }
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface)",
                        color: "var(--text)",
                      }}
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Duration
                    </label>
                    <select
                      value={form.duration_months}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          duration_months: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface)",
                        color: "var(--text)",
                      }}
                    >
                      <option value={1}>1 Month</option>
                      <option value={3}>3 Months</option>
                      <option value={6}>6 Months</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Credits +/-
                    </label>
                    <input
                      type="number"
                      value={form.credits_delta}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          credits_delta: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface)",
                        color: "var(--text)",
                      }}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={saveUser}
                      disabled={saving}
                      className="w-full rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
                      style={{
                        backgroundColor: "var(--accent)",
                        color: "var(--bg)",
                      }}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                  {msg && <p className="col-span-full text-xs mt-1">{msg}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
        {filteredUsers.length === 0 && (
          <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
            No users found.
          </p>
        )}
      </div>
    </AppShell>
  );
}
