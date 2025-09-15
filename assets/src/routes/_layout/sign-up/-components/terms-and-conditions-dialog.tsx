import React from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TermContent } from '@/components/term-content';

export const TermsAndConditionsDialog = () => (
    <Dialog>
        <DialogTrigger asChild>
            <Button variant="link" className="text-primary underline underline-offset-2 cursor-pointer">
                Terms of Service
            </Button>
        </DialogTrigger>
        <DialogContent className="p-4">
            <DialogHeader>
                <DialogTitle>Terms & Conditions</DialogTitle>
            </DialogHeader>
            <TermContent />
            <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">
                        Close
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

TermsAndConditionsDialog.displayName = 'TermsAndConditionsDialog';
