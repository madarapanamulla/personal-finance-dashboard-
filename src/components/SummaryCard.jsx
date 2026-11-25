
export default function SummaryCard({
  title,
  amount,
  description,
  type
}) {
  return (
    <div className="summary-card">
      <p className="summary-title">{title}</p>

      <h2 className={type}>
        €{amount.toLocaleString("en-FI", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </h2>

      <p className="summary-description">{description}</p>
    </div>
  );
}
