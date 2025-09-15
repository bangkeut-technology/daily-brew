import React from 'react';

interface TermContentProps {
    contactEmail?: string;
}

export const TermContent: React.FunctionComponent<TermContentProps> = ({ contactEmail }) => {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold mb-4">Terms & Conditions</h1>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">1. Introduction</h2>
                <p>
                    Welcome to our platform. By accessing or using our services, you agree to these Terms & Conditions.
                    Please read them carefully.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">2. Use of Service</h2>
                <p>
                    You agree to use the service responsibly and in compliance with all applicable laws. Any misuse may
                    result in suspension or termination of access.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">3. Accounts</h2>
                <p>
                    You are responsible for maintaining the confidentiality of your account credentials. Any activity
                    under your account is your responsibility.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">4. Limitation of Liability</h2>
                <p>
                    We provide the service “as is” without warranties of any kind. We are not liable for any damages
                    resulting from your use of the service.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">5. Changes</h2>
                <p>
                    We may update these Terms & Conditions at any time. Updates will be posted here, and continued use
                    of the service means you accept the changes.
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-semibold">6. Contact</h2>
                <p>
                    If you have questions about these Terms & Conditions, please contact us at
                    <a href={`mailto:${contactEmail}`} className="text-blue-600 hover:underline">
                        {' '}
                        ${contactEmail}
                    </a>
                    .
                </p>
            </section>
        </div>
    );
};
