"use client"; // ✅ Ensure it's a client component
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ Use next/navigation in App Router
import Nav from "../components/Nav";
import UserRoleChart from "../components/UserRoleChart";

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/AdminLogin'); // Redirect to login if not authenticated
    }
  }, [router]);

  return (
    <div>
      <Nav />
      <UserRoleChart />
      {/* ... other dashboard content ... */}
    </div>
  );
}
