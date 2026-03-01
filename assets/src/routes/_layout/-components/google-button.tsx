import React from 'react';
import { Button } from '@/components/ui/button';
import { GoogleIcon } from '@/components/icons/google-icon';

export const GoogleButton: React.FunctionComponent = () => (
    <Button variant="outline" type="button" className="w-full" asChild>
        <a href="/oauth/auth/google">
            <GoogleIcon /> Google
        </a>
    </Button>
);

GoogleButton.displayName = 'GoogleButton';
