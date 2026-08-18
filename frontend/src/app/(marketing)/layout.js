import MarketingNavbar from "@/components/MarketingNavbar";

export default function MarketingLayout({
  children,
}) {
  return (
    <>
      <MarketingNavbar />

      {children}
    </>
  );
}