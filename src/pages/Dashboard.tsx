import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Dashboard = () => (
  <div className="bg-background min-h-screen">
    <Navbar />
    <div className="max-w-[1240px] mx-auto px-14 py-16 text-center">
      <h1 className="font-display text-4xl font-black text-foreground mb-4">Dashboard</h1>
      <p className="text-slate">Coming soon — interactive charts, map view, and scenario planning.</p>
    </div>
    <Footer />
  </div>
);

export default Dashboard;
