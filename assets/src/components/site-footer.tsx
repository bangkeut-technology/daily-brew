import React from 'react';
import { Coffee } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const SiteFooter = () => (
    <footer className="mt-10 border-t">
        <div className="mx-auto max-w-7xl px-6 md:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 grid place-items-center rounded-lg bg-primary/10 text-primary">
                        <Coffee className="h-4 w-4" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">
                        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            DailyBrew
                        </span>
                        <span className="text-muted-foreground">.work</span>
                    </span>
                </div>
                <div className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} DailyBrew. All rights reserved.
                </div>
            </div>
            <Separator className="my-4" />
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                    <div className="font-medium mb-2">Product</div>
                    <ul className="space-y-1 text-muted-foreground">
                        <li>
                            <a href="#features" className="hover:text-foreground">
                                Features
                            </a>
                        </li>
                        <li>
                            <a href="#pricing" className="hover:text-foreground">
                                Pricing
                            </a>
                        </li>
                        <li>
                            <a href="#faq" className="hover:text-foreground">
                                FAQ
                            </a>
                        </li>
                    </ul>
                </div>
                <div>
                    <div className="font-medium mb-2">Company</div>
                    <ul className="space-y-1 text-muted-foreground">
                        <li>
                            <a href="/about" className="hover:text-foreground">
                                About
                            </a>
                        </li>
                        <li>
                            <a href="/terms" className="hover:text-foreground">
                                Terms
                            </a>
                        </li>
                        <li>
                            <a href="/privacy" className="hover:text-foreground">
                                Privacy
                            </a>
                        </li>
                    </ul>
                </div>
                <div>
                    <div className="font-medium mb-2">Contact</div>
                    <ul className="space-y-1 text-muted-foreground">
                        <li>
                            <a href="mailto:support@dailybrew.work" className="hover:text-foreground">
                                support@dailybrew.work
                            </a>
                        </li>
                        <li>
                            <a href="/status" className="hover:text-foreground">
                                Status
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>
);
