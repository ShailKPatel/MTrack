import React from 'react';

interface LayoutProps {
    navbar: React.ReactNode;
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ navbar, children }) => {
    return (
        <div className="flex flex-col h-screen w-full bg-primary text-primary transition-colors duration-300 overflow-hidden">
            {/* Top Navigation Bar */}
            <div className="flex-shrink-0 z-50">
                {navbar}
            </div>

            {/* Main Content Area - Scrollable */}
            <main className="flex-1 relative w-full h-full overflow-hidden pt-20">
                {/* pt-20 to offset fixed navbar height */}
                <div className="h-full w-full overflow-y-auto overflow-x-hidden p-6 md:p-10 scroll-smooth">
                    {/* Centered Container */}
                    <div className="max-w-7xl mx-auto min-h-full pb-20 flex flex-col items-center w-full">
                        {/* Ensure children take full width of container but are centered themselves if needed */}
                        <div className="w-full">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
