import React from 'react';
import { Link } from 'react-router-dom';
import styles from './style/Nav.modle.css'; // Create a CSS module for styles

const Nav = () => {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>Wassalha</div>
      <ul className={styles.navItems}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/order">Order</Link></li>
        <li><Link to="/travel">Travel</Link></li>
        <li><Link to="/pickup">Pick Up</Link></li>
        <li><Link to="/subscription">Subscription</Link></li>
      </ul>
      <button className={styles.authButton}>Sign In</button>
    </nav>
  );
};

export default Nav; 