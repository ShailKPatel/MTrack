import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

export interface Transaction {
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
}

interface TransactionTableProps {
    data: Transaction[];
    onDelete?: (id: string) => void;
    type?: 'income' | 'expense' | 'investment';
}

export function TransactionTable({ data, onDelete, type = 'income' }: TransactionTableProps) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                No records found. Add your first transaction.
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden rounded-lg border border-[#1a1a1a]">
            <table className="w-full text-sm text-left">
                <thead className="bg-[#111] text-gray-400 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        {onDelete && <th className="px-6 py-3 text-center">Action</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                    {data.map((item) => (
                        <tr key={item.id} className="hover:bg-[#1a1a1a]/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                {formatDate(item.date)}
                            </td>
                            <td className="px-6 py-4 text-gray-300">{item.category}</td>
                            <td className="px-6 py-4 text-gray-400">{item.description}</td>
                            <td className={`px-6 py-4 text-right font-bold ${type === 'income' ? 'text-green-500' : type === 'expense' ? 'text-red-500' : 'text-blue-500'
                                }`}>
                                {formatCurrency(item.amount)}
                            </td>
                            {onDelete && (
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="text-gray-500 hover:text-red-500 transition-colors bg-transparent p-1"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
