"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; 
import Link from "next/link";
import { Moon, Sun, Eye, EyeOff } from "lucide-react";
import styles from "../../styles/AdminLogin.module.css"; 
import api from "../../lib/api";

const AdminLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [showPassword, setShowPassword] = useState(false); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await api.post(
        '/api/users/admin/login',
        { email, password }
      );

      console.log("Login - Full response data:", response.data);

      if (!response.data.user?.id) {
        console.error("Login - No user ID in response:", response.data);
        throw new Error("No user ID in response");
      }

      const userData = {
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role,
        profile: {
          image: {
            url: response.data.user.profile?.image?.url
          }
        }
      };

      console.log("Login - Storing user data:", userData);

      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("userData", JSON.stringify(userData));

      // Verify the data was stored correctly
      const storedData = localStorage.getItem("userData");
      console.log("Login - Verified stored data:", storedData);

      router.push("/AdminDashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.response?.status === 403) {
        setError("Access denied. Admin privileges required.");
      } else {
        setError("Invalid email or password");
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`${styles.container} ${styles.adminLoginContainer} ${isDarkMode ? styles.dark : ""}`}>
      <div className={`${styles.card} ${isDarkMode ? styles.darkMode : ""}`}>
        <h2>Admin Login</h2>
        <div onClick={toggleDarkMode} className={styles.moonIcon}>
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </div>
        <form className={styles.formContainer} onSubmit={handleLogin}>
          <label className={styles.label}>Email:</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />

          <label className={styles.label}>Password:</label>
          <div className={styles.inputWrapper}>
            <input
              className={styles.input}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
            <div 
              onClick={togglePasswordVisibility} 
              className={styles.eyeIcon}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.button} type="submit">
            Log In
          </button>
          
          <div className={styles.forgotPasswordContainer}>
            <Link href="/AdminLogin/ForgotPassword" className={styles.forgotPasswordLink}>
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
