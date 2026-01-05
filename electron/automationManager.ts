import fs from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { DataManager, Transaction } from './dataManager';
import { AppSettings } from './settingsManager';

export interface AutomationRule {
    id: string;
    name: string;
    type: 'income' | 'expense' | 'investment';
    amount: number;
    frequency: 'monthly' | 'quarterly' | 'yearly';
    dayOfMonth: number; // 1-28
    category: string;
    description: string;
    startDate: string; // ISO Date
    expiryDate?: string; // ISO Date, optional
    lastRunDate?: string; // ISO Date
    isActive: boolean;
}

interface AutomationState {
    rules: AutomationRule[];
}

export class AutomationManager {
    private path: string;
    private state: AutomationState = { rules: [] };
    private dataManager: DataManager;

    constructor(userDataPath: string, dataManager: DataManager) {
        this.path = path.join(userDataPath, 'automation.json');
        this.dataManager = dataManager;
    }

    async init() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            this.state = JSON.parse(data);
        } catch {
            await this.save();
        }
    }

    async getRules() {
        return this.state.rules;
    }

    async addRule(rule: Omit<AutomationRule, 'id' | 'lastRunDate' | 'isActive'>) {
        const newRule: AutomationRule = {
            ...rule,
            id: uuidv4(),
            isActive: true,
            lastRunDate: new Date().toISOString() // Assume created "now", so run next cycle? Or should run immediately if date passed? 
            // Let's set lastRunDate to "yesterday" so if it's today it runs? 
            // User likely wants "Salary on 1st". If today is 5th, and they set 1st, should it run for this month? 
            // Let's assume startDate handles the "when to start".
        };
        this.state.rules.push(newRule);
        await this.save();
        return newRule;
    }

    async deleteRule(id: string) {
        this.state.rules = this.state.rules.filter(r => r.id !== id);
        await this.save();
    }

    async updateRule(updatedRule: AutomationRule) {
        const index = this.state.rules.findIndex(r => r.id === updatedRule.id);
        if (index !== -1) {
            this.state.rules[index] = updatedRule;
            await this.save();
        }
    }

    private async save() {
        // Atomic Write
        const tempPath = `${this.path}.tmp`;
        await fs.writeFile(tempPath, JSON.stringify(this.state, null, 2));
        await fs.rename(tempPath, this.path);
    }

    async runAutomation() {
        const now = new Date();
        // const today = now.toISOString().split('T')[0];
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentDay = now.getDate();

        let processedCount = 0;

        for (const rule of this.state.rules) {
            if (!rule.isActive) continue;

            // Check Expiry
            if (rule.expiryDate) {
                const expiry = new Date(rule.expiryDate);
                if (now > expiry) {
                    rule.isActive = false; // Auto-deactivate
                    continue;
                }
            }

            // Check Logic: Has it run this month/period?
            const lastRun = rule.lastRunDate ? new Date(rule.lastRunDate) : new Date(rule.startDate);
            // specific logic needed here. 
            // Simple Monthly Logic:
            // If today >= rule.dayOfMonth AND (lastRunMonth < currentMonth OR lastRunYear < currentYear)

            let shouldRun = false;

            if (rule.frequency === 'monthly') {
                const lastRunMonthId = lastRun.getFullYear() * 12 + lastRun.getMonth();
                const currentMonthId = currentYear * 12 + currentMonth;

                // If we haven't run this month yet, and today is on or after the dayOfMonth
                if (currentMonthId > lastRunMonthId && currentDay >= rule.dayOfMonth) {
                    shouldRun = true;
                }
            }
            // Add Quarterly/Yearly logic if needed

            if (shouldRun) {
                // Create Transaction
                const transaction = {
                    amount: rule.amount,
                    category: rule.category,
                    description: `Automated: ${rule.description}`,
                    date: now.toISOString().split('T')[0],
                    type: rule.type,
                    // For investments, we might need investmentType. For now, put in extra?
                    // Extending DataManager.addRecord to accept extra props would be good.
                } as any;

                if (rule.type === 'investment') {
                    transaction.investmentType = 'SIP/Automated';
                }

                // ACID-ish: We add record, then update rule. 
                // Ideally we batch these. 
                // DataManager is atomic per file. 
                await this.dataManager.addRecord(rule.type, transaction);

                rule.lastRunDate = now.toISOString();
                processedCount++;
            }
        }

        if (processedCount > 0) {
            await this.save();
        }

        return processedCount;
    }
}
