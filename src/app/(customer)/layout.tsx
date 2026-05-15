import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartSync from "@/components/CartSync";
import MagicEffects from "@/components/MagicEffects";
import GlobalPopup from "@/components/GlobalPopup";

export const dynamic = "force-dynamic";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MagicEffects />
      <CartSync />
      <GlobalPopup />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
