"use client"; // Ensure this is a client component
import Nav from "./components/Nav"; // Adjust the import path as necessary
import UserRoleChart from "./components/UserRoleChart"; // Adjust the import path as necessary

export default function Home() {
  return (
    <div>
      <h2>Welcome to the Admin Dashboard</h2>
      <Nav />
      <UserRoleChart />
      {/* You can add any additional dashboard content here */}
    </div>
  );
}
