import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartSync from "@/components/CartSync";
import MagicEffects from "@/components/MagicEffects";
import TransitionProvider from "@/components/TransitionProvider";
import FloatingWidgets from "@/components/FloatingWidgets";
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <MagicEffects />
      <CartSync />
      <Navbar />
      <main className="flex-1 flex flex-col w-full">
        <TransitionProvider>
          {children}
        </TransitionProvider>
      </main>
      <Footer />
      <FloatingWidgets />
    </div>
  );
}
