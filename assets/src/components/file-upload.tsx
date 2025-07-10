import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FileUploadProps {
    label?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, onChange }) => (
    <div className="space-y-2 text-sm">
        {label && (
            <Label htmlFor="file" className="text-sm font-medium">
                {label}
            </Label>
        )}
        <Input id="file" type="file" placeholder="File" accept="image/*" onChange={onChange} />
    </div>
);
