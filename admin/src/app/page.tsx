"use client"; // ✅ Ensure it's a client component
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ Use next/navigation in App Router

export default function Home() {
  const router = useRouter(); 

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/AdminLogin'); // Redirect to login if not authenticated
    } else {
      router.push('/AdminDashboard'); // Redirect to dashboard if authenticated
    }
  }, [router]);

  return null; // No content needed
}
