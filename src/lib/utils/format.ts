// Regex для удаления всех эмодзи и спецсимволов, включая галочки
const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F018}-\u{1F270}\u{2300}-\u{23FF}\u{2B50}\u{2B06}-\u{2B07}\u{2934}-\u{2935}\u{3297}\u{3299}]/gu;

export function sanitizeName(name: string | null | undefined): string {
  if (!name) return 'Unnamed';
  return name.replace(emojiRegex, '').trim() || 'Unnamed';
}

export function formatUserName(name: string | null | undefined, role: string | undefined): string {
  const safeName = sanitizeName(name);
  if (role === 'admin') {
    return `${safeName} ☑`;
  }
  return safeName;
}
