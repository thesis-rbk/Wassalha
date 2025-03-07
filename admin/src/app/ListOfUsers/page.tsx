"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router
import styles from '../styles/ListOfUsers.module.css'; // Import the CSS module
import navStyles from '../styles/Nav.module.css'; // Import Nav styles
import Nav from "../components/Nav";
interface User {
  id: number;
  name: string;
  email: string;
  password: string; // Displaying password (consider security implications)
  phoneNumber?: string;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
    image?: {url:string}; 
    country?: string;
    gender?: string;
   
    // Assuming you have an image field in the profile
  };
}

export default function ListOfUsers() {
  const router = useRouter(); // Initialize useRouter
  const [users, setUsers] = useState<User[]>([]); // State to hold user data
  const [error, setError] = useState<string | null>(null); // State to hold error messages

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users"); // Ensure this endpoint is correct
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched users:", data); // Log the fetched data
        setUsers(data.data); // Assuming the response structure is { data: users }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users. Please try again later.");
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (userId: number) => {
    // Implement edit functionality here
    console.log(`Edit user with ID: ${userId}`);
  };

  const handleBan = (userId: number) => {
    // Implement ban functionality here
    console.log(`Ban user with ID: ${userId}`);
  };

  const handleViewProfile = (userId: number) => {
    try {
      router.push(`/Profile?id=${userId}`);
    } catch (error) {
      console.error("Navigation error:", error);
      setError("Failed to navigate to profile page.");
    }
  };

  return (
    <div className={navStyles.layout}>
      <Nav />
      <div className={navStyles.mainContent}>
        <div className={styles.container}>
          <h1 className={styles.title}>List of Users</h1>
          {error && <p className={styles.error}>{error}</p>} {/* Display error message if any */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>ID</th>
                  <th className={styles.th}>Image</th>
                  <th className={styles.th}>User Name</th>
                  <th className={styles.th}>First Name</th>
                  <th className={styles.th}>Last Name</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Phone Number</th>
                  {/* <th className={styles.th}>Role</th> */}
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className={styles.tr}>
                      <td className={styles.td}>{user.id}</td>
                      <td className={styles.td}>
                        <img
                          src={user.profile?.image?.url || "/default-profile.png"} // Use a default image if none exists
                          alt="User"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                          }}
                        />
                      </td>
                      <td className={styles.td}>{user.name}</td>
                      <td className={styles.td}>{user.profile?.firstName || "N/A"}</td>
                      <td className={styles.td}>{user.profile?.lastName || "N/A"}</td>
                      <td className={styles.td}>{user.email}</td>
                      <td className={styles.td}>{user.phoneNumber || "N/A"}</td>
                      {/* <td className={styles.td}>{user.role}</td> */}
                      <td className={styles.td}>
                        <button className={`${styles.button} ${styles.button_view}`} onClick={() => handleViewProfile(user.id)}>View Profile</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 