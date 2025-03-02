import Image from "next/image";
import Nav from "../components/Nav"; // Import the Nav component
import Footer from "../components/Footer"; // Import the Footer component

export default function Home() {
  return (
    <div>
      <Nav /> {/* Call the Nav component here */}
      <main>
        {/* Main content goes here */}
      </main>
      <Footer /> {/* Call the Footer component here */}
    </div>
  );
}