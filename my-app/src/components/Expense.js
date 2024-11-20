import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Expense.css';
import { useNavigate } from 'react-router-dom';

const Expense = () => {
    const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [budgetType, setBudgetType] = useState('');
    const [availableBudgets, setAvailableBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [expenseDate, setExpenseDate] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [description, setDescription] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [isEditing, setIsEditing] = useState(false); 
    const [currentExpenseId, setCurrentExpenseId] = useState(null); 

    const navigate = useNavigate();

    const handleBackToDashboard = () => {
        navigate('/dashboard');
      };

    const predefinedCategories = {
        Food: ['Breakfast', 'Lunch', 'Dinner', 'Groceries', 'Misc'],
        Home: ['Electricity Bill', 'Water Bill', 'Gas', 'Rent'],
        Travel: ['Flight', 'Hotel', 'Transport', 'Activities'],
        Entertainment: ['Movies', 'Concerts', 'Games'],
        Miscellaneous: ['Gifts', 'Charity', 'Unexpected'],
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 
        'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        const email = user ? user.email : null;

        if (email && month && year) {
            axios.get(`http://localhost:5000/api/budgets?email=${email}&month=${month}&year=${year}`)
                .then(response => {
                    setAvailableBudgets(response.data.length === 0 ? [] : response.data);
                })
                .catch(error => {
                    if (error.response && error.response.status === 404) {
                        setAvailableBudgets([]);
                    } else {
                        console.error('Error fetching budgets:', error);
                    }
                });
        } else {
            console.error('Email, month, or year is missing.');
        }
    }, [month, year]);

    useEffect(() => {
        if (budgetType) {
            setCategories(predefinedCategories[budgetType] || []);
            setSelectedCategory('');
        }
    }, [budgetType]);

    useEffect(() => {
        const fetchExpenses = async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.email) return;

            try {
                const response = await axios.get('http://localhost:5000/fetch_expenses', {
                    params: { email: user.email, month, year }
                });
    
                const expenseArray = response.data.expenses;
                if (Array.isArray(expenseArray)) {
                    const formattedExpenses = expenseArray.map(expense => ({
                        expense_id: expense[0],
                        expense_date: expense[1],
                        category_name: expense[2],
                        budget_type: expense[3],
                        expense_amount: parseFloat(expense[4]),
                        description: expense[5] || "No Description",
                    }));

                    setExpenses(formattedExpenses.sort((a, b) => new Date(a.expense_date) - new Date(b.expense_date)));
                }
            } catch (error) {
                console.error('Error fetching expenses:', error);
            }
        };
        fetchExpenses();
    }, [month, year]);

    const getMonthYearDateRange = () => {
        const firstDay = new Date(year, months.indexOf(month), 2);
        const lastDay = new Date(year, months.indexOf(month) + 1, 1);

        const minDate = firstDay.toISOString().split('T')[0];
        const maxDate = lastDay.toISOString().split('T')[0];

        return { minDate, maxDate };
    };

    const { minDate, maxDate } = getMonthYearDateRange();

    const handleAddExpense = () => {
        if (!budgetType || !selectedCategory || !expenseDate || !expenseAmount) {
            alert('Please fill in all required fields.');
            return;
        }

        const expenseMonth = new Date(expenseDate).toLocaleString('default', { month: 'long' });
        const expenseYear = new Date(expenseDate).getFullYear();

        if (expenseMonth !== month || expenseYear.toString() !== year) {
            alert(`Expense date (${expenseDate}) must match the selected month (${month}) and year (${year}).`);
            return;
        }

        const expenseData = {
            amount: parseFloat(expenseAmount),
            budgetType,
            category: selectedCategory,
            date: expenseDate,
            description,
            month,
            year,
        };

        axios.post('http://localhost:5000/api/expenses', expenseData)
            .then(response => {
                alert('Expense added successfully!');

                // Trigger a refresh of expenses
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.email) return;

            axios.get('http://localhost:5000/fetch_expenses', {
                params: { email: user.email, month, year }
            })
            .then(response => {
                const expenseArray = response.data.expenses;
                if (Array.isArray(expenseArray)) {
                    const formattedExpenses = expenseArray.map(expense => ({
                        expense_id: expense[0],
                        expense_date: expense[1],
                        category_name: expense[2],
                        budget_type: expense[3],
                        expense_amount: parseFloat(expense[4]),
                        description: expense[5] || "No Description",
                    }));

                    setExpenses(formattedExpenses.sort((a, b) => new Date(a.expense_date) - new Date(b.expense_date)));
                }
            })
            .catch(error => {
                console.error('Error fetching expenses:', error);
            });
            
                setExpenses([...expenses, {
                    expense_id: response.data.expense_id,
                    expense_date: expenseDate,
                    category_name: selectedCategory,
                    budget_type: budgetType,
                    expense_amount: parseFloat(expenseAmount),
                    description: description || "No Description",
                }]);

                setExpenseDate('');
                setExpenseAmount('');
                setDescription('');
                setSelectedCategory('');
            })
            .catch(error => {
                alert('Failed to add expense. Please try again later.');
                console.error('Error adding expense:', error);
            });
    };

    const handleEditExpense = (expense) => {
        setIsEditing(true);
        setCurrentExpenseId(expense.expense_id);
        setExpenseDate(expense.expense_date);
        setExpenseAmount(expense.expense_amount);
        setDescription(expense.description);
        setBudgetType(expense.budget_type);
        setSelectedCategory(expense.category_name);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setExpenseDate('');
        setExpenseAmount('');
        setDescription('');
        setBudgetType('');
        setSelectedCategory('');
    };

    const handleUpdateExpense = () => {
        const expenseData = {
            expense_id: currentExpenseId,
            amount: parseFloat(expenseAmount),
            budgetType,
            category: selectedCategory,
            date: expenseDate,
            description,
            month,
            year,
        };

        axios.put('http://localhost:5000/api/update-expense', expenseData)
            .then(response => {
                alert('Expense updated successfully!');
                setExpenses(prevExpenses => 
                    prevExpenses.map(expense => 
                        expense.expense_id === currentExpenseId ? { ...expense, ...expenseData } : expense
                    )
                );
                setIsEditing(false);
                setExpenseDate('');
                setExpenseAmount('');
                setDescription('');
                setSelectedCategory('');
                setBudgetType('');
            })
            .catch(error => {
                alert('Failed to update expense. Please try again later.');
                console.error('Error updating expense:', error);
            });
    };

    const handleDeleteExpense = (expenseId) => {
        axios.delete(`http://localhost:5000/delete_expense?expense_id=${expenseId}`)
            .then(response => {
                alert('Expense deleted successfully!');
                setExpenses(expenses.filter(expense => expense.expense_id !== expenseId));
            })
            .catch(error => {
                alert('Failed to delete expense. Please try again later.');
                console.error('Error deleting expense:', error);
            });
    };

    return (
        <div className="expense-container">
        <button className="back-to-dashboard" onClick={handleBackToDashboard}>
        Back to Dashboard
        </button>
            <div className="expense-form">
                <h2>{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
                <form>
                    <div className="form-group">
                        <label>Month</label>
                        <select value={month} onChange={(e) => setMonth(e.target.value)} disabled={isEditing}>
                            <option value="" disabled>Select Month</option>
                            {months.map((monthName) => (
                                <option key={monthName} value={monthName}>{monthName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Year</label>
                        <input
                            type="text"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            disabled={isEditing}
                            placeholder="Enter Year (e.g., 2024)"
                        />
                    </div>
                    <div className="form-group">
                        <label>Budget Type</label>
                        <select value={budgetType} onChange={(e) => setBudgetType(e.target.value)} disabled={isEditing}>
                            <option value="" disabled>Select Budget Type</option>
                            {availableBudgets.map((budget) => (
                                <option key={budget.Budget_ID} value={budget.Budget_Type}>
                                    {budget.Budget_Type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            <option value="" disabled>Select Category</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Expense Date</label>
                        <input
                            type="date"
                            value={expenseDate}
                            onChange={(e) => setExpenseDate(e.target.value)}
                            min={minDate}
                            max={maxDate}
                        />
                    </div>
                    <div className="form-group">
                        <label>Amount</label>
                        <input
                            type="number"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                            placeholder="Enter amount"
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter description (optional)"
                        />
                    </div>
                    <div className="form-actions">
                        {isEditing ? (
                            <>
                                <button type="button" onClick={handleUpdateExpense}>Update Expense</button>
                                <button type="button" onClick={handleCancelEdit}>Cancel</button>
                            </>
                        ) : (
                            <button type="button" onClick={handleAddExpense}>Add Expense</button>
                        )}
                    </div>
                </form>
            </div>

            <div className="expense-list">
                <h2>Expenses</h2>
                {expenses.length === 0 ? (
                    <p>No expenses recorded for {month} {year}.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense) => (
                                <tr key={expense.expense_id}>
                                    <td>{expense.expense_date}</td>
                                    <td>{expense.category_name}</td>
                                    <td>{expense.expense_amount}</td>
                                    <td>{expense.description}</td>
                                    <td>
                                        <button onClick={() => handleEditExpense(expense)}>Edit</button>
                                        <button onClick={() => handleDeleteExpense(expense.expense_id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Expense;
