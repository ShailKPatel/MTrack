import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { DistributionChart } from '../components/DistributionChart';
import clsx from 'clsx';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

export function Dashboard() {
    const { formatCurrency } = useSettings();
    const { theme } = useTheme();
    const [summary, setSummary] = useState({ income: 0, expense: 0, investment: 0, balance: 0 });
    const [monthlySummary, setMonthlySummary] = useState({ income: 0, expense: 0, investment: 0 });
    const [chartData, setChartData] = useState<any>(null);
    const [cashFlowData, setCashFlowData] = useState<any>(null);
    const [historyData, setHistoryData] = useState<any>(null);
    const [income, setIncome] = useState<any[]>([]);
    const [expense, setExpense] = useState<any[]>([]);
    const [investment, setInvestment] = useState<any[]>([]);
    const [automations, setAutomations] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, [theme]);

    const isCurrentMonth = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    };

    const loadData = async () => {
        const [incomeData, expenseData, investmentData, rules, goalsAllocated] = await Promise.all([
            window.ipcRenderer.invoke('get-records', 'income'),
            window.ipcRenderer.invoke('get-records', 'expense'),
            window.ipcRenderer.invoke('get-records', 'investment'),
            window.ipcRenderer.invoke('get-automation-rules'),
            window.ipcRenderer.invoke('get-total-allocated')
        ]);

        setIncome(incomeData);
        setExpense(expenseData);
        setInvestment(investmentData);
        setAutomations(rules);

        const currentMonthIncome = incomeData.filter((r: any) => isCurrentMonth(r.date));
        const currentMonthExpense = expenseData.filter((r: any) => isCurrentMonth(r.date));
        const currentMonthInvestment = investmentData.filter((r: any) => isCurrentMonth(r.date));

        const totalIncome = incomeData.reduce((sum: number, r: any) => sum + r.amount, 0);
        const totalExpense = expenseData.reduce((sum: number, r: any) => sum + r.amount, 0);
        const totalInvestment = investmentData.reduce((sum: number, r: any) => sum + r.amount, 0);

        const mIncome = currentMonthIncome.reduce((sum: number, r: any) => sum + r.amount, 0);
        const mExpense = currentMonthExpense.reduce((sum: number, r: any) => sum + r.amount, 0);
        const mInvestment = currentMonthInvestment.reduce((sum: number, r: any) => sum + r.amount, 0);

        setSummary({
            income: totalIncome,
            expense: totalExpense,
            investment: totalInvestment,
            balance: totalIncome - totalExpense - totalInvestment
        });

        setMonthlySummary({
            income: mIncome,
            expense: mExpense,
            investment: mInvestment
        });

        // Monthly Distribution (Doughnut)
        setChartData({
            labels: ['Expenses', 'Investments', 'Savings'],
            datasets: [
                {
                    data: [mExpense, mInvestment, Math.max(0, mIncome - mExpense - mInvestment)],
                    backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'],
                    borderWidth: 0,
                },
            ],
        });

        // Monthly Cash Flow (Bar)
        setCashFlowData({
            labels: ['In', 'Out', 'Invested'],
            datasets: [{
                label: 'Monthly Cash Flow',
                data: [mIncome, mExpense, mInvestment],
                backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(239, 68, 68, 0.6)', 'rgba(59, 130, 246, 0.6)'],
                borderRadius: 4,
            }]
        });

        // Historical Data (Last 12 Months)
        const last12Months = Array.from({ length: 12 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (11 - i));
            return {
                month: d.toLocaleString('default', { month: 'short' }),
                year: d.getFullYear(),
                index: d.getMonth() + d.getFullYear() * 12
            };
        });

        const getMonthlyTotal = (data: any[], monthIdx: number) => {
            return data.filter((r: any) => {
                const rd = new Date(r.date);
                return (rd.getMonth() + rd.getFullYear() * 12) === monthIdx;
            }).reduce((sum: number, r: any) => sum + r.amount, 0);
        };

        setHistoryData({
            labels: last12Months.map(m => m.month),
            datasets: [
                {
                    label: 'Income',
                    data: last12Months.map(m => getMonthlyTotal(incomeData, m.index)),
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                },
                {
                    label: 'Expense',
                    data: last12Months.map(m => getMonthlyTotal(expenseData, m.index)),
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                },
                {
                    label: 'Investment',
                    data: last12Months.map(m => getMonthlyTotal(investmentData, m.index)),
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                }
            ]
        });
    };

    const cardClass = "glass-panel p-6 flex flex-col items-center justify-center text-center hover:scale-[1.02] transition-transform duration-300 min-h-[160px]";

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-10">
            {/* Centered Header */}
            <div className="text-center space-y-2">
                <h1 className="text-h1">Dashboard</h1>
                <p className="text-muted">Financial Overview</p>
            </div>

            {/* Summary Cards - Centered Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className={cardClass}>
                    <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
                        <Wallet size={28} />
                    </div>
                    <p className="text-muted text-sm font-medium mb-1">Total Balance</p>
                    <h3 className="text-h2 text-emerald-500">{formatCurrency(summary.balance)}</h3>
                </div>

                <div className={cardClass}>
                    <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 mb-3">
                        <ArrowDownRight size={28} />
                    </div>
                    <p className="text-muted text-sm font-medium mb-1">Income</p>
                    <h3 className="text-h2">{formatCurrency(summary.income)}</h3>
                </div>

                <div className={cardClass}>
                    <div className="p-3 rounded-full bg-red-500/10 text-red-500 mb-3">
                        <ArrowUpRight size={28} />
                    </div>
                    <p className="text-muted text-sm font-medium mb-1">Expenses</p>
                    <h3 className="text-h2">{formatCurrency(summary.expense)}</h3>
                </div>

                <div className={cardClass}>
                    <div className="p-3 rounded-full bg-purple-500/10 text-purple-500 mb-3">
                        <DollarSign size={28} />
                    </div>
                    <p className="text-muted text-sm font-medium mb-1">Investments</p>
                    <h3 className="text-h2">{formatCurrency(summary.investment)}</h3>
                </div>
            </div>

            {/* Monthly Overview Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold px-4 border-l-4 border-blue-500 ml-4">Monthly Overview</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
                    {/* Cash Flow Chart */}
                    <div className="glass-panel p-6 lg:col-span-2">
                        <h3 className="text-h3 mb-6 text-center">Monthly Cash Flow</h3>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            {cashFlowData && (
                                <Bar
                                    data={cashFlowData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            y: { grid: { color: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' } },
                                            x: { grid: { display: false } }
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Monthly Distribution Chart */}
                    <div className="glass-panel p-6">
                        <h3 className="text-h3 mb-6 text-center">Monthly Distribution</h3>
                        <div className="h-[300px] flex items-center justify-center relative">
                            {chartData && (
                                <Doughnut
                                    data={chartData}
                                    options={{
                                        cutout: '75%',
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
                                        },
                                        elements: { arc: { borderWidth: 0 } }
                                    }}
                                />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                                <div className="text-center">
                                    <p className="text-muted text-xs uppercase tracking-widest">Saved</p>
                                    <p className="text-xl font-bold text-emerald-500">
                                        {monthlySummary.income > 0 ? Math.round(((monthlySummary.income - monthlySummary.expense - monthlySummary.investment) / monthlySummary.income) * 100) : 0}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
                    {/* Monthly Expense Breakdown Pie */}
                    <div className="lg:col-span-1">
                        <DistributionChart
                            title="Monthly Expense Breakdown"
                            data={(() => {
                                const categoryTotals = new Map<string, number>();
                                expense.filter(r => isCurrentMonth(r.date)).forEach((r: any) => {
                                    const cat = r.category || 'Other';
                                    categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + r.amount);
                                });
                                return Array.from(categoryTotals.entries()).map(([category, amount]) => ({ category, amount }));
                            })()}
                            colors={['#EF4444', '#F59E0B', '#8B5CF6', '#3B82F6', '#10B981']}
                        />
                    </div>

                    {/* Monthly EMIs/Subscriptions Table */}
                    <div className="lg:col-span-2 glass-panel p-6">
                        <h3 className="text-xl font-bold mb-4">Active Monthly EMIs & Subscriptions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {automations.filter((r: any) => r.type === 'expense' && r.frequency === 'monthly').length > 0 ? (
                                automations.filter((r: any) => r.type === 'expense' && r.frequency === 'monthly').map((rule: any) => (
                                    <div key={rule.id} className="flex justify-between items-center p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--color-border)]">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{rule.name}</span>
                                            <span className="text-xs text-muted uppercase">Recurring</span>
                                        </div>
                                        <span className="text-red-500 font-bold">{formatCurrency(rule.amount)}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted text-center py-4 col-span-full">No monthly EMIs or subscriptions</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Historical Analysis Section */}
            <div className="space-y-6 pt-10 border-t border-[var(--color-border)]">
                <h2 className="text-2xl font-bold px-4 border-l-4 border-purple-500 ml-4">Historical Analysis</h2>

                <div className="max-w-7xl mx-auto px-4 space-y-8">
                    {/* 12 Month Trend Chart */}
                    <div className="glass-panel p-8">
                        <h3 className="text-xl font-bold mb-8 text-center">Last 12 Months Performance</h3>
                        <div className="h-[400px]">
                            {historyData && (
                                <Bar
                                    data={historyData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: { color: 'rgba(255,255,255,0.05)' }
                                            },
                                            x: { grid: { display: false } }
                                        },
                                        plugins: {
                                            legend: { position: 'top' as const }
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* All-time Expense Breakdown Pie */}
                        <DistributionChart
                            title="All-Time Expense Breakdown"
                            data={(() => {
                                const categoryTotals = new Map<string, number>();
                                expense.forEach((r: any) => {
                                    const cat = r.category || 'Other';
                                    categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + r.amount);
                                });
                                return Array.from(categoryTotals.entries()).map(([category, amount]) => ({ category, amount }));
                            })()}
                            colors={['#EF4444', '#F59E0B', '#8B5CF6', '#3B82F6', '#10B981']}
                        />

                        {/* All-time Cash flow Summary */}
                        <div className="glass-panel p-6 flex flex-col items-center justify-center space-y-6">
                            <h3 className="text-xl font-bold text-center">Lifetime Financial Summary</h3>
                            <div className="w-full space-y-4">
                                <div className="flex justify-between items-center p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                    <span className="text-muted">Total Income</span>
                                    <span className="text-xl font-bold text-emerald-500">{formatCurrency(summary.income)}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                                    <span className="text-muted">Total Expenses</span>
                                    <span className="text-xl font-bold text-red-500">{formatCurrency(summary.expense)}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                    <span className="text-muted">Total Investments</span>
                                    <span className="text-xl font-bold text-blue-500">{formatCurrency(summary.investment)}</span>
                                </div>
                                <div className="pt-4 border-t border-[var(--color-border)] flex justify-between items-center px-4">
                                    <span className="font-bold">Net Worth</span>
                                    <span className="text-2xl font-black text-emerald-500">{formatCurrency(summary.balance)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
