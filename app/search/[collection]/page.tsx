import { getProductsByCollection } from "@/actions/api/get-collection-products";
import ProductGrid from "@/components/grid/product-grid";
import { getCollection } from "@/lib/neondb";
import { defaultSort, sorting } from "lib/constants";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const collection = await getCollection(params.collection);

  if (!collection) return notFound();

  return {
    title: collection.seo?.title || collection.title,
    description:
      collection.seo?.description ||
      collection.description ||
      `${collection.title} products`,
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { collection } = params;
  const { sort, page: pageParam } = (searchParams as { [key: string]: string }) || {};

  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;

  
  const collectionData = await getCollection(collection);
  if (!collectionData) return notFound();

 
  const { items, totalPages } = await getProductsByCollection({
    collectionHandle: collection,
    page,
    sortKey,
    reverse,
  });

  return (
    <section>
      {items.length === 0 ? (
        <p className="py-3 text-lg">{`No products found in this collection`}</p>
      ) : (
        <div>
          <ProductGrid items={items} currentPage={page} totalPages={totalPages} />
        </div>
      )}
    </section>
  );
}
