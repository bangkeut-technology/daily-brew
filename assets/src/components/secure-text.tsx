import React from 'react';
import { useBoolean } from 'react-use';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface SecureTextProps {
    text: string;
}

export const SecureText: React.FC<SecureTextProps> = ({ text }) => {
    const { t } = useTranslation();
    const [isSecure, onToggle] = useBoolean(true);

    return (
        <div className="flex space-x-2 items-center">
            <span className={isSecure ? 'max-w-20 truncate' : ''}>{text}</span>
            <Button onClick={onToggle} size="sm">
                {isSecure ? t('show') : t('hide')}
            </Button>
        </div>
    );
};
