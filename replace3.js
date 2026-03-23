const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src/app/(kiosk)/kiosk/auth/page.tsx');
let content = fs.readFileSync(target, 'utf8');

// The main div
content = content.replace(
  'className="kiosk-page flex items-center justify-center"',
  'className="h-full flex items-center justify-center p-6"'
);
content = content.replace(
  'className="bg-white border border-[var(--irs-gray-200)] rounded-[var(--radius-xl)] shadow-lg w-full max-w-[480px] p-8 md:p-10 relative overflow-hidden"',
  'className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 max-w-lg mx-auto border-2 border-[#BEE3F8] w-full relative"'
);

// Header / Title area
content = content.replace(
  'className="text-center mb-8 border-b-4 border-[var(--irs-blue-mid)] pb-6"',
  'className="text-center mb-0 pb-0 border-0 flex flex-col items-center"'
);
content = content.replace(
  '<h2 className="text-[var(--font-xl)] font-bold text-[var(--irs-navy)]">{t(\'Citizen Authentication\')}</h2>',
  '<div className="w-20 h-20 bg-[#002868] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"><span className="text-white text-3xl font-black">auth</span></div><h2 className="text-3xl font-black text-[#0A1628] text-center mb-2">{t(\'Citizen Authentication\')}</h2>'
);
content = content.replace(
  'className="text-[var(--font-sm)] text-[var(--irs-gray-600)] mt-2"',
  'className="text-[#4A6FA5] text-lg text-center mb-8"'
);

content = content.replace(
  'className="kiosk-label"',
  'className="text-base font-semibold text-[#2C5282] block mb-2"'
);
content = content.replace(
  'className="kiosk-label mb-4 text-center"',
  'className="text-base font-semibold text-[#2C5282] block mb-4 text-center"'
);

// +91 block
content = content.replace(
  'className="absolute left-4 text-[var(--font-md)] font-bold text-[var(--irs-gray-600)]">+91</span>',
  'className="absolute left-0 top-0 bottom-0 bg-[#E8F4FD] border-r-2 border-[#90CDF4] px-4 py-4 text-[#002868] font-bold text-xl rounded-l-xl flex items-center">+91</span>'
);

// Input field
content = content.replace(
  'className="kiosk-input pl-14 tracking-widest"',
  'className="bg-white border-2 border-[#90CDF4] rounded-xl pl-20 pr-5 py-4 text-xl text-[#0A1628] font-medium min-h-[60px] w-full placeholder:text-[#4A6FA5] focus:outline-none focus:border-[#004085] focus:ring-4 focus:ring-[#BEE3F8] tracking-widest"'
);

// OTP inputs
content = content.replace(
  'className="w-[70px] h-[80px] text-center text-[var(--font-2xl)] font-bold border-2 border-[var(--irs-gray-400)] rounded-[var(--radius-md)] focus:border-[var(--irs-blue-mid)] focus:bg-[var(--irs-blue-pale)] outline-none transition-all shadow-sm"',
  'className="w-14 h-16 text-center text-3xl font-black border-2 border-[#BEE3F8] rounded-xl text-[#0A1628] bg-white focus:border-[#004085] focus:ring-4 focus:ring-[#E8F4FD] outline-none transition-all"'
);

// Buttons
content = content.replace(
  /className="btn-primary w-full mt-2"/g,
  'className="bg-[#004085] hover:bg-[#002868] active:bg-[#001a4d] text-white font-bold text-xl min-h-[64px] px-8 rounded-2xl transition-all duration-150 shadow-md flex items-center justify-center gap-3 w-full mt-2"'
);
content = content.replace(
  'className="text-[var(--irs-blue-mid)] text-center w-full font-semibold underline underline-offset-4 mt-4"',
  'className="text-[#004085] hover:bg-[#E8F4FD] active:bg-[#BEE3F8] font-medium text-base min-h-[48px] px-5 rounded-xl transition-all mt-4 w-full"'
);

// Demo OTP
content = content.replace(
  'className="fixed top-24 right-8 bg-[#fff8e6] border-l-4 border-[var(--irs-warning)] text-[#4a3000] p-4 shadow-lg rounded-r-[var(--radius-md)] z-50"',
  'className="fixed top-24 right-8 bg-[#EBF8FF] border-2 border-[#90CDF4] text-[#002868] rounded-2xl p-4 shadow-lg z-50 min-h-[72px] flex flex-col items-center justify-center"'
);
content = content.replace(
  'className="font-bold text-[var(--font-sm)] uppercase mb-1"',
  'className="text-sm border-b border-[#90CDF4] pb-1 font-bold uppercase mb-1"'
);
content = content.replace(
  'className="text-[var(--font-lg)] font-mono tracking-widest"',
  'className="text-lg font-mono text-center font-bold tracking-widest"'
);

fs.writeFileSync(target, content);
