import '../styles/globals.css'; // ✅ Tailwind styles

export const metadata = {
  title: "Aim Trainer",
  description: "Train your aim across multiple modes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
