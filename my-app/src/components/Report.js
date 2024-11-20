import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Report.css"; // Include the CSS file

const Report = () => {
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [totalIncome, setTotalIncome] = useState(null);
    const [totalBudget, setTotalBudget] = useState(null);
    const [totalCategory, setTotalCategory] = useState(null);
    const [incomes, setIncomes] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [expenses, setExpenses] = useState([]);

    const navigate = useNavigate();

    const fetchReportData = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.email) {
            alert("User not logged in");
            return;
        }

        const email = user.email;

        try {
            const responses = await Promise.all([
                fetch(`http://localhost:5000/total_income?email=${email}&month=${month}&year=${year}`),
                fetch(`http://localhost:5000/total_budget?email=${email}&month=${month}&year=${year}`),
                fetch(`http://localhost:5000/total_category?email=${email}&month=${month}&year=${year}`),
                fetch(`http://localhost:5000/get_income_list?email=${email}&month=${month}&year=${year}`),
                fetch(`http://localhost:5000/get_budget_list?email=${email}&month=${month}&year=${year}`),
                fetch(`http://localhost:5000/get_category_list?email=${email}&month=${month}&year=${year}`),
                fetch(`http://localhost:5000/get_expense_list?email=${email}&month=${month}&year=${year}`),
            ]);

            const [
                incomeData,
                budgetData,
                categoryData,
                incomesData,
                budgetsData,
                categoriesData,
                expensesData,
            ] = await Promise.all(responses.map((res) => res.json()));

            setTotalIncome(incomeData.total_income);
            setTotalBudget(budgetData.total_budget);
            setTotalCategory(categoryData.total_category);
            setIncomes(incomesData.incomes || []);
            setBudgets(budgetsData.budgets || []);
            setCategories(categoriesData.categories || []);
            setExpenses(expensesData.expenses || []);
        } catch (error) {
            console.error("Error fetching report data:", error);
        }
    };

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    return (
        <div className="report-container">
            <button className="back-btn" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
            <h1>Monthly Report</h1>
            <div className="filters">
                <div>
                    <label>Month: </label>
                    <select value={month} onChange={(e) => setMonth(e.target.value)}>
                        <option value="">Select Month</option>
                        {months.map((monthName, index) => (
                            <option key={index} value={monthName}>
                                {monthName}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Year: </label>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="Enter Year"
                    />
                </div>
                <button className="fetch-btn" onClick={fetchReportData}>Get Report</button>
            </div>

            <div className="section">
                <h2>Income</h2>
                <ul>
                    {incomes.length > 0 ? (
                        incomes.map((income, index) => (
                            <li key={index}>
                                {income.income_amt} ({income.income_type})
                            </li>
                        ))
                    ) : (
                        <p>No incomes found</p>
                    )}
                </ul>
                {totalIncome !== null && <p className="summary">Total Income: {totalIncome}</p>}
            </div>

            <div className="section">
                <h2>Budget</h2>
                <ul>
                    {budgets.length > 0 ? (
                        budgets.map((budget, index) => (
                            <li key={index}>
                                {budget.Budget_Type}: {budget.Budget_Amount} (Spent: {budget.total_expense})
                            </li>
                        ))
                    ) : (
                        <p>No budgets found</p>
                    )}
                </ul>
                {totalBudget !== null && <p className="summary">Total Budget Expense: {totalBudget}</p>}
            </div>

            <div className="section">
                <h2>Category</h2>
                <ul>
                    {categories.length > 0 ? (
                        categories.map((category, index) => (
                            <li key={index}>
                                {category.category_name} (Expense: {category.total_expense})
                            </li>
                        ))
                    ) : (
                        <p>No categories found</p>
                    )}
                </ul>
                {totalCategory !== null && <p className="summary">Total Category Expense: {totalCategory}</p>}
            </div>

            <div className="section">
                <h2>Expense</h2>
                <ul>
                    {expenses.length > 0 ? (
                        expenses.map((expense, index) => (
                            <li key={index}>
                                {expense.description}: {expense.expense_amount} ({expense.expense_date})
                            </li>
                        ))
                    ) : (
                        <p>No expenses found</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Report;
