import React, { useState } from 'react';
import { X, Calendar, DollarSign, Tag, FileText } from 'lucide-react';

interface AddAutomationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (rule: any) => Promise<void>;
    type: 'income' | 'expense' | 'investment';
    title?: string;
}

export const AddAutomationModal: React.FC<AddAutomationModalProps> = ({ isOpen, onClose, onAdd, type, title }) => {
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        frequency: 'monthly',
        dayOfMonth: 1,
        category: '',
        startDate: new Date().toISOString().split('T')[0],
        description: ''
    });

    const categories = {
        income: ['Salary', 'Freelance', 'Business', 'Rental', 'Other'],
        expense: ['EMI', 'Subscription', 'Rent', 'Bills', 'Groceries', 'Other'],
        investment: ['SIP', 'Stocks', 'Crypto', 'Mutual Fund', 'Gold', 'Other']
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAdd({
            ...formData,
            amount: parseFloat(formData.amount),
            type,
            dayOfMonth: parseInt(String(formData.dayOfMonth))
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-secondary border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden glass-panel">
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold font-display">{title || `Add Automated ${type}`}</h2>
                    <button onClick={onClose} className="text-muted hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-muted">Name</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-3 text-muted" size={18} />
                            <input
                                required
                                type="text"
                                placeholder="e.g. Monthly Salary, Netflix"
                                className="w-full pl-10 bg-black/20"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-muted">Amount</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 text-muted" size={18} />
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-10 bg-black/20"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-muted">Day of Month</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 text-muted" size={18} />
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    max="31"
                                    className="w-full pl-10 bg-black/20"
                                    value={formData.dayOfMonth}
                                    onChange={e => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-muted">Category</label>
                            <select
                                className="w-full bg-black/20"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">Select...</option>
                                {categories[type].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-muted">Start Date</label>
                            <input
                                type="date"
                                className="w-full bg-black/20"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full btn-primary py-3 justify-center mt-4 text-black bg-white hover:bg-gray-200">
                        Create Automation
                    </button>
                </form>
            </div>
        </div>
    );
};
