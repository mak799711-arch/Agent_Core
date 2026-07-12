const fs = require('fs');
const path = require('path');

const langOptions = `
<option value="en">English</option>
<option value="ru">Русский</option>
<option value="id">Bahasa Indonesia</option>
<option value="zh">中文 (Chinese)</option>
<option value="es">Español (Spanish)</option>
<option value="de">Deutsch (German)</option>
<option value="fr">Français (French)</option>
<option value="ja">日本語 (Japanese)</option>
<option value="ar">العربية (Arabic)</option>
<option value="pt">Português (Portuguese)</option>
<option value="hi">हिन्दी (Hindi)</option>
`;

const currOptions = `
<option value="USD">USD ($)</option>
<option value="EUR">EUR (€)</option>
<option value="GBP">GBP (£)</option>
<option value="IDR">IDR (Rp)</option>
<option value="RUB">RUB (₽)</option>
<option value="CNY">CNY (¥)</option>
<option value="JPY">JPY (¥)</option>
<option value="AED">AED (د.إ)</option>
<option value="INR">INR (₹)</option>
<option value="BRL">BRL (R$)</option>
`;

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // For languages
    // Find <select ...> containing <option value="en"> and replace options
    const langRegex = /(<select[^>]*value=\{lang\}[^>]*>)([\s\S]*?)(<\/select>)/g;
    content = content.replace(langRegex, (match, open, inner, close) => {
        return open + '\\n' + langOptions + close;
    });

    // Same for currency
    const currRegex = /(<select[^>]*value=\{currency\}[^>]*>)([\s\S]*?)(<\/select>)/g;
    content = content.replace(currRegex, (match, open, inner, close) => {
        return open + '\\n' + currOptions + close;
    });

    fs.writeFileSync(filePath, content);
}

const files = [
    'src/app/components/SettingsSidebar.tsx',
    'src/app/onboarding/page.tsx',
    'src/app/onboarding/page_complex.tsx',
    'src/app/partner/settings/page.tsx',
    'src/app/cashier/settings/page.tsx' // just in case
];

files.forEach(processFile);
console.log("Updated dropdowns!");
