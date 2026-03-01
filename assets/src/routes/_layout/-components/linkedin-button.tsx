import React from 'react';
import { Button } from '@/components/ui/button';
import { LinkedinIcon } from '@/components/icons/linkedin-icon';

export const LinkedInButton: React.FunctionComponent = () => (
    <Button variant="outline" type="button" className="w-full" asChild>
        <a href="/oauth/auth/linkedin">
            <LinkedinIcon /> LinkedIn
        </a>
    </Button>
);

LinkedInButton.displayName = 'LinkedInButton';
