"use client"; // This is a client component
import { useEffect } from "react";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import UserRoleChart from "../components/UserRoleChart";

export default function AdminDashboard() {
 

  return (
    <div>
      <Nav />
      <UserRoleChart />
      {/* ... other dashboard content ... */}
    </div>
  );
}
