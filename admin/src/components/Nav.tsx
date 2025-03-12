"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "null");
        if (!userData?.id) {
          console.error("Nav - No user ID in stored data");
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
    try {
      if (user?.id) {
        const profileUrl = `/Profile?id=${user.id}`;
        router.push(profileUrl);
        setIsDropdownOpen(false);
      } else {
        console.error("Nav - No user ID found in user data:", user);
        const storedData = localStorage.getItem("userData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData?.id) {
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
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }

    window.dispatchEvent(new Event('themeChange'));
  };

  const handleSidebarHover = (isEntering: boolean) => {
    if (isEntering) {
      setIsHovered(true);
      setIsCollapsed(false);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
        setIsCollapsed(true);
      }, 300);
    }
  };

  useEffect(() => {
    // Set initial collapsed state
    setIsCollapsed(true);
    
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`${styles.layout} ${isDarkMode ? styles.darkMode : ''}`}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          Admin Dashboard 
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
                  src={user.profile?.image?.url }
                  alt="Admin" 
                  className={styles.userImage}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/default-admin-image.png';
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

      <div 
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isHovered ? styles.hovered : ''}`}
        onMouseEnter={() => handleSidebarHover(true)}
        onMouseLeave={() => handleSidebarHover(false)}
      >
        <Link href="/AdminDashboard" className={styles.sidebarItem}>
          <Home size={20} />
          <span className={styles.itemText}>Dashboard</span>
        </Link>
        <Link href="/ListOfUsers" className={styles.sidebarItem}>
          <Users size={20} />
          <span className={styles.itemText}>List of Users</span>
        </Link>
        <Link href="/ListOfServiceProviders" className={styles.sidebarItem}>
          <Users size={20} />
          <span className={styles.itemText}>List of Service Providers</span>
        </Link>
        <Link href="/ListOfCategories" className={styles.sidebarItem}>
          <Tag size={20} />
          <span className={styles.itemText}>List of Categories</span>
        </Link>
        <Link href="/ListOfPayments" className={styles.sidebarItem}>
          <CreditCard size={20} />
          <span className={styles.itemText}>List of Payments</span>
        </Link>
        <Link href="/ListOfOrders" className={styles.sidebarItem}>
          <ShoppingCart size={20} />
          <span className={styles.itemText}>List of Orders</span>
        </Link>
        <Link href="/ListOfRequests" className={styles.sidebarItem}>
          <FileText size={20} />
          <span className={styles.itemText}>List of Requests</span>
        </Link>
        <Link href="/ListOfGoods" className={styles.sidebarItem}>
          <Package size={20} />
          <span className={styles.itemText}>List of Goods</span>
        </Link>
        <Link href="/ListOfGoodPosts" className={styles.sidebarItem}>
          <FileText size={20} />
          <span className={styles.itemText}>List of Goods Posts</span>
        </Link>
        <Link href="/ListOfPromoPosts" className={styles.sidebarItem}>
          <FileText size={20} />
          <span className={styles.itemText}>List of PromoPosts</span>
        </Link>
        <Link href="/ListOfPickups" className={styles.sidebarItem}>
          <Truck size={20} />
          <span className={styles.itemText}>List of Pickups</span>
        </Link>
        <Link href="/ListOfSponsorships" className={styles.sidebarItem}>
          <Award size={20} />
          <span className={styles.itemText}>List of Sponsorships</span>
        </Link>
        <Link href="/ListOfSubscriptions" className={styles.sidebarItem}>
          <Bookmark size={20} />
          <span className={styles.itemText}>List of Subscriptions</span>
        </Link>
      </div>

      <div className={`${styles.mainContent} ${(!isCollapsed || isHovered) ? styles.mainContentExpanded : ''}`}>
        {/* Your main content goes here */}
      </div>
    </div>
  );
}
