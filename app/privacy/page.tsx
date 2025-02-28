import React from 'react';
import { Card, CardBody } from "@heroui/card";

export default function PrivacyPage() {
    return (
        <div className="p-6 font-sans leading-relaxed">
            <Card className="shadow-lg rounded-lg">
                <CardBody className='p-8'>
                    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                    <p className="mb-6">
                        Last updated: <strong>08/16/2024</strong>
                    </p>

                    <p className="mb-6">
                        This privacy policy describes how LowContent.ai (hereinafter "we" or "the site") collects, uses, and protects the personal data of users (hereinafter "you" or "the user") who visit and use our site.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">1. Types of Data Collected</h2>
                    <p className="mb-6">
                        We collect the following personal data:
                    </p>
                    <ul className="list-disc ml-6 mb-6">
                        <li>Name</li>
                        <li>Address</li>
                        <li>Email address</li>
                        <li>Payment information</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mb-4">2. Methods of Data Collection</h2>
                    <p className="mb-6">
                        Personal data is collected through:
                    </p>
                    <ul className="list-disc ml-6 mb-6">
                        <li>Online forms</li>
                        <li>Site registration</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mb-4">3. Use of Data</h2>
                    <p className="mb-6">
                        The collected data is used for:
                    </p>
                    <ul className="list-disc ml-6 mb-6">
                        <li>Subscribing to memberships</li>
                        <li>Improving our site and services</li>
                    </ul>

                    <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
                    <p className="mb-6">
                        We do not share users' personal data with third parties.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
                    <p className="mb-6">
                        We retain personal data until the customer unsubscribes.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">6. User Rights</h2>
                    <p className="mb-6">
                        You have the right to request the deletion of your personal data at any time. To exercise this right, you can contact us using the information provided in the contact section.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">7. Data Security</h2>
                    <p className="mb-6">
                        We implement appropriate security measures to protect users' personal data from unauthorized access, alterations, or disclosures.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
                    <p className="mb-6">
                        For questions regarding this privacy policy or to exercise your rights, please contact us through the dedicated form on our site or by sending an email to <a href="mailto:support@lowcontent.ai" className="text-blue-500 underline"> support@lowcontent.ai</a>.
                    </p>

                    <h2 className="text-2xl font-semibold mb-4">9. Changes to the Privacy Policy</h2>
                    <p className="mb-6">
                        We reserve the right to modify this privacy policy at any time. Changes will be posted on this page, and we encourage you to review this policy periodically for any updates.
                    </p>
                </CardBody>
            </Card>
        </div>
    );
}
