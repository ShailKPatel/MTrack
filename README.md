# MTrack - Personal Finance Tracking

MTrack is a minimalistic, modern, and powerful personal finance application designed for users who want complete control and privacy over their financial data. Built as a cross-platform desktop app, MTrack ensures all your sensitive data stays on your local machine.

## Key Features

- **Consolidated Dashboard**: View monthly performance vs. lifetime history at a glance.
- **Multi-Currency Support**: Over 180 world currencies with automatic locale formatting.
- **Automated Tracking**: Configure SIPs, EMIs, and salary rules to automate recurring entries.
- **Goal Management**: Set financial goals, allocate funds from your liquid cash, and track progress until purchase.
- **Deep Historical Analysis**: Visual breakdowns of income sources, expenses, and investments over time.
- **Data Sovereignty**: All data is stored locally in CSV/JSON formats in your Documents folder. No cloud required.
- **Premium Aesthetics**: Dynamic glassmorphism UI with full Dark Mode support.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Visuals**: Chart.js (via react-chartjs-2)
- **Icons**: Lucide React
- **Backend/Desktop Shell**: Electron (with Node.js inter-process communication)
- **State Management**: React Context API
- **Utilities**: date-fns, uuid, Intl API for currency formatting

## Developer Setup

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Recommended: LTS version)
- npm (Comes with Node.js)

### 2. Installation
Clone the repository and install the dependencies:
```bash
# Install dependencies
npm install
```

### 3. Running in Development
To launch the application in development mode:
```bash
npm run dev
```

### 4. Building for Production (.exe)
To package the app into a standalone Windows executable:
1. Open your terminal (Run as **Administrator** recommended for a smooth build process).
2. Run the build command:
```bash
npm run build
```
This command will:
- Compile TypeScript code.
- Build the Vite frontend assets.
- Use `electron-builder` to package the app into a `.exe` installer.

The final installer will be located in the `dist` directory.

## Data Storage
MTrack stores your financial data in:
`C:\Users\<YourUsername>\Documents\MTrack\`

Files include:
- `income.csv`: All income records.
- `expenses.csv`: All expense records.
- `investments.csv`: All investment records.
- `automation.json`: Recurring rules and SIPs.
- `goals.json`: Financial targets and allocations.
- `settings.json`: Personal preferences (currency, theme).

## License
This project is licensed under the MIT License. Feel free to use, modify, and share.

---
*Created by Shail K Patel*
