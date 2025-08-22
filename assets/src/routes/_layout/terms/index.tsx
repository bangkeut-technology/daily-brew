import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_layout/terms/')({
    component: TermsPage,
});

function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
            <div className="max-w-3xl w-full">
                <Link to="/" className="inline-flex items-center text-sm text-gray-600 mb-6 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
                </Link>

                <Card className="shadow-md rounded-2xl">
                    <CardContent className="p-8 space-y-6">
                        <h1 className="text-3xl font-bold mb-4">Terms & Conditions</h1>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold">1. Introduction</h2>
                            <p>
                                Welcome to our platform. By accessing or using our services, you agree to these Terms &
                                Conditions. Please read them carefully.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold">2. Use of Service</h2>
                            <p>
                                You agree to use the service responsibly and in compliance with all applicable laws. Any
                                misuse may result in suspension or termination of access.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold">3. Accounts</h2>
                            <p>
                                You are responsible for maintaining the confidentiality of your account credentials. Any
                                activity under your account is your responsibility.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold">4. Limitation of Liability</h2>
                            <p>
                                We provide the service “as is” without warranties of any kind. We are not liable for any
                                damages resulting from your use of the service.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold">5. Changes</h2>
                            <p>
                                We may update these Terms & Conditions at any time. Updates will be posted here, and
                                continued use of the service means you accept the changes.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold">6. Contact</h2>
                            <p>
                                If you have questions about these Terms & Conditions, please contact us at
                                <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
                                    {' '}
                                    support@example.com
                                </a>
                                .
                            </p>
                        </section>

                        <div className="pt-6">
                            <Button asChild>
                                <Link to="/sign-in">Accept & Continue</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
