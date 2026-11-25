
import pandas as pd

from models import Transaction, Budget


def get_transaction_dataframe(db):
    """Load transactions from SQLite into a Pandas DataFrame."""

    records = db.query(Transaction).all()

    data = [
        {
            "id": item.id,
            "date": item.date,
            "description": item.description,
            "category": item.category,
            "type": item.type,
            "amount": item.amount
        }
        for item in records
    ]

    return pd.DataFrame(data)


def get_summary(db):
    """Calculate total income, expenses and balance."""

    df = get_transaction_dataframe(db)

    if df.empty:
        return {
            "total_income": 0,
            "total_expenses": 0,
            "balance": 0
        }

    income = df.loc[
        df["type"] == "income", "amount"
    ].sum()

    expenses = df.loc[
        df["type"] == "expense", "amount"
    ].sum()

    return {
        "total_income": round(float(income), 2),
        "total_expenses": round(float(expenses), 2),
        "balance": round(float(income - expenses), 2)
    }


def get_monthly_analysis(db):
    """Calculate monthly income and expenses."""

    df = get_transaction_dataframe(db)

    if df.empty:
        return []

    df["month"] = df["date"].str[:7]

    monthly = (
        df.groupby(["month", "type"])["amount"]
        .sum()
        .unstack(fill_value=0)
    )

    results = []

    for month, row in monthly.iterrows():
        income = float(row.get("income", 0))
        expenses = float(row.get("expense", 0))

        results.append({
            "month": month,
            "income": round(income, 2),
            "expenses": round(expenses, 2),
            "net_balance": round(income - expenses, 2)
        })

    return results


def get_category_analysis(db):
    """Calculate total expenses by category."""

    df = get_transaction_dataframe(db)

    if df.empty:
        return []

    expenses = df[df["type"] == "expense"]

    result = (
        expenses.groupby("category")["amount"]
        .sum()
        .reset_index()
    )

    return [
        {
            "name": row["category"],
            "value": round(float(row["amount"]), 2)
        }
        for _, row in result.iterrows()
    ]


def get_budget_analysis(db, month):
    """Compare planned budgets with actual monthly expenses."""

    df = get_transaction_dataframe(db)

    budget_records = db.query(Budget).all()

    if not budget_records:
        return []

    if not df.empty:
        monthly_expenses = df[
            (df["type"] == "expense") &
            (df["date"].str.startswith(month))
        ]

        actual_by_category = (
            monthly_expenses.groupby("category")["amount"]
            .sum()
            .to_dict()
        )
    else:
        actual_by_category = {}

    results = []

    for item in budget_records:
        actual = float(
            actual_by_category.get(item.category, 0)
        )

        budget = float(item.budget)

        remaining = budget - actual

        percentage = (
            (actual / budget) * 100
            if budget > 0 else 0
        )

        results.append({
            "category": item.category,
            "budget": round(budget, 2),
            "actual": round(actual, 2),
            "remaining": round(remaining, 2),
            "percentage": round(percentage, 2)
        })

    return results
