import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { useUser } from '../context/UserContext'; // Import the useUser hook
import Lottie from 'react-lottie'; // Import Lottie for animation
import logoAnimation from '../assets/homepage-logo.json';
import './Dashboard.css';

const Dashboard = () => {
  const { user, setUser } = useUser(); // Get and set user data from context
  const navigate = useNavigate(); // Initialize navigation function
  const [loading, setLoading] = useState(true); // State to handle loading

  // Persist user state with localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user'); // Get user data from localStorage
    if (storedUser && !user) {
      setUser(JSON.parse(storedUser)); // Set the user in context if not already set
    }
    setLoading(false); // Loading completed
  }, [user, setUser]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading message while checking localStorage
  }

  if (!user) {
    return <div>Please login to access your dashboard.</div>; // If no user is logged in, show message
  }

  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: logoAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  // Function to handle navigation
  const handleNavigation = (tab) => {
    navigate(`/${tab}`); // Navigate to the selected tab
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
      <div className="logo-animation">
          <Lottie options={lottieOptions} height="4.5rem" width="9.375rem" />
        </div>

        <nav className="sidebar-menu">
          <button className="sidebar-button" onClick={() => handleNavigation('income')}>
            Income
          </button>
          <button className="sidebar-button" onClick={() => handleNavigation('budget')}>
            Budget
          </button>
          <button className="sidebar-button" onClick={() => handleNavigation('expense')}>
            Expense
          </button>
          <button className="sidebar-button" onClick={() => handleNavigation('report')}>
            Report
          </button>
          <button className="sidebar-button" onClick={() => handleNavigation('profile')}>
            Profile
          </button>
        </nav>

      </aside>

      <main className="main-content">
        <div className="content-left">
          <h1 className="dashboard-title">Dashboard</h1>
          <h2>Welcome Back, {user.name}!</h2>
          <p className="email-display">Email: {user.email}</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
