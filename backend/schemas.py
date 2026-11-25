
from pydantic import BaseModel, Field, ConfigDict
from typing import Literal


class TransactionCreate(BaseModel):
    date: str
    description: str
    category: str
    type: Literal["income", "expense"]
    amount: float = Field(gt=0)


class TransactionResponse(TransactionCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class BudgetCreate(BaseModel):
    category: str
    budget: float = Field(ge=0)


class BudgetResponse(BudgetCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)
