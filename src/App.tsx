import React, { useState } from 'react'
import { Navbar } from './components/Navbar'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Income } from './pages/Income'
import { Expenses } from './pages/Expenses'
import { Investments } from './pages/Investments'
import { Goals } from './pages/Goals'
import { SettingsPage } from './pages/Settings'
import { SettingsProvider } from './context/SettingsContext'
import { ThemeProvider } from './context/ThemeContext'

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <ThemeProvider>
            <SettingsProvider>
                <Layout
                    navbar={<Navbar activeTab={activeTab} setActiveTab={setActiveTab} />}
                >
                    {activeTab === 'dashboard' && <Dashboard />}
                    {activeTab === 'income' && <Income />}
                    {activeTab === 'expenses' && <Expenses />}
                    {activeTab === 'investments' && <Investments />}
                    {activeTab === 'goals' && <Goals />}
                    {activeTab === 'settings' && <SettingsPage />}
                </Layout>
            </SettingsProvider>
        </ThemeProvider>
    )
}

export default App
