import Link from "next/link";
import styles from "../styles/Nav.module.css"; // Import the updated CSS module

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>Wasslha</Link>
      <div className={styles.navItems}>
        <Link href="/">Home</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/travel">Travel</Link>
        <Link href="/pickup">Pickup</Link>
      </div>
      <div className={styles.auth}>
        <Link href="/login">Login / </Link>
        <Link href="/register">Register</Link>
      </div>
    </nav>
  );
} 