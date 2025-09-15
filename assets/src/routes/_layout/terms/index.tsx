import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TermContent } from '@/components/term-content';

export const Route = createFileRoute('/_layout/terms/')({
    component: TermsPage,
});

function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col items-center p-6">
            <div className="max-w-3xl w-full">
                <Link to="/" className="inline-flex items-center text-sm text-gray-600 mb-6 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
                </Link>

                <Card className="shadow-md rounded-2xl">
                    <CardContent className="p-8 space-y-6">
                        <TermContent withHeader />

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
