import React from 'react';
import { Button } from '@/components/ui/button';
import { AppleIcon } from '@/components/icons/apple-icon';

export const AppleButton: React.FunctionComponent = () => (
    <Button variant="outline" type="button" className="w-full" asChild>
        <a href="/oauth/auth/apple">
            <AppleIcon /> Apple
        </a>
    </Button>
);

AppleButton.displayName = 'AppleButton';
