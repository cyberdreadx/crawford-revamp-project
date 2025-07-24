import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Properties from "@/components/Properties";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  // Handle hash scrolling when page loads
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Wait a bit for the page to fully render
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Navigation />
      <main className="w-full">
        <Hero />
        <About />
        <Properties />
        <Services />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
