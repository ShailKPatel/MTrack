import React, { useEffect, useState } from 'react';
import { TransactionTable, Transaction } from '../components/TransactionTable';
import { AddTransactionModal } from '../components/AddTransactionModal';
import { AddAutomationModal } from '../components/AddAutomationModal';
import { EditTransactionModal } from '../components/EditTransactionModal';
import { DistributionChart } from '../components/DistributionChart';
import { useSettings } from '../context/SettingsContext';
import { Plus, Repeat, Filter, Trash2 } from 'lucide-react';

export function Income() {
    const { formatCurrency } = useSettings();
    const [records, setRecords] = useState<Transaction[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<Transaction[]>([]);
    const [automations, setAutomations] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Transaction | null>(null);
    const [filterType, setFilterType] = useState('all');

    const loadData = async () => {
        try {
            const [rec, rules] = await Promise.all([
                window.ipcRenderer.invoke('get-records', 'income'),
                window.ipcRenderer.invoke('get-automation-rules')
            ]);
            setRecords(rec.reverse());
            setFilteredRecords(rec);
            setAutomations(rules.filter((r: any) => r.type === 'income'));
        } catch (error) {
            console.error("Failed to load data", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (filterType === 'all') setFilteredRecords(records);
        else if (filterType === 'high') setFilteredRecords(records.filter(r => r.amount > 1000));
        else if (filterType === 'salary') setFilteredRecords(records.filter(r => r.category?.toLowerCase().includes('salary')));
    }, [filterType, records]);

    const handleAdd = async (data: any) => {
        await window.ipcRenderer.invoke('add-record', { type: 'income', record: data });
        await loadData();
    };

    const handleAddAutomation = async (data: any) => {
        await window.ipcRenderer.invoke('add-automation-rule', data);
        await loadData();
    };

    const handleDeleteAutomation = async (id: string) => {
        // Removed blocking confirm, assuming direct action for responsiveness (or implement custom modal later)
        // Ideally we'd use a custom modal, but to fix the "freeze" bug, we remove native block.
        await window.ipcRenderer.invoke('delete-automation-rule', id);
        await loadData();
    };

    const handleDeleteRecord = async (id: string) => {
        await window.ipcRenderer.invoke('delete-record', { type: 'income', id });
        await loadData();
    };

    const handleEdit = (record: Transaction) => {
        setEditingRecord(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (data: any) => {
        await window.ipcRenderer.invoke('update-record', { type: 'income', record: data });
        await loadData();
    };

    const totalIncome = records.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="animate-in fade-in duration-500 space-y-8 pb-10 w-full max-w-7xl mx-auto px-4">
            {/* Standard Header */}
            <header className="flex flex-col items-center space-y-4 mb-8">
                <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-center">Income</h1>
                <p className="text-muted text-lg">Manage your revenue sources and salary automations</p>
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 backdrop-blur-md">
                    <span className="font-medium">Total Income:</span>
                    <span className="text-xl font-bold">{formatCurrency(totalIncome)}</span>
                </div>
            </header>

            {/* Automation Section */}
            <div className="glass-panel p-6 md:p-8">
                <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                            <Repeat size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Salary Automation</h3>
                            <p className="text-sm text-muted">Automatically track monthly paychecks</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAutoModalOpen(true)}
                        className="btn-ghost border border-[var(--color-border)] hover:bg-[var(--bg-tertiary)]"
                    >
                        <Plus size={18} className="mr-2" /> Add Salary
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {automations.map((rule, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--color-border)] hover:border-blue-500/50 transition-colors flex justify-between items-start group relative">
                            <div>
                                <p className="font-bold text-lg mb-1">{rule.name}</p>
                                <p className="text-emerald-500 font-mono font-medium">{formatCurrency(rule.amount)} <span className="text-xs text-muted">/ {rule.frequency}</span></p>
                            </div>
                            <button
                                onClick={() => handleDeleteAutomation(rule.id)}
                                className="text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 absolute top-2 right-2"
                                title="Delete Rule"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {automations.length === 0 && (
                        <div className="col-span-full py-8 text-center text-muted border border-dashed border-[var(--color-border)] rounded-2xl">
                            No active automations
                        </div>
                    )}
                </div>
            </div>

            {/* Transactions Section */}
            <div className="max-w-md mx-auto mb-8">
                <DistributionChart
                    title="Income Sources - Complete History"
                    data={(() => {
                        const categoryTotals = new Map<string, number>();
                        records.forEach((r: any) => {
                            const cat = r.category || 'Other';
                            categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + r.amount);
                        });
                        return Array.from(categoryTotals.entries()).map(([category, amount]) => ({ category, amount }));
                    })()}
                    colors={['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']}
                />
            </div>

            <div className="glass-panel p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-2xl font-bold font-display">Recent Transactions</h3>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex items-center bg-[var(--bg-tertiary)] rounded-xl px-4 py-2 flex-1 md:flex-none">
                            <Filter size={18} className="mr-2 text-muted" />
                            <select
                                className="bg-transparent border-none p-0 text-sm focus:ring-0 cursor-pointer w-full focus:outline-none text-[var(--color-text-primary)] [&>option]:bg-[var(--bg-tertiary)] [&>option]:text-[var(--color-text-primary)]"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">All Records</option>
                                <option value="salary">Salary Only</option>
                                <option value="high">High Value (&gt;1000)</option>
                                <option value="category">By Category</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn-primary"
                        >
                            <Plus size={20} className="mr-2" /> Add Income
                        </button>
                    </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
                    <TransactionTable
                        data={filteredRecords}
                        type="income"
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
                type="income"
            />

            <EditTransactionModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingRecord(null);
                }}
                onUpdate={handleUpdate}
                transaction={editingRecord}
                type="income"
            />

            <AddAutomationModal
                isOpen={isAutoModalOpen}
                onClose={() => setIsAutoModalOpen(false)}
                onAdd={handleAddAutomation}
                type="income"
                title="Add Salary Automation"
            />
        </div>
    );
}
