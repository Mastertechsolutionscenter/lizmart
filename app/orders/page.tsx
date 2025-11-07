
import OrdersClient, { Order } from "@/components/OrdersClient";
import { getOrdersByUser } from "@/actions/api/orders";

interface Props {
  searchParams?: { userId?: string };
}

export default async function OrdersPage({ searchParams }: Props) {
  const userId = searchParams?.userId;

  // fetch orders directly server-side
  const ordersData = await getOrdersByUser(userId);

  // map to client-friendly structure
  const orders: Order[] = ordersData.map((o) => ({
    id: o.id,
    createdAt: o.createdAt,
    totalAmount: o.totalAmount,
    status: String(o.status).toUpperCase() === "DELIVERED" ? "past" : "active",
    items: (o.items || []).map((it) => ({
      productTitle: it.productTitle ?? "Product",
      variantTitle: it.variantTitle ?? "",
      quantity: it.quantity,
      lineTotalAmount: it.lineTotalAmount,
      image: it.image ?? "/1.webp",
    })),
  }));

  return <OrdersClient orders={orders} />;
}
