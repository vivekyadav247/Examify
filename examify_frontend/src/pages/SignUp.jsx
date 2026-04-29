import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApiClient } from "../lib/useApiClient";

export default function SignUp({ onClose, onSwitchToSignIn }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken, apiFetch } = useApiClient();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/api/users/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to sign up.");
      }

      const data = await res.json();
      setToken(data.token);
      onClose();
      navigate("/onboarding"); // After signup, user must complete onboarding
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border p-8 shadow-2xl animate-in zoom-in-95"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--surface)",
          color: "var(--text)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-white/10 transition"
        >
          Close
        </button>
        <h1 className="mb-2 font-display text-3xl font-bold">Create Account</h1>
        <p className="mb-8 text-sm" style={{ color: "var(--text-muted)" }}>
          Join Examify and accelerate your learning.
        </p>

        {error && (
          <div
            className="mb-4 rounded-xl border p-3 text-sm text-red-500"
            style={{
              borderColor: "rgba(239, 68, 68, 0.3)",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border p-3 outline-none transition focus:border-[var(--accent)]"
              style={{
                backgroundColor: "var(--surface-2)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
              required
            />
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border p-3 outline-none transition focus:border-[var(--accent)]"
              style={{
                backgroundColor: "var(--surface-2)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
              required
            />
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border p-3 outline-none transition focus:border-[var(--accent)]"
              style={{
                backgroundColor: "var(--surface-2)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-full py-3 font-semibold transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)", color: "var(--bg)" }}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <p
          className="mt-6 text-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="font-semibold"
            style={{ color: "var(--accent)" }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
