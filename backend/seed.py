
from database import SessionLocal, engine, Base
from models import Transaction, Budget

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

# Original transaction data from sampleData.js
transactions = [
    {"id": 1, "date": "2026-01-05", "description": "Monthly Salary", "category": "Salary", "type": "income", "amount": 3200},
    {"id": 2, "date": "2026-01-06", "description": "Rent", "category": "Housing", "type": "expense", "amount": 850},
    {"id": 3, "date": "2026-01-08", "description": "Supermarket", "category": "Groceries", "type": "expense", "amount": 280},
    {"id": 4, "date": "2026-01-10", "description": "Bus Pass", "category": "Transport", "type": "expense", "amount": 65},
    {"id": 5, "date": "2026-01-15", "description": "Electricity", "category": "Utilities", "type": "expense", "amount": 90},
    {"id": 6, "date": "2026-02-05", "description": "Monthly Salary", "category": "Salary", "type": "income", "amount": 3200},
    {"id": 7, "date": "2026-02-06", "description": "Rent", "category": "Housing", "type": "expense", "amount": 850},
    {"id": 8, "date": "2026-02-10", "description": "Supermarket", "category": "Groceries", "type": "expense", "amount": 350},
    {"id": 9, "date": "2026-02-12", "description": "Transport", "category": "Transport", "type": "expense", "amount": 75},
    {"id": 10, "date": "2026-03-05", "description": "Monthly Salary", "category": "Salary", "type": "income", "amount": 3200},
    {"id": 11, "date": "2026-03-06", "description": "Rent", "category": "Housing", "type": "expense", "amount": 850},
    {"id": 12, "date": "2026-03-08", "description": "Supermarket", "category": "Groceries", "type": "expense", "amount": 400},
    {"id": 13, "date": "2026-03-12", "description": "Entertainment", "category": "Entertainment", "type": "expense", "amount": 120}
]

# Original budget data from sampleData.js
budgets = [
    {"category": "Housing", "budget": 850},
    {"category": "Groceries", "budget": 400},
    {"category": "Transport", "budget": 100},
    {"category": "Utilities", "budget": 150},
    {"category": "Entertainment", "budget": 100}
]


def seed_database():
    db = SessionLocal()

    try:
        # Import transactions only if the table is empty
        if db.query(Transaction).count() == 0:
            for item in transactions:
                db.add(Transaction(**item))

            print("13 transactions imported successfully.")

        else:
            print("Transactions already exist. Skipping import.")

        # Import budgets only if the table is empty
        if db.query(Budget).count() == 0:
            for item in budgets:
                db.add(Budget(**item))

            print("5 budgets imported successfully.")

        else:
            print("Budgets already exist. Skipping import.")

        db.commit()
        print("Database seeding completed successfully!")

    except Exception as error:
        db.rollback()
        print("Error importing data:", error)

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
