const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src/app/pre-visit/page.tsx');
let content = fs.readFileSync(target, 'utf8');

// Header
content = content.replace(
  'bg-[#008069]',
  'bg-[#004085]' // Brand blue instead of WhatsApp green for AAA compliance & consistency
);

// Map pin bubble
content = content.replace(
  'bg-blue-50 text-blue-600',
  'bg-[#E8F4FD] text-[#004085]'
);
content = content.replace(
  'text-gray-900',
  'text-[#0A1628]'
);
content = content.replace(
  'text-gray-500',
  'text-[#4A6FA5]'
);
content = content.replace(
  'text-blue-600',
  'text-[#004085]'
);
content = content.replace(
  'border-gray-100',
  'border-[#BEE3F8]'
);
content = content.replace(
  'bg-white rounded-3xl p-6 shadow-sm border border-[#BEE3F8] flex items-start gap-4 mx-4 mt-2 sm:mx-8 sm:mt-4',
  'bg-white rounded-2xl p-6 flex items-start gap-4 shadow-md border-2 border-[#BEE3F8] mx-4 mt-2 sm:mx-8 sm:mt-4'
);

// WhatsApp message bubbles
content = content.replace(
  /bg-white text-gray-800/g,
  'bg-white text-[#0A1628] border-2 border-[#BEE3F8] shadow-sm'
);
content = content.replace(
  /bg-\[#d9fdd3\] text-gray-800/g,
  'bg-[#E8F4FD] text-[#0A1628] border-2 border-[#BEE3F8] shadow-sm'
);

content = content.replace(
  /text-gray-500 text-xs/g,
  'text-[#4A6FA5] text-xs font-bold'
);

// Input area
content = content.replace(
  'bg-[#f0f2f5] p-3 flex items-end gap-2 shrink-0 border-t border-gray-200',
  'bg-white p-4 flex items-end gap-3 shrink-0 border-t-2 border-[#BEE3F8]'
);
content = content.replace(
  'bg-white rounded-2xl flex-1 flex items-center px-4 py-2 sm:py-3 shadow-sm',
  'bg-white rounded-xl flex-1 flex items-center px-4 py-3 shadow-sm border-2 border-[#90CDF4]'
);
content = content.replace(
  'text-gray-400 hover:text-gray-600',
  'text-[#4A6FA5] hover:text-[#004085]'
);
content = content.replace(
  'bg-[#00a884] text-white p-3 sm:p-4 rounded-full shadow-sm hover:bg-[#008f6f] active:scale-95 transition-all',
  'bg-[#004085] text-white p-3 sm:p-4 rounded-xl shadow-md hover:bg-[#002868] active:scale-95 transition-all'
);

fs.writeFileSync(target, content);
