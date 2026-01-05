import React from 'react';
import { LayoutDashboard, Wallet, TrendingUp, PiggyBank, Target, Settings, Sun, Moon } from 'lucide-react';
import { Logo } from './Logo';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

interface NavbarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: Wallet },
    { id: 'expenses', label: 'Expenses', icon: TrendingUp },
    { id: 'investments', label: 'Investments', icon: PiggyBank },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="fixed top-0 left-0 right-0 h-20 bg-secondary/80 backdrop-blur-xl border-b border-white/5 z-50 px-6 flex items-center justify-between transition-all duration-300">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
                <Logo size={42} className="text-accent" />
                <h1 className="text-2xl font-bold font-display tracking-tight hidden md:block">MTrack</h1>
            </div>

            {/* Navigation Items */}
            <nav className="flex items-center gap-2 lg:gap-4">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={clsx(
                                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium",
                                isActive
                                    ? "bg-primary text-accent shadow-sm"
                                    : "text-muted hover:text-primary hover:bg-white/5"
                            )}
                        >
                            <Icon size={18} />
                            <span className="hidden lg:inline">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Theme Toggle - Slider Switch */}
            <div className="flex items-center gap-3">
                <div
                    onClick={toggleTheme}
                    className="w-14 h-8 bg-black/20 dark:bg-black/40 rounded-full border border-white/10 relative cursor-pointer transition-colors hover:border-accent/30"
                    title="Toggle Theme"
                >
                    <div className={clsx(
                        "absolute top-1 left-1 w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-all duration-300 transform",
                        theme === 'dark' ? "translate-x-6 bg-gray-800 text-white border border-white/20" : "translate-x-0 bg-white text-yellow-500"
                    )}>
                        {theme === 'dark'
                            ? <Moon size={14} fill="currentColor" />
                            : <Sun size={14} fill="currentColor" />
                        }
                    </div>
                </div>
            </div>
        </header>
    );
};
