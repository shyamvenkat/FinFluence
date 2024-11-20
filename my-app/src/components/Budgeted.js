import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Budgeted.css';

const Budgeted = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [budgetData, setBudgetData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [availableBudget, setAvailableBudget] = useState(0);
  const [formData, setFormData] = useState({
    budget_amt: '',
    budget_type: '',
    month: '',
    year: new Date().getFullYear(),
    description: '',
  });
  const [editingBudget, setEditingBudget] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  // Extract email from localStorage
  useEffect(() => {
    const email = JSON.parse(localStorage.getItem('user'))?.email;
    if (email) {
      setUserEmail(email);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const budget_types = ['Food', 'Home', 'Entertainment', 'Travel', 'Miscellaneous'];

  // Fetch total income and budget data for the logged-in user
  useEffect(() => {
    if (userEmail && formData.month && formData.year) {
      const fetchBudgetData = async () => {
        try {
          const incomeResponse = await axios.get('http://localhost:5000/total_income', {
            params: { email: userEmail, month: formData.month, year: formData.year },
          });
          const totalIncomeAmount = incomeResponse.data.total_income;
          setTotalIncome(totalIncomeAmount);
          setAvailableBudget(totalIncomeAmount);

          const budgetResponse = await axios.get('http://localhost:5000/fetch_budget', {
            params: { email: userEmail, month: formData.month, year: formData.year },
          });

          if (budgetResponse.data.message) {
            setErrorMessage(budgetResponse.data.message);
            setBudgetData([]);
          } else {
            const budgetArray = budgetResponse.data.budgets.map(budget => ({
              budget_id: budget.budget_id,
              budget_amt: budget.budget_amt,
              budget_type: budget.budget_type,
              month: budget.month,
              year: budget.year,
              description: budget.description || '',
            }));
            setBudgetData(budgetArray);

            // Recalculate available budget after fetching existing budgets
            const totalSpent = budgetArray.reduce((sum, budget) => sum + parseFloat(budget.budget_amt), 0);
            setAvailableBudget(totalIncomeAmount - totalSpent);

            setErrorMessage('');
          }
        } catch (error) {
          console.error('Error fetching budget data:', error);
          setErrorMessage('Error fetching budget data');
        }
      };

      fetchBudgetData();
    }
  }, [userEmail, formData.month, formData.year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { budget_amt, budget_type, month, year, description } = formData;

    // Validate required fields
    if (!budget_amt || !budget_type || !month || !year) {
        setErrorMessage('Please fill in all the fields');
        return;
    }

    try {
        // Check if budget exceeds available budget, only for new budgets
        if (!editingBudget && parseFloat(budget_amt) > availableBudget) {
            setErrorMessage('The budget exceeds the available budget');
            return;
        }

        // Add or Update Budget based on editingBudget flag
        if (editingBudget) {
            // Update existing budget
            await axios.put('http://localhost:5000/update_budget', {
                budget_id: editingBudget.budget_id,
                email: userEmail,
                budget_amt,
                budget_type,
                month,
                year,
                description: description || '',
            });
            setSuccessMessage('Budget updated successfully');
        } else {
            // Add new budget
            const response = await axios.post('http://localhost:5000/add_budget', {
                email: userEmail,
                budget_amt,
                budget_type,
                month,
                year,
                description: description || '',
            });

            if (response.status === 200) {
                setSuccessMessage(response.data.message); // Success message from server
                setAvailableBudget(prev => prev - parseFloat(budget_amt)); // Update available budget
            }
        }

        // Re-fetch updated budget data for the given month and year
        const budgetResponse = await axios.get('http://localhost:5000/fetch_budget', {
            params: { email: userEmail, month, year },
        });

        const budgetArray = budgetResponse.data.budgets.map(budget => ({
            budget_id: budget.budget_id,
            budget_amt: budget.budget_amt,
            budget_type: budget.budget_type,
            month: budget.month,
            year: budget.year,
            description: budget.description || '',
        }));
        setBudgetData(budgetArray);

        // Recalculate available budget
        const totalSpent = budgetArray.reduce((sum, budget) => sum + parseFloat(budget.budget_amt), 0);
        setAvailableBudget(totalIncome - totalSpent);

        // Reset the form, with the year being reset to the current year
        setFormData(prevFormData => ({
            ...prevFormData,
            budget_amt: '',
            budget_type: '',
            description: '',
            year: new Date().getFullYear(), // Reset year to the current year
        }));
        setEditingBudget(null); // Reset editing flag
        setErrorMessage(''); // Clear error message after success
    } catch (error) {
        console.error('Error updating/adding budget:', error);
        setErrorMessage('An error occurred while updating/adding the budget');
    }
};


  // Handle Edit Budget
  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      budget_amt: budget.budget_amt,
      budget_type: budget.budget_type,
      month: budget.month,
      year: budget.year,
      description: budget.description || '',
    });
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    setFormData({
      budget_amt: '',
      budget_type: '',
      month: editingBudget?.month,
      year: new Date().getFullYear(),
      description: '',
    });
    setEditingBudget(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Handle Delete Budget
  const handleDelete = async (budget_id, budget_amt) => {
    try {
      await axios.delete('http://localhost:5000/delete_budget', { params: { budget_id } });
      setSuccessMessage('Budget deleted successfully');
      setAvailableBudget(prev => prev + parseFloat(budget_amt));

      const budgetResponse = await axios.get('http://localhost:5000/fetch_budget', {
        params: { email: userEmail, month: formData.month, year: formData.year },
      });
      const budgetArray = budgetResponse.data.budgets.map(budget => ({
        budget_id: budget.budget_id,
        budget_amt: budget.budget_amt,
        budget_type: budget.budget_type,
        month: budget.month,
        year: budget.year,
        description: budget.description || '',
      }));
      setBudgetData(budgetArray);

      // Recalculate available budget after deletion
      const totalSpent = budgetArray.reduce((sum, budget) => sum + parseFloat(budget.budget_amt), 0);
      setAvailableBudget(totalIncome - totalSpent);
    } catch (error) {
      console.error('Error deleting budget:', error);
      setErrorMessage('Error deleting budget');
    }
  };

  return (
    <div className="budget-page">
      <button className="back-to-dashboard" onClick={handleBackToDashboard}>
        Back to Dashboard
      </button>
      <h1>{editingBudget ? 'Update Budget' : 'Add Budget'}</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          Month:
          <select
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
            required
          >
            {['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
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
        <label>
          Budget Type:
          <select
            value={formData.budget_type}
            onChange={(e) => setFormData({ ...formData, budget_type: e.target.value })}
            required
          >
            <option value="">Select Type</option>
            {budget_types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          Amount:
          <input
            type="number"
            value={formData.budget_amt}
            onChange={(e) => setFormData({ ...formData, budget_amt: e.target.value })}
            required
          />
        </label>
        <label>
          Description:
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </label>
        <button type="submit" onClick={handleSubmit}>
          {editingBudget ? 'Update Budget' : 'Add Budget'}
        </button>
        {editingBudget && (
          <button type="button" onClick={handleCancelEdit}>
            Cancel
          </button>
        )}
      </form>

      <div className="budget-summary">
        <p>
          Total Income: <strong>{totalIncome}</strong>
        </p>
        <p>
          Available Budget: <strong>{availableBudget}</strong>
        </p>
      </div>

      <div className="budget-list">
        <h2>Budgeted Amounts</h2>
        {budgetData.length === 0 ? (
          <p>No budgets available for this month/year.</p>
        ) : (
          <ul>
            {budgetData.map((budget) => (
              <li key={budget.budget_id}>
                <p>
                  Amount: <strong>{budget.budget_amt}</strong>
                </p>
                <button onClick={() => handleEdit(budget)}>Edit</button>
                <button onClick={() => handleDelete(budget.budget_id, budget.budget_amt)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Budgeted;
