export default function ResetPasswordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="flex items-center justify-center gap-4 py-8 md:py-10">
            <div className="text-center">
                {children}
            </div>
        </section>
    );
}