"use client"; // ✅ Ensure it's a client component
import React, { useState } from 'react';
import { useRouter } from "next/navigation"; // ✅ Use next/navigation in App Router

const AdminLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate a successful login
    if (email === "admin@example.com" && password === "password") {
      localStorage.setItem('adminToken', 'your_token_here'); // Set a token
      router.push('/AdminDashboard'); // Redirects to the Admin Dashboard
    } else {
      setError('Invalid email or password');
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
