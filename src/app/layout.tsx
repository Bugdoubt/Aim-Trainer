export const metadata = {
  title: "Aim Trainer",
  description: "Train your aim in multiple modes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
