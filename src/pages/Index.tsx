import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CitiesStrip from "@/components/CitiesStrip";
import Features from "@/components/Features";

const Index = () => (
  <div className="bg-background min-h-screen">
    <Navbar />
    <Hero />
    <CitiesStrip />
    <Features />
  </div>
);

export default Index;
