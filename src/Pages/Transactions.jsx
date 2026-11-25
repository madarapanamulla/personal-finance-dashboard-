
import { useState, useEffect } from "react";
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction
} from "../services/api";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    date: "",
    description: "",
    category: "",
    type: "expense",
    amount: ""
  });

  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

  // Load transactions from SQLite through FastAPI
  async function loadTransactions() {
    try {
      setLoading(true);
      setError("");

      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  // Update form fields
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  // Add or update a transaction in the backend
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const transactionData = {
      date: formData.date,
      description: formData.description.trim(),
      category: formData.category.trim(),
      type: formData.type,
      amount: Number(formData.amount)
    };

    if (
      !transactionData.description ||
      !transactionData.category ||
      !transactionData.date ||
      !Number.isFinite(transactionData.amount) ||
      transactionData.amount <= 0
    ) {
      setError("Please enter valid transaction details.");
      return;
    }

    try {
      if (editingId !== null) {
        await updateTransaction(editingId, transactionData);
      } else {
        await addTransaction(transactionData);
      }

      await loadTransactions();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  }

  // Clear the form
  function resetForm() {
    setFormData({
      date: "",
      description: "",
      category: "",
      type: "expense",
      amount: ""
    });

    setEditingId(null);
  }

  // Load transaction into the form for editing
  function handleEdit(transaction) {
    setFormData({
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      amount: String(transaction.amount)
    });

    setEditingId(transaction.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  // Delete transaction from the backend
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteTransaction(id);

      setTransactions((previous) =>
        previous.filter((item) => item.id !== id)
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      setError(err.message);
    }
  }

  // Get unique categories
  const categories = [
    ...new Set(transactions.map((item) => item.category))
  ].sort();

  // Get available months
  const months = [
    ...new Set(
      transactions.map((item) => item.date.substring(0, 7))
    )
  ].sort().reverse();

  // Search and filter transactions
  const filteredTransactions = transactions.filter((item) => {
    const matchesSearch =
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || item.type === filterType;

    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;

    const matchesMonth =
      filterMonth === "all" ||
      item.date.startsWith(filterMonth);

    return (
      matchesSearch &&
      matchesType &&
      matchesCategory &&
      matchesMonth
    );
  });

  return (
    <div className="page-content">

      <h2>Transactions</h2>
      <p>Add, edit, delete, search and filter your transactions.</p>

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}

      {/* Transaction form */}
      <div className="transaction-section">
        <h3>
          {editingId !== null
            ? "Edit Transaction"
            : "Add New Transaction"}
        </h3>

        <form className="transaction-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              name="description"
              placeholder="e.g. Grocery shopping"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              type="text"
              name="category"
              placeholder="e.g. Groceries"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Transaction Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (€)</label>
            <input
              id="amount"
              type="number"
              name="amount"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-buttons">
            <button
              type="submit"
              className="add-button"
              disabled={loading}
            >
              {editingId !== null
                ? "Update Transaction"
                : "Add Transaction"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>

        </form>
      </div>

      {/* Search and filters */}
      <div className="filter-section">
        <h3>Search and Filter</h3>

        <div className="filter-controls">

          <input
            type="text"
            placeholder="Search description or category..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <select
            value={filterType}
            onChange={(event) => setFilterType(event.target.value)}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
          >
            <option value="all">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={filterMonth}
            onChange={(event) => setFilterMonth(event.target.value)}
          >
            <option value="all">All Months</option>

            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* Transaction table */}
      <div className="transaction-section">

        <h3>Transaction History</h3>

        {loading ? (
          <p>Loading transactions...</p>
        ) : (
          <>
            <p className="result-count">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>

            <div className="table-container">

              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((item) => (
                      <tr key={item.id}>
                        <td>{item.date}</td>
                        <td>{item.description}</td>
                        <td>{item.category}</td>

                        <td>
                          <span className={`transaction-type ${item.type}`}>
                            {item.type}
                          </span>
                        </td>

                        <td>
                          €{Number(item.amount).toFixed(2)}
                        </td>

                        <td className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-results">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

            </div>
          </>
        )}
      </div>

    </div>
  );
}
