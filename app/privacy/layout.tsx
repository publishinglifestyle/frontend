export default function PrivacyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="gap-4">
            <div>
                {children}
            </div>
        </section>
    );
}