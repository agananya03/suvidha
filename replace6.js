const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src/app/(kiosk)/kiosk/queue/page.tsx');
let content = fs.readFileSync(target, 'utf8');

// Container
content = content.replace(
  'bg-gray-50\'}',
  'bg-[#F0F7FF]\'}'
);
content = content.replace(
  'p-4 lg:p-8',
  'p-6 md:p-8'
);
content = content.replace(
  'text-3xl font-bold mb-2',
  'text-3xl font-black text-[#0A1628] mb-2'
);
content = content.replace(
  'text-gray-500\'}',
  'text-[#4A6FA5]\'}'
);

// Tabs
content = content.replace(
  'px-6 py-3 font-semibold text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === idx',
  'px-6 py-3 font-semibold text-sm whitespace-nowrap transition-colors border-b-4 ${activeTab === idx'
);
content = content.replace(
  'border-primary text-primary',
  'border-[#004085] text-[#004085]'
);
content = content.replace(
  'border-transparent text-gray-500 hover:text-gray-700',
  'border-transparent text-[#4A6FA5] hover:text-[#004085]'
);
content = content.replace(
  'bg-gray-100 text-gray-600 rounded-full text-xs',
  'bg-[#E8F4FD] text-[#004085] rounded-full text-xs font-bold px-2 py-0.5'
);

// Main Card
content = content.replace(
  'p-8 rounded-3xl shadow-sm border ${highContrast ? \'bg-gray-900 border-gray-700\' : \'bg-white border-gray-100\'}',
  'p-8 rounded-3xl shadow-sm border-2 ${highContrast ? \'bg-gray-900 border-gray-700\' : \'bg-white border-[#BEE3F8]\'}'
);
content = content.replace(
  'text-sm font-bold tracking-widest text-gray-400 uppercase mb-1',
  'text-sm font-bold tracking-widest text-[#4A6FA5] uppercase mb-1'
);
content = content.replace(
  'text-gray-900\'}',
  'text-[#0A1628]\'}'
);
content = content.replace(
  'text-gray-500 mb-2 whitespace-nowrap',
  'text-[#4A6FA5] mb-2 whitespace-nowrap'
);

// Badges
content = content.replace(
  /bg-blue-100 text-blue-700/g,
  'bg-[#EBF8FF] text-[#1E4DB7] border border-[#90CDF4]'
);
content = content.replace(
  /bg-purple-100 text-purple-700/g,
  'bg-[#F5F3FF] text-[#5B21B6] border border-[#DDD6FE]' // or just use info badge
);
content = content.replace(
  /bg-gray-100 text-gray-700/g,
  'bg-white border border-[#90CDF4] text-[#4A6FA5]'
);

content = content.replace(
  'bg-gray-50 px-4 py-2 rounded-lg border',
  'bg-white px-4 py-2 rounded-lg border-2 border-[#BEE3F8]'
);

// SLA Ring
content = content.replace(
  'bg-gray-50 p-6 rounded-2xl border',
  'bg-white p-6 rounded-2xl border-2 border-[#BEE3F8]'
);
content = content.replace(
  /text-gray-500/g,
  'text-[#4A6FA5]'
);

// Corruption Panel
content = content.replace(
  'p-6 rounded-3xl shadow-sm border ${highContrast ? \'bg-gray-900 border-gray-700\' : \'bg-gradient-to-br from-white to-gray-50/50 border-gray-100\'}',
  'p-6 rounded-3xl shadow-md border-2 ${highContrast ? \'bg-gray-900 border-gray-700\' : \'bg-white border-[#BEE3F8]\'}'
);
content = content.replace(
  'bg-green-100 text-green-700',
  'bg-[#F0FFF4] text-[#1A6B35] border border-[#9AE6B4]'
);
content = content.replace(
  'text-gray-400',
  'text-[#4A6FA5]'
);

// Buttons
content = content.replace(
  /className="w-full"/g,
  'className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center gap-3 w-full"'
);
content = content.replace(
  /variant="outline" className="w-full"/g,
  'variant="outline" className="bg-white hover:bg-[#E8F4FD] active:bg-[#BEE3F8] text-[#004085] border-2 border-[#004085] font-semibold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-sm flex items-center justify-center gap-3 w-full"'
);

fs.writeFileSync(target, content);
