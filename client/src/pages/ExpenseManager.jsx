import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ["websocket"], // avoid polling issues
});


export default function ExpenseManager() {
  const { id } = useParams();

  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  // Load expenses + realtime listener
  useEffect(() => {
    socket.emit("joinTrip", id);

    API.get(`/expenses/${id}`)
      .then((res) => setExpenses(res.data.expenses))
      .catch(() => setError("Failed to load expenses"));

    socket.on("expenseUpdated", (data) => {
      if (data.action === "add") {
        setExpenses((prev) => [...prev, data.expense]);
      }
      if (data.action === "delete") {
        setExpenses((prev) => prev.filter((e) => e._id !== data.id));
      }
    });

    return () => {
      socket.emit("leaveTrip", id);
      socket.off("expenseUpdated");
    };
  }, [id]);

  // Add new expense
  const add = async () => {
    if (!title || !amount) {
      setError("Title and amount required");
      return;
    }
    try {
      await API.post(`/expenses/${id}`, {
        title,
        amount: Number(amount),
        type: "equal",
      });
      setTitle("");
      setAmount("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add expense");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">

        <h2 className="text-2xl font-bold mb-6">💰 Manage Expenses</h2>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 mb-3 font-medium bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        {/* Add Expense Fields */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            className="flex-1 p-3 border rounded focus:ring focus:ring-blue-200"
            placeholder="Expense Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="w-full md:w-40 p-3 border rounded focus:ring focus:ring-blue-200"
            placeholder="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button
            onClick={add}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Add
          </button>
        </div>

        {/* Expense List */}
        <ul className="space-y-3">
          {expenses.map((e) => (
            <li
              key={e._id}
              className="p-4 bg-gray-50 rounded border flex justify-between items-center hover:bg-gray-100 transition"
            >
              <span className="text-lg">{e.title}</span>
              <span className="font-bold text-green-700">
                ₹{Number(e.amount).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
