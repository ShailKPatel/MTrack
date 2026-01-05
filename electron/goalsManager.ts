import fs from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    deadline: string; // ISO date
    allocatedAmount: number;
    createdDate: string;
    status: 'active' | 'completed';
}

interface GoalsState {
    goals: Goal[];
}

export class GoalsManager {
    private path: string;
    private state: GoalsState;

    constructor(userDataPath: string) {
        this.path = path.join(userDataPath, 'goals.json');
        this.state = { goals: [] };
    }

    async init() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            this.state = JSON.parse(data);
        } catch {
            // File doesn't exist, initialize with empty state
            await this.save();
        }
    }

    async getGoals(): Promise<Goal[]> {
        return this.state.goals;
    }

    async addGoal(goalData: Omit<Goal, 'id' | 'allocatedAmount' | 'createdDate' | 'status'>): Promise<Goal> {
        const newGoal: Goal = {
            ...goalData,
            id: uuidv4(),
            allocatedAmount: 0,
            createdDate: new Date().toISOString(),
            status: 'active'
        };

        this.state.goals.push(newGoal);
        await this.save();
        return newGoal;
    }

    async allocateFunds(goalId: string, amount: number): Promise<void> {
        const goal = this.state.goals.find(g => g.id === goalId);
        if (goal) {
            goal.allocatedAmount = Math.max(0, goal.allocatedAmount + amount);
            await this.save();
        }
    }

    async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | null> {
        const goal = this.state.goals.find(g => g.id === id);
        if (!goal) return null;

        Object.assign(goal, updates);
        await this.save();
        return goal;
    }

    async deleteGoal(id: string): Promise<void> {
        this.state.goals = this.state.goals.filter(g => g.id !== id);
        await this.save();
    }

    async getTotalAllocated(): Promise<number> {
        return this.state.goals.reduce((sum, goal) => sum + goal.allocatedAmount, 0);
    }

    async completeGoalPurchase(id: string): Promise<Goal | null> {
        const goal = this.state.goals.find(g => g.id === id);
        if (!goal) return null;

        goal.status = 'completed';
        await this.save();
        return goal;
    }

    private async save() {
        const tempPath = `${this.path}.tmp`;
        await fs.writeFile(tempPath, JSON.stringify(this.state, null, 2), 'utf-8');
        await fs.rename(tempPath, this.path);
    }
}
