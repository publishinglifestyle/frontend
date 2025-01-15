import React from 'react';
import { Card, CardBody } from "@nextui-org/card";

export default function TermsPage() {
    return (
        <div className="p-6 font-sans leading-relaxed">
            <Card className="shadow-lg rounded-lg">
                <CardBody className='p-8'>
                    <h1 className="text-3xl font-bold mb-6">Terms and Conditions of Use</h1>
                    <p className="mb-6">
                        Last updated: <strong>16/08/2024</strong>
                    </p>

                    <p className="mb-6">
                        Welcome to LowContent.ai. By using our website and services, you agree to comply with the following
                        terms and conditions. We encourage you to read these terms carefully before using our site.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                    <p className="mb-6">
                        By using the LowContent.ai website, you agree to be bound by these terms and conditions. If you do not agree
                        with these terms, please do not use our site.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">2. Changes to Terms</h2>
                    <p className="mb-6">
                        We reserve the right to modify these terms and conditions at any time. Changes will be posted
                        on this page, and continued use of the site after such changes will constitute acceptance of the same.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">3. Use of the Site</h2>
                    <p className="mb-6">
                        You agree to use the site legally and in compliance with applicable laws. It is prohibited to use the site for
                        illegal or unauthorized purposes.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
                    <p className="mb-6">
                        All content on LowContent.ai, including text, graphics, logos, images, and software, is owned by
                        LowContent.ai or its licensors and is protected by copyright and intellectual property laws.
                    </p>
                    <p className="mb-6">
                        By using our paid service, users acquire full ownership of the generated content, including text and images.
                        Users have the exclusive right to use, modify, and distribute such content without restrictions. Your ownership
                        of the assets you created persists even if in subsequent months you downgrade or cancel your membership.
                    </p>
                    <p className="mb-6">
                        LowContent.ai does not claim any rights to content created by users through the paid service during the
                        subscription period. We reserve the right to use the generated content for promotional or service improvement
                        purposes, with the user's authorization.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">5. Costs for Generating Content</h2>
                    <p className="mb-6">
                        Generating images and text on LowContent.ai incurs the following costs:
                        - Each image costs 100,000 tokens.
                        - Each word of generated text costs approximately 1.33 tokens.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
                    <p className="mb-6">
                        LowContent.ai will not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from the use or
                        inability to use the site or its services.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">7. Privacy</h2>
                    <p className="mb-6">
                        Your privacy is important to us. We invite you to read our <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Privacy Policy</a> to understand how we collect, use, and protect your personal information.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
                    <p className="mb-6">
                        These terms are governed by the laws of the Italian State. Any disputes arising from or
                        related to these terms will be subject to the exclusive jurisdiction of the courts of Milan.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
                    <p className="mb-6">
                        For questions regarding these terms and conditions, please contact us at the email address:
                        <a href="mailto:support@lowcontent.ai" className="text-blue-500 underline"> support@lowcontent.ai</a>.
                    </p>

                    <h3 className="text-xl font-bold mb-4">Important</h3>
                    <p>
                        We remind you to periodically review these terms and conditions. Continuing to use our site implies acceptance
                        of any updates or changes. For any doubts, contact us through the provided channels.
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}
