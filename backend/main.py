
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import Transaction, Budget
from schemas import (
    TransactionCreate,
    TransactionResponse,
    BudgetCreate,
    BudgetResponse
)

import analysis


# Initialize database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="Personal Finance Dashboard API",
    description="Backend API for financial data analysis and visualization",
    version="1.0.0"
)


# Allow React frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Home endpoint
@app.get("/")
def home():
    return {
        "message": "Personal Finance Dashboard API is running!"
    }


# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy"}


# ---------------------------------
# TRANSACTION ENDPOINTS
# ---------------------------------

# Retrieve all transactions
@app.get("/transactions", response_model=list[TransactionResponse])
def get_transactions(db: Session = Depends(get_db)):

    return db.query(Transaction).order_by(
        Transaction.date.asc(),
        Transaction.id.asc()
    ).all()


# Add a new transaction
@app.post("/transactions", response_model=TransactionResponse, status_code=201)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db)
):

    new_transaction = Transaction(**transaction.model_dump())

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    return new_transaction


# Update an existing transaction
@app.put("/transactions/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction: TransactionCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).first()

    if existing is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    for key, value in transaction.model_dump().items():
        setattr(existing, key, value)

    db.commit()
    db.refresh(existing)

    return existing


# Delete a transaction
@app.delete("/transactions/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db)
):

    existing = db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).first()

    if existing is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    db.delete(existing)
    db.commit()

    return {
        "message": "Transaction deleted successfully"
    }


# ---------------------------------
# BUDGET ENDPOINTS
# ---------------------------------

# Retrieve budgets with actual monthly spending
@app.get("/budgets")
def get_budgets(
    month: str = "2026-03",
    db: Session = Depends(get_db)
):

    return analysis.get_budget_analysis(db, month)


# Add a new budget
@app.post("/budgets", response_model=BudgetResponse, status_code=201)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(Budget).filter(
        Budget.category == budget.category
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="A budget already exists for this category"
        )

    new_budget = Budget(**budget.model_dump())

    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)

    return new_budget


# ---------------------------------
# DATA ANALYSIS ENDPOINTS
# ---------------------------------

# Overall financial summary
@app.get("/analytics/summary")
def financial_summary(db: Session = Depends(get_db)):

    return analysis.get_summary(db)


# Monthly income and expense analysis
@app.get("/analytics/monthly")
def monthly_analysis(db: Session = Depends(get_db)):

    return analysis.get_monthly_analysis(db)


# Expense distribution by category
@app.get("/analytics/categories")
def category_analysis(db: Session = Depends(get_db)):

    return analysis.get_category_analysis(db)


# Budget performance summary for a selected month
@app.get("/analytics/budget")
def budget_analysis(
    month: str = "2026-03",
    db: Session = Depends(get_db)
):

    return analysis.get_budget_analysis(db, month)
