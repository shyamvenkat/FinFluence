import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Lottie from 'react-lottie'; // Import Lottie for animation
import logoAnimation from '../assets/homepage-logo.json'; // Import logo animation
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && !user) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [user, setUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please login as an admin to access the dashboard.</div>;
  }

  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: logoAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  const handleNavigation = (tab) => {
    if (tab === 'profile') {
        navigate('/profile'); // Navigate to the Profile page
      } 
      else if (tab === 'user') {
        navigate('/user'); // Navigate to the Profile page
      }
      else if (tab === 'income') {
        navigate('/admin-income'); // Navigate to the Profile page
      }
      else if (tab === 'budget') {
        navigate('/admin-budget'); // Navigate to the Profile page
      }
      else if (tab === 'expense') {
        navigate('/admin-expense'); // Navigate to the Profile page
      }
      else {
        navigate('/admin/${tab}');
      }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-animation">
          <Lottie options={lottieOptions} height="4.5rem" width="9.375rem" />
        </div>
        <nav className="sidebar-menu">
          <button className="sidebar-button" onClick={() => handleNavigation('user')}>
            User
          </button>
          <button className="sidebar-button" onClick={() => handleNavigation('income')}>
            Income
          </button>
          <button className="sidebar-button" onClick={() => handleNavigation('budget')}>
            Budget
          </button>
          <button className="sidebar-button" onClick={() => handleNavigation('expense')}>
            Expense
          </button>
          <button className="sidebar-button" onClick={() => handleNavigation('profile')}>
            Profile
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-left">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <h2>Welcome Back, {user.name}!</h2>
          <p className="email-display">Email: {user.email}</p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;