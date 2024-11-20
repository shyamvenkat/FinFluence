import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // Import the useUser hook
import './Profile.css';

const Profile = () => {
  const { user, logout } = useUser(); // Get user data and logout function
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null); // State to store profile data
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [newPassword, setNewPassword] = useState(''); // State for updating password
  const [isUpdating, setIsUpdating] = useState(false); // State for update process
  const [updateMessage, setUpdateMessage] = useState(''); // Feedback message for updates
  
  const handleBackToDashboard = () => {
    if (user?.isAdmin) {
      navigate('/admin-dashboard'); // Navigate to admin dashboard if user is an admin
    } else {
      navigate('/dashboard'); // Navigate to regular dashboard if user is not an admin
    }
  };

  useEffect(() => {
    // Fetch user profile data from the backend
    const fetchProfileData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: user.email }),
        });

        const result = await response.json();
        if (response.ok) {
          setProfileData(result);
        } else {
          console.error(result.error || 'Failed to fetch profile data');
        }
      } catch (error) {
        console.error('An error occurred while fetching profile data:', error);
      }
    };

    if (user?.email) {
      fetchProfileData();
    }
  }, [user]);

  if (!user) {
    return <div>Please login to access your profile.</div>;
  }

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword) {
      setUpdateMessage('Please enter a new password.');
      return;
    }

    setIsUpdating(true);
    setUpdateMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          newPassword,
        }),
      });

      const result = await response.json();
      if (response.ok && result.updated) {
        setUpdateMessage('Password updated successfully.');
        setNewPassword('');
      } else {
        setUpdateMessage('Failed to update password. Please try again.');
      }
    } catch (error) {
      setUpdateMessage('An error occurred. Please try again later.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="profile-container">
      <button className="back-to-dashboard" onClick={handleBackToDashboard}>
        Back to Dashboard
      </button>
      <h2>User Profile</h2>

      {profileData ? (
        <div className="profile-details">
          <div className="profile-info">
            <p><strong>Name:</strong> {profileData.name}</p>
            <p><strong>Email:</strong> {profileData.email}</p>
            <p><strong>Phone:</strong> {profileData.phone}</p>
          </div>

          <div className="password-section">
            <strong>Password:</strong>
            <span>{showPassword ? profileData.password : '********'}</span>
            <button className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'} Password
            </button>
          </div>
        </div>
      ) : (
        <p>Loading profile data...</p>
      )}

      <div className="update-password">
        <h3>Update Password</h3>
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="password-input"
        />
        <button onClick={handlePasswordUpdate} disabled={isUpdating} className="update-password-btn">
          {isUpdating ? 'Updating...' : 'Update Password'}
        </button>
        {updateMessage && <p className="update-message">{updateMessage}</p>}
      </div>

      <div className="logout-section">
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </div>
  );
};

export default Profile;
