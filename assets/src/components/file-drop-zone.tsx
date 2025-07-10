import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileIcon } from 'lucide-react';
import { FileUpload } from '@/components/file-upload';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';

interface FileDropZoneProps {
    images: File[];
    onDrop: (acceptedFiles: File[]) => void;
    onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (index: number) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ images, onDrop, onUpload, onRemove }) => {
    const { t } = useTranslation();
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
        },
    });

    return (
        <React.Fragment>
            <div
                className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-6 items-center"
                {...getRootProps()}
            >
                <input {...getInputProps()} />
                <FileIcon className="w-12 h-12" />
                {isDragActive ? (
                    <React.Fragment>
                        <span className="text-sm font-medium text-gray-500">
                            {t('image.drop_here', { ns: 'glossary' })}
                        </span>
                        <span className="text-xs text-gray-500">({t('image.only', { ns: 'glossary' })})</span>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <span className="text-sm font-medium text-gray-500">
                            {t('image.drop_click', { ns: 'glossary' })}
                        </span>
                        <span className="text-xs text-gray-500">({t('image.only', { ns: 'glossary' })})</span>
                    </React.Fragment>
                )}
            </div>
            <FileUpload onChange={onUpload} />
            {images.map((imageFile, index) => (
                <div
                    className="flex flex-row items-center justify-between space-x-2"
                    key={`file-drop-zone-image-${index}`}
                >
                    <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-12 h-12" />
                    <span>{imageFile.name}</span>
                    <Button className="text-red-500" variant="ghost" onClick={() => onRemove(index)}>
                        {t('remove')}
                    </Button>
                </div>
            ))}
        </React.Fragment>
    );
};
