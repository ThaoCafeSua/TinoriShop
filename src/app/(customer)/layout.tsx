import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartSync from "@/components/CartSync";
import MagicEffects from "@/components/MagicEffects";
import HeartLoader from "@/components/HeartLoader";


export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeartLoader />
      <MagicEffects />
      <CartSync />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
