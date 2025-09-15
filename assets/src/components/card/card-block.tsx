import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CardBlockProps {
    title: string;
    children: React.ReactNode;
}
export const CardBlock: React.FunctionComponent<CardBlockProps> = ({ title, children }) => (
    <Card>
        <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-muted-foreground">{children}</CardContent>
    </Card>
);

CardBlock.displayName = 'CardBlock';
