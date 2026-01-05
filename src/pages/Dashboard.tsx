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
    const [chartData, setChartData] = useState<any>(null);
    const [cashFlowData, setCashFlowData] = useState<any>(null);
    const [income, setIncome] = useState<any[]>([]);
    const [expense, setExpense] = useState<any[]>([]);
    const [investment, setInvestment] = useState<any[]>([]);
    const [automations, setAutomations] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, [theme]);

    const loadData = async () => {
        const [incomeData, expenseData, investmentData, rules] = await Promise.all([
            window.ipcRenderer.invoke('get-records', 'income'),
            window.ipcRenderer.invoke('get-records', 'expense'),
            window.ipcRenderer.invoke('get-records', 'investment'),
            window.ipcRenderer.invoke('get-automation-rules')
        ]);

        setIncome(incomeData);
        setExpense(expenseData);
        setInvestment(investmentData);
        setAutomations(rules);

        const totalIncome = incomeData.reduce((sum: number, r: any) => sum + r.amount, 0);
        const totalExpense = expenseData.reduce((sum: number, r: any) => sum + r.amount, 0);
        const totalInvestment = investmentData.reduce((sum: number, r: any) => sum + r.amount, 0);

        setSummary({
            income: totalIncome,
            expense: totalExpense,
            investment: totalInvestment,
            balance: totalIncome - totalExpense - totalInvestment
        });

        // Chart configurations...
        // Use css variables for colors if possible, but ChartJS needs hex/rgba
        setChartData({
            labels: ['Expenses', 'Investments', 'Savings'],
            datasets: [
                {
                    data: [totalExpense, totalInvestment, Math.max(0, totalIncome - totalExpense - totalInvestment)],
                    backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'],
                    borderWidth: 0,
                },
            ],
        });

        setCashFlowData({
            labels: ['In', 'Out', 'Invested'],
            datasets: [{
                label: 'Cash Flow',
                data: [totalIncome, totalExpense, totalInvestment],
                backgroundColor: ['rgba(16, 185, 129, 0.6)', 'rgba(239, 68, 68, 0.6)', 'rgba(59, 130, 246, 0.6)'],
                borderRadius: 4,
            }]
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

            {/* Charts Section - Centered */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Cash Flow Chart */}
                <div className="glass-panel p-6 lg:col-span-2">
                    <h3 className="text-h3 mb-6 text-center">Cash Flow Analysis</h3>
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

                {/* Distribution Chart */}
                <div className="glass-panel p-6">
                    <h3 className="text-h3 mb-6 text-center">Distribution</h3>
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
                                <p className="text-muted text-xs uppercase tracking-widest">Savings</p>
                                <p className="text-xl font-bold text-emerald-500">
                                    {summary.income > 0 ? Math.round(((summary.income - summary.expense - summary.investment) / summary.income) * 100) : 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
                <DistributionChart
                    title="Income Sources"
                    data={(() => {
                        const categoryTotals = new Map<string, number>();
                        income.forEach((r: any) => {
                            const cat = r.category || 'Other';
                            categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + r.amount);
                        });
                        return Array.from(categoryTotals.entries()).map(([category, amount]) => ({ category, amount }));
                    })()}
                    colors={['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']}
                />

                <DistributionChart
                    title="Expense Breakdown"
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

                <DistributionChart
                    title="Investment Distribution"
                    data={(() => {
                        const categoryTotals = new Map<string, number>();
                        investment.forEach((r: any) => {
                            const cat = r.category || 'Other';
                            categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + r.amount);
                        });
                        return Array.from(categoryTotals.entries()).map(([category, amount]) => ({ category, amount }));
                    })()}
                    colors={['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']}
                />
            </div>

            {/* Automation Breakdown Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto px-4">
                {/* Monthly Recurring Income */}
                <div className="glass-panel p-6">
                    <h3 className="text-xl font-bold mb-4">Monthly Recurring Income</h3>
                    <div className="space-y-2">
                        {automations.filter((r: any) => r.type === 'income' && r.frequency === 'monthly').length > 0 ? (
                            automations.filter((r: any) => r.type === 'income' && r.frequency === 'monthly').map((rule: any) => (
                                <div key={rule.id} className="flex justify-between items-center p-3 bg-[var(--bg-tertiary)] rounded-lg">
                                    <span className="font-medium">{rule.name}</span>
                                    <span className="text-green-500 font-bold">{formatCurrency(rule.amount)}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted text-center py-4">No monthly recurring income</p>
                        )}
                    </div>
                </div>

                {/* Monthly EMIs/Subscriptions */}
                <div className="glass-panel p-6">
                    <h3 className="text-xl font-bold mb-4">Monthly EMIs & Subscriptions</h3>
                    <div className="space-y-2">
                        {automations.filter((r: any) => r.type === 'expense' && r.frequency === 'monthly').length > 0 ? (
                            automations.filter((r: any) => r.type === 'expense' && r.frequency === 'monthly').map((rule: any) => (
                                <div key={rule.id} className="flex justify-between items-center p-3 bg-[var(--bg-tertiary)] rounded-lg">
                                    <span className="font-medium">{rule.name}</span>
                                    <span className="text-red-500 font-bold">{formatCurrency(rule.amount)}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted text-center py-4">No monthly EMIs or subscriptions</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
