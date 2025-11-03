import { getProducts } from "@/actions/api/products";
import { Carousel } from "@/components/carousel";
import ProductGrid from "@/components/grid/product-grid";
import { ThreeItemGrid } from "@/components/grid/three-items";
import PromotionSection from "@/components/PromotionSection"
import Footer from "@/components/layout/footer";

export const metadata = {
  description: "E-Commerce",
  openGraph: { type: "website" },
};


export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const pageParam = Array.isArray(params?.page) ? params?.page[0] : params?.page;
  const page = Number(pageParam || 1);

  const perPage = 12;
  const { items, totalPages } = await getProducts({ page, perPage });

  return (
    <>
    <PromotionSection />
      <ThreeItemGrid />
      <ProductGrid items={items} currentPage={page} totalPages={totalPages} />
      <Carousel />
      <Footer />
    </>
  );
}
