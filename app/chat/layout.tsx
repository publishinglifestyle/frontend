export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="gap-4">
      <div>{children}</div>
    </section>
  );
}
