import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ===============================
  // HANDLE INPUT CHANGE
  // ===============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ===============================
  // HANDLE LOGIN
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      await login({
        email,
        password,
      });

      // Login successful
      navigate("/", { replace: true });
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error.response?.data || error.message
      );

      // Backend is not running
      if (
        error.code === "ERR_NETWORK" ||
        error.message === "Network Error"
      ) {
        setError(
          "Unable to connect to the server. Please make sure the StaySphere backend is running."
        );
      }

      // Invalid credentials / backend error
      else if (error.response) {
        setError(
          error.response?.data?.message ||
            "Invalid email or password. Please try again."
        );
      }

      // Other errors
      else {
        setError(
          error.message ||
            "Unable to login. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] grid place-items-center p-6">
      <form
        onSubmit={handleSubmit}
        className="card p-7 w-full max-w-md space-y-4"
      >
        {/* ===============================
            HEADER
        =============================== */}
        <div>
          <h1 className="text-3xl font-black">
            Welcome back
          </h1>

          <p className="text-gray-500 mt-2">
            Sign in to continue your StaySphere journey.
          </p>
        </div>

        {/* ===============================
            ERROR MESSAGE
        =============================== */}
        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm"
          >
            {error}
          </div>
        )}

        {/* ===============================
            EMAIL
        =============================== */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold mb-1"
          >
            Email
          </label>

          <input
            id="email"
            className="input w-full"
            name="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        {/* ===============================
            PASSWORD
        =============================== */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold mb-1"
          >
            Password
          </label>

          <input
            id="password"
            className="input w-full"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        {/* ===============================
            LOGIN BUTTON
        =============================== */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {/* ===============================
            REGISTER LINK
        =============================== */}
        <p className="text-sm text-center">
          New here?{" "}
          <Link
            className="underline font-bold"
            to="/register"
          >
            Create an account
          </Link>
        </p>
      </form>
    </main>
  );
}