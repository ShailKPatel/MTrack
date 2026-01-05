import fs from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface Transaction {
    id: string;
    date: string;
    amount: number;
    category: string;
    description: string;
    type: 'income' | 'expense' | 'investment';
    timestamp: string;
}

export interface Investment extends Transaction {
    investmentType: string; // e.g., 'Stock', 'Bond', 'Mutual Fund'
}

type RecordType = Transaction | Investment;

export class DataManager {
    private basePath: string;
    private files = {
        income: 'income.csv',
        expense: 'expenses.csv',
        investment: 'investments.csv',
    };

    constructor(userDocumentPath: string) {
        this.basePath = userDocumentPath;
    }

    async init() {
        // Ensure directory exists
        try {
            await fs.access(this.basePath);
        } catch {
            await fs.mkdir(this.basePath, { recursive: true });
        }

        // Initialize files if they don't exist
        await this.ensureFile(this.files.income, ['id', 'date', 'amount', 'category', 'description', 'type', 'timestamp']);
        await this.ensureFile(this.files.expense, ['id', 'date', 'amount', 'category', 'description', 'type', 'timestamp']);
        await this.ensureFile(this.files.investment, ['id', 'date', 'amount', 'category', 'description', 'type', 'timestamp', 'investmentType']);
    }

    private async ensureFile(filename: string, headers: string[]) {
        const filePath = path.join(this.basePath, filename);
        try {
            await fs.access(filePath, constants.F_OK);
        } catch {
            const content = stringify([headers]);
            await fs.writeFile(filePath, content, 'utf-8');
        }
    }

    async readRecords(type: 'income' | 'expense' | 'investment'): Promise<RecordType[]> {
        const filePath = path.join(this.basePath, this.files[type]);
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const records = parse(content, {
                columns: true,
                skip_empty_lines: true,
                cast: (value, context) => {
                    if (context.column === 'amount') return parseFloat(value);
                    return value;
                }
            });
            return records;
        } catch (error) {
            console.error(`Error reading ${type}:`, error);
            return [];
        }
    }

    async addRecord(type: 'income' | 'expense' | 'investment', record: Omit<RecordType, 'id' | 'timestamp'>): Promise<RecordType> {
        const newRecord = {
            ...record,
            id: uuidv4(),
            timestamp: new Date().toISOString(),
        } as RecordType;

        const filePath = path.join(this.basePath, this.files[type]);

        // Atomic Write: Read, Append, Write to temp, Rename
        // Note: For simplicity and performance in a single-user desktop app, 
        // we use a read-modify-write approach. 
        // Ideally, we would use a proper file lock, but JS single-threaded main process gives us decent safety if we don't await during the critical section wildly.
        // However, csv-stringify allows appending.
        // For Atomicity (ACID-like): Write to generic .tmp file then rename.

        const currentRecords = await this.readRecords(type);
        currentRecords.push(newRecord);

        const csvContent = stringify(currentRecords, { header: true });
        const tempPath = `${filePath}.tmp`;

        await fs.writeFile(tempPath, csvContent, 'utf-8');
        await fs.rename(tempPath, filePath);

        return newRecord;
    }
    async updateRecord(type: 'income' | 'expense' | 'investment', updatedRecord: RecordType): Promise<void> {
        const currentRecords = await this.readRecords(type);
        const index = currentRecords.findIndex(r => r.id === updatedRecord.id);

        if (index !== -1) {
            currentRecords[index] = { ...currentRecords[index], ...updatedRecord };
            const filePath = path.join(this.basePath, this.files[type]);
            const csvContent = stringify(currentRecords, { header: true });
            const tempPath = `${filePath}.tmp`;

            await fs.writeFile(tempPath, csvContent, 'utf-8');
            await fs.rename(tempPath, filePath);
        }
    }

    async deleteRecord(type: 'income' | 'expense' | 'investment', id: string): Promise<void> {
        const currentRecords = await this.readRecords(type);
        const newRecords = currentRecords.filter(r => r.id !== id);

        const filePath = path.join(this.basePath, this.files[type]);
        const csvContent = stringify(newRecords, { header: true });
        const tempPath = `${filePath}.tmp`;

        await fs.writeFile(tempPath, csvContent, 'utf-8');
        await fs.rename(tempPath, filePath);
    }
}
