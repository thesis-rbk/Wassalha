import Nav from "../components/Nav";

export default function AdminDashboard() {
  const isLoggedIn = true; // Replace with actual login state
  const adminName = "Admin"; // Replace with actual admin name

  return (
    <div>
      <Nav />
      {/* ... other dashboard content ... */}
    </div>
  );
}
