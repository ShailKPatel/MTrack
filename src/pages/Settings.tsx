import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Download, Upload } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface AutomationRule {
    id: string;
    name: string;
    type: string;
    amount: number;
    frequency: string;
    dayOfMonth: number;
    isActive: boolean;
}

export function SettingsPage() {
    const { settings, updateSettings } = useSettings();
    const [rules, setRules] = useState<AutomationRule[]>([]);

    // Form State for New Rule
    const [newRule, setNewRule] = useState({
        name: '', type: 'expense', amount: '', frequency: 'monthly', dayOfMonth: '1', category: '', description: ''
    });

    useEffect(() => {
        loadRules();
    }, []);

    const loadRules = async () => {
        const data = await window.ipcRenderer.invoke('get-automation-rules');
        setRules(data);
    };

    const handleSaveCurrency = (currency: string) => {
        const localeMap: Record<string, string> = {
            'USD': 'en-US',
            'INR': 'en-IN',
            'EUR': 'de-DE',
            'GBP': 'en-GB',
            'AUD': 'en-AU',
            'CAD': 'en-CA',
            'JPY': 'ja-JP',
            'CNY': 'zh-CN',
            'CHF': 'de-CH',
            'NZD': 'en-NZ',
            'SGD': 'en-SG',
            'HKD': 'zh-HK',
            'KRW': 'ko-KR',
            'BRL': 'pt-BR',
            'MXN': 'es-MX',
        };

        const locale = localeMap[currency] || 'en-US';
        updateSettings({ currency, currencyLocale: locale });
    };

    const handleAddRule = async () => {
        if (!newRule.name || !newRule.amount) return;

        await window.ipcRenderer.invoke('add-automation-rule', {
            ...newRule,
            amount: parseFloat(newRule.amount),
            dayOfMonth: parseInt(newRule.dayOfMonth),
            startDate: new Date().toISOString()
        });

        setNewRule({ name: '', type: 'expense', amount: '', frequency: 'monthly', dayOfMonth: '1', category: '', description: '' });
        loadRules();
    };

    const handleDeleteRule = async (id: string) => {
        await window.ipcRenderer.invoke('delete-automation-rule', id);
        loadRules();
    };

    return (
        <div className="p-8 max-w-4xl">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-gray-400">Manage currency, automation, and data.</p>
            </header>

            {/* Currency Section */}
            <section className="bg-[#0d0d0d] rounded-xl border border-[#1a1a1a] p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">General</h2>
                <div className="flex gap-4">
                    <div className="w-1/3">
                        <label className="block text-xs text-gray-500 uppercase font-semibold mb-2">Currency</label>
                        <select
                            value={settings.currency}
                            onChange={(e) => handleSaveCurrency(e.target.value)}
                            className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-white focus:border-white transition-colors"
                        >
                            <option value="USD">USD ($)</option>
                            <option value="INR">INR (₹)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="AUD">AUD (A$)</option>
                            <option value="CAD">CAD (C$)</option>
                            <option value="JPY">JPY (¥)</option>
                            <option value="CNY">CNY (¥)</option>
                            <option value="CHF">CHF (Fr)</option>
                            <option value="NZD">NZD (NZ$)</option>
                            <option value="SGD">SGD (S$)</option>
                            <option value="HKD">HKD (HK$)</option>
                            <option value="KRW">KRW (₩)</option>
                            <option value="BRL">BRL (R$)</option>
                            <option value="MXN">MXN (Mex$)</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Automation Section */}
            <section className="bg-[#0d0d0d] rounded-xl border border-[#1a1a1a] p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Automation Rules (SIPs, EMIs, Salary)</h2>

                {/* Add New Rule Form */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-[#111] rounded-lg border border-[#222]">
                    <input type="text" placeholder="Name (e.g. Salary, Rent)" value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })} className="bg-[#0d0d0d] text-white p-2 rounded border border-[#333]" />
                    <select value={newRule.type} onChange={e => setNewRule({ ...newRule, type: e.target.value })} className="bg-[#0d0d0d] text-white p-2 rounded border border-[#333]">
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                        <option value="investment">Investment</option>
                    </select>
                    <input type="number" placeholder="Amount" value={newRule.amount} onChange={e => setNewRule({ ...newRule, amount: e.target.value })} className="bg-[#0d0d0d] text-white p-2 rounded border border-[#333]" />

                    <div className="flex gap-2">
                        <select value={newRule.frequency} onChange={e => setNewRule({ ...newRule, frequency: e.target.value })} className="bg-[#0d0d0d] text-white p-2 rounded border border-[#333] flex-1">
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                        </select>

                        <input type="number" placeholder="Day" min="1" max="28" value={newRule.dayOfMonth} onChange={e => setNewRule({ ...newRule, dayOfMonth: e.target.value })} className="bg-[#0d0d0d] text-white p-2 rounded border border-[#333] w-16" />

                        <button onClick={handleAddRule} className="bg-white text-black p-2 rounded hover:bg-gray-200">
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Rules List */}
                <div className="space-y-2">
                    {rules.map(rule => (
                        <div key={rule.id} className="flex justify-between items-center bg-[#111] p-3 rounded border border-[#222]">
                            <div className="flex gap-4 items-center">
                                <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${rule.type === 'income' ? 'bg-green-900 text-green-300' :
                                    rule.type === 'expense' ? 'bg-red-900 text-red-300' : 'bg-blue-900 text-blue-300'
                                    }`}>{rule.type}</span>
                                <span className="font-medium text-white">{rule.name}</span>
                                <span className="text-gray-400 text-sm">{rule.frequency} on Day {rule.dayOfMonth}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-white">{new Intl.NumberFormat(settings.currencyLocale, { style: 'currency', currency: settings.currency }).format(rule.amount)}</span>
                                <button onClick={() => handleDeleteRule(rule.id)} className="text-gray-500 hover:text-red-500">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {rules.length === 0 && <p className="text-gray-500 text-center py-4">No automation rules configured.</p>}
                </div>
            </section>

            {/* Data Management Section */}
            <section className="bg-[#0d0d0d] rounded-xl border border-[#1a1a1a] p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Data Management</h2>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#222] text-white rounded hover:bg-[#333] transition-colors border border-[#333]">
                        <Download size={18} /> Export Data (ZIP)
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#222] text-white rounded hover:bg-[#333] transition-colors border border-[#333]">
                        <Upload size={18} /> Import Data
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Export includes all CSV files and Settings. Import will overwrite current data.
                </p>
            </section>
        </div>
    );
}
