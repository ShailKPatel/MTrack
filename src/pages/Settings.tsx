import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Download, Upload, Github, Heart } from 'lucide-react';
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
            'AED': 'ar-AE', 'AFN': 'ps-AF', 'ALL': 'sq-AL', 'AMD': 'hy-AM', 'ANG': 'nl-AN',
            'AOA': 'pt-AO', 'ARS': 'es-AR', 'AUD': 'en-AU', 'AWG': 'nl-AW', 'AZN': 'az-AZ',
            'BAM': 'bs-BA', 'BBD': 'en-BB', 'BDT': 'bn-BD', 'BGN': 'bg-BG', 'BHD': 'ar-BH',
            'BIF': 'fr-BI', 'BMD': 'en-BM', 'BND': 'ms-BN', 'BOB': 'es-BO', 'BRL': 'pt-BR',
            'BSD': 'en-BS', 'BTN': 'dz-BT', 'BWP': 'en-BW', 'BYN': 'be-BY', 'BZD': 'en-BZ',
            'CAD': 'en-CA', 'CDF': 'fr-CD', 'CHF': 'de-CH', 'CLP': 'es-CL', 'CNY': 'zh-CN',
            'COP': 'es-CO', 'CRC': 'es-CR', 'CUP': 'es-CU', 'CVE': 'pt-CV', 'CZK': 'cs-CZ',
            'DJF': 'fr-DJ', 'DKK': 'da-DK', 'DOP': 'es-DO', 'DZD': 'ar-DZ', 'EGP': 'ar-EG',
            'ERN': 'ti-ER', 'ETB': 'am-ET', 'EUR': 'de-DE', 'FJD': 'en-FJ', 'FKP': 'en-FK',
            'GBP': 'en-GB', 'GEL': 'ka-GE', 'GHS': 'en-GH', 'GIP': 'en-GI', 'GMD': 'en-GM',
            'GNF': 'fr-GN', 'GTQ': 'es-GT', 'GYD': 'en-GY', 'HKD': 'zh-HK', 'HNL': 'es-HN',
            'HRK': 'hr-HR', 'HTG': 'fr-HT', 'HUF': 'hu-HU', 'IDR': 'id-ID', 'ILS': 'he-IL',
            'INR': 'en-IN', 'IQD': 'ar-IQ', 'IRR': 'fa-IR', 'ISK': 'is-IS', 'JMD': 'en-JM',
            'JOD': 'ar-JO', 'JPY': 'ja-JP', 'KES': 'sw-KE', 'KGS': 'ky-KG', 'KHR': 'km-KH',
            'KMF': 'ar-KM', 'KPW': 'ko-KP', 'KRW': 'ko-KR', 'KWD': 'ar-KW', 'KYD': 'en-KY',
            'KZT': 'kk-KZ', 'LAK': 'lo-LA', 'LBP': 'ar-LB', 'LKR': 'si-LK', 'LRD': 'en-LR',
            'LSL': 'en-LS', 'LYD': 'ar-LY', 'MAD': 'ar-MA', 'MDL': 'ro-MD', 'MGA': 'mg-MG',
            'MKD': 'mk-MK', 'MMK': 'my-MM', 'MNT': 'mn-MN', 'MOP': 'zh-MO', 'MRU': 'ar-MR',
            'MUR': 'en-MU', 'MVR': 'dv-MV', 'MWK': 'en-MW', 'MXN': 'es-MX', 'MYR': 'ms-MY',
            'MZN': 'pt-MZ', 'NAD': 'en-NA', 'NGN': 'en-NG', 'NIO': 'es-NI', 'NOK': 'nb-NO',
            'NPR': 'ne-NP', 'NZD': 'en-NZ', 'OMR': 'ar-OM', 'PAB': 'es-PA', 'PEN': 'es-PE',
            'PGK': 'en-PG', 'PHP': 'en-PH', 'PKR': 'ur-PK', 'PLN': 'pl-PL', 'PYG': 'es-PY',
            'QAR': 'ar-QA', 'RON': 'ro-RO', 'RSD': 'sr-RS', 'RUB': 'ru-RU', 'RWF': 'rw-RW',
            'SAR': 'ar-SA', 'SBD': 'en-SB', 'SCR': 'en-SC', 'SDG': 'ar-SD', 'SEK': 'sv-SE',
            'SGD': 'en-SG', 'SHP': 'en-SH', 'SLL': 'en-SL', 'SOS': 'so-SO', 'SRD': 'nl-SR',
            'SSP': 'en-SS', 'STN': 'pt-ST', 'SYP': 'ar-SY', 'SZL': 'en-SZ', 'THB': 'th-TH',
            'TJS': 'tg-TJ', 'TMT': 'tk-TM', 'TND': 'ar-TN', 'TOP': 'to-TO', 'TRY': 'tr-TR',
            'TTD': 'en-TT', 'TWD': 'zh-TW', 'TZS': 'sw-TZ', 'UAH': 'uk-UA', 'UGX': 'en-UG',
            'USD': 'en-US', 'UYU': 'es-UY', 'UZS': 'uz-UZ', 'VES': 'es-VE', 'VND': 'vi-VN',
            'VUV': 'bi-VU', 'WST': 'sm-WS', 'XAF': 'fr-CM', 'XCD': 'en-LC', 'XOF': 'fr-SN',
            'XPF': 'fr-PF', 'YER': 'ar-YE', 'ZAR': 'en-ZA', 'ZMW': 'en-ZM', 'ZWL': 'en-ZW'
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
                            <option value="AED">AED (د.إ)</option>
                            <option value="AFN">AFN (؋)</option>
                            <option value="ALL">ALL (L)</option>
                            <option value="AMD">AMD (֏)</option>
                            <option value="ANG">ANG (ƒ)</option>
                            <option value="AOA">AOA (Kz)</option>
                            <option value="ARS">ARS ($)</option>
                            <option value="AUD">AUD ($)</option>
                            <option value="AWG">AWG (ƒ)</option>
                            <option value="AZN">AZN (₼)</option>
                            <option value="BAM">BAM (KM)</option>
                            <option value="BBD">BBD ($)</option>
                            <option value="BDT">BDT (৳)</option>
                            <option value="BGN">BGN (лв)</option>
                            <option value="BHD">BHD (.د.ب)</option>
                            <option value="BIF">BIF (Fr)</option>
                            <option value="BMD">BMD ($)</option>
                            <option value="BND">BND ($)</option>
                            <option value="BOB">BOB (Bs.)</option>
                            <option value="BRL">BRL (R$)</option>
                            <option value="BSD">BSD ($)</option>
                            <option value="BTN">BTN (Nu.)</option>
                            <option value="BWP">BWP (P)</option>
                            <option value="BYN">BYN (Br)</option>
                            <option value="BZD">BZD ($)</option>
                            <option value="CAD">CAD ($)</option>
                            <option value="CDF">CDF (Fr)</option>
                            <option value="CHF">CHF (Fr)</option>
                            <option value="CLP">CLP ($)</option>
                            <option value="CNY">CNY (¥)</option>
                            <option value="COP">COP ($)</option>
                            <option value="CRC">CRC (₡)</option>
                            <option value="CUP">CUP ($)</option>
                            <option value="CVE">CVE (Esc)</option>
                            <option value="CZK">CZK (Kč)</option>
                            <option value="DJF">DJF (Fr)</option>
                            <option value="DKK">DKK (kr)</option>
                            <option value="DOP">DOP ($)</option>
                            <option value="DZD">DZD (د.ج)</option>
                            <option value="EGP">EGP (£)</option>
                            <option value="ERN">ERN (Nfk)</option>
                            <option value="ETB">ETB (Br)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="FJD">FJD ($)</option>
                            <option value="FKP">FKP (£)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="GEL">GEL (₾)</option>
                            <option value="GHS">GHS (₵)</option>
                            <option value="GIP">GIP (£)</option>
                            <option value="GMD">GMD (D)</option>
                            <option value="GNF">GNF (Fr)</option>
                            <option value="GTQ">GTQ (Q)</option>
                            <option value="GYD">GYD ($)</option>
                            <option value="HKD">HKD ($)</option>
                            <option value="HNL">HNL (L)</option>
                            <option value="HRK">HRK (kn)</option>
                            <option value="HTG">HTG (G)</option>
                            <option value="HUF">HUF (Ft)</option>
                            <option value="IDR">IDR (Rp)</option>
                            <option value="ILS">ILS (₪)</option>
                            <option value="INR">INR (₹)</option>
                            <option value="IQD">IQD (ع.د)</option>
                            <option value="IRR">IRR (﷼)</option>
                            <option value="ISK">ISK (kr)</option>
                            <option value="JMD">JMD ($)</option>
                            <option value="JOD">JOD (د.ا)</option>
                            <option value="JPY">JPY (¥)</option>
                            <option value="KES">KES (Sh)</option>
                            <option value="KGS">KGS (с)</option>
                            <option value="KHR">KHR (៛)</option>
                            <option value="KMF">KMF (Fr)</option>
                            <option value="KPW">KPW (₩)</option>
                            <option value="KRW">KRW (₩)</option>
                            <option value="KWD">KWD (د.ك)</option>
                            <option value="KYD">KYD ($)</option>
                            <option value="KZT">KZT (₸)</option>
                            <option value="LAK">LAK (₭)</option>
                            <option value="LBP">LBP (ل.ل)</option>
                            <option value="LKR">LKR (₨)</option>
                            <option value="LRD">LRD ($)</option>
                            <option value="LSL">LSL (L)</option>
                            <option value="LYD">LYD (ل.د)</option>
                            <option value="MAD">MAD (د.م.)</option>
                            <option value="MDL">MDL (L)</option>
                            <option value="MGA">MGA (Ar)</option>
                            <option value="MKD">MKD (ден)</option>
                            <option value="MMK">MMK (K)</option>
                            <option value="MNT">MNT (₮)</option>
                            <option value="MOP">MOP (P)</option>
                            <option value="MRU">MRU (UM)</option>
                            <option value="MUR">MUR (₨)</option>
                            <option value="MVR">MVR (ރ.)</option>
                            <option value="MWK">MWK (MK)</option>
                            <option value="MXN">MXN ($)</option>
                            <option value="MYR">MYR (RM)</option>
                            <option value="MZN">MZN (MT)</option>
                            <option value="NAD">NAD ($)</option>
                            <option value="NGN">NGN (₦)</option>
                            <option value="NIO">NIO (C$)</option>
                            <option value="NOK">NOK (kr)</option>
                            <option value="NPR">NPR (₨)</option>
                            <option value="NZD">NZD ($)</option>
                            <option value="OMR">OMR (ر.ع.)</option>
                            <option value="PAB">PAB (B/.)</option>
                            <option value="PEN">PEN (S/.)</option>
                            <option value="PGK">PGK (K)</option>
                            <option value="PHP">PHP (₱)</option>
                            <option value="PKR">PKR (₨)</option>
                            <option value="PLN">PLN (zł)</option>
                            <option value="PYG">PYG (₲)</option>
                            <option value="QAR">QAR (ر.ق)</option>
                            <option value="RON">RON (lei)</option>
                            <option value="RSD">RSD (дин)</option>
                            <option value="RUB">RUB (₽)</option>
                            <option value="RWF">RWF (Fr)</option>
                            <option value="SAR">SAR (ر.س)</option>
                            <option value="SBD">SBD ($)</option>
                            <option value="SCR">SCR (₨)</option>
                            <option value="SDG">SDG (£)</option>
                            <option value="SEK">SEK (kr)</option>
                            <option value="SGD">SGD ($)</option>
                            <option value="SHP">SHP (£)</option>
                            <option value="SLL">SLL (Le)</option>
                            <option value="SOS">SOS (Sh)</option>
                            <option value="SRD">SRD ($)</option>
                            <option value="SSP">SSP (£)</option>
                            <option value="STN">STN (Db)</option>
                            <option value="SYP">SYP (£)</option>
                            <option value="SZL">SZL (L)</option>
                            <option value="THB">THB (฿)</option>
                            <option value="TJS">TJS (ЅМ)</option>
                            <option value="TMT">TMT (m)</option>
                            <option value="TND">TND (د.ت)</option>
                            <option value="TOP">TOP (T$)</option>
                            <option value="TRY">TRY (₺)</option>
                            <option value="TTD">TTD ($)</option>
                            <option value="TWD">TWD (NT$)</option>
                            <option value="TZS">TZS (Sh)</option>
                            <option value="UAH">UAH (₴)</option>
                            <option value="UGX">UGX (Sh)</option>
                            <option value="USD">USD ($)</option>
                            <option value="UYU">UYU ($)</option>
                            <option value="UZS">UZS (so'm)</option>
                            <option value="VES">VES (Bs.)</option>
                            <option value="VND">VND (₫)</option>
                            <option value="VUV">VUV (Vt)</option>
                            <option value="WST">WST (T)</option>
                            <option value="XAF">XAF (Fr)</option>
                            <option value="XCD">XCD ($)</option>
                            <option value="XOF">XOF (Fr)</option>
                            <option value="XPF">XPF (Fr)</option>
                            <option value="YER">YER (﷼)</option>
                            <option value="ZAR">ZAR (R)</option>
                            <option value="ZMW">ZMW (ZK)</option>
                            <option value="ZWL">ZWL ($)</option>
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
                    <button onClick={async () => await window.ipcRenderer.invoke('export-data')} className="flex items-center gap-2 px-4 py-2 bg-[#222] text-white rounded hover:bg-[#333] transition-colors border border-[#333]">
                        <Download size={18} /> Export Data (ZIP)
                    </button>
                    <button onClick={async () => await window.ipcRenderer.invoke('import-data')} className="flex items-center gap-2 px-4 py-2 bg-[#222] text-white rounded hover:bg-[#333] transition-colors border border-[#333]">
                        <Upload size={18} /> Import Data
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Export includes all CSV files and Settings. Import will overwrite current data.
                </p>
            </section>

            {/* Developer Section */}
            <section className="bg-[#0d0d0d] rounded-xl border border-[#1a1a1a] p-6">
                <h2 className="text-xl font-semibold mb-6 text-white">Developer</h2>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Left 1/3: Image */}
                    <div className="w-full md:w-1/3">
                        <div className="aspect-square rounded-2xl overflow-hidden border border-[#222] bg-[#111] group">
                            <img
                                src="shail.png"
                                alt="Shail K Patel"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'icon.png';
                                }}
                            />
                        </div>
                    </div>

                    {/* Right 2/3: Text */}
                    <div className="w-full md:w-2/3 space-y-4">
                        <header>
                            <h3 className="text-3xl font-black font-display tracking-tight text-white mb-1">Shail K Patel</h3>
                            <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
                        </header>

                        <p className="text-gray-300 leading-relaxed text-sm">
                            I created this application for my personal use, but I found it valuable enough to share with everyone.
                            The project is released under the <strong>MIT License</strong>, so feel free to modify and use it as you wish.
                        </p>

                        <p className="text-gray-400 leading-relaxed text-sm italic">
                            If you find this application helpful, please consider donating to the <strong>Wikimedia Foundation</strong>.
                            This organization supports Wikipedia, which remains one of the greatest resources for knowledge in our time,
                            and I believe it deserves our collective support.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <button
                                onClick={() => window.ipcRenderer.invoke('open-external', 'https://github.com/ShailKPatel/MTrack')}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#222] text-white rounded-xl hover:bg-[#333] transition-all border border-[#333] font-bold text-sm"
                            >
                                <Github size={18} /> GitHub Repository
                            </button>
                            <button
                                onClick={() => window.ipcRenderer.invoke('open-external', 'https://donate.wikimedia.org')}
                                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-xl hover:bg-gray-100 transition-all font-bold text-sm shadow-lg shadow-white/5"
                            >
                                <Heart size={18} className="text-red-500 fill-red-500" /> Support Wikipedia
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
