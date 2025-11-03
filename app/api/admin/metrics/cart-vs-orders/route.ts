import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Group carts by year
    const carts = await prisma.cart.findMany({
      select: { createdAt: true },
    });

    const orders = await prisma.order.findMany({
      select: { createdAt: true },
    });

    
    const getYear = (date: Date) => new Date(date).getFullYear();

    
    const yearsSet = new Set([
      ...carts.map((c) => getYear(c.createdAt)),
      ...orders.map((o) => getYear(o.createdAt)),
    ]);
    const years = Array.from(yearsSet).sort((a, b) => a - b);

    
    const chartData = years.map((year) => {
      const cartCount = carts.filter((c) => getYear(c.createdAt) === year).length;
      const orderCount = orders.filter((o) => getYear(o.createdAt) === year).length;

      

      return {
        year,
        carts: cartCount,
        orders: orderCount,
      };
    });

    return NextResponse.json(chartData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load yearly metrics" }, { status: 500 });
  }
}
