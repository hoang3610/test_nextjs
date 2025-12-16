'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/hooks/useTheme';
import ic404Dark from '@/assets/icons/ic_404_dark.svg';
import ic404Light from '@/assets/icons/ic_404_light.svg';

export default function NotFound() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-white dark:bg-gray-900">
            <div className="px-6 py-16 text-center font-semibold before:container before:absolute before:left-1/2 before:-translate-x-1/2 before:rounded-full before:bg-[linear-gradient(180deg,#4361EE_0%,rgba(67,97,238,0)_50.73%)] before:aspect-square before:opacity-10 md:py-20 text-gray-800 dark:text-white">
                <div className="relative z-10">
                    <div className="w-full max-w-xs mx-auto -mt-10 md:-mt-14 md:max-w-xl">
                        <Image
                            src={isDark ? ic404Dark : ic404Light}
                            alt="404 Not Found"
                            priority
                            className="w-full h-auto object-contain"
                        />
                    </div>
                    <Link
                        href="/"
                        className={`mt-8 inline-block px-8 py-3 rounded-full font-bold shadow-lg hover:opacity-90 transition-opacity uppercase ${isDark
                            ? "bg-gradient-to-r from-[#FDB931] via-[#9C7C18] to-[#FDB931] text-[#4a0404]"
                            : "bg-gradient-to-r from-[#C9A12B] via-[#8C6E14] to-[#C9A12B] text-white"
                            }`}
                    >
                        VỀ TRANG CHỦ
                    </Link>
                </div>
            </div>
        </div>
    );
}
