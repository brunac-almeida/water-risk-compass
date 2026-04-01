import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CitiesStrip from "@/components/CitiesStrip";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="bg-background min-h-screen">
    <Navbar />
    <Hero />
    <CitiesStrip />
    <Features />
    <Footer />
  </div>
);

export default Index;
