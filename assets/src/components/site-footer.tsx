import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useApplication } from '@/hooks/use-application';
import { Logo } from '@/components/logo';

export const SiteFooter = () => {
    const { t } = useTranslation();
    const { contactEmail } = useApplication();

    return (
        <footer className="border-t pt-10">
            <div className="mx-auto max-w-7xl px-6 md:px-8 pb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <Logo to="/" />
                    <div className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} DailyBrew. All rights reserved.
                    </div>
                </div>

                <Separator className="my-6" />

                {/* Navigation */}
                <nav aria-label="Footer navigation">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div>
                            <div className="font-medium mb-2">Product</div>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>
                                    <Link
                                        to="/features"
                                        className="text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        {t('features')}
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                                        {t('pricing')}
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">
                                        {t('faq')}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <div className="font-medium mb-2">Company</div>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>
                                    <Link
                                        to="/about"
                                        className="hover:text-foreground hover:underline underline-offset-2"
                                    >
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/terms"
                                        className="hover:text-foreground hover:underline underline-offset-2"
                                    >
                                        Terms
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/privacy"
                                        className="hover:text-foreground hover:underline underline-offset-2"
                                    >
                                        Privacy
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <div className="font-medium mb-2">Contact</div>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>
                                    <a
                                        href={`mailto:${contactEmail}`}
                                        className="hover:text-foreground hover:underline underline-offset-2"
                                    >
                                        {contactEmail}
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        to="/status"
                                        className="hover:text-foreground hover:underline underline-offset-2"
                                    >
                                        Status
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        </footer>
    );
};
