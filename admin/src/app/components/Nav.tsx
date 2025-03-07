"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "../styles/Nav.module.css";
import { User, Bell, Home, ShoppingCart, List, Moon, Sun } from "lucide-react";

export default function Nav() {
  const [user, setUser] = useState<{ name: string; role: string; image: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      const userData = JSON.parse(localStorage.getItem("userData") || "null");
      setUser(userData);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userData");
    window.location.href = "/AdminLogin";
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("isDarkMode", JSON.stringify(!isDarkMode));
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <Link href="/AdminDashboard" className={styles.sidebarItem}>
          <Home size={20} /> Dashboard
        </Link>
        <Link href="/ListOfUsers" className={styles.sidebarItem}>
          <User size={20} /> List of Users
        </Link>
        <Link href="/ListOfOrders" className={styles.sidebarItem}>
          <ShoppingCart size={20} /> List of Orders
        </Link>
        <Link href="/ListOfRequests" className={styles.sidebarItem}>
          <List size={20} /> List of Requests
        </Link>
        <Link href="/ListOfGoods" className={styles.sidebarItem}>
          <List size={20} /> List of Goods
        </Link>
        <Link href="/ListOfGoodPosts" className={styles.sidebarItem}>
          <List size={20} /> List of Goods Posts
        </Link>
        <Link href="/ListOfPromoPosts" className={styles.sidebarItem}>
          <List size={20} /> List of PromoPosts
        </Link>
        <Link href="/ListOfCategories" className={styles.sidebarItem}>
          <List size={20} /> List of Categories
        </Link>
        <Link href="/ListOfPayments" className={styles.sidebarItem}>
          <List size={20} /> List of Payments
        </Link>
        <Link href="/ListOfPickups" className={styles.sidebarItem}>
          <List size={20} /> List of Pickups
        </Link>
        <Link href="/ListOfServiceProviders" className={styles.sidebarItem}>
          <List size={20} /> List of Service Providers
        </Link>
        <Link href="/ListOfSponsorships" className={styles.sidebarItem}>
          <List size={20} /> List of Sponsorships
        </Link>
        <Link href="/ListOfSubscriptions" className={styles.sidebarItem}>
          <List size={20} /> List of Subscriptions
        </Link>






      </div>

      {/* Top Navbar */}
      <nav className={styles.nav}>
        <div className={styles.logo}>Admin Dashboard</div>
        <div className={styles.navItems}>
          <Bell className={`${styles.bellIcon} ${styles.icon}`} />
          <div onClick={toggleDarkMode} style={{ cursor: 'pointer' }}>
            {isDarkMode ? <Sun className={`${styles.sunIcon} ${styles.icon}`} /> : <Moon className={`${styles.moonIcon} ${styles.icon}`} />}
          </div>
          <div
            className={styles.userContainer}
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            {user ? (
              <div className={styles.userProfile}>
                <img src={user.image} alt="User" className={styles.userImage} />
                <div className={styles.userInfo}>
                  <div>{user.name}</div>
                  <div className={styles.userRole}>{user.role}</div>
                </div>
                {isDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <Link href="/Profile" className={styles.dropdownItem}>
                      Profile
                    </Link>
                    <div className={styles.dropdownItem} onClick={handleLogout}>
                      Log Out
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.iconWrapper}>
                <User className={styles.userIcon} />
                {isDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <Link href="/profile" className={styles.dropdownItem}>
                      Profile
                    </Link>
                    <div className={styles.dropdownItem} onClick={handleLogout}>
                      Log Out
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
