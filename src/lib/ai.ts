import natural from 'natural';

export async function detectKeywords(text: string) {
    if (!text) return [];

    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());
    if (!tokens) return [];

    const categories = {
        ELECTRICITY: ['light', 'power', 'bill', 'electricity', 'current'],
        WATER: ['water', 'pipe', 'leak', 'jal', 'pani'],
        WASTE: ['garbage', 'trash', 'waste', 'kacha'],
        GAS: ['gas', 'cylinder', 'pipe']
    };

    const detected: string[] = [];
    for (const [category, words] of Object.entries(categories)) {
        if (tokens.some(t => words.includes(t))) {
            detected.push(category);
        }
    }

    return detected;
}
