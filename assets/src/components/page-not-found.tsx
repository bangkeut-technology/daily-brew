import { Link } from '@tanstack/react-router';
import { Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PageNotFound = () => (
    <div className="flex flex-col items-center justify-center h-screen text-center space-y-6">
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="xl">Looks like this cup’s empty</p>
        <Coffee className="h-36 w-36 my-6 text-primary" />
        <p className="text-xl">let’s get you back to the brewery!</p>
        <Button asChild>
            <Link to="/">Go Home</Link>
        </Button>
    </div>
);
