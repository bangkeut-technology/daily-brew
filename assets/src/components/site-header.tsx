import { Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import React from 'react';

export const SiteHeader = () => (
    <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border">
        <div className="mx-auto max-w-7xl px-6 md:px-8 h-16 flex items-center justify-between">
            <a href="#" className="flex items-center gap-2">
                <div className="h-9 w-9 grid place-items-center rounded-xl bg-primary/10 text-primary">
                    <Coffee className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        DailyBrew
                    </span>
                    <span className="text-muted-foreground">.work</span>
                </span>
            </a>
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                <a href="#features" className="hover:text-foreground">
                    Features
                </a>
                <a href="#pricing" className="hover:text-foreground">
                    Pricing
                </a>
                <a href="#faq" className="hover:text-foreground">
                    FAQ
                </a>
            </nav>
            <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link to="/console/sign-in" search={{ redirect: '/console' }}>
                        Sign in
                    </Link>
                </Button>
                <Button asChild>
                    <Link to="/console/sign-up" search={{ redirect: '/console' }}>
                        Get started
                    </Link>
                </Button>
            </div>
        </div>
    </header>
);
