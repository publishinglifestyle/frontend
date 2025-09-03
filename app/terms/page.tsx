import React from 'react';
import { Card, CardBody } from "@heroui/card";

export default function TermsPage() {
    return (
        <div className="p-6 font-sans leading-relaxed">
            <Card className="shadow-lg rounded-lg">
                <CardBody className='p-8'>
                    <h1 className="text-3xl font-bold mb-6">Terms and Conditions of Use</h1>
                    <p className="mb-6">
                        Last updated: <strong>01/09/2025</strong>
                    </p>

                    <p className="mb-6">
                        Welcome to LowContent.ai. By using our website and services, you agree to comply with the following
                        terms and conditions. Please read them carefully before using the platform.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                    <p className="mb-6">
                        By accessing LowContent.ai or subscribing to any of our services, you agree to be bound by these terms
                        and conditions. If you do not agree, please do not use the site.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">2. Changes to Terms</h2>
                    <p className="mb-6">
                        We reserve the right to modify these terms at any time. Changes will be published on this page, and
                        continued use of the site after such updates will constitute implicit acceptance.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">3. Subscriptions and Automatic Renewal</h2>
                    <p className="mb-6">
                        By subscribing to a paid plan, you agree that the subscription will automatically renew at the end of
                        each billing cycle (monthly or yearly, depending on the plan). The amount will be charged automatically
                        to the payment method on file unless you cancel the subscription before the renewal date through your
                        personal account area.
                    </p>
                    <p className="mb-6">
                        We reserve the right to adjust subscription prices. In case of changes, users will be notified by email
                        at least 7 days in advance of the renewal.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">4. Right of Withdrawal (EU Consumers Only)</h2>
                    <p className="mb-6">
                        In accordance with European regulations, consumers residing in the EU have the right to withdraw from
                        the purchase within 14 days from the subscription or automatic renewal date, provided that:
                    </p>
                    <ul className="list-disc ml-8 mb-6">
                        <li>the service has not been used (e.g., content generation after renewal);</li>
                        <li>the user has not explicitly waived the right of withdrawal during the purchase process.</li>
                    </ul>
                    <p className="mb-6">
                        To exercise the right of withdrawal, you must contact <a href="mailto:support@lowcontent.ai" className="text-blue-500 underline">support@lowcontent.ai</a> within
                        the allowed period. If accepted, the amount will be refunded to the original payment method.
                    </p>
                    <p className="mb-6 font-semibold">
                        ⚠️ Please note: Once the subscription has been renewed and the service activated, no refunds will be
                        issued, even in case of non-use.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">5. Use of the Site</h2>
                    <p className="mb-6">
                        Users agree to use the site lawfully and in compliance with applicable regulations. Any misuse, illegal
                        or unauthorized activity may result in account suspension or termination.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property and Content Ownership</h2>
                    <p className="mb-6">
                        All content on LowContent.ai (text, images, logos, graphics, software) is the property of LowContent.ai
                        or its licensors and is protected by copyright laws.
                    </p>
                    <p className="mb-6">
                        With a paid subscription, users acquire full ownership of generated content, including text and images.
                        Users have the exclusive right to use, modify, and distribute such content even after cancellation or
                        downgrade of the subscription.
                    </p>
                    <p className="mb-6">
                        LowContent.ai does not claim any rights over content generated by the user during the subscription period
                        but reserves the right to use it for promotional or service improvement purposes with the user's prior consent.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">7. Content Generation and Tokens</h2>
                    <p className="mb-6">
                        Content generation (text and images) is based on a token system:
                    </p>
                    <ul className="list-disc ml-8 mb-4">
                        <li>Each image costs 200,000 tokens</li>
                        <li>Each generated word costs approximately 1.33 tokens</li>
                    </ul>
                    <p className="mb-6">
                        Token usage includes:
                    </p>
                    <ul className="list-disc ml-8 mb-4">
                        <li>User input (prompt)</li>
                        <li>Internal processing (e.g., title generation, tool selection)</li>
                        <li>AI-generated output</li>
                    </ul>
                    <p className="mb-6">
                        Actual usage may vary based on the length and complexity of the content.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
                    <p className="mb-6">
                        LowContent.ai shall not be liable for any direct or indirect damages resulting from the use or inability
                        to use the platform, including data loss or business interruption.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">9. Privacy</h2>
                    <p className="mb-6">
                        We respect your privacy. Please refer to our <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Privacy Policy</a> to
                        understand how we collect, use, and protect your personal data.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">10. Governing Law and Jurisdiction</h2>
                    <p className="mb-6">
                        These terms are governed by Italian law. Any disputes will be subject to the exclusive jurisdiction of
                        the Court of Milan (MI).
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
                    <p className="mb-6">
                        For any questions or information regarding these terms and conditions, please contact us at:
                    </p>
                    <p className="mb-6">
                        <a href="mailto:support@lowcontent.ai" className="text-blue-500 underline">support@lowcontent.ai</a>
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}
