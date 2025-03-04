"use client"
import Link from "next/link";
import { useState, useEffect } from "react"; // Import useEffect for managing timeout
import styles from "../styles/Nav.module.css"; // Import the updated CSS module
import { User, Bell, Home, ShoppingCart, List } from 'lucide-react'; // Import icons from Lucide

export default function Nav() {
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown visibility
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null); // State for timeout

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (dropdownOpen) {
      // If closing, clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    }
  };

  const handleMouseEnter = () => {
    setDropdownOpen(true);
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  const handleMouseLeave = () => {
    // Set a timeout to close the dropdown after 1 second
    const id = setTimeout(() => {
      setDropdownOpen(false);
    }, 1000);
    setTimeoutId(id);
  };

  return (
    <div style={{ display: 'flex' }}>
      <div className={styles.sidebar}>
        <Link href="/dashboard" className={styles.sidebarItem}>
          <Home size={20} /> Dashboard
        </Link>
        <Link href="/user" className={styles.sidebarItem}>
          <User size={20} /> List of Users
        </Link>
        <Link href="/orders" className={styles.sidebarItem}>
          <ShoppingCart size={20} /> List of Orders
        </Link>
        <Link href="/requests" className={styles.sidebarItem}>
          <List size={20} /> List of Requests
        </Link>
        <Link href="/" className={styles.sidebarItem}>
          <List size={20} /> List of goods
        </Link>
        <Link href="/" className={styles.sidebarItem}>
          <List size={20} /> List of goods posts
        </Link>
        <Link href="/" className={styles.sidebarItem}>
          <List size={20} /> List of PromoPosts
        </Link>
        <Link href="/" className={styles.sidebarItem}>
          <List size={20} /> List of Categories
        </Link>
      
      </div>
      <nav className={styles.nav}>
        <div className={styles.logo}>Admin Dashboard</div>
        <div className={styles.navItems}>
          <Bell className={styles.bellIcon} />
          <div className={styles.dropdown} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <User className={styles.userIcon} />
            <div className={`${styles.dropdownMenu} ${dropdownOpen ? styles.visible : ''}`}>
              <Link href="/login" className={styles.dropdownItem}>Log In</Link>
              {/* <Link href="/change-password" className={styles.dropdownItem}>Change Password</Link> */}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
} 