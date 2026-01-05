import React, { useState, useEffect } from 'react';
import { Plus, Target, Trash2, TrendingUp, Wallet } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { AddGoalModal } from '../components/AddGoalModal';

interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    deadline: string;
    allocatedAmount: number;
    createdDate: string;
}

export function Goals() {
    const { formatCurrency } = useSettings();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [liquidCash, setLiquidCash] = useState(0);
    const [totalAllocated, setTotalAllocated] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [goalsData, income, expenses, investments, allocated] = await Promise.all([
            window.ipcRenderer.invoke('get-goals'),
            window.ipcRenderer.invoke('get-records', 'income'),
            window.ipcRenderer.invoke('get-records', 'expense'),
            window.ipcRenderer.invoke('get-records', 'investment'),
            window.ipcRenderer.invoke('get-total-allocated')
        ]);

        setGoals(goalsData);
        setTotalAllocated(allocated);

        // Calculate liquid cash
        const totalIncome = income.reduce((sum: number, r: any) => sum + r.amount, 0);
        const totalExpense = expenses.reduce((sum: number, r: any) => sum + r.amount, 0);
        const totalInvestment = investments.reduce((sum: number, r: any) => sum + r.amount, 0);

        const liquid = totalIncome - totalExpense - totalInvestment - allocated;
        setLiquidCash(Math.max(0, liquid));
    };

    const handleAddGoal = async (goalData: any) => {
        await window.ipcRenderer.invoke('add-goal', goalData);
        await loadData();
    };

    const handleDeleteGoal = async (id: string) => {
        await window.ipcRenderer.invoke('delete-goal', id);
        await loadData();
    };

    const handleAllocate = async (goalId: string, amount: number) => {
        if (amount > liquidCash) {
            alert(`Cannot allocate more than available liquid cash (${formatCurrency(liquidCash)})`);
            return;
        }

        await window.ipcRenderer.invoke('allocate-to-goal', { goalId, amount });
        await loadData();
    };

    const unallocatedCash = liquidCash;

    return (
        <div className="animate-in fade-in duration-500 space-y-8 pb-10 w-full max-w-7xl mx-auto px-4">
            {/* Header */}
            <header className="flex flex-col items-center space-y-4 mb-8">
                <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-center">Financial Goals</h1>
                <p className="text-muted text-lg">Track and allocate towards your savings targets</p>
            </header>

            {/* Liquid Cash Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Wallet className="text-blue-500" size={24} />
                        <h3 className="font-semibold">Total Liquid Cash</h3>
                    </div>
                    <p className="text-3xl font-bold">{formatCurrency(liquidCash + totalAllocated)}</p>
                </div>

                <div className="glass-panel p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Target className="text-green-500" size={24} />
                        <h3 className="font-semibold">Allocated to Goals</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-500">{formatCurrency(totalAllocated)}</p>
                </div>

                <div className="glass-panel p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="text-orange-500" size={24} />
                        <h3 className="font-semibold">Unallocated</h3>
                    </div>
                    <p className="text-3xl font-bold text-orange-500">{formatCurrency(unallocatedCash)}</p>
                </div>
            </div>

            {/* Goals List */}
            <div className="glass-panel p-6 md:p-8">
                <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4">
                    <h3 className="text-2xl font-bold font-display">Active Goals</h3>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary"
                    >
                        <Plus size={20} className="mr-2" /> Add Goal
                    </button>
                </div>

                {goals.length === 0 ? (
                    <div className="py-12 text-center text-muted border border-dashed border-[var(--color-border)] rounded-2xl">
                        No goals set yet. Create your first financial goal!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {goals.map(goal => {
                            const progress = (goal.allocatedAmount / goal.targetAmount) * 100;
                            const remaining = goal.targetAmount - goal.allocatedAmount;

                            return (
                                <div key={goal.id} className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--color-border)] space-y-4 group relative">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">{goal.name}</h4>
                                            <p className="text-sm text-muted">Target: {formatCurrency(goal.targetAmount)} by {new Date(goal.deadline).toLocaleDateString()}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteGoal(goal.id)}
                                            className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-muted">Progress</span>
                                            <span className="font-semibold">{Math.min(100, progress).toFixed(1)}%</span>
                                        </div>
                                        <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                                                style={{ width: `${Math.min(100, progress)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-muted mt-2">
                                            <span>Allocated: {formatCurrency(goal.allocatedAmount)}</span>
                                            <span>Remaining: {formatCurrency(remaining)}</span>
                                        </div>
                                    </div>

                                    {/* Allocation Input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Amount to allocate"
                                            className="flex-1 px-3 py-2 text-sm"
                                            min="0"
                                            step="0.01"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const input = e.target as HTMLInputElement;
                                                    const value = parseFloat(input.value);
                                                    if (value > 0) {
                                                        handleAllocate(goal.id, value);
                                                        input.value = '';
                                                    }
                                                }
                                                if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                                            }}
                                        />
                                        <button
                                            onClick={(e) => {
                                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                const value = parseFloat(input.value);
                                                if (value > 0) {
                                                    handleAllocate(goal.id, value);
                                                    input.value = '';
                                                }
                                            }}
                                            className="btn-ghost px-4 text-sm"
                                        >
                                            Allocate
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <AddGoalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddGoal}
            />
        </div>
    );
}
