"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import styles from "../styles/Nav.module.css";
import { 
  User, 
  Bell, 
  Home, 
  ShoppingCart, 
  List, 
  Moon, 
  Sun,
  Package,
  FileText,
  Tag,
  CreditCard,
  Truck,
  Users,
  Award,
  Bookmark,
  Store,
  LogOut
} from "lucide-react";

export default function Nav() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: number;
    name: string;
    role: string;
    profile?: {
      image?: {
        url: string;
      };
    };
  } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "null");
        console.log("Nav - Loaded user data:", userData); // Debug log
        if (!userData?.id) {
          console.error("Nav - No user ID in stored data"); // Debug log
        }
        setUser(userData);
      } catch (error) {
        console.error("Nav - Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const darkModePreference = localStorage.getItem("darkMode");
    const shouldBeDark = darkModePreference === "true";
    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userData");
    window.location.href = "/AdminLogin";
  };

  const handleProfileClick = () => {
    console.log("Profile click - Current user:", user); // Debug log
    try {
      if (user?.id) {
        console.log("Nav - Navigating to profile with ID:", user.id); // Debug log
        const profileUrl = `/Profile?id=${user.id}`;
        console.log("Nav - Profile URL:", profileUrl); // Debug log
        router.push(profileUrl);
        setIsDropdownOpen(false);
      } else {
        console.error("Nav - No user ID found in user data:", user);
        // Try to recover the ID from localStorage directly
        const storedData = localStorage.getItem("userData");
        console.log("Nav - Stored user data:", storedData); // Debug log
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData?.id) {
            console.log("Nav - Found ID in localStorage:", parsedData.id); // Debug log
            router.push(`/Profile?id=${parsedData.id}`);
            setIsDropdownOpen(false);
          }
        }
      }
    } catch (error) {
      console.error("Nav - Navigation error:", error);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    
    // Apply dark mode to root element for global styling
    if (newDarkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }

    // Dispatch a custom event for other components
    window.dispatchEvent(new Event('themeChange'));
  };

  return (
    <div className={`${styles.layout} ${isDarkMode ? styles.darkMode : ''}`}>
      {/* Sidebar with updated icons */}
      <div className={styles.sidebar}>
        <Link href="/AdminDashboard" className={styles.sidebarItem}>
          <Home size={20} /> Dashboard
        </Link>
        <Link href="/ListOfUsers" className={styles.sidebarItem}>
          <Users size={20} /> List of Users
        </Link>
        <Link href="/ListOfServiceProviders" className={styles.sidebarItem}>
          <Users size={20} /> List of Service Providers
        </Link>
        <Link href="/ListOfCategories" className={styles.sidebarItem}>
          <Tag size={20} /> List of Categories
        </Link>
        <Link href="/ListOfPayments" className={styles.sidebarItem}>
          <CreditCard size={20} /> List of Payments
        </Link>
        <Link href="/ListOfOrders" className={styles.sidebarItem}>
          <ShoppingCart size={20} /> List of Orders
        </Link>
        <Link href="/ListOfRequests" className={styles.sidebarItem}>
          <FileText size={20} /> List of Requests
        </Link>
        <Link href="/ListOfGoods" className={styles.sidebarItem}>
          <Package size={20} /> List of Goods
        </Link>
        <Link href="/ListOfGoodPosts" className={styles.sidebarItem}>
          <FileText size={20} /> List of Goods Posts
        </Link>
        <Link href="/ListOfPromoPosts" className={styles.sidebarItem}>
          <FileText size={20} /> List of PromoPosts
        </Link>
      
        <Link href="/ListOfPickups" className={styles.sidebarItem}>
          <Truck size={20} /> List of Pickups
        </Link>
       
        <Link href="/ListOfSponsorships" className={styles.sidebarItem}>
          <Award size={20} /> List of Sponsorships
        </Link>
        <Link href="/ListOfSubscriptions" className={styles.sidebarItem}>
          <Bookmark size={20} /> List of Subscriptions
        </Link>
      </div>

      {/* Top Navbar */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          {/* Admin Dashboard */}
          </div>
        <div className={styles.navItems}>
          <Bell className={`${styles.bellIcon} ${styles.icon}`} />
          <div 
            onClick={toggleDarkMode} 
            className={styles.themeToggle}
          >
            {isDarkMode ? 
              <Sun className={`${styles.sunIcon} ${styles.icon}`} /> : 
              <Moon className={`${styles.moonIcon} ${styles.icon}`} />
            }
          </div>
          <div
            className={styles.userContainer}
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            {user ? (
              <div className={styles.userProfile}>
                <img 
                  src={user.profile?.image?.url 
                    // ||  "/images/default-profile.png"
                  }
                  alt="User" 
                  className={styles.userImage}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // target.src = "/images/default-profile.png";
                  }}
                />
                <div className={styles.userInfo}>
                  <div>{user.name}</div>
                  <div className={styles.userRole}>{user.role}</div>
                </div>
                {isDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <div 
                      className={styles.dropdownItem} 
                      onClick={handleProfileClick}
                      style={{ cursor: 'pointer' }}
                    >
                      <User size={16} className={styles.dropdownIcon} />
                      Profile
                    </div>
                    <div 
                      className={styles.dropdownItem} 
                      onClick={handleLogout}
                      style={{ cursor: 'pointer' }}
                    >
                      <LogOut size={16} className={styles.dropdownIcon} />
                      Log Out
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.iconWrapper}>
                <User className={styles.userIcon} />
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
