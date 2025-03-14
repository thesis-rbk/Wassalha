import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

import styles from "../styles/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
       
        {/* Center Section - Navigation */}
        <div className={styles.linksContainer}>
        <div className={styles.linkList}>
        <div className={styles.logoSection}>
          <h2 className={styles.logo}>Wasslha</h2>
        
        </div>
            
          </div>



          {/* Navigation Links */}
          <div className={styles.linkList}>
            <h3>pages</h3>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/orders">orders</Link>
              </li>
              <li>
                <Link href="/travel">travel</Link>
              </li>
              <li>
                <Link href="/pickup">pickup</Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Policies */}
          <div className={styles.linkList}>
            <h3>links</h3>
            <ul>
              <li>
                <Link href="">Privacy Policy</Link>
              </li>
              <li>
                <Link href="">Terms of Service</Link>
              </li>
              <li>
                <Link href="">Cookie Policy</Link>
              </li>
        
            </ul>
          </div>
          <div className={styles.linkList}>
            <h3>links</h3>
            <ul>
               <li>
                <Link href="/faq">FAQ</Link>
              </li>
              <li>
                <Link href="/support">Support</Link>
              </li>
              <li>
                <Link href="/guide">how to use Wasslha</Link>
              </li>
            </ul>
          </div>
          {/* Other Useful Links */}
          <div className={styles.linkList}>
            <h3>More</h3>
            <a href="#" className={styles.button}>Get it on the App Store</a>
            <a href="#" className={styles.button}>Get it on Google Play</a>
            <select className={styles.language}>
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>
      </div>

      {/* Social Media Icons Centered at the Bottom */}
      <div className={styles.socialContainer}>
        <Link href="#">
          <Facebook className={styles.icon} />
        </Link>
        <Link href="#">
          <Twitter className={styles.icon} />
        </Link>
        <Link href="#">
          <Instagram className={styles.icon} />
        </Link>
       
      </div>

      {/* Divider Line and Copyright */}
      <hr className={styles.divider} />
      <p className={styles.copyright}>© 2025 Wasslha. All rights reserved.</p>
    </footer>
  );
}