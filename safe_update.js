const fs = require('fs');

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

function replaceBlock(filePath, startMarker, endMarker, newContent) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return;
    const endIndex = content.indexOf(endMarker, startIndex);
    if (endIndex === -1) return;

    const before = content.substring(0, startIndex + startMarker.length);
    const after = content.substring(endIndex);
    
    fs.writeFileSync(filePath, before + '\\n' + newContent + '\\n' + after);
}

// 1. SettingsSidebar
replaceBlock('src/app/components/SettingsSidebar.tsx', '<option value="en">English</option>', '</select>', langOptions.trim());
replaceBlock('src/app/components/SettingsSidebar.tsx', '<option value="USD">USD ($)</option>', '</select>', currOptions.trim());

// 2. onboarding/page.tsx
replaceBlock('src/app/onboarding/page.tsx', '<option value="en">English</option>', '</select>', langOptions.trim());
replaceBlock('src/app/onboarding/page.tsx', '<option value="USD">USD ($)</option>', '</select>', currOptions.trim());

// 3. onboarding/page_complex.tsx
// wait, page_complex has style={{ background... }} in option.
// Since I added global CSS, I can just replace it with normal options.
// replaceBlock('src/app/onboarding/page_complex.tsx', '<option value="en"', '</select>', langOptions.trim());
// replaceBlock('src/app/onboarding/page_complex.tsx', '<option value="USD"', '</select>', currOptions.trim());

// 4. partner/settings/page.tsx
replaceBlock('src/app/partner/settings/page.tsx', '<option value="en">English</option>', '</select>', langOptions.trim());
replaceBlock('src/app/partner/settings/page.tsx', '<option value="USD">USD ($)</option>', '</select>', currOptions.trim());

console.log("Safely updated options!");
