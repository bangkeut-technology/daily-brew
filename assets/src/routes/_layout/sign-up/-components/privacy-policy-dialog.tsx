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
import { PrivacyContent } from '@/components/privacy-content';

export const PrivacyPolicyDialog = () => (
    <Dialog>
        <DialogTrigger asChild>
            <Button variant="link" className="text-primary underline underline-offset-2 cursor-pointer">
                Privacy Policy
            </Button>
        </DialogTrigger>
        <DialogContent className="p-4">
            <DialogHeader>
                <DialogTitle>Privacy Policy</DialogTitle>
            </DialogHeader>
            <PrivacyContent />
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

PrivacyPolicyDialog.displayName = 'PrivacyPolicyDialog';
