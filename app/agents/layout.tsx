"use client";

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="fixed inset-0 top-16 z-40 overflow-auto">
      {children}
    </section>
  );
}
