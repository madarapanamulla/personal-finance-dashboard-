
const API_BASE_URL = "http://127.0.0.1:8000";

// Reusable function for API requests
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "API request failed");
  }

  return response.json();
}


// Get all transactions
export function getTransactions() {
  return apiRequest("/transactions");
}


// Add a transaction
export function addTransaction(data) {
  return apiRequest("/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}


// Update a transaction
export function updateTransaction(id, data) {
  return apiRequest(`/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}


// Delete a transaction
export function deleteTransaction(id) {
  return apiRequest(`/transactions/${id}`, {
    method: "DELETE",
  });
}


// Get financial summary
export function getSummary() {
  return apiRequest("/analytics/summary");
}


// Get monthly analysis
export function getMonthlyAnalysis() {
  return apiRequest("/analytics/monthly");
}


// Get expense categories
export function getCategoryAnalysis() {
  return apiRequest("/analytics/categories");
}


// Get budgets for a selected month
export function getBudgets(month = "2026-03") {
  return apiRequest(`/budgets?month=${month}`);
}
