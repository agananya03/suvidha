const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src/app/(kiosk)/kiosk/pay/page.tsx');
let content = fs.readFileSync(target, 'utf8');

// General
content = content.replace(
  'h-full overflow-y-auto p-8 max-w-4xl mx-auto w-full',
  'h-full overflow-y-auto p-6 md:p-8 max-w-4xl mx-auto w-full border-t-0'
);
content = content.replace(
  'text-3xl font-bold mb-8',
  'text-3xl font-black text-[#0A1628] mb-8'
);
content = content.replace(
  /className="text-2xl font-bold([^"]*)"/g,
  'className="text-2xl font-black text-[#0A1628]$1"'
);
content = content.replace(
  /text-gray-500/g,
  'text-[#4A6FA5]'
);
content = content.replace(
  /text-gray-700/g,
  'text-[#2C5282]'
);

// Biller Buttons
content = content.replace(
  /className="w-full p-4 rounded-xl border border-gray-200 bg-white\s+text-left hover:border-blue-400 hover:shadow-md\s+transition-all group"/g,
  'className="w-full p-5 rounded-2xl border-2 border-[#BEE3F8] bg-white text-left hover:border-[#004085] hover:shadow-md transition-all group active:scale-98 flex items-center gap-4 min-h-[80px]"'
);

// Inputs and blocks
content = content.replace(
  'bg-white rounded-2xl p-6 shadow-sm border border-gray-100',
  'bg-white rounded-2xl p-6 shadow-md border-2 border-[#BEE3F8]'
);
content = content.replace(
  /className="w-full px-4 py-3 border border-gray-300 rounded-xl\s+text-lg font-mono focus:outline-none focus:ring-2\s+focus:ring-blue-500 focus:border-transparent"/g,
  'className="bg-white border-2 border-[#90CDF4] rounded-xl px-5 py-4 text-xl text-[#0A1628] font-medium min-h-[60px] w-full placeholder:text-[#4A6FA5] focus:outline-none focus:border-[#004085] focus:ring-4 focus:ring-[#BEE3F8] font-mono tracking-widest"'
);

// Fetch button
content = content.replace(
  /className="w-full"\s*size="lg"/g,
  'className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center gap-3 w-full"'
);

// Bill Details Card
content = content.replace(
  /bg-white rounded-2xl p-6 shadow-sm border border-gray-100/g,
  'bg-white rounded-2xl p-8 shadow-md border-2 border-[#BEE3F8]'
);

// Anomaly
content = content.replace(
  'bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-2xl shadow-sm',
  'bg-[#FFFBEB] border-2 border-[#FBD38D] p-6 rounded-2xl shadow-sm'
);
content = content.replace(
  /text-yellow-800/g,
  'text-[#7B4A0A]'
);
content = content.replace(
  /text-yellow-700/g,
  'text-[#7B4A0A]'
);

// Dispute / Pay Anyway
content = content.replace(
  /variant="outline"\s+className="bg-white text-\[#7B4A0A\] border-yellow-300 hover:bg-yellow-100"/g,
  'variant="outline" className="bg-white hover:bg-[#E8F4FD] active:bg-[#BEE3F8] text-[#004085] border-2 border-[#004085] font-semibold text-lg min-h-[56px] px-8 rounded-xl"'
);
content = content.replace(
  /className="bg-yellow-500 hover:bg-yellow-600 text-white"/g,
  'className="bg-[#004085] hover:bg-[#002868] text-white font-bold text-lg min-h-[56px] px-8 rounded-xl shadow-md"'
);

// Payment Method Selection
content = content.replace(
  /bg-white p-6 rounded-2xl shadow-sm border hover:border-primary hover:shadow-md transition-all cursor-pointer group relative overflow-hidden/g,
  'bg-white p-6 rounded-2xl border-2 border-[#BEE3F8] hover:border-[#004085] hover:shadow-md transition-all cursor-pointer group relative overflow-hidden'
);
content = content.replace(
  /bg-white p-6 rounded-2xl shadow-sm border hover:border-primary hover:shadow-md transition-all cursor-pointer group relative/g,
  'bg-white p-6 rounded-2xl border-2 border-[#BEE3F8] hover:border-[#004085] hover:shadow-md transition-all cursor-pointer group relative'
);

content = content.replace(
  /text-xl font-bold text-primary/g,
  'text-3xl font-black text-[#004085]'
);

fs.writeFileSync(target, content);
