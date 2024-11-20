import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminIncome.css';

const AdminIncome = () => {
  const [incomeData, setIncomeData] = useState([]);
  const [deletedIncomeData, setDeletedIncomeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

const handleBackToDashboard = () => {
        navigate('/admin-dashboard');
      };

  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/income');
        if (!response.ok) throw new Error('Failed to fetch income data');
        const data = await response.json();
        setIncomeData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchDeletedIncomeData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/deleted-income');
        if (!response.ok) throw new Error('Failed to fetch deleted income data');
        const data = await response.json();
        setDeletedIncomeData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchIncomeData();
    fetchDeletedIncomeData();
    setLoading(false);
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-income-container">
        <button className="back-to-dashboard" onClick={handleBackToDashboard}>
        Back to Dashboard
      </button>
      <h2>Income Management</h2>

      {/* Active Income Table */}
      <div className="income-section">
        <h3>Active Income</h3>
        <table className="income-table">
          <thead>
            <tr>
              <th>Budget ID</th>
              <th>User ID</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Month</th>
              <th>Year</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {incomeData.map((income) => (
              <tr key={income.income_id}>
                <td>{income.income_id}</td>
                <td>{income.user_id}</td>
                <td>{isNaN(income.income_amt) ? income.income_amt : Number(income.income_amt).toFixed(2)}</td>
                <td>{income.income_type}</td>
                <td>{income.month}</td>
                <td>{income.year}</td>
                <td>{new Date(income.updated_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deleted Income Table */}
      <div className="income-section">
        <h3>Deleted Income</h3>
        <table className="income-table">
          <thead>
            <tr>
              <th>Budget ID</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Month</th>
              <th>Year</th>
              <th>Last Updated</th>
              <th>User ID</th>
              <th>Deleted At</th>
            </tr>
          </thead>
          <tbody>
            {deletedIncomeData.map((income) => (
              <tr key={income.income_id}>
                <td>{income.income_id}</td>
                <td>{isNaN(income.income_amt) ? income.income_amt : Number(income.income_amt).toFixed(2)}</td>
                <td>{income.income_type}</td>
                <td>{income.month}</td>
                <td>{income.year}</td>
                <td>{new Date(income.last_updated_at).toLocaleString()}</td>
                <td>{income.user_id}</td>
                <td>{new Date(income.deleted_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminIncome;
