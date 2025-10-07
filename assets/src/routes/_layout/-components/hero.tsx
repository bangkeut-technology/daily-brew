import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export const Hero = () => (
    <section className="py-14 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                <Badge variant="secondary" className="rounded-full">
                    Open beta
                </Badge>
                <span className="hidden sm:inline">Instant setup • No credit card</span>
            </div>
            <motion.h1
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-4xl font-extrabold tracking-tight md:text-6xl"
            >
                Brew better shifts, every day.
            </motion.h1>
            <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-muted-foreground">
                KPI, attendance, and leave management designed for cafés and small teams. Simple to start, powerful when
                you need it.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" asChild className="w-full sm:w-auto">
                    <Link to="/sign-up" className="inline-flex items-center">
                        Get started free <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                    <Link to="/demo" className="inline-flex items-center">
                        Try the Demo
                    </Link>
                </Button>
            </div>
        </div>
    </section>
);
