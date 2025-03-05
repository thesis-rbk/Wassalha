"use client"; // ✅ Ensure it's a client component
import React, { useState } from 'react';
import { useRouter } from "next/navigation"; // ✅ Use next/navigation in App Router
import axios from 'axios'; // Import Axios

const AdminLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        const response = await axios.post('http://localhost:5000/api/users/admin/login', { email, password }); // Axios call to admin login
        localStorage.setItem('adminToken', response.data.token); // Set the token from response
        router.push('/AdminDashboard'); // Redirects to the Admin Dashboard
    } catch (error) {
        setError('Invalid email or password'); // Handle error
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            style={{ margin: '10px 0', padding: '8px', width: '100%' }}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            style={{ margin: '10px 0', padding: '8px', width: '100%' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '10px 15px', marginTop: '10px' }}>
          Log In
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
