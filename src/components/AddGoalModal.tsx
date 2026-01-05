import React, { useState, useEffect } from 'react';
import { X, Calendar, Target, Pencil } from 'lucide-react';

interface AddGoalModalProps {
    isOpen: boolean;
    initialData?: any;
    onClose: () => void;
    onAdd: (goalData: any) => Promise<void>;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, initialData, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        deadline: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                targetAmount: initialData.targetAmount.toString(),
                deadline: initialData.deadline
            });
        } else {
            setFormData({ name: '', targetAmount: '', deadline: '' });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAdd({
            name: formData.name,
            targetAmount: parseFloat(formData.targetAmount),
            deadline: formData.deadline
        });
        setFormData({ name: '', targetAmount: '', deadline: '' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-secondary border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden glass-panel">
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold font-display">{initialData ? 'Edit Goal' : 'Set New Goal'}</h2>
                    <button onClick={onClose} className="text-muted hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm text-muted">Goal Name</label>
                        <div className="relative">
                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                required
                                type="text"
                                placeholder="e.g. Vacation, New Laptop"
                                className="w-full pl-10 bg-black/20"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-muted">Target Amount</label>
                        <input
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter amount"
                            className="w-full bg-black/20"
                            value={formData.targetAmount}
                            onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
                            onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-muted">Target Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                required
                                type="date"
                                className="w-full pl-10 bg-black/20"
                                value={formData.deadline}
                                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full btn-primary py-3 justify-center mt-4">
                        {initialData ? 'Update Goal' : 'Create Goal'}
                    </button>
                </form>
            </div>
        </div>
    );
};
