import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext'; 
import HomePage from './components/HomePage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Income from './components/Income'; 
import Budget from './components/Budgeted';
import Profile from './components/Profile';
import Expense from './components/Expense';
import User from './components/User';
import AdminIncome from './components/AdminIncome';
import AdminBudget from './components/AdminBudget';
import AdminExpense from './components/AdminExpense';
import Report from './components/Report';


function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/income" element={<Income />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/expense" element={<Expense />} />
          <Route path="/user" element={<User />} />
          <Route path="/admin-income" element={<AdminIncome />} />
          <Route path="/admin-budget" element={<AdminBudget />} />
          <Route path="/admin-expense" element={<AdminExpense />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
