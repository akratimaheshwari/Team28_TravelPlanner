import { useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";   // ✅ FIXED
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const { login } = useAuth();  // <— this is why the import is required
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/auth/register", {
        name,
        email,
        password,
      });

      login(data.user, data.accessToken);
      nav("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Create Account</h2>

        {error && (
          <p className="text-red-500 mb-3 text-center font-medium">{error}</p>
        )}

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-3 border rounded mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded mb-5"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition">
          Register
        </button>

        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
