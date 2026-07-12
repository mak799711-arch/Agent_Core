const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, search, replacement) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(search, replacement);
        fs.writeFileSync(filePath, content);
    }
}

// 1. admin/page.tsx
replaceInFile('src/app/admin/page.tsx', 'usr.status === \'verified\'', '(usr.status || \'\') === \'verified\'');
replaceInFile('src/app/admin/page.tsx', 'usr.status === \'verified\'', '(usr.status || \'\') === \'verified\''); // replace multiple if needed, let's use regex
function replaceAll(filePath, regex, replacement) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(regex, replacement);
        fs.writeFileSync(filePath, content);
    }
}

replaceAll('src/app/admin/page.tsx', /usr\.status === 'verified'/g, "(usr.status || '') === 'verified'");
replaceAll('src/app/admin/page.tsx', /handleToggleVerification\(usr\.id, usr\.status\)/g, "handleToggleVerification(usr.id, usr.status || '')");
replaceAll('src/app/admin/page.tsx', /className="verify-btn"\s*title="Verify User"/g, 'className="verify-btn"');

// 2. partner/page.tsx
replaceAll('src/app/partner/page.tsx', /import { useRouter } from 'next\/navigation';/, "import { useRouter } from 'next/navigation';\nimport { useState, useEffect } from 'react';");
replaceAll('src/app/partner/page.tsx', /Parameter 'offer' implicitly has an 'any' type/g, '');
replaceAll('src/app/partner/page.tsx', /\(offer\) =>/g, '(offer: any) =>');
replaceAll('src/app/partner/page.tsx', /offer =>/g, '(offer: any) =>');

// 3. MockAuthService.ts
const mockAuthCode = `
function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Zа-яА-Я0-9 _-]/g, '').trim();
}
`;
replaceAll('src/lib/services/mock/MockAuthService.ts', /export class MockAuthService/, mockAuthCode + '\nexport class MockAuthService');
replaceAll('src/lib/services/mock/MockAuthService.ts', /const authCode = generateCode\(\);/g, "const authCode = generateCode() || '';");
replaceAll('src/lib/services/mock/MockAuthService.ts', /return Array\.from\({ length }, \(\) => chars\[Math\.floor\(Math\.random\(\) \* chars\.length\)\]\)\.join\(''\);/, "return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('') as string;");
replaceAll('src/lib/services/mock/MockAuthService.ts', /userProfile\.telegram_username/g, "userProfile.telegram_username || ''");
replaceAll('src/lib/services/mock/MockAuthService.ts', /userProfile\.full_name/g, "userProfile.full_name || ''");
replaceAll('src/lib/services/mock/MockAuthService.ts', /await this.updateProfile\(currentUser\.id, { telegram_username: telegramUsername }\);/g, "await this.updateProfile(currentUser.id, { telegram_username: telegramUsername || '' });");

// 4. partner/profile/page.tsx
replaceAll('src/app/partner/profile/page.tsx', /user\.isVerified/g, "((user as any).isVerified || false)");

// 5. referrals/complete/route.ts
replaceAll('src/app/api/v1/referrals/complete/route.ts', /offer\.rewardPercent/g, "(offer.rewardPercent || 0)");

// 6. telegram/webhook/route.ts
replaceAll('src/app/api/v1/telegram/webhook/route.ts', /offer\.rewardPercent/g, "(offer.rewardPercent || 0)");

// 7. SupabaseAuthService.ts
replaceAll('src/lib/services/supabase/SupabaseAuthService.ts', /p\.role !== 'admin'/g, "(p as any).role !== 'admin'");
