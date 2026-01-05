import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EditTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (data: any) => void;
    transaction: {
        id: string;
        date: string;
        category: string;
        description: string;
        amount: number;
    } | null;
    type: 'income' | 'expense' | 'investment';
}

export function EditTransactionModal({ isOpen, onClose, onUpdate, transaction, type }: EditTransactionModalProps) {
    const [formData, setFormData] = useState({
        date: '',
        category: '',
        description: '',
        amount: ''
    });

    useEffect(() => {
        if (transaction) {
            setFormData({
                date: transaction.date.split('T')[0], // Format for date input
                category: transaction.category,
                description: transaction.description,
                amount: transaction.amount.toString()
            });
        }
    }, [transaction]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.date || !formData.category || !formData.amount) return;

        onUpdate({
            id: transaction?.id,
            date: new Date(formData.date).toISOString(),
            category: formData.category,
            description: formData.description,
            amount: parseFloat(formData.amount)
        });

        onClose();
    };

    if (!isOpen || !transaction) return null;

    const getCategoryOptions = () => {
        if (type === 'income') {
            return ['Salary', 'Freelance', 'Investment Returns', 'Business', 'Bonus', 'Other'];
        } else if (type === 'expense') {
            return ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'];
        } else {
            return ['Stocks', 'Mutual Funds', 'Crypto', 'Real Estate', 'Gold', 'Fixed Deposit', 'Other'];
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="glass-panel p-8 max-w-md w-full animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold font-display">Edit {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
                    <button onClick={onClose} className="text-muted hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--color-border)] focus:border-white transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--color-border)] focus:border-white transition-colors"
                            required
                        >
                            <option value="">Select Category</option>
                            {getCategoryOptions().map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter description"
                            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--color-border)] focus:border-white transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Amount</label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--color-border)] focus:border-white transition-colors"
                            required
                            onKeyDown={(e) => {
                                if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                            }}
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-primary"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
