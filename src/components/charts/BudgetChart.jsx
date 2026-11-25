
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function BudgetChart({ data }) {
  return (
    <div className="chart-card">
      <h3>Budget vs Actual Spending</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="category" />
          <YAxis />

          <Tooltip formatter={(value) => `€${value}`} />
          <Legend />

          <Bar
            dataKey="budget"
            fill="#3B82F6"
            name="Planned Budget"
          />

          <Bar
            dataKey="actual"
            fill="#F59E0B"
            name="Actual Spending"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}