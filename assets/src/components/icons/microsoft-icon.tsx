import React from 'react';

type MicrosoftIconProps = {
    className?: string;
};

export const MicrosoftIcon: React.FunctionComponent<MicrosoftIconProps> = ({ className }) => (
    <div className={className}>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                {' '}
                <rect x="17" y="17" width="10" height="10" fill="#FEBA08"></rect>{' '}
                <rect x="5" y="17" width="10" height="10" fill="#05A6F0"></rect>{' '}
                <rect x="17" y="5" width="10" height="10" fill="#80BC06"></rect>{' '}
                <rect x="5" y="5" width="10" height="10" fill="#F25325"></rect>{' '}
            </g>
        </svg>
    </div>
);

MicrosoftIcon.displayName = 'MicrosoftIcon';
