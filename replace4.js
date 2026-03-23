const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src/app/(kiosk)/kiosk/discovery/page.tsx');
let content = fs.readFileSync(target, 'utf8');

// Container
content = content.replace(
  'className="h-full overflow-y-auto p-4 md:p-8 bg-gray-50 flex flex-col items-center"',
  'className="h-full overflow-y-auto p-6 md:p-8 flex flex-col items-center"'
);

// Title / Input wrapper
content = content.replace(
  'className="w-full max-w-3xl bg-white p-8 md:p-12 rounded-3xl shadow-xl border mt-10 md:mt-20 text-center"',
  'className="w-full max-w-3xl flex flex-col text-center"'
);
content = content.replace(
  'className="text-3xl font-black text-gray-900 mb-4"',
  'className="text-3xl font-black text-white mb-2 tracking-tight"'
);
content = content.replace(
  'className="text-lg text-gray-500 mb-10 max-w-lg mx-auto"',
  'className="text-blue-200 text-lg mb-6 max-w-lg mx-auto"'
);
content = content.replace(
  /className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex flex-col md:flex-row items-center justify-center mx-auto mb-6 shadow-inner"/g,
  'className="hidden"'
);
// We hide that icon since the new layout is cleaner.
content = content.replace(
  '<div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">\n                            <MapPin className="w-10 h-10" />\n                        </div>',
  ''
);

// Address input container
content = content.replace(
  'className="relative max-w-xl mx-auto mb-8"',
  'className="bg-white rounded-2xl p-2 shadow-xl border-2 border-white/40 flex items-center gap-2 max-w-xl mx-auto mb-8"'
);
content = content.replace(
  'className="w-full text-xl py-6 pl-6 pr-16 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all shadow-inner text-gray-900"',
  'className="flex-1 bg-transparent px-5 py-4 text-xl text-[#0A1628] font-medium outline-none min-h-[60px] placeholder:text-[#4A6FA5]"'
);
content = content.replace(
  '<div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">\n                                <Search className="w-6 h-6" />\n                            </div>',
  ''
);

// Search button
content = content.replace(
  'className="h-16 px-12 text-xl rounded-xl shadow-[0_10px_20px_rgba(0,102,204,0.2)]"',
  'className="bg-[#004085] hover:bg-[#002868] text-white px-6 py-4 rounded-xl font-bold text-lg min-h-[56px] transition-all"'
);


// FOUND STATE
content = content.replace(
  /className="bg-white p-8 rounded-3xl shadow-xl border"/g,
  'className="bg-transparent"'
);

// Actually, in FOUND we want the items to be visible without a massive white box if title is white.
content = content.replace(
  'className="text-3xl font-black text-gray-900"',
  'className="text-3xl font-black text-white mb-2"'
);
content = content.replace(
  /<p className="text-gray-500 mt-1 flex items-center gap-2">/g,
  '<p className="text-blue-200 text-lg flex items-center gap-2">'
);
content = content.replace(
  'className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1"',
  'className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-1"'
);
content = content.replace(
  'className="text-4xl font-black text-gray-900"',
  'className="text-4xl font-black text-white"'
);


// Service cards
content = content.replace(
  /className=\{`p-6 rounded-2xl border-2 cursor-pointer transition-all \$\{selectedServices\.includes\(service\.id\)\n\s*\?\s*`border-primary bg-blue-50\/30 shadow-md transform scale-\[1\.02\]`\n\s*:\s*`border-gray-200 hover:border-blue-300 opacity-70`\n\s*\}`\}/g,
  'className={`rounded-2xl p-5 min-h-[80px] border-2 cursor-pointer transition-all active:scale-98 flex items-center gap-4 ${selectedServices.includes(service.id) ? \'bg-[#EBF8FF] border-[#004085] shadow-md\' : \'bg-white border-[#BEE3F8] hover:border-[#004085] shadow-sm\'}`}'
);

content = content.replace(
  /w-14 h-14 rounded-2xl.*border flex items-center justify-center shrink-0/,
  'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${service.color}'
);

content = content.replace(
  /className="font-bold text-lg text-gray-900"/g,
  'className="text-lg font-bold text-[#0A1628]"'
);
content = content.replace(
  /className="text-sm text-gray-500 font-mono tracking-wider"/g,
  'className="font-mono text-sm text-[#4A6FA5] font-bold"'
);
content = content.replace(
  /className="text-xs font-bold text-gray-400 uppercase"/g,
  'className="text-sm text-[#4A6FA5]"'
);
content = content.replace(
  /className="text-2xl font-black"/g,
  'className="text-xl font-black text-[#004085]"'
);

// Checkbox custom
content = content.replace(
  'className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedServices.includes(service.id) ? \'bg-primary border-primary text-white\' : \'border-gray-300\'',
  'className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedServices.includes(service.id) ? \'bg-[#004085] border-[#004085] text-white\' : \'border-[#BEE3F8] bg-white\''
);


// Token Section
content = content.replace(
  /className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6"/g,
  'className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-5 mt-4 mb-6 text-white"'
);
content = content.replace(
  /className="font-bold text-purple-900 mb-2"/g,
  'className="font-bold text-white mb-2 text-xl"'
);
content = content.replace(
  /className="text-sm text-purple-700 mb-3"/g,
  'className="text-lg text-blue-100 mb-3"'
);

// Token Input
content = content.replace(
  'className="flex-1 px-3 py-2 border rounded-lg font-mono text-lg uppercase focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"',
  'className="bg-white border-2 border-[#90CDF4] rounded-xl px-5 py-4 text-xl font-mono min-h-[60px] text-[#0A1628] focus:border-[#004085] focus:ring-4 focus:ring-[#BEE3F8] uppercase flex-1 outline-none"'
);
content = content.replace(
  '<Button type="button" onClick={handleTokenLookup} disabled={documentToken.length !== 6}>',
  '<button type="button" className="bg-[#004085] hover:bg-[#002868] text-white px-6 py-4 rounded-xl font-bold min-h-[60px] disabled:opacity-50 transition-all" onClick={handleTokenLookup} disabled={documentToken.length !== 6}>'
);

// Confirm button
content = content.replace(
  'className="h-16 px-12 text-xl rounded-xl shadow-xl"',
  'className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center gap-3 w-full"'
);

content = content.replace(
  /w-14 h-14 rounded-2xl(.*?) border flex items-center justify-center shrink-0/g,
  'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 $1'
);

fs.writeFileSync(target, content);
