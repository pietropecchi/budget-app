from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import sqlite3

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# SQLite setup
conn = sqlite3.connect("transactions.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    who TEXT,
    recipient TEXT,
    method TEXT,
    category TEXT,
    description TEXT,
    amount REAL,
    currency TEXT,
    note TEXT
)
""")
conn.commit()

class Transaction(BaseModel):
    id: int = None
    date: str
    who: str
    recipient: str
    method: str
    category: str
    description: str
    amount: float
    currency: str
    note: str

@app.get("/transactions", response_model=List[Transaction])
def get_transactions():
    cursor.execute("SELECT * FROM transactions")
    transactions = cursor.fetchall()
    return [Transaction(id=row[0], date=row[1], who=row[2], recipient=row[3], method=row[4], category=row[5], description=row[6], amount=row[7], currency=row[8], note=row[9]) for row in transactions]

@app.post("/transactions", response_model=Transaction)
def add_transaction(transaction: Transaction):
    cursor.execute("INSERT INTO transactions (date, who, recipient, method, category, description, amount, currency, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                   (transaction.date, transaction.who, transaction.recipient, transaction.method, transaction.category, transaction.description, transaction.amount, transaction.currency, transaction.note))
    conn.commit()
    transaction.id = cursor.lastrowid
    return transaction

@app.put("/transactions/{transaction_id}", response_model=Transaction)
def update_transaction(transaction_id: int, transaction: Transaction):
    cursor.execute("UPDATE transactions SET date = ?, who = ?, recipient = ?, method = ?, category = ?, description = ?, amount = ?, currency = ?, note = ? WHERE id = ?",
                   (transaction.date, transaction.who, transaction.recipient, transaction.method, transaction.category, transaction.description, transaction.amount, transaction.currency, transaction.note, transaction_id))
    conn.commit()
    transaction.id = transaction_id
    return transaction

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
