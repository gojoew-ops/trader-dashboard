export const metadata = {
  title: "Neo’s Short-Term Trader Dashboard",
  description: "Watchlist • Live Chart • Signals • Risk"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        {children}
      </body>
    </html>
  );
}