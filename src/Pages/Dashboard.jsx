
import { useState, useEffect } from "react";

import {
  getSummary,
  getMonthlyAnalysis,
  getCategoryAnalysis,
  getBudgets
} from "../services/api";

import SummaryCard from "../components/SummaryCard";
import ExpenseChart from "../components/charts/ExpenseChart";
import MonthlyChart from "../components/charts/MonthlyChart";
import BudgetChart from "../components/charts/BudgetChart";

export default function Dashboard() {

  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    async function loadDashboard() {

      try {
        setLoading(true);

        const [
          summaryResult,
          monthlyResult,
          categoryResult,
          budgetResult
        ] = await Promise.all([
          getSummary(),
          getMonthlyAnalysis(),
          getCategoryAnalysis(),
          getBudgets("2026-11")
        ]);

        setSummary(summaryResult);
        setMonthlyData(monthlyResult);
        setCategoryData(categoryResult);
        setBudgetData(budgetResult);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();

  }, []);


  if (loading) {
    return <p>Loading dashboard data...</p>;
  }

  if (error) {
    return <p>Unable to load dashboard: {error}</p>;
  }

  if (!summary) {
    return <p>No dashboard data available.</p>;
  }


  return (

    <div className="dashboard">

      <section className="summary-grid">

        <SummaryCard
          title="Total Income"
          amount={summary.total_income}
          description="All recorded income"
          type="income"
        />

        <SummaryCard
          title="Total Expenses"
          amount={summary.total_expenses}
          description="All recorded expenses"
          type="expense"
        />

        <SummaryCard
          title="Remaining Balance"
          amount={summary.balance}
          description="Income minus expenses"
          type="balance"
        />

      </section>


      <section className="charts-grid">

        <ExpenseChart data={categoryData} />

        <MonthlyChart data={monthlyData} />

        <BudgetChart data={budgetData} />

      </section>

    </div>

  );
}
