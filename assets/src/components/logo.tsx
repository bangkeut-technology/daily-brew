import React from 'react';
import { Link } from '@tanstack/react-router';
import LogoImage from '@/images/logo.svg';

interface LogoProps {
    to: string;
}

export const Logo: React.FunctionComponent<LogoProps> = ({ to }) => (
    <Link to={to} className="flex items-center gap-2">
        <div className="h-9 w-9 grid place-items-center rounded-xl bg-primary/10 text-primary">
            <img src={LogoImage} alt="DailyBrew" className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">DailyBrew</span>
            <span className="text-muted-foreground">.work</span>
        </span>
    </Link>
);
