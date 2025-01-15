export default function AgentsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="gap-4 py-8 md:py-10">
            <div>
                {children}
            </div>
        </section>
    );
}