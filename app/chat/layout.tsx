export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="fixed inset-0 top-16 z-40 bg-black overflow-hidden">
      {children}
    </section>
  );
}
