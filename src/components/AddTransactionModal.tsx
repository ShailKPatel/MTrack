import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => Promise<void>;
    type: 'income' | 'expense' | 'investment';
}

export function AddTransactionModal({ isOpen, onClose, onAdd, type }: AddTransactionModalProps) {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [platform, setPlatform] = useState('');
    const [risk, setRisk] = useState('Medium');
    const [yield_, setYield] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onAdd({
                amount: parseFloat(amount),
                category,
                description,
                date,
                type,
                ...(type === 'investment' && {
                    platform,
                    risk,
                    yield: yield_ ? parseFloat(yield_) : 0
                })
            });
            onClose();
            // Reset form
            setAmount('');
            setCategory('');
            setDescription('');
            setPlatform('');
            setRisk('Medium');
            setYield('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0a0a0a] border border-[#333] w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                <header className="flex justify-between items-center p-4 border-b border-[#222]">
                    <h2 className="text-xl font-bold capitalize">Add {type}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                            className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-white focus:border-white transition-colors"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Category</label>
                        <input
                            type="text"
                            required
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-white focus:border-white transition-colors"
                            placeholder={type === 'income' ? "e.g., Salary, Freelance" : "e.g., Food, Rent"}
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Description (Optional)</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-white focus:border-white transition-colors"
                            placeholder="Notes..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Date</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-white focus:border-white transition-colors"
                        />
                    </div>

                    {type === 'investment' && (
                        <>
                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Platform</label>
                                <input
                                    type="text"
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value)}
                                    className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-white focus:border-white transition-colors"
                                    placeholder="e.g., CoinDCX, Angellist, Zerodha"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Risk Level</label>
                                    <select
                                        value={risk}
                                        onChange={(e) => setRisk(e.target.value)}
                                        className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-white focus:border-white transition-colors"
                                    >
                                        <option value="Low">Low Risk</option>
                                        <option value="Medium">Medium Risk</option>
                                        <option value="High">High Risk</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Yield/Returns</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={yield_}
                                        onChange={(e) => setYield(e.target.value)}
                                        onKeyDown={(e) => ['e', 'E', '+'].includes(e.key) && e.preventDefault()}
                                        className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-white focus:border-white transition-colors"
                                        placeholder="Profit/Loss"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-4 bg-white text-black font-bold py-3 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Transaction'}
                    </button>
                </form>
            </div>
        </div>
    );
}
