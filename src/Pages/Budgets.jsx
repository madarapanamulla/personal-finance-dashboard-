
import { useState, useEffect } from "react";
import {
  getBudgets,
  getTransactions
} from "../services/api";

export default function Budgets() {
  const [selectedMonth, setSelectedMonth] = useState("2026-03");
  const [budgetDetails, setBudgetDetails] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  // Load available months from the backend
  useEffect(() => {
    async function loadMonths() {
      try {
        const transactions = await getTransactions();

        const months = [
          ...new Set(
            transactions.map((item) => item.date.substring(0, 7))
          )
        ].sort();

        setAvailableMonths(months);

        if (months.length > 0 && !months.includes(selectedMonth)) {
          setSelectedMonth(months[months.length - 1]);
        }
      } catch (err) {
        setError(err.message);
      }
    }

    loadMonths();
  }, []);

  // Load budget analysis whenever the selected month changes
  useEffect(() => {
    async function loadBudgets() {
      try {
        setLoading(true);
        setError("");

        const data = await getBudgets(selectedMonth);

        setBudgetDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadBudgets();
  }, [selectedMonth]);

  const totalBudget = budgetDetails.reduce(
    (sum, item) => sum + Number(item.budget), 0
  );

  const totalActual = budgetDetails.reduce(
    (sum, item) => sum + Number(item.actual), 0
  );

  const totalRemaining = totalBudget - totalActual;

  const exceededCount = budgetDetails.filter(
    (item) => Number(item.actual) > Number(item.budget)
  ).length;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-FI", {
      style: "currency",
      currency: "EUR"
    }).format(amount);

  const displayMonth = (month) => {
    const [year, number] = month.split("-");
    return `${monthNames[Number(number) - 1]} ${year}`;
  };

  if (loading) {
    return <p>Loading budget data...</p>;
  }

  return (
    <div className="budgets-page">

      <div className="page-intro">
        <h2>Budget Management</h2>
        <p>
          Compare your planned budgets with actual expenditure.
        </p>
      </div>

      {error && (
        <p role="alert" style={{ color: "red" }}>
          Unable to load budgets: {error}
        </p>
      )}

      {/* Month selector */}
      <div className="budget-month-selector">
        <label htmlFor="budget-month">Select month:</label>

        <select
          id="budget-month"
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
        >
          {availableMonths.map((month) => (
            <option key={month} value={month}>
              {displayMonth(month)}
            </option>
          ))}
        </select>
      </div>

      {/* Budget summary */}
      <section className="budget-summary-grid">

        <div className="budget-summary-card">
          <span>Total planned budget</span>
          <h2>{formatCurrency(totalBudget)}</h2>
        </div>

        <div className="budget-summary-card">
          <span>Actual spending</span>
          <h2>{formatCurrency(totalActual)}</h2>
        </div>

        <div className="budget-summary-card">
          <span>Remaining budget</span>
          <h2 className={totalRemaining < 0 ? "over-budget" : "under-budget"}>
            {formatCurrency(totalRemaining)}
          </h2>
        </div>

        <div className="budget-summary-card">
          <span>Categories over budget</span>
          <h2>{exceededCount}</h2>
        </div>

      </section>

      {/* Category budget details */}
      <section className="budget-details">
        <h3>Budget by Category</h3>

        {budgetDetails.length > 0 ? (
          budgetDetails.map((item) => {
            const exceeded =
              Number(item.actual) > Number(item.budget);

            return (
              <div className="budget-detail-card" key={item.category}>

                <div className="budget-detail-header">
                  <h4>{item.category}</h4>

                  <span className={exceeded ? "status-over" : "status-ok"}>
                    {exceeded ? "Over budget" : "Within budget"}
                  </span>
                </div>

                <div className="budget-amounts">
                  <span>
                    Actual: {formatCurrency(item.actual)}
                  </span>

                  <span>
                    Budget: {formatCurrency(item.budget)}
                  </span>
                </div>

                <div className="budget-progress-track">
                  <div
                    className={`budget-progress-fill ${
                      exceeded ? "progress-over" : "progress-ok"
                    }`}
                    style={{
                      width: `${Math.min(Number(item.percentage), 100)}%`
                    }}
                  />
                </div>

                <div className="budget-detail-footer">
                  <span>
                    {Number(item.percentage).toFixed(1)}% used
                  </span>

                  <span className={exceeded ? "over-budget" : "under-budget"}>
                    {exceeded
                      ? `${formatCurrency(Math.abs(Number(item.remaining)))} over`
                      : `${formatCurrency(item.remaining)} remaining`}
                  </span>
                </div>

              </div>
            );
          })
        ) : (
          <p>No budget information available for this month.</p>
        )}
      </section>

      {/* Budget table */}
      <section className="budget-table-section">
        <h3>Budget Performance Table</h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Budget</th>
                <th>Actual</th>
                <th>Remaining</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {budgetDetails.map((item) => (
                <tr key={item.category}>
                  <td>{item.category}</td>
                  <td>{formatCurrency(item.budget)}</td>
                  <td>{formatCurrency(item.actual)}</td>
                  <td>{formatCurrency(item.remaining)}</td>
                  <td>
                    {Number(item.actual) > Number(item.budget)
                      ? "Over budget"
                      : "Within budget"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
