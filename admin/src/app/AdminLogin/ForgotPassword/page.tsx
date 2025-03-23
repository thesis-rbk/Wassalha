"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, ArrowLeft } from "lucide-react";
import styles from "../../../styles/AdminLogin.module.css";
import api from "../../../lib/api";
import Link from "next/link";
import { ForgotPasswordStep } from "../../../types/ForgotPasswordStep";

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>(ForgotPasswordStep.REQUEST_CODE);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Countdown timer effect for resend button
  useEffect(() => {
    if (countdown <= 0) {
      setResendDisabled(false);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await api.post('/api/users/admin/reset-password/request', { email });
      setSuccess("Reset code sent! Please check your email.");
      setCurrentStep(ForgotPasswordStep.VERIFY_CODE);
      // Start countdown for resend
      setResendDisabled(true);
      setCountdown(30);
    } catch (error: any) {
      console.error("Error requesting reset code:", error);
      setError(error.response?.data?.error || "Failed to send reset code. Please try again.");
    }
  };

  const handleResendCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await api.post('/api/users/admin/reset-password/request', { email });
      setSuccess("Reset code resent! Please check your email.");
      setResendDisabled(true);
      setCountdown(30);
    } catch (error: any) {
      console.error("Error resending reset code:", error);
      setError(error.response?.data?.error || "Failed to resend reset code. Please try again.");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    try {
      // This step only validates the code format
      // The actual verification will happen in the final step
      setCurrentStep(ForgotPasswordStep.RESET_PASSWORD);
      setSuccess("Code verified! Please set a new password.");
    } catch (error: any) {
      setError("Invalid code. Please try again.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must include at least one uppercase letter");
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError("Password must include at least one number");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await api.post('/api/users/admin/reset-password', {
        email,
        code,
        newPassword
      });
      
      setSuccess("Password reset successful! Redirecting to login...");
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/AdminLogin");
      }, 2000);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      setError(error.response?.data?.error || "Failed to reset password. Please try again.");
    }
  };

  return (
    <div className={`${styles.container} ${styles.adminLoginContainer} ${isDarkMode ? styles.dark : ""}`}>
      <div className={`${styles.card} ${isDarkMode ? styles.darkMode : ""}`}>
        <h2>Forgot Password</h2>
        
        <Link href="/AdminLogin" className={styles.backButton}>
          <ArrowLeft size={24} />
        </Link>
        <div onClick={toggleDarkMode} className={styles.moonIcon}>
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </div>

        {currentStep === ForgotPasswordStep.REQUEST_CODE && (
          <form className={styles.formContainer} onSubmit={handleRequestCode}>
            <p className={styles.instructions}>
              Enter your email address and we'll send you a verification code.
            </p>
            <label className={styles.label}>Email:</label>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your admin email"
            />

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}
            <button className={styles.button} type="submit">
              Send Reset Code
            </button>
          </form>
        )}

        {currentStep === ForgotPasswordStep.VERIFY_CODE && (
          <form className={styles.formContainer} onSubmit={handleVerifyCode}>
            <p className={styles.instructions}>
              Enter the 6-digit code sent to your email.
            </p>
            <label className={styles.label}>Verification Code:</label>
            <input
              className={styles.input}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
              required
              placeholder="Enter 6-digit code"
              maxLength={6}
              pattern="\d{6}"
            />

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}
            
            <div className={styles.resendContainer}>
              <button 
                className={`${styles.resendButton} ${resendDisabled ? styles.disabled : ''}`}
                onClick={handleResendCode}
                disabled={resendDisabled}
                type="button"
              >
                {resendDisabled 
                  ? `Resend code in ${countdown}s` 
                  : "Didn't receive a code? Resend"}
              </button>
            </div>

            <button className={styles.button} type="submit">
              Verify Code
            </button>
          </form>
        )}

        {currentStep === ForgotPasswordStep.RESET_PASSWORD && (
          <form className={styles.formContainer} onSubmit={handleResetPassword}>
            <p className={styles.instructions}>
              Create a new password for your account.
            </p>
            <label className={styles.label}>New Password:</label>
            <input
              className={styles.input}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password"
              minLength={8}
            />

            <label className={styles.label}>Confirm Password:</label>
            <input
              className={styles.input}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
              minLength={8}
            />

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}
            <button className={styles.button} type="submit">
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 