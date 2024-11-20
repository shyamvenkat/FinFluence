import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Income.css';

const Income = () => {
  const [incomeData, setIncomeData] = useState([]);
  const [formData, setFormData] = useState({
    income_amt: '',
    income_type: '',
    month: new Date().toLocaleString('default', { month: 'long' }), // Default to current month as word
    year: new Date().getFullYear(), // Default to current year
  });
  const [editingIncome, setEditingIncome] = useState(null); // To track if editing an income

  const navigate = useNavigate(); // For navigation

  // Extract email from localStorage
  const userEmail = JSON.parse(localStorage.getItem('user'))?.email;

  // Redirect to login if user is not logged in
  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
    }
  }, [userEmail, navigate]);

  // Fetch income data for the logged-in user
  const fetchIncome = async () => {
    if (!userEmail) {
      console.log('User email not found in localStorage');
      return;
    }
    try {
      const response = await axios.get('http://localhost:5000/fetch_income', { params: { email: userEmail } });
      const incomeArray = response.data.income.map(income => ({
        income_id: income[0],
        income_amt: income[1],
        income_type: income[2],
        month: income[3], // Assuming month is returned as string (e.g., 'January')
        year: income[4], // Assuming year is returned as part of the response
        timestamp: income[5],
      }));
      setIncomeData(incomeArray); // Set the mapped data in the state
    } catch (error) {
      console.error('Error fetching income:', error);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchIncome();
    } else {
      console.log('No user email found in localStorage');
    }
  }, [userEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { income_amt, income_type, month, year } = formData;

    if (!income_amt || !income_type || !month || !year) {
      console.log('Please fill in all the fields');
      return;
    }

    try {
      const existingIncome = incomeData.find(
        (income) =>
          income.income_type === income_type &&
          income.month === month &&
          income.year === parseInt(year)
      );

      if (existingIncome) {
        if (editingIncome) {
          await axios.put('http://localhost:5000/update_income', {
            income_id: editingIncome.income_id,
            income_amt: parseFloat(income_amt),
            income_type,
            month,
            year,
          });
          console.log('Income updated successfully');
          setEditingIncome(null); // Clear editing state
        } else {
          const updatedAmt = parseFloat(existingIncome.income_amt) + parseFloat(income_amt);
          await axios.put('http://localhost:5000/update_income', {
            income_id: existingIncome.income_id,
            income_amt: updatedAmt,
            income_type,
            month,
            year,
          });
          console.log('Income amount updated successfully');
        }
      } else {
        await axios.post('http://localhost:5000/add_income', { ...formData, email: userEmail });
        console.log('Income added successfully');
      }

      fetchIncome();
      setFormData({ income_amt: '', income_type: '', month: new Date().toLocaleString('default', { month: 'long' }), year: new Date().getFullYear() }); // Reset form
    } catch (error) {
      console.error(editingIncome ? 'Error updating income:' : 'Error adding income:', error);
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setFormData({
      income_amt: income.income_amt,
      income_type: income.income_type,
      month: income.month,
      year: income.year,
    });
  };

  const handleDelete = async (income_id) => {
    try {
      await axios.delete('http://localhost:5000/delete_income', { params: { income_id } });
      console.log('Income deleted successfully');
      fetchIncome();
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const incomeTypes = ['Salary', 'Rent', 'Return On Investment', 'Miscellaneous'];

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Grouping and sorting logic for displaying income details
  const groupedIncome = incomeData
    .sort((a, b) => {
      const monthA = months.indexOf(a.month);
      const monthB = months.indexOf(b.month);
      return a.year - b.year || monthA - monthB;
    })
    .reduce((acc, income) => {
      const key = `${income.month} ${income.year}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(income);
      return acc;
    }, {});

  return (
    <div className="income-page">
      {/* Back to Dashboard Tab */}
      <button className="back-to-dashboard" onClick={handleBackToDashboard}>
        Back to Dashboard
      </button>

      {/* Top Section: Add/Update Income */}
      <div className="add-income-section">
        <h1>{editingIncome ? 'Update Income' : 'Add Income'}</h1>
        <form onSubmit={handleSubmit} className="income-form">
          <label>
            Income Type:
            <select
              value={formData.income_type}
              onChange={(e) => setFormData({ ...formData, income_type: e.target.value })}
              required
            >
              <option value="" disabled>Select Income Type</option>
              {incomeTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            Income Amount:
            <input
              type="number"
              value={formData.income_amt}
              onChange={(e) => setFormData({ ...formData, income_amt: e.target.value })}
              required
            />
          </label>
          <label>
            Month:
            <select
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              required
            >
              {months.map((month, index) => (
                <option key={index} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </label>
          <label>
            Year:
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              required
            />
          </label>
          <button type="submit">{editingIncome ? 'Update' : 'Add'} Income</button>
        </form>
      </div>

      {/* Bottom Section: Income Details */}
      <div className="income-details-section">
        <h2>Income Details</h2>
        {incomeData.length === 0 ? (
          <p className="empty-message">Income Empty</p>
        ) : (
          Object.keys(groupedIncome).map((key) => (
            <div key={key}>
              <h3>{key}</h3>
              <ul className="income-list">
                {groupedIncome[key].map((income) => (
                  <li key={income.income_id} className="income-item">
                    <p>Amount: {income.income_amt}, Type: {income.income_type}</p>
                    <button onClick={() => handleEdit(income)}>Edit</button>
                    <button onClick={() => handleDelete(income.income_id)}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Income;
