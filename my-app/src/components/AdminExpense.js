import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminExpense.css';

const AdminExpense = () => {
  const [expenseData, setExpenseData] = useState([]);
  const [deletedExpenseData, setDeletedExpenseData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deletedCategories, setDeletedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const handleBackToDashboard = () => {
    navigate('/admin-dashboard');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const expenseResponse = await fetch('http://localhost:5000/api/expense');
        if (!expenseResponse.ok) throw new Error('Failed to fetch expense data');
        const expenseData = await expenseResponse.json();

        const deletedExpenseResponse = await fetch('http://localhost:5000/api/deleted-expense');
        if (!deletedExpenseResponse.ok) throw new Error('Failed to fetch deleted expense data');
        const deletedExpenseData = await deletedExpenseResponse.json();

        const categoryResponse = await fetch('http://localhost:5000/api/category');
        if (!categoryResponse.ok) throw new Error('Failed to fetch categories');
        const categories = await categoryResponse.json();

        const deletedCategoryResponse = await fetch('http://localhost:5000/api/deleted-category');
        if (!deletedCategoryResponse.ok) throw new Error('Failed to fetch deleted categories');
        const deletedCategories = await deletedCategoryResponse.json();

        setExpenseData(expenseData);
        setDeletedExpenseData(deletedExpenseData);
        setCategories(categories);
        setDeletedCategories(deletedCategories);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-expense-container">
      <button className="back-to-dashboard" onClick={handleBackToDashboard}>
        Back to Dashboard
      </button>
      <h2>Expense Management</h2>

      {/* Active Expenses */}
      <div className="expense-section">
        <h3>Active Expenses</h3>
        <table className="expense-table">
          <thead>
            <tr>
              <th>Expense ID</th>
              <th>Category ID</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Description</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {expenseData.map((expense) => (
              <tr key={expense.expense_id}>
                <td>{expense.expense_id}</td>
                <td>{expense.category_id}</td>
                <td>{Number(expense.expense_amount).toFixed(2)}</td>
                <td>{expense.expense_date}</td>
                <td>{expense.description}</td>
                <td>{new Date(expense.created_at).toLocaleString()}</td>
                <td>{new Date(expense.updated_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deleted Expenses */}
      <div className="expense-section">
        <h3>Deleted Expenses</h3>
        <table className="expense-table">
          <thead>
            <tr>
              <th>Deleted ID</th>
              <th>Expense ID</th>
              <th>Category ID</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Description</th>
              <th>Deleted At</th>
            </tr>
          </thead>
          <tbody>
            {deletedExpenseData.map((deletedExpense) => (
              <tr key={deletedExpense.deleted_expense_id}>
                <td>{deletedExpense.deleted_expense_id}</td>
                <td>{deletedExpense.expense_id}</td>
                <td>{deletedExpense.category_id}</td>
                <td>{Number(deletedExpense.expense_amount).toFixed(2)}</td>
                <td>{deletedExpense.expense_date}</td>
                <td>{deletedExpense.description}</td>
                <td>{new Date(deletedExpense.deleted_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Categories */}
      <div className="expense-section">
        <h3>Active Categories</h3>
        <table className="expense-table">
          <thead>
            <tr>
              <th>Category ID</th>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.category_id}>
                <td>{category.category_id}</td>
                <td>{category.category_name}</td>
                <td>{category.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deleted Categories */}
      <div className="expense-section">
        <h3>Deleted Categories</h3>
        <table className="expense-table">
          <thead>
            <tr>
              <th>Deleted ID</th>
              <th>Category ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Deleted At</th>
            </tr>
          </thead>
          <tbody>
            {deletedCategories.map((deletedCategory) => (
              <tr key={deletedCategory.deleted_category_id}>
                <td>{deletedCategory.deleted_category_id}</td>
                <td>{deletedCategory.category_id}</td>
                <td>{deletedCategory.category_name}</td>
                <td>{deletedCategory.description}</td>
                <td>{new Date(deletedCategory.deleted_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminExpense;
