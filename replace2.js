const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src/app/(kiosk)/kiosk/page.tsx');
let content = fs.readFileSync(target, 'utf8');

// Container
content = content.replace(
  'className="flex-1 flex flex-col items-center justify-center w-full"',
  'className="h-full overflow-y-auto p-6 md:p-8 max-w-4xl mx-auto flex flex-col items-center justify-center w-full"'
);

// ACCESSIBILITY SCREEN (STEP 1)
content = content.replace(
  'className="text-[var(--font-2xl)] font-bold text-[var(--irs-navy)] mb-2"',
  'className="text-3xl font-black text-white text-center mb-2 tracking-tight"'
);
content = content.replace(
  'className="text-[var(--font-lg)] text-[var(--irs-gray-600)] mb-12"',
  'className="text-blue-200 text-lg text-center mb-8"'
);

// Flow buttons
content = content.replace(
  'className="btn-secondary"',
  'className="bg-white hover:bg-[#E8F4FD] active:bg-[#BEE3F8] text-[#004085] border-2 border-[#004085] font-semibold text-lg min-h-[56px] px-6 rounded-2xl transition-all duration-150"'
);
content = content.replace(
  'className="btn-primary"',
  'className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[56px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center"'
);

// Accessibility Cards grid
content = content.replace(
  'className="flex justify-center gap-6"',
  'className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full justify-center"'
);

// AccessBtn function equivalent:
content = content.replace(
  /className="flex flex-col items-center gap-2 text-\[var\(--irs-gray-600\)\] hover:text-\[var\(--irs-navy\)\] transition-colors"/g,
  'className="bg-white text-[#0A1628] rounded-2xl p-6 min-h-[100px] border-2 border-[#BEE3F8] hover:border-[#004085] hover:shadow-md cursor-pointer transition-all duration-150 active:scale-95 flex flex-col items-center text-center gap-3"'
);

content = content.replace(
  /className="w-14 h-14 rounded-full bg-white border border-\[var\(--irs-gray-200\)\] flex items-center justify-center shadow-sm"/g,
  'className="w-14 h-14 rounded-2xl bg-[#E8F4FD] flex items-center justify-center text-2xl text-[#004085]"'
);
content = content.replace(
  /className="text-\[var\(--font-xs\)\] font-bold uppercase tracking-widest"/g,
  'className="text-lg font-bold text-[#0A1628] block"'
);

// LANGUAGE SCREEN (STEP 2)
content = content.replace(
  'className="kiosk-page-title"',
  'className="text-3xl font-black text-white text-center mb-2 tracking-tight"'
);

content = content.replace(
  'className="lang-grid"',
  'className="grid grid-cols-3 md:grid-cols-4 gap-3"'
);

content = content.replace(
  /className={`lang-btn flex-col gap-1 \$\{selectedLang === lang.code \? 'selected' : ''\}`}/g,
  'className={`flex flex-col items-center gap-1 transition-all min-h-[56px] cursor-pointer ${selectedLang === lang.code ? \'bg-white text-[#002868] border-[2px] border-white rounded-xl px-4 py-4 font-black shadow-lg\' : \'bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl px-4 py-4 text-base font-semibold active:bg-white/30\'}`}'
);

content = content.replace(
  /className="text-\[var\(--font-md\)\] font-bold"/g,
  'className="text-lg font-bold"'
);
content = content.replace(
  /className="text-\[var\(--font-xs\)\] opacity-80"/g,
  'className="text-xs opacity-70"'
);

// Start Button
content = content.replace(
  'className="btn-primary"',
  'className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center w-full mt-6"'
);

// HOME VISIT STEP (adjusting colors to match the design system lightly without breaking it)
// It was not requested, but keeping it functional and legible given we changed backgrounds
content = content.replace(
  'className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-colors text-base shadow-none border-0"',
  'className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#E8F4FD] active:bg-[#BEE3F8] text-[#004085] border border-[#004085] font-semibold rounded-2xl transition-colors text-base shadow-none"'
);
content = content.replace(
  '<div className="kiosk-page flex flex-col relative w-full h-full overflow-hidden">',
  '<div className="bg-gradient-to-br from-[#001a4d] via-[#002868] to-[#003a8c] flex flex-col relative w-full h-full overflow-hidden">'
);


fs.writeFileSync(target, content);
