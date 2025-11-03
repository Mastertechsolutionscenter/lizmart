import CartClient from "./CartClient";
import { getCart } from "@/lib/neondb";
import type { Cart } from "@/lib/neondb/types";

export default async function CartPage() {
  const cart: Cart | undefined = await getCart();

  return (
    <div className="min-h-screen">
      <CartClient cart={cart} />
    </div>
  );
}
