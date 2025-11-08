import Footer from '@/components/layout/footer';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        
        {children}
      </main>
      
      <Footer />
    </div>
  );
}