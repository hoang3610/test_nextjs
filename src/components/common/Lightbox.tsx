'use client';

import React, { useEffect } from 'react';
import Image from 'next/image'; // Use next/image for optimization
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    currentImage: string;
}

const Lightbox: React.FC<LightboxProps> = ({ isOpen, onClose, images, currentImage }) => {
    const [index, setIndex] = React.useState(0);

    // Sync internal index when opening
    useEffect(() => {
        if (isOpen) {
            const foundIndex = images.indexOf(currentImage);
            setIndex(foundIndex >= 0 ? foundIndex : 0);
        }
    }, [isOpen, currentImage, images]);

    const navigate = (direction: number) => {
        setIndex((prev) => {
            const newIndex = prev + direction;
            if (newIndex < 0) return images.length - 1; // Loop to end
            if (newIndex >= images.length) return 0; // Loop to start
            return newIndex;
        });
    };

    // Handle Keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-[60]"
            >
                <X size={32} />
            </button>

            {/* Prev Button */}
            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 z-[60] hover:bg-white/10 rounded-full transition-all"
                >
                    <ChevronLeft size={48} />
                </button>
            )}

            {/* Next Button */}
            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); navigate(1); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 z-[60] hover:bg-white/10 rounded-full transition-all"
                >
                    <ChevronRight size={48} />
                </button>
            )}

            {/* Image Container */}
            <div
                className="relative w-full h-full p-4 md:p-10 flex items-center justify-center"
                onClick={onClose}
            >
                <div
                    className="relative w-full h-full max-w-6xl max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Image
                        src={images[index] || ''}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-contain"
                        sizes="100vw" // Original quality
                        quality={100}
                        priority
                    />

                    {/* Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {index + 1} / {images.length}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lightbox;
