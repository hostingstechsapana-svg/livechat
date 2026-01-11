import Navbar from "@/components/navbar";
import ProductDetails from "@/components/product-details";
import Footer from "@/components/footer";

type ProductDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { id } = await params;
  return (
    <main className="min-h-screen">
      <Navbar />
      <ProductDetails cameraId={id} />
      <Footer />
    </main>
  );
}

