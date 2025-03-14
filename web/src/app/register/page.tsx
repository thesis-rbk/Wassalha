"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "../page.module.css"; // Create this CSS module
import { BaseButton } from "@/components/ui/buttons/BaseButton";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const checkPasswordStrength = (pwd: string) => {
    if (pwd.length < 6) {
      return "weak";
    }
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    const strengthScore = [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChars,
    ].filter(Boolean).length;

    if (pwd.length >= 12 && strengthScore >= 3) {
      return "strong";
    } else if (pwd.length >= 8 && strengthScore >= 2) {
      return "normal";
    } else {
      return "weak";
    }
  };

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setErrors(prev => ({ ...prev, name: "Name is required", email: "Email is required", password: "Password is required", confirmPassword: "Confirm Password is required" }));
      return false;
    }
    if (!name.trim()) {
      setErrors(prev => ({ ...prev, name: "Name cannot be empty" }));
      return false;
    }
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      return false;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      return false;
    }
    if (password.length < 8) {
      setErrors(prev => ({ ...prev, password: "Password must be at least 8 characters" }));
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setErrors(prev => ({ ...prev, password: "Password must contain at least one uppercase letter" }));
      return false;
    }
    if (!/\d/.test(password)) {
      setErrors(prev => ({ ...prev, password: "Password must contain at least one number" }));
      return false;
    }
    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        const errorData = await response.json();
        setErrors(prev => ({ ...prev, email: errorData.message }));
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors(prev => ({ ...prev, email: "Registration failed" }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <Image
          src="/images/11.jpeg"
          alt="Logo"
          width={150}
          height={150}
          className={styles.logo}
        />

        <h1 className={styles.title}>Join Us!</h1>
        <p className={styles.subtitle}>Sign up to get started</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? styles.errorInput : ""}
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? styles.errorInput : ""}
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordStrength(checkPasswordStrength(e.target.value));
              }}
              className={errors.password ? styles.errorInput : ""}
            />
            {errors.password && <span className={styles.error}>{errors.password}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={errors.confirmPassword ? styles.errorInput : ""}
            />
            {errors.confirmPassword && (
              <span className={styles.error}>{errors.confirmPassword}</span>
            )}
          </div>

          <BaseButton
            variant="primary"
            size="login"
            type="submit"
            className={styles.signupButton}
          >
            Sign Up
          </BaseButton>
        </form>

        <p className={styles.loginText}>
          Already have an account?{" "}
          <Link href="/login" className={styles.loginLink}>
            Log In
          </Link>
        </p>
      </div>

      {showSuccess && (
        <div className={styles.successModal}>
          <div className={styles.modalContent}>
            <h2>Success!</h2>
            <p>Registration successful. Redirecting to login...</p>
          </div>
        </div>
      )}
    </div>
  );
}
