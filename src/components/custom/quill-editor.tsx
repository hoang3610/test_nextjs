'use client';

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { showToast } from './custom-toast';
import { LoadingOverlay } from '@mantine/core';
import { uploadImageClient } from '@/lib/cloudinary-client';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false }) as any;

interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
}

const QuillEditor = forwardRef<any, QuillEditorProps>(({ value, onChange, readOnly }, ref) => {

    const [isUploading, setIsUploading] = useState(false);
    const quillRef = useRef<any>(null); // Use any for ReactQuill instance as dynamic import makes types tricky
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => quillRef.current, []);

    // Register handlers when Quill is ready or refs are available
    // Since ReactQuill is dynamic, we might need to wait, but usually ref attaches when loaded.
    useEffect(() => {
        // We can't access getEditor() immediately on mount if it's dynamic
        // But we can check periodically or just rely on user interaction.
        // However, standard toolbar handlers need to be registered.
        // ReactQuill modules prop handles this configuration.
        // Custom handlers need to be attached if we want to override default behavior.
    }, []);

    // Helper to upload file
    const uploadFileToCloudinary = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                try {
                    const base64 = reader.result as string;
                    const url = await uploadImageClient(base64);
                    resolve(url);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
        });
    };

    // Handler for Image Upload
    const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setIsUploading(true);
            try {
                const url = await uploadFileToCloudinary(files[0]);
                if (url) {
                    const quill = quillRef.current?.getEditor();
                    if (quill) {
                        const range = quill.getSelection(true);
                        quill.insertEmbed(range.index, 'image', url);
                        quill.setSelection(range.index + 1);
                    }
                }
            } catch (error) {
                console.error('Upload failed', error);
                showToast({ message: 'Upload ảnh thất bại', type: 'error' });
            } finally {
                setIsUploading(false);
                if (imageInputRef.current) imageInputRef.current.value = '';
            }
        }
    };

    // Handler for Video Upload
    const handleVideoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setIsUploading(true);
            try {
                const url = await uploadFileToCloudinary(files[0]);
                if (url) {
                    const quill = quillRef.current?.getEditor();
                    if (quill) {
                        const range = quill.getSelection(true);
                        quill.insertEmbed(range.index, 'video', url);
                        quill.setSelection(range.index + 1);
                    }
                }
            } catch (error) {
                console.error('Upload failed', error);
                showToast({ message: 'Upload video thất bại', type: 'error' });
            } finally {
                setIsUploading(false);
                if (videoInputRef.current) videoInputRef.current.value = '';
            }
        }
    };

    const modules = React.useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: () => {
                    imageInputRef.current?.click();
                },
                video: () => {
                    videoInputRef.current?.click();
                }
            }
        }
    }), []);

    return (
        <div className='relative'>
            <input
                type="file"
                ref={imageInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleImageSelect}
            />
            <input
                type="file"
                ref={videoInputRef}
                style={{ display: 'none' }}
                accept="video/*"
                onChange={handleVideoSelect}
            />
            <ReactQuill
                ref={quillRef}
                value={value}
                onChange={onChange}
                modules={modules}
                readOnly={readOnly}
                theme="snow"
                className="bg-white"
            />
            <LoadingOverlay visible={isUploading} zIndex={100} overlayBlur={1} radius="sm" />
        </div>
    );
});

QuillEditor.displayName = 'QuillEditor';

export default QuillEditor;