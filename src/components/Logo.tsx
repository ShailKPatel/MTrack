import React from 'react';
import clsx from 'clsx';

interface LogoProps {
    size?: number;
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, className }) => {
    return (
        <div className={clsx("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <img
                src="./icon.png"
                alt="M"
                className="w-full h-full object-contain filter drop-shadow-md rounded-xl"
                style={{ minWidth: size, minHeight: size }}
            />
        </div>
    );
};
