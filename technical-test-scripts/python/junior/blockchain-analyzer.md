# Junior Python Test: Blockchain Transaction Analyzer

## **TEST DURATION**: 1.5 - 2 hours

## **DIFFICULTY**: Junior

---

## 📋 **OBJECTIVE**

Create a Python script that analyzes blockchain transaction data from a JSON file and generates statistical reports about transaction patterns, frequencies, and trends.

---

## 🎯 **REQUIREMENTS**

### **Core Features**

1. **Load Transaction Data** from JSON file
2. **Calculate Statistics**:
   - Total number of transactions
   - Total volume (sum of all amounts)
   - Average transaction amount
   - Transactions per frequency (528Hz, 963Hz, 999Hz)
   - Top 5 addresses by transaction count
   - Top 5 addresses by volume

3. **Generate Report** - Output formatted report to console and save to file

4. **Filter Transactions** - Allow filtering by:
   - Frequency
   - Date range
   - Minimum amount

5. **Export Results** - Save analysis to JSON and CSV formats

---

## 📊 **SAMPLE DATA FORMAT**

### **transactions.json**

```json
{
  "transactions": [
    {
      "id": "0x1234...",
      "from": "0xABC...",
      "to": "0xDEF...",
      "amount": 2.5,
      "frequency": 528,
      "timestamp": "2026-01-01T10:00:00Z",
      "type": "transfer"
    },
    {
      "id": "0x5678...",
      "from": "0xGHI...",
      "to": "0xJKL...",
      "amount": 10.0,
      "frequency": 999,
      "timestamp": "2026-01-01T11:30:00Z",
      "type": "mint"
    }
  ]
}
```

---

## 🛠️ **TECHNICAL REQUIREMENTS**

1. **Python Version**: 3.10+
2. **Type Hints**: Use type hints for all functions
3. **Docstrings**: Document all functions
4. **Error Handling**: Handle file not found, invalid JSON, etc.
5. **Testing**: Use pytest for unit tests
6. **Code Style**: Follow PEP 8

---

## 📦 **ALLOWED LIBRARIES**

```python
import json
import csv
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass
```

No external packages required (standard library only).

---

## 📝 **REQUIRED FUNCTIONS**

```python
@dataclass
class Transaction:
    """Represents a blockchain transaction"""
    id: str
    from_address: str
    to_address: str
    amount: float
    frequency: int
    timestamp: str
    type: str

def load_transactions(filepath: str) -> List[Transaction]:
    """Load transactions from JSON file"""
    pass

def calculate_total_volume(transactions: List[Transaction]) -> float:
    """Calculate total transaction volume"""
    pass

def calculate_average_amount(transactions: List[Transaction]) -> float:
    """Calculate average transaction amount"""
    pass

def count_by_frequency(transactions: List[Transaction]) -> Dict[int, int]:
    """Count transactions grouped by frequency"""
    pass

def get_top_addresses(
    transactions: List[Transaction], 
    by: str = "count", 
    limit: int = 5
) -> List[tuple]:
    """Get top addresses by transaction count or volume"""
    pass

def filter_transactions(
    transactions: List[Transaction],
    frequency: Optional[int] = None,
    min_amount: Optional[float] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> List[Transaction]:
    """Filter transactions based on criteria"""
    pass

def generate_report(transactions: List[Transaction]) -> str:
    """Generate formatted analysis report"""
    pass

def export_to_csv(transactions: List[Transaction], filepath: str) -> None:
    """Export transactions to CSV file"""
    pass

def export_analysis_to_json(analysis: Dict, filepath: str) -> None:
    """Export analysis results to JSON file"""
    pass
```

---

## 📋 **EXPECTED OUTPUT**

### **Console Report**

```
═══════════════════════════════════════════
  BLOCKCHAIN TRANSACTION ANALYSIS REPORT
═══════════════════════════════════════════

📊 Overall Statistics:
   Total Transactions: 150
   Total Volume: 1,250.75 ETH
   Average Amount: 8.34 ETH

🎵 Transactions by Frequency:
   528Hz (DNA Healing): 60 transactions (40.0%)
   963Hz (Pineal Activation): 50 transactions (33.3%)
   999Hz (Crown Chakra): 40 transactions (26.7%)

👥 Top 5 Addresses by Transaction Count:
   1. 0xABC... - 15 transactions
   2. 0xDEF... - 12 transactions
   3. 0xGHI... - 10 transactions
   4. 0xJKL... - 9 transactions
   5. 0xMNO... - 8 transactions

💰 Top 5 Addresses by Volume:
   1. 0xABC... - 125.50 ETH
   2. 0xDEF... - 98.25 ETH
   3. 0xGHI... - 75.00 ETH
   4. 0xJKL... - 62.30 ETH
   5. 0xMNO... - 55.75 ETH

═══════════════════════════════════════════
Report generated: 2026-01-05 12:00:00
═══════════════════════════════════════════
```

---

## 🧪 **TESTING REQUIREMENTS**

Create tests using pytest:

1. **Data Loading**
   - Load valid JSON file
   - Handle file not found
   - Handle invalid JSON

2. **Statistics Calculation**
   - Total volume calculation
   - Average amount calculation
   - Frequency counting

3. **Filtering**
   - Filter by frequency
   - Filter by amount range
   - Filter by date range
   - Multiple filters combined

4. **Top Addresses**
   - Get top by count
   - Get top by volume
   - Handle ties correctly

5. **Export Functions**
   - CSV export creates valid file
   - JSON export creates valid file

---

## 📁 **EXPECTED FILE STRUCTURE**

```
blockchain-analyzer/
├── analyzer.py
├── test_analyzer.py
├── data/
│   ├── transactions.json
│   └── sample_data.json
├── output/
│   ├── report.txt
│   ├── analysis.json
│   └── transactions.csv
├── requirements-dev.txt
└── README.md
```

---

## 💻 **STARTER CODE**

```python
from dataclasses import dataclass
from typing import List, Dict, Optional
import json

@dataclass
class Transaction:
    id: str
    from_address: str
    to_address: str
    amount: float
    frequency: int
    timestamp: str
    type: str

def load_transactions(filepath: str) -> List[Transaction]:
    """
    Load transactions from JSON file.
    
    Args:
        filepath: Path to JSON file
        
    Returns:
        List of Transaction objects
        
    Raises:
        FileNotFoundError: If file doesn't exist
        json.JSONDecodeError: If invalid JSON
    """
    # TODO: Implement
    pass

# TODO: Implement other functions

def main():
    """Main entry point"""
    # Load data
    transactions = load_transactions('data/transactions.json')
    
    # Generate report
    report = generate_report(transactions)
    print(report)
    
    # Save report
    with open('output/report.txt', 'w') as f:
        f.write(report)
    
    # Export data
    export_to_csv(transactions, 'output/transactions.csv')

if __name__ == '__main__':
    main()
```

---

## ✅ **ACCEPTANCE CRITERIA**

- [ ] All required functions implemented
- [ ] Type hints on all functions
- [ ] Docstrings for all functions
- [ ] PEP 8 compliant code
- [ ] Proper error handling
- [ ] Tests cover all functions
- [ ] Test coverage >85%
- [ ] All tests pass
- [ ] Report generates correctly
- [ ] Export functions work

---

## 🎨 **BONUS POINTS**

- [ ] Add command-line arguments (argparse)
- [ ] Implement data visualization (matplotlib)
- [ ] Add logging instead of print statements
- [ ] Create a class-based analyzer
- [ ] Add support for multiple input files
- [ ] Implement caching for large datasets
- [ ] Add transaction validation
- [ ] Generate HTML report

---

## 📤 **SUBMISSION**

1. Complete Python code
2. Test suite with pytest
3. Sample data files
4. README with:
   - Usage instructions
   - Function documentation
   - Example output
   - Test coverage report

---

## 🎯 **EVALUATION FOCUS**

1. **Code Quality**: PEP 8, type hints, docstrings
2. **Functionality**: All features working correctly
3. **Error Handling**: Robust error management
4. **Testing**: Comprehensive test coverage
5. **Documentation**: Clear and helpful

---

## 💡 **HINTS**

- Use `collections.Counter` for frequency counting
- Use `sorted()` with `key` parameter for top addresses
- Use `datetime.fromisoformat()` for date parsing
- Test with edge cases (empty data, single transaction)
- Use `pytest fixtures` for test data
- Format numbers with f-strings: f"{amount:,.2f}"

---

**Analyze data like a pro! 📊🔥**

**ALLAHU AKBAR! 🐍💎**
