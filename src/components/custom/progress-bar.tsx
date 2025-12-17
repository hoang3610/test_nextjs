import React from 'react';

interface ProgressBarProps {
    progress: number; // 0 to 100
    className?: string;
    barColor?: string; // Tailwind class, e.g., 'bg-blue-600'
    height?: string; // CSS value, e.g., 'h-2.5'
    showLabel?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    className = '',
    barColor = 'bg-blue-600',
    height = 'h-2.5',
    showLabel = false,
}) => {
    // Clamp progress between 0 and 100
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Tiến độ</span>
                    <span className="text-sm font-medium text-gray-700">{Math.round(clampedProgress)}%</span>
                </div>
            )}
            <div className={`w-full bg-gray-200 rounded-full ${height}`}>
                <div
                    className={`${barColor} ${height} rounded-full transition-all duration-300 ease-out`}
                    style={{ width: `${clampedProgress}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;
