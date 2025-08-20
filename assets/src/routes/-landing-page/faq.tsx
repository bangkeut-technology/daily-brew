import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function FAQ() {
    return (
        <section id="faq" className="py-14">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">FAQs</h2>
                <p className="mt-2 text-muted-foreground">Everything you need to know before brewing with us.</p>
            </div>
            <div className="mt-6 max-w-3xl mx-auto">
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>What’s included in the free plan?</AccordionTrigger>
                        <AccordionContent>
                            One store, up to 10 employees, 5 KPI templates, basic attendance and leave. Owners can grade
                            KPIs.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>When do I need Pro?</AccordionTrigger>
                        <AccordionContent>
                            When you need multiple stores, delegated evaluators, custom weights, or to restrict
                            clock‑ins by IP/geofence.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Can I migrate later?</AccordionTrigger>
                        <AccordionContent>Yes. You can upgrade anytime and your data stays intact.</AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
    );
}
