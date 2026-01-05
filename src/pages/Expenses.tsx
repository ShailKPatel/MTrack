import React, { useEffect, useState } from 'react';
import { TransactionTable, Transaction } from '../components/TransactionTable';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { AddAutomationModal } from '../components/AddAutomationModal';
import { EditTransactionModal } from '../components/EditTransactionModal';
import { DistributionChart } from '../components/DistributionChart';
import { useSettings } from '../context/SettingsContext';
import { Plus, Clock, Filter, Trash2 } from 'lucide-react';

export function Expenses() {
    const { formatCurrency } = useSettings();
    const [records, setRecords] = useState<Transaction[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<Transaction[]>([]);
    const [automations, setAutomations] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Transaction | null>(null);
    const [filterType, setFilterType] = useState('all');

    const loadRecords = async () => {
        try {
            const [rec, rules] = await Promise.all([
                window.ipcRenderer.invoke('get-records', 'expense'),
                window.ipcRenderer.invoke('get-automation-rules')
            ]);
            setRecords(rec.reverse());
            setFilteredRecords(rec);
            setAutomations(rules.filter((r: any) => r.type === 'expense'));
        } catch (error) {
            console.error("Failed to load records", error);
        }
    };

    useEffect(() => {
        loadRecords();
    }, []);

    useEffect(() => {
        if (filterType === 'all') setFilteredRecords(records);
        else if (filterType === 'high') setFilteredRecords(records.filter(r => r.amount > 500));
        else if (filterType === 'recent') setFilteredRecords(records.slice(0, 10));
    }, [filterType, records]);

    const handleAdd = async (data: any) => {
        await window.ipcRenderer.invoke('add-record', { type: 'expense', record: data });
        await loadRecords();
    };

    const handleAddAutomation = async (data: any) => {
        await window.ipcRenderer.invoke('add-automation-rule', data);
        await loadRecords();
    };

    const handleDeleteAutomation = async (id: string) => {
        // Removed blocking confirm to prevent UI freeze
        await window.ipcRenderer.invoke('delete-automation-rule', id);
        await loadRecords();
    };

    const handleDeleteRecord = async (id: string) => {
        await window.ipcRenderer.invoke('delete-record', { type: 'expense', id });
        await loadRecords();
    };

    const handleEdit = (record: Transaction) => {
        setEditingRecord(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (data: any) => {
        await window.ipcRenderer.invoke('update-record', { type: 'expense', record: data });
        await loadRecords();
    };

    const totalExpense = records.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="animate-in fade-in duration-500 space-y-8 pb-10 w-full max-w-7xl mx-auto px-4">
            {/* Standard Header */}
            <header className="flex flex-col items-center space-y-4 mb-8">
                <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-center">Expenses</h1>
                <p className="text-muted text-lg">Track spending and manage EMI automations</p>
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 backdrop-blur-md">
                    <span className="font-medium">Total Spent:</span>
                    <span className="text-xl font-bold">{formatCurrency(totalExpense)}</span>
                </div>
            </header>

            {/* Automation Section (EMI) */}
            <div className="glass-panel p-6 md:p-8">
                <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">EMI & Subscriptions</h3>
                            <p className="text-sm text-muted">Recurring payments and loans</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAutoModalOpen(true)}
                        className="btn-ghost border border-[var(--color-border)] hover:bg-[var(--bg-tertiary)]"
                    >
                        <Plus size={18} className="mr-2" /> Add EMI
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {automations.map((rule, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--color-border)] hover:border-orange-500/50 transition-colors flex flex-col justify-between h-28 group relative">
                            <div className="flex justify-between items-start w-full">
                                <span className="font-bold text-lg truncate pr-6">{rule.name}</span>
                                <button
                                    onClick={() => handleDeleteAutomation(rule.id)}
                                    className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 right-0 p-2"
                                    title="Stop Payment"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-red-500 font-bold text-xl">{formatCurrency(rule.amount)}</span>
                                <span className="text-xs text-muted uppercase bg-[var(--bg-tertiary)] px-2 py-1 rounded-md tracking-wider font-semibold">{rule.frequency}</span>
                            </div>
                        </div>
                    ))}
                    {automations.length === 0 && (
                        <div className="col-span-full py-8 text-center text-muted border border-dashed border-[var(--color-border)] rounded-2xl">
                            No active EMIs
                        </div>
                    )}
                </div>
            </div>

            {/* Transactions Table */}
            <div className="max-w-md mx-auto mb-8">
                <DistributionChart
                    title="Expense Breakdown - Complete History"
                    data={(() => {
                        const categoryTotals = new Map<string, number>();
                        records.forEach((r: any) => {
                            const cat = r.category || 'Other';
                            categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + r.amount);
                        });
                        return Array.from(categoryTotals.entries()).map(([category, amount]) => ({ category, amount }));
                    })()}
                    colors={['#EF4444', '#F59E0B', '#8B5CF6', '#3B82F6', '#10B981']}
                />
            </div>

            <div className="glass-panel p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-2xl font-bold font-display">Recent Expenses</h3>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex items-center bg-[var(--bg-tertiary)] rounded-xl px-4 py-2 flex-1 md:flex-none">
                            <Filter size={18} className="mr-2 text-muted" />
                            <select
                                className="bg-transparent border-none p-0 text-sm focus:ring-0 cursor-pointer w-full focus:outline-none text-[var(--color-text-primary)] [&>option]:bg-[var(--bg-tertiary)] [&>option]:text-[var(--color-text-primary)]"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">All Expenses</option>
                                <option value="recent">Recent (10)</option>
                                <option value="high">High Value (&gt;500)</option>
                                <option value="category">By Category</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn-primary"
                        >
                            <Plus size={20} className="mr-2" /> Add Expense
                        </button>
                    </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
                    <TransactionTable
                        data={filteredRecords}
                        type="expense"
                        onDelete={handleDeleteRecord}
                        onEdit={handleEdit}
                    />
                </div>
            </div>

            {/* Distribution Analysis */}
            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAdd}
                type="expense"
            />

            <EditTransactionModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingRecord(null);
                }}
                onUpdate={handleUpdate}
                transaction={editingRecord}
                type="expense"
            />

            <AddAutomationModal
                isOpen={isAutoModalOpen}
                onClose={() => setIsAutoModalOpen(false)}
                onAdd={handleAddAutomation}
                type="expense"
                title="Add EMI / Subscription"
            />
        </div>
    );
}
