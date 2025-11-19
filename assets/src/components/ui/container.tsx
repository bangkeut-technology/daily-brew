import React from 'react';

interface ContainerProps {
    children?: React.ReactNode;
}

export const Container: React.FunctionComponent<ContainerProps> = ({ children }) => (
    <div className="container mx-auto px-4">{children}</div>
);
