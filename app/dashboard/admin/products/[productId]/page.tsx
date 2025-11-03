import { currentUser, currentRole } from "@/lib/auth";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { ProductForm } from "./components/product-form";

export const metadata: Metadata = {
  title: "Edit Product",
};

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductPage({ params }: PageProps){
    const user = await currentUser();
    const role = await currentRole();
  
    
    if (!user) {
      redirect("dashboard/login"); 
    }
  
    
    if (role !== "ADMIN") {
      redirect("/unauthorized"); 
    }
  
  const { productId } = await params;
  
  const products = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
      variants: true,
      featuredImage: true,
      seo: true,
      CollectionProduct: {
      include: {
        collection: true,
      },
    },
    },
  });

  const collections = await prisma.collection.findMany({
    orderBy: { createdAt: "desc" },
  });
  
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm collections={collections} initialData={products} />
      </div>
    </div>
  );
}
