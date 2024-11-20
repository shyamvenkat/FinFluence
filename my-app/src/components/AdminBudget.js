import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminBudget.css';

const AdminBudget = () => {
  const [budgetData, setBudgetData] = useState([]);
  const [deletedBudgetData, setDeletedBudgetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const handleBackToDashboard = () => {
    navigate('/admin-dashboard');
  };

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/budget');
        if (!response.ok) throw new Error('Failed to fetch budget data');
        const data = await response.json();
        setBudgetData(data);
      } catch (err) {
        setError(err.message);
      }
    };


    const fetchDeletedBudgetData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/deleted-budget');
        if (!response.ok) throw new Error('Failed to fetch deleted budget data');
        const data = await response.json();
        setDeletedBudgetData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchBudgetData();
    fetchDeletedBudgetData();
    setLoading(false);
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-budget-container">
        <button className="back-to-dashboard" onClick={handleBackToDashboard}>
        Back to Dashboard
      </button>
      <h2>Budget Management</h2>

      {/* Active Budget Table */}
      <div className="budget-section">
        <h3>Active Budgets</h3>
        <table className="budget-table">
          <thead>
            <tr>
              <th>Budget ID</th>
              <th>User ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Month</th>
              <th>Year</th>
              <th>Description</th>
              <th>Created At</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {budgetData.map((budget) => (
              <tr key={budget.Budget_ID}>
                <td>{budget.Budget_ID}</td>
                <td>{budget.User_ID}</td>
                <td>{budget.Budget_Type}</td>
                <td>{Number(budget.Budget_Amount).toFixed(2)}</td>
                <td>{budget.Month}</td>
                <td>{budget.Year}</td>
                <td>{budget.Description}</td>
                <td>{new Date(budget.Created_At).toLocaleString()}</td>
                <td>{new Date(budget.Updated_At).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deleted Budget Table */}
      <div className="budget-section">
        <h3>Deleted Budgets</h3>
        <table className="budget-table">
          <thead>
            <tr>
              <th>Deleted ID</th>
              <th>Budget ID</th>
              <th>User ID</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Month</th>
              <th>Year</th>
              <th>Description</th>
              <th>Created At</th>
              <th>Deleted At</th>
            </tr>
          </thead>
          <tbody>
            {deletedBudgetData.map((deletedBudget) => (
              <tr key={deletedBudget.deleted_budget_id}>
                <td>{deletedBudget.deleted_budget_id}</td>
                <td>{deletedBudget.budget_id}</td>
                <td>{deletedBudget.user_id}</td>
                <td>{deletedBudget.budget_type}</td>
                <td>{Number(deletedBudget.budget_amt).toFixed(2)}</td>
                <td>{deletedBudget.month}</td>
                <td>{deletedBudget.year}</td>
                <td>{deletedBudget.description}</td>
                <td>{new Date(deletedBudget.created_at).toLocaleString()}</td>
                <td>{new Date(deletedBudget.deleted_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBudget;
