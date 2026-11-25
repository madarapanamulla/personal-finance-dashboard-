
import { useState, useEffect } from "react";

import {
  getSummary,
  getMonthlyAnalysis,
  getCategoryAnalysis,
  getBudgets
} from "../services/api";

import ExpenseChart from "../components/charts/ExpenseChart";
import MonthlyChart from "../components/charts/MonthlyChart";
import BudgetChart from "../components/charts/BudgetChart";

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load analytics directly from the backend
  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const [
          summaryResult,
          categoryResult,
          monthlyResult,
          budgetResult
        ] = await Promise.all([
          getSummary(),
          getCategoryAnalysis(),
          getMonthlyAnalysis(),
          getBudgets("2026-03")
        ]);

        setSummary(summaryResult);
        console.log("Analytics summary from backend:", summaryResult);
        setCategoryData(categoryResult);

        // Convert backend snake_case to chart-friendly camelCase
        setMonthlyData(
          monthlyResult.map((item) => ({
            ...item,
            netBalance: item.net_balance
          }))
        );

        setBudgetData(budgetResult);

      } catch (err) {
        setError(err.message || "Unable to load analytics data.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  // Loading state
  if (loading) {
    return <p>Loading financial analytics...</p>;
  }

  // Error state
  if (error) {
    return (
      <div className="analytics-page">
        <h2>Financial Analytics</h2>
        <p>Unable to load analytics: {error}</p>
      </div>
    );
  }

  if (!summary) {
    return <p>No analytics data available.</p>;
  }

  // Financial indicators
  const totalIncome = summary.total_income;
  const totalExpenses = summary.total_expenses;
  const netBalance = summary.balance;

  // Highest spending category
  const highestCategory = categoryData.length > 0
    ? categoryData.reduce((highest, current) =>
        current.value > highest.value ? current : highest
      )
    : null;

  // Budget calculations
  const totalBudget = budgetData.reduce(
    (sum, item) => sum + item.budget,
    0
  );

  const actualBudgetSpending = budgetData.reduce(
    (sum, item) => sum + item.actual,
    0
  );

  const budgetUtilization = totalBudget > 0
    ? (actualBudgetSpending / totalBudget) * 100
    : 0;

  return (
    <div className="analytics-page">

      <div className="page-intro">
        <h2>Financial Analytics</h2>
        <p>
          Analyse your spending patterns, income trends
          and monthly budget performance.
        </p>
      </div>

      {/* Key financial indicators */}
      <section className="analytics-summary">

        <div className="analytics-card">
          <span>Total Income</span>
          <h2 className="income">
            €{totalIncome.toFixed(2)}
          </h2>
        </div>

        <div className="analytics-card">
          <span>Total Expenses</span>
          <h2 className="expense">
             €{totalExpenses.toFixed(2)}
          </h2>
        </div>

        <div className="analytics-card">
          <span>Net Balance</span>
          <h2 className="balance">
            €{netBalance.toFixed(2)}
          </h2>
        </div>

      </section>

      {/* Research Question 1 */}
      <section className="analytics-section">

        <h3>1. Spending Analysis</h3>

        <p>
          Which expense categories account for the highest
          proportion of total expenditure?
        </p>

        <div className="analytics-grid">

          <ExpenseChart data={categoryData} />

          <div className="insight-card">
            <h3>Spending Insights</h3>

            {highestCategory ? (
              <>
                <p>Highest spending category</p>

                <h2>{highestCategory.name}</h2>

                <h3>
                  €{highestCategory.value.toFixed(2)}
                </h3>

                <p>
                  {totalExpenses > 0
                    ? `${(
                        highestCategory.value /
                        totalExpenses *
                        100
                      ).toFixed(1)}% of total recorded expenses`
                    : "No recorded expenses"}
                </p>
              </>
            ) : (
              <p>No expense records available.</p>
            )}
          </div>

        </div>

      </section>

      {/* Research Question 2 */}
      <section className="analytics-section">

        <h3>2. Monthly Trend Analysis</h3>

        <p>
          How do monthly income and expenditure patterns
          change over time?
        </p>

        {monthlyData.length > 0 ? (
          <>
            <MonthlyChart data={monthlyData} />

            <div className="monthly-table">
              <h3>Monthly Financial Summary</h3>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Income</th>
                      <th>Expenses</th>
                      <th>Net Balance</th>
                    </tr>
                  </thead>

                  <tbody>
                    {monthlyData.map((item) => (
                      <tr key={item.month}>
                        <td>{item.month}</td>
                        <td>€{item.income.toFixed(2)}</td>
                        <td>€{item.expenses.toFixed(2)}</td>
                        <td>€{item.netBalance.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <p>No monthly transaction data available.</p>
        )}

      </section>

      {/* Research Question 3 */}
      <section className="analytics-section">

        <h3>3. Budget Performance Analysis</h3>

        <p>
          How does actual expenditure compare with the
          planned monthly budget across categories?
        </p>

        <div className="budget-insight">
          <h3>Budget Utilization - March 2026</h3>

          <h2>{budgetUtilization.toFixed(1)}%</h2>

          <p>
            €{actualBudgetSpending.toFixed(2)} spent out of
            €{totalBudget.toFixed(2)} planned for March 2026.
          </p>
        </div>

        {budgetData.length > 0 ? (
          <BudgetChart data={budgetData} />
        ) : (
          <p>No budget information available.</p>
        )}

      </section>

    </div>
  );
}
