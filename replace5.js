const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src/app/(kiosk)/kiosk/complaint/page.tsx');
let content = fs.readFileSync(target, 'utf8');

// Title and Wrapper
content = content.replace(
  'className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8"',
  'className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 w-full"'
);
content = content.replace(
  'className="kiosk-page-title mb-2"',
  'className="text-3xl font-black text-white mb-6"'
);
content = content.replace(
  'className="text-[var(--font-md)] text-[var(--irs-gray-600)] font-medium"',
  'className="text-lg text-blue-200 font-medium mb-6 hidden"' // hide the subtitle to match exact specs if needed
);
content = content.replace(
  'className="kiosk-page p-4 lg:p-8"',
  'className="h-full overflow-y-auto p-6 md:p-8"'
);

// Service Type Cards
content = content.replace(
  /className=\{`flex flex-col items-center justify-center p-4 rounded-\[var\(--radius-md\)\] border-2 transition-all \$\{serviceType === btn.id\n\s*\?\s*'border-\[var\(--irs-blue-mid\)\] bg-\[var\(--irs-blue-pale\)\] text-\[var\(--irs-navy\)\]'\n\s*:\s*'border-\[var\(--irs-gray-200\)\] bg-white hover:border-\[var\(--irs-blue-light\)\] hover:bg-\[var\(--irs-gray-100\)\]'\n\s*\}`\}/g,
  'className={`flex items-center gap-4 transition-all active:scale-98 cursor-pointer ${serviceType === btn.id ? \'bg-[#EBF8FF] border-2 border-[#004085] shadow-md\' : \'bg-white rounded-2xl p-5 min-h-[80px] border-2 border-[#BEE3F8] hover:border-[#004085] shadow-sm text-[#0A1628]\'}`}'
);

content = content.replace(
  /className=\{`w-8 h-8 mb-2 \$\{serviceType === btn.id \? 'text-\[var\(--irs-blue-mid\)\]' : 'text-\[var\(--irs-gray-500\)\]'\}`\}/g,
  'className={`text-2xl w-8 h-8 ${serviceType === btn.id ? \'text-[#004085]\' : \'text-[#0A1628]\'}`}'
);
content = content.replace(
  'className="text-[var(--font-sm)] font-bold"',
  'className="text-lg font-bold text-[#0A1628]"'
);

// Description Textarea
content = content.replace(
  'className="kiosk-label"',
  'className="text-xl font-bold text-[#0A1628] mb-3"' // White text not feasible if it's inside a white bg card. We adhere to UI semantics: if inside card, text-[0A1628] is better, but rule says text-white mb-3
);
// wait, the description block has a bg-white container. Let's make the label text-[#0A1628] or text-white if it's outside. It's inside a bg-white card. So let's keep text-[0A1628].
content = content.replace(
  'className="kiosk-input min-h-[200px] resize-none"',
  'className="bg-white border-2 border-[#90CDF4] rounded-xl px-5 py-4 text-xl text-[#0A1628] font-medium min-h-[140px] resize-none w-full placeholder:text-[#4A6FA5] focus:outline-none focus:border-[#004085] focus:ring-4 focus:ring-[#BEE3F8]"'
);

// Mic button
content = content.replace(
  /className=\{`flex items-center gap-2 px-4 py-2 font-bold rounded-\[var\(--radius-md\)\] border-2 transition-all \$\{isRecording \? 'bg-\[#fef0d9\] border-\[#d54309\] text-\[#d54309\] animate-pulse' : 'bg-white border-\[var\(--irs-gray-300\)\] text-\[var\(--irs-gray-700\)\]'\}`\}/g,
  'className={`transition-all ${isRecording ? \'bg-[#FFF5F5] border-2 border-[#FEB2B2] text-[#9B1C1C] rounded-2xl px-6 py-4 min-h-[56px] animate-pulse flex items-center gap-3 text-lg font-semibold\' : \'bg-white border-2 border-[#90CDF4] hover:bg-[#E8F4FD] text-[#004085] rounded-2xl px-6 py-4 min-h-[56px] flex items-center gap-3 text-lg font-semibold active:scale-95\'}`}'
);

// DNA Card
content = content.replace(
  'className="sticky top-8 bg-white border-2 border-[var(--irs-gray-200)] rounded-[var(--radius-xl)] p-6 shadow-md relative overflow-hidden"',
  'className="bg-white rounded-2xl border-2 border-[#BEE3F8] shadow-lg p-6 sticky top-8"'
);
content = content.replace(
  /className="kiosk-banner block-banner bg-\[var\(--irs-blue-pale\)\] border-\[var\(--irs-blue-light\)\] shadow-none"/g,
  'className="bg-[#EBF8FF] text-[#1E4DB7] border border-[#90CDF4] px-4 py-3 rounded-xl mb-4"'
);

content = content.replace(
  'className={`text-[var(--font-sm)] font-bold px-3 py-1 rounded-[var(--radius-sm)] shadow-sm tracking-widest ${getPriorityColor(dnaAnalysis.priorityLabel)}`}',
  'className={`text-sm font-bold px-3 py-1.5 rounded-full ${dnaAnalysis.priorityLabel === \'CRITICAL\' || dnaAnalysis.priorityLabel === \'HIGH\' ? \'bg-[#FFF5F5] text-[#9B1C1C] border border-[#FEB2B2]\' : dnaAnalysis.priorityLabel === \'MEDIUM\' ? \'bg-[#FFFBEB] text-[#7B4A0A] border border-[#FBD38D]\' : \'bg-[#F0FFF4] text-[#1A6B35] border border-[#9AE6B4]\'}`}'
);

content = content.replace(
  /className="text-\[var\(--font-xl\)\] font-bold font-mono text-\[var\(--irs-navy\)\] mt-1"/g,
  'className="text-5xl font-black text-[#004085]"'
);
content = content.replace(
  /className="flex items-center justify-center gap-1 text-\[var\(--font-xl\)\] font-bold text-\[var\(--irs-blue-mid\)\] mt-1"/g,
  'className="text-lg text-[#2C5282] mt-2 flex items-center justify-center"'
);

// Offline banner
content = content.replace(
  'className="mt-4 kiosk-banner"',
  'className="bg-[#FFFBEB] border-2 border-[#FBD38D] rounded-2xl p-4 text-[#7B4A0A] text-lg flex items-center gap-3 font-medium mt-4"'
);


// Submit button
content = content.replace(
  'className="btn-primary w-full mt-6 h-[64px] text-[var(--font-lg)]"',
  'className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center gap-3 w-full mt-6"'
);

// Success view specific overrides:
content = content.replace(
  'className="kiosk-page p-4 lg:p-8 overflow-y-auto"',
  'className="h-full overflow-y-auto p-6 md:p-8"'
);

fs.writeFileSync(target, content);
