import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './User.css'; // Add CSS for styling

const User = () => {
  const [users, setUsers] = useState([]); // State to store user data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/admin-dashboard');
  };


  useEffect(() => {
    // Fetch user data from the API
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="user-container">
        <button className="back-to-dashboard" onClick={handleBackToDashboard}>
        Back to Dashboard
      </button>
      <h2>User Management</h2>
      <table className="user-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Password</th>
            <th>Phone</th>
            <th>Is Admin</th>
            <th>Created At</th>
            <th>Last Login</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.User_ID}>
              <td>{user.User_ID}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.password}</td>
              <td>{user.phone}</td>
              <td>{user.is_admin ? 'Yes' : 'No'}</td>
              <td>{new Date(user.created_at).toLocaleString()}</td>
              <td>{user.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default User;
