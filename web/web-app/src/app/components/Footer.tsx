import React from 'react';
import styles from './style/Footer.module.css'; // Create a CSS module for styles

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div>© Grab Inc.</div>
      <div className={styles.socialLinks}>
        {/* Add social media icons here */}
      </div>
    </footer>
  );
};

export default Footer; 