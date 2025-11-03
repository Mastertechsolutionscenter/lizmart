import prisma from "@/lib/prisma";
import { CollectionForm } from "./components/collection-form";


interface PageProps {
  params: Promise<{ collectionId: string }>;
}


export default async function CollectionPage({ params }: PageProps) {
 
   const { collectionId } = await params; 
 //
  const collection = await prisma.collection.findUnique({
  where: { id: collectionId },
  include: {
    products: {
      include: {
        product: {
          select: { title: true, id: true },
        },
      },
    },
  },
});


  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CollectionForm initialData={collection} />
      </div>
    </div>
  );
}
