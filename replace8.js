const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src/app/(kiosk)/kiosk/dashboard/page.tsx');
let content = fs.readFileSync(target, 'utf8');

// Welcome text
content = content.replace(
  'text-[var(--font-xl)] font-bold text-[var(--irs-navy)]',
  'text-3xl font-black text-[#0A1628] mb-2'
);
content = content.replace(
  'text-[var(--font-sm)] text-[var(--irs-gray-600)] font-medium',
  'text-lg font-medium text-[#4A6FA5]'
);
content = content.replace(
  'text-[var(--font-sm)] font-medium text-[var(--irs-blue-mid)]',
  'text-lg font-medium text-[#004085]'
);

// Info banner (Quick Pay)
content = content.replace(
  'kiosk-banner',
  'bg-[#E8F4FD] border-2 border-[#90CDF4] text-[#0A1628] rounded-2xl p-4 flex gap-3 shadow-sm'
);
content = content.replace(
  'text-[var(--irs-blue-mid)]',
  'text-[#004085]'
);
content = content.replace(
  'text-[var(--font-sm)]',
  'text-sm font-bold'
);

// Tabs
content = content.replace(
  'kiosk-subnav mb-8 rounded-[var(--radius-lg)] overflow-hidden shadow-sm',
  'flex w-full bg-[#EBF5FB] border-2 border-[#BEE3F8] rounded-xl p-1 mb-8'
);
content = content.replace(
  /className={`kiosk-subnav-tab flex-1 justify-center text-\[var\(--font-md\)\] \$\{activeTab === tab\.id \? 'active' : ''\}`}/g,
  'className={`flex-1 flex justify-center py-3 text-lg font-bold rounded-lg transition-all ${activeTab === tab.id ? \'bg-white text-[#004085] shadow-sm\' : \'text-[#4A6FA5] hover:text-[#002868]\'}`}'
);

// Services Header
content = content.replace(
  'text-[var(--font-lg)] font-bold text-[var(--irs-navy)] border-l-4 border-[var(--irs-blue-mid)] pl-3 mb-4',
  'text-2xl font-black text-[#0A1628] mb-6'
);

// Service Grid
content = content.replace(
  'service-grid',
  'grid grid-cols-2 md:grid-cols-4 gap-4'
);
content = content.replace(
  /className="service-card group"/g,
  'className="bg-white rounded-2xl p-5 min-h-[120px] border-2 border-[#BEE3F8] hover:border-[#004085] hover:shadow-md cursor-pointer transition-all duration-150 active:scale-95 flex flex-col items-center justify-center text-center gap-3 group shadow-sm"'
);
content = content.replace(
  /bg-\[var\(--irs-blue-pale\)\] p-3 rounded-full mr-2 group-hover:bg-\[var\(--irs-blue-mid\)\] transition-colors/g,
  'w-14 h-14 rounded-2xl bg-[#E8F4FD] flex items-center justify-center text-2xl text-[#004085] transition-all group-hover:bg-[#004085]'
);
content = content.replace(
  /text-\[var\(--irs-blue-mid\)\] group-hover:text-white/g,
  'text-[#004085] group-hover:text-white'
);
content = content.replace(
  'service-card-label',
  'text-lg font-bold text-[#0A1628]'
);

// Outer wrapper
content = content.replace(
  'className="kiosk-page"',
  'className="h-full overflow-y-auto p-6 md:p-8"'
);

fs.writeFileSync(target, content);
