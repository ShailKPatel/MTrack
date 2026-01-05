import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import os from 'node:os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname, '../public')

let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        frame: true, // We will use standard frame but style it nicely or use false if we implement custom titlebar
        backgroundColor: '#000000', // Black background for startup
        icon: path.join(process.env.VITE_PUBLIC || '', 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    })

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(process.env.DIST || '', 'index.html'))
    }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

import { DataManager } from './dataManager';
import { SettingsManager } from './settingsManager';
import { AutomationManager } from './automationManager';
import { GoalsManager } from './goalsManager';

let dataManager: DataManager;
let settingsManager: SettingsManager;
let automationManager: AutomationManager;
let goalsManager: GoalsManager;

app.whenReady().then(async () => {
    const docsPath = path.join(app.getPath('documents'), 'MTrack');

    dataManager = new DataManager(docsPath);
    settingsManager = new SettingsManager(docsPath);
    automationManager = new AutomationManager(docsPath, dataManager);
    goalsManager = new GoalsManager(docsPath);

    await Promise.all([
        dataManager.init(),
        settingsManager.init(),
        automationManager.init(),
        goalsManager.init()
    ]);

    // Run Automation Check on Startup
    await automationManager.runAutomation();

    createWindow()
    handleIpc()
})

function handleIpc() {
    ipcMain.handle('get-documents-path', () => {
        return path.join(app.getPath('documents'), 'MTrack');
    });

    ipcMain.handle('open-external', async (_event, url) => {
        await shell.openExternal(url);
    });

    ipcMain.handle('get-records', async (_event, type) => {
        return await dataManager.readRecords(type);
    });

    ipcMain.handle('add-record', async (_event, { type, record }) => {
        return await dataManager.addRecord(type, record);
    });

    // Settings IPC
    ipcMain.handle('get-settings', () => settingsManager.get());
    ipcMain.handle('update-settings', async (_event, newSettings) => {
        return await settingsManager.update(newSettings);
    });

    // Automation IPC
    ipcMain.handle('get-automation-rules', () => automationManager.getRules());
    ipcMain.handle('add-automation-rule', async (_event, rule) => {
        return await automationManager.addRule(rule);
    });
    ipcMain.handle('delete-automation-rule', async (_event, id) => {
        return await automationManager.deleteRule(id);
    });
    ipcMain.handle('update-automation-rule', async (_event, rule) => {
        return await automationManager.updateRule(rule);
    });

    // Goals IPC
    ipcMain.handle('get-goals', () => goalsManager.getGoals());
    ipcMain.handle('add-goal', async (_event, goalData) => {
        return await goalsManager.addGoal(goalData);
    });
    ipcMain.handle('update-goal', async (_event, { id, updates }) => {
        return await goalsManager.updateGoal(id, updates);
    });
    ipcMain.handle('delete-goal', async (_event, id) => {
        return await goalsManager.deleteGoal(id);
    });
    ipcMain.handle('allocate-to-goal', async (_event, { goalId, amount }) => {
        return await goalsManager.allocateFunds(goalId, amount);
    });
    ipcMain.handle('get-total-allocated', () => goalsManager.getTotalAllocated());

    ipcMain.handle('complete-goal-purchase', async (_event, goalId) => {
        const goal = await goalsManager.completeGoalPurchase(goalId);
        if (goal) {
            // Create expense record
            await dataManager.addRecord('expense', {
                date: new Date().toISOString(),
                amount: goal.targetAmount,
                category: 'Goal',
                description: `Purchase: ${goal.name}`,
                type: 'expense'
            });
            return true;
        }
        return false;
    });

    // Record Management IPC
    ipcMain.handle('delete-record', async (_event, { type, id }) => {
        return await dataManager.deleteRecord(type, id);
    });
    ipcMain.handle('update-record', async (_event, { type, record }) => {
        return await dataManager.updateRecord(type, record);
    });

    // Data Management IPC
    const { dialog } = require('electron');

    ipcMain.handle('export-data', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
            title: 'Select Export Destination'
        });
        if (canceled || filePaths.length === 0) return false;

        const destDir = filePaths[0];
        const files = ['income.csv', 'expenses.csv', 'investments.csv', 'automation.json', 'settings.json'];

        try {
            for (const file of files) {
                const srcPath = path.join(app.getPath('documents'), 'MTrack', file);
                const destPath = path.join(destDir, file);
                try {
                    await fs.copyFile(srcPath, destPath);
                } catch {
                    // Ignore missing files
                }
            }
            return true;
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    });

    ipcMain.handle('import-data', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openDirectory'],
            title: 'Select Folder with MTrack Data'
        });
        if (canceled || filePaths.length === 0) return false;

        const srcDir = filePaths[0];
        const requiredFiles = ['income.csv', 'expenses.csv', 'investments.csv'];

        // Validation: Check if at least one core file exists
        let hasData = false;
        for (const file of requiredFiles) {
            try {
                await fs.access(path.join(srcDir, file));
                hasData = true;
            } catch { }
        }

        if (!hasData) {
            throw new Error('No valid MTrack data found in selected folder.');
        }

        // ACID Import: Copy to temp, then swap? 
        // For simplicity: We will backup current data first, then copy new.
        // Actually, we can just copy over. If it fails mid-way, user has backup in the source folder.
        // But to protect *current* app state, we should probably clear it first?
        // Let's just Overwrite.

        const filesToImport = ['income.csv', 'expenses.csv', 'investments.csv', 'automation.json', 'settings.json'];
        const targetDir = path.join(app.getPath('documents'), 'MTrack');

        for (const file of filesToImport) {
            try {
                const srcPath = path.join(srcDir, file);
                await fs.copyFile(srcPath, path.join(targetDir, file));
            } catch (e) {
                // If source doesn't have it, we keep ours? Or delete ours? 
                // Likely keep ours if not present in import, OR ignore.
            }
        }

        // Reload managers
        await Promise.all([
            dataManager.init(),
            settingsManager.init(),
            automationManager.init()
        ]);

        // Refresh UI
        win?.webContents.reload();
        return true;
    });
}
