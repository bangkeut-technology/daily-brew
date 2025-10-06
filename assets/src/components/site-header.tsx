import { Coffee, LogIn, Menu, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';

export const SiteHeader = () => {
    const { t } = useTranslation();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur">
            <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
                <div className="flex h-14 items-center justify-between">
                    {/* Brand */}
                    <Logo to="/" />
                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground">
                            {t('features')}
                        </Link>
                        <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                            {t('pricing')}
                        </Link>
                        <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">
                            {t('faq')}
                        </Link>
                    </nav>
                    {/* Desktop actions */}
                    <div className="hidden md:flex items-center gap-2">
                        <Button variant="ghost" asChild>
                            <Link to="/sign-in">
                                <LogIn className="mr-1 h-4 w-4" />
                                {t('sign_in')}
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link to="/sign-up">
                                <UserPlus className="mr-1 h-4 w-4" />
                                {t('get_started')}
                            </Link>
                        </Button>
                    </div>
                    {/* Mobile: menu + single CTA */}
                    <div className="flex md:hidden items-center gap-2">
                        <Button asChild size="sm" className="px-3">
                            <Link to="/sign-up">
                                <UserPlus className="mr-1 h-4 w-4" />
                                {t('start')}
                            </Link>
                        </Button>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" aria-label="Open menu">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[85vw] sm:w-[360px]">
                                <SheetHeader>
                                    <SheetTitle className="flex items-center gap-2">
                                        <Coffee className="h-4 w-4" />
                                        DailyBrew
                                    </SheetTitle>
                                </SheetHeader>

                                <div className="mt-4 space-y-3">
                                    <Link to="/features" className="block text-sm py-2">
                                        Features
                                    </Link>
                                    <Link to="/pricing" className="block text-sm py-2">
                                        {t('pricing')}
                                    </Link>
                                    <Link to="/faq" className="block text-sm py-2">
                                        {t('faq')}
                                        FAQ
                                    </Link>
                                    <Separator />
                                    <div className="flex items-center gap-2 pt-1">
                                        <Button asChild variant="ghost" size="sm" className="flex-1">
                                            <Link to="/sign-in">
                                                <LogIn className="mr-1 h-4 w-4" />
                                                {t('sign_in')}
                                            </Link>
                                        </Button>
                                        <Button asChild size="sm" className="flex-1">
                                            <Link to="/sign-up">
                                                <UserPlus className="mr-1 h-4 w-4" />
                                                {t('get_started')}
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
};
