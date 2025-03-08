"use client"; // ✅ Ensure it's a client component
import React, { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Use next/navigation in App Router
import axios from "axios"; // Import Axios
import { Moon, Sun, Eye, EyeOff } from "lucide-react"; // Import icons
import styles from "../styles/AdminLogin.module.css"; // Import the new CSS module

const AdminLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/admin/login`,
        { email, password }
      );

      console.log("Login - Full response data:", response.data); // Debug log

      if (!response.data.user?.id) {
        console.error("Login - No user ID in response:", response.data); // Debug log
        throw new Error("No user ID in response");
      }

      const userData = {
        id: response.data.user.id,
        name: response.data.user.name,
        role: response.data.user.role,
        profile: {
          image: {
            url: response.data.user.profile?.image?.url
          }
        }
      };

      console.log("Login - Storing user data:", userData); // Debug log

      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("userData", JSON.stringify(userData));

      // Verify the data was stored correctly
      const storedData = localStorage.getItem("userData");
      console.log("Login - Verified stored data:", storedData); // Debug log

      router.push("/AdminDashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid email or password");
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
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
