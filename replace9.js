const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src/app/(kiosk)/kiosk/electricity/page.tsx');
let content = fs.readFileSync(target, 'utf8');

// Wrapper
content = content.replace(
  'className="h-full flex flex-col overflow-hidden bg-gray-50"',
  'className="h-full flex flex-col overflow-hidden bg-[#F0F7FF]"'
);

// Header
content = content.replace(
  'className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-4 flex items-center gap-4 shrink-0"',
  'className="bg-gradient-to-r from-[#002868] to-[#004085] text-white px-6 py-6 flex items-center gap-4 shrink-0 shadow-md"'
);

// Tabs
content = content.replace(
  'className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl font-semibold text-sm transition-all shrink-0 ${active ? \'bg-yellow-500 text-white shadow-md\' : \'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-700\'}`}',
  'className={`flex items-center gap-2 whitespace-nowrap px-5 py-3 rounded-xl font-bold text-base transition-all shrink-0 ${active ? \'bg-[#004085] text-white shadow-md\' : \'bg-white text-[#4A6FA5] hover:bg-[#E8F4FD] hover:text-[#002868] border border-[#BEE3F8]\'}`}'
);

content = content.replace(
  /bg-yellow-500 hover:bg-yellow-600/g,
  'bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] shadow-md'
);
content = content.replace(
  /text-yellow-500/g,
  'text-[#004085]'
);
content = content.replace(
  /focus:border-yellow-400/g,
  'focus:border-[#004085] focus:ring-4 focus:ring-[#BEE3F8]'
);
content = content.replace(
  /border-yellow-500 bg-yellow-50 text-yellow-700/g,
  'border-[#004085] bg-[#EBF8FF] text-[#004085] shadow-sm'
);

// Anomaly
content = content.replace(
  'bg-amber-50 border-2 border-amber-300 rounded-3xl p-6',
  'bg-[#FFFBEB] border-2 border-[#FBD38D] rounded-3xl p-6'
);

// Buttons
content = content.replace(
  /className="w-full mt-4 bg-\[#004085\](.*) text-white"/g,
  'className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center gap-3 w-full mt-4"'
);
content = content.replace(
  /className="w-full bg-\[#004085\](.*) text-white"/g,
  'className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center gap-3 w-full"'
);

// Inputs
content = content.replace(
  /w-full p-3 border-2 border-gray-200 rounded-xl/g,
  'bg-white border-2 border-[#90CDF4] rounded-xl px-5 py-4 text-xl text-[#0A1628] font-medium min-h-[60px] w-full placeholder:text-[#4A6FA5] transition-all'
);

// Cards
content = content.replace(
  /bg-white rounded-3xl p-6 shadow-sm border/g,
  'bg-white rounded-3xl p-6 shadow-md border-2 border-[#BEE3F8]'
);
content = content.replace(
  /bg-white rounded-3xl p-8 shadow-sm border/g,
  'bg-white rounded-3xl p-8 shadow-md border-2 border-[#BEE3F8]'
);
content = content.replace(
  /bg-white rounded-2xl p-6 shadow-sm border/g,
  'bg-white rounded-2xl p-8 shadow-md border-2 border-[#BEE3F8]'
);

fs.writeFileSync(target, content);
