import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import ProductPageContent from "@/components/ProductPageContent";

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  return <ProductPageContent product={product} />;
}
