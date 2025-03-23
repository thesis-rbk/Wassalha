"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import Link from "next/link";
import { Moon, Sun, Eye, EyeOff } from "lucide-react";
import styles from "../../styles/AdminLogin.module.css"; 
import api, { refreshTokenTimestamp } from "../../lib/api";
// Import the types
import '@/types/global';

const AdminLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    // Check if user was redirected due to session expiration
    const expired = searchParams.get('expired');
    if (expired === 'true') {
      setStatusMessage("Your session has expired. Please login again.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatusMessage("");
    
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
      
      // Update token timestamp to mark it as fresh
      refreshTokenTimestamp();

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

  const handleGoogleLogin = async () => {
    try {
      // This function will be triggered when Google auth is complete
      window.handleGoogleAuth = async (response: any) => {
        try {
          const { credential } = response;
          
          // Using the admin-specific endpoint to verify admin access
          const apiResponse = await api.post('/api/users/admin/google-login', { 
            idToken: credential 
          });
          
          if (apiResponse.data.user?.id) {
            // Save user data from successful response
            localStorage.setItem("adminToken", apiResponse.data.token);
            localStorage.setItem("userData", JSON.stringify(apiResponse.data.user));
            
            // Update token timestamp to mark it as fresh
            refreshTokenTimestamp();
            
            // Navigate to dashboard
            router.push("/AdminDashboard");
          } else {
            setError("Failed to authenticate with Google");
          }
        } catch (error: any) {
          console.error("Google login error:", error);
          if (error.response?.status === 403) {
            setError("Access denied. Admin privileges required.");
          } else {
            setError("Failed to authenticate with Google");
          }
        }
      };
      
      // Initialize Google Sign-In
      if (window.google && window.google.accounts) {
        // Display the One Tap UI
        window.google.accounts.id.prompt();
      } else {
        setError("Google Sign-In is not available. Please try again later.");
      }
    } catch (error) {
      console.error("Error initializing Google login:", error);
      setError("Failed to initialize Google login");
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Load Google Sign-In SDK on component mount
  React.useEffect(() => {
    // Use the environment variable, but fallback to a hardcoded value for testing
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "975660785693-s3g88pg1b060b0uhh5h6ebti08v9m8gk.apps.googleusercontent.com";
    
    // Log to check if the client ID is loaded properly
    console.log("Google Client ID being used:", googleClientId);
    
    // Don't proceed if no client ID is available
    if (!googleClientId) {
      console.error("Google Client ID is not defined in environment variables");
      return;
    }
    
    // Add Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Initialize Google Sign-In
      // @ts-ignore - Google API injects this globally
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: any) => {
          // @ts-ignore
          if (window.handleGoogleAuth) {
            // @ts-ignore
            window.handleGoogleAuth(response);
          }
        },
      });
      
      // Optionally render a button (though we're using our custom button)
      // @ts-ignore
      window.google.accounts.id.renderButton(
        document.getElementById("googleButton"),
        { theme: "outline", size: "large", width: "100%" }
      );
    };
    
    document.body.appendChild(script);

    return () => {
      // Clean up the script when component unmounts
      try {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      } catch (error) {
        console.error("Error removing script:", error);
      }
    };
  }, []);

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
          {statusMessage && <p className={styles.statusMessage}>{statusMessage}</p>}
          <button className={styles.button} type="submit">
            Log In
          </button>
          
          <div className={styles.divider}>
            <span>or</span>
          </div>
          
          <button 
            id="googleButton"
            type="button"
            className={styles.googleButton} 
            onClick={handleGoogleLogin}
          >
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google logo" 
              className={styles.googleIcon} 
            />
            Login with Google
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
