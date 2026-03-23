const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src/app/page.tsx');
let content = fs.readFileSync(target, 'utf8');

// Container
content = content.replace(
  '<div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">',
  '<div className="min-h-screen bg-gradient-to-br from-[#001a4d] via-[#002868] to-[#003a8c] font-sans text-white overflow-x-hidden">'
);

// Hero section
content = content.replace(
  '<section className="relative w-full min-h-[90vh] bg-[#0A192F] text-white flex flex-col justify-center overflow-hidden pt-20 pb-16">',
  '<section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">'
);
content = content.replace(
  'h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight"',
  'h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-4"'
);
content = content.replace(
  '<span className="text-orange-500">All Civic Services.</span>',
  '<span className="text-white">All Civic Services.</span>'
);
content = content.replace(
  '<p className="text-xl md:text-3xl text-gray-300 font-light mb-8 max-w-3xl leading-relaxed">',
  '<p className="text-lg md:text-xl text-blue-200 leading-relaxed max-w-2xl mb-10 mx-auto">'
);
content = content.replace(
  '<p className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl mb-12 border-l-4 border-orange-500 pl-4">\n              Serving every citizen regardless of location, ability, or literacy.\n            </p>',
  ''
);

// Buttons
content = content.replace(
  'className="flex flex-col sm:flex-row gap-4 mb-16"',
  'className="flex flex-col sm:flex-row justify-center gap-4 mb-16 mx-auto w-full max-w-3xl"'
);
content = content.replace(
  'className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all hover:scale-105"',
  'className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 font-semibold px-8 py-4 rounded-xl backdrop-blur-sm transition-all duration-200"'
);
content = content.replace(
  'className="bg-transparent border-2 border-white/30 text-white hover:text-white hover:bg-white/10 font-bold text-lg px-8 py-6 rounded-xl transition-all"',
  'className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 font-semibold px-8 py-4 rounded-xl backdrop-blur-sm transition-all duration-200"'
);

// Start demo wrapper
content = content.replace(
  '<div className="flex flex-col">',
  '<div className="flex flex-col w-full sm:w-auto">'
);
content = content.replace(
  'className="relative group flex items-center gap-3 px-8 py-4\n                             bg-green-500 hover:bg-green-600 disabled:bg-green-400\n                             text-white font-bold text-lg rounded-2xl shadow-lg\n                             shadow-green-500/30 transition-all duration-200 h-full"',
  'className="bg-white hover:bg-[#E8F4FD] active:bg-[#BEE3F8] text-[#002868] font-black text-xl px-10 py-5 rounded-2xl shadow-2xl transition-all duration-200 flex items-center justify-center gap-3 mx-auto border-0 w-full disabled:opacity-75"'
);
content = content.replace(
  '<span className="text-sm font-normal opacity-80">— skip login</span>',
  '<span className="text-sm font-normal opacity-80 whitespace-nowrap hidden sm:inline">— skip login</span>'
);
content = content.replace(
  '<p className="text-xs text-gray-400 mt-2 text-center">\n                  Pre-loaded with Rahul Sharma&apos;s data · Electricity anomaly · 3 services\n                </p>',
  ''
);

// Stats
content = content.replace(
  '<div className="w-full bg-white/5 border-y border-white/10 backdrop-blur-md relative z-10 py-8">',
  '<div className="w-full relative z-10 py-8">'
);
content = content.replace(
  '<div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/20">',
  '<div className="grid grid-cols-2 lg:grid-cols-4 gap-6">'
);

content = content.replace(
  '<div className="text-center pt-4 md:pt-0">',
  '<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">'
);
content = content.replace(
  'className="text-4xl md:text-5xl font-black text-orange-400 mb-2"',
  'className="text-4xl font-black text-white"'
);
content = content.replace(
  '<div className="text-sm text-gray-400 uppercase tracking-widest font-bold">Citizens</div>',
  '<div className="text-sm text-blue-200 mt-1 font-medium">Citizens</div>'
);

content = content.replace(
  '<div className="text-center pt-4 md:pt-0">',
  '<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">'
);
content = content.replace(
  'className="text-4xl md:text-5xl font-black text-blue-400 mb-2"',
  'className="text-4xl font-black text-white"'
);
content = content.replace(
  '<div className="text-sm text-gray-400 uppercase tracking-widest font-bold">Languages</div>',
  '<div className="text-sm text-blue-200 mt-1 font-medium">Languages</div>'
);

content = content.replace(
  '<div className="text-center pt-4 md:pt-0">',
  '<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">'
);
content = content.replace(
  'className="text-4xl md:text-5xl font-black text-green-400 mb-2"',
  'className="text-4xl font-black text-white"'
);
content = content.replace(
  '<div className="text-sm text-gray-400 uppercase tracking-widest font-bold">Services</div>',
  '<div className="text-sm text-blue-200 mt-1 font-medium">Services</div>'
);

content = content.replace(
  '<div className="text-center pt-4 md:pt-0">',
  '<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">'
);
content = content.replace(
  'className="text-4xl md:text-5xl font-black text-purple-400 mb-2"',
  'className="text-4xl font-black text-white"'
);
content = content.replace(
  '<div className="text-sm text-gray-400 uppercase tracking-widest font-bold">Aadhaar Required</div>',
  '<div className="text-sm text-blue-200 mt-1 font-medium">Aadhaar Req.</div>'
);

// Section 2
content = content.replace(
  '<section className="py-24 bg-[#050D18] text-white">',
  '<section className="py-24 relative z-20 text-white">'
);
content = content.replace(
  '<h2 className="text-3xl md:text-5xl font-black mb-6">Why India Needs SUVIDHA</h2>',
  '<h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-4">Why India Needs SUVIDHA</h2>'
);
content = content.replace(
  '<div className="w-24 h-1 bg-orange-500 mx-auto rounded-full" />',
  '<div className="w-24 h-1 bg-white mx-auto rounded-full" />'
);
content = content.replace(
  'className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-orange-500/50 hover:bg-white/10 transition-colors"',
  'className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all text-center flex flex-col items-center"'
);
content = content.replace(/className="bg-white\/5 p-6 rounded-2xl border border-white\/10 hover:border-orange-500\/50 hover:bg-white\/10 transition-colors"/g, 'className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all text-center flex flex-col items-center"');
content = content.replace(/className="mb-4 bg-white\/10 w-fit p-3 rounded-xl"/g, 'className="mb-4 bg-white/10 w-fit p-3 rounded-xl mx-auto"');
content = content.replace(/className="text-gray-300 font-medium leading-relaxed"/g, 'className="text-white font-medium leading-relaxed"');

// Section 3
content = content.replace(
  '<section className="py-24 bg-gray-50 border-y border-gray-200 overflow-hidden">',
  '<section className="bg-white py-16 px-6">'
);
content = content.replace(
  '<h2 className="text-3xl md:text-5xl font-black text-[#0A192F] mb-6">Your 7-Step Journey with SUVIDHA</h2>',
  '<h2 className="text-3xl font-black text-[#0A1628] mb-6">Your 7-Step Journey with SUVIDHA</h2>'
);
content = content.replace(
  '<div className="w-24 h-1 bg-[#0A192F] rounded-full" />',
  '<div className="w-24 h-1 bg-[#0A1628] mx-auto rounded-full" />'
);
content = content.replace(
  '<div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbars">',
  '<div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory">'
);
content = content.replace(
  /className="min-w-\[280px\] md:min-w-\[320px\] bg-white p-8 rounded-3xl shadow-lg border border-gray-100 snap-center relative"/g,
  'className="min-w-[280px] md:min-w-[320px] bg-white rounded-2xl border-2 border-[#BEE3F8] shadow-sm p-6 hover:shadow-md hover:border-[#90CDF4] transition-all duration-200 snap-center relative"'
);
content = content.replace(
  /<div className="text-7xl font-black text-gray-100 absolute top-4 right-4 pointer-events-none">\s*0\{step\.num\}\s*<\/div>/g,
  ''
);
content = content.replace(
  /className="relative z-10"/g,
  'className="relative z-10 flex flex-col items-center text-center"'
);
content = content.replace(
  /className="w-12 h-12 bg-\[#0A192F\] text-white rounded-full flex items-center justify-center font-bold text-xl mb-6 shadow-md"/g,
  'className="w-12 h-12 bg-[#004085] text-white rounded-full flex items-center justify-center font-black text-xl flex-shrink-0 shadow-md mb-6"'
);
content = content.replace(
  /className="text-xl font-bold text-gray-900 mb-3"/g,
  'className="text-lg font-bold text-[#0A1628] mb-3"'
);
content = content.replace(
  /className="text-gray-600 leading-relaxed"/g,
  'className="text-[#2C5282] leading-relaxed"'
);

// Section 4
content = content.replace(
  '<section className="py-24 bg-white">',
  '<section className="bg-white py-16 px-6">'
);
content = content.replace(
  '<h2 className="text-3xl md:text-5xl font-black text-[#0A192F] mb-6">Engineered for Scale</h2>',
  '<h2 className="text-3xl font-black text-[#0A1628] mb-6">Engineered for Scale</h2>'
);
content = content.replace(
  '<div className="w-24 h-1 bg-orange-500 mx-auto rounded-full" />',
  '<div className="w-24 h-1 bg-[#004085] mx-auto rounded-full" />'
);
content = content.replace(
  /className="w-full sm:w-\[calc\(50%-1rem\)\] lg:w-\[calc\(25%-1rem\)\] bg-gray-50 border border-gray-200 p-6 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all"/g,
  'className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1rem)] bg-white rounded-2xl border-2 border-[#BEE3F8] shadow-sm p-6 hover:shadow-md hover:border-[#90CDF4] transition-all duration-200 text-center flex flex-col items-center"'
);
content = content.replace(
  /className="mb-4 text-\[#0A192F\] bg-blue-100 w-fit p-3 rounded-xl"/g,
  'className="mb-4 text-[#004085]"'
);
content = content.replace(
  /className="font-bold text-lg mb-2 text-gray-900"/g,
  'className="text-xl font-bold text-[#1A365D] mb-2"'
);
content = content.replace(
  /className="text-sm text-gray-600 leading-relaxed"/g,
  'className="text-sm text-[#4A6FA5] leading-relaxed"'
);


// Section 5
content = content.replace(
  '<section className="py-24 bg-blue-50 border-t border-blue-100">',
  '<section className="bg-[#F0F7FF] py-16 px-6 border-t-2 border-[#BEE3F8]">'
);
content = content.replace(
  '<h2 className="text-3xl md:text-5xl font-black text-[#0A192F] mb-6">Accessibility For All</h2>',
  '<h2 className="text-3xl font-black text-[#0A1628] mb-6">Accessibility For All</h2>'
);
content = content.replace(
  '<p className="text-xl text-gray-600 max-w-2xl">Because true public infrastructure leaves no citizen behind.</p>',
  '<p className="text-lg text-[#1A365D] max-w-2xl mx-auto">Because true public infrastructure leaves no citizen behind.</p>'
);
content = content.replace(
  '<div className="w-24 h-1 bg-[#0A192F] rounded-full mt-6" />',
  '<div className="w-24 h-1 bg-[#0A1628] rounded-full mx-auto mt-6" />'
);

content = content.replace(
  /className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex gap-6 items-start"/g,
  'className="bg-white rounded-2xl border-2 border-[#BEE3F8] shadow-sm p-6 hover:border-[#90CDF4] flex gap-6 items-start"'
);

// Eye
content = content.replace(
  'className="bg-blue-100 text-blue-700 p-4 rounded-2xl"',
  'className="text-[#004085] p-3 rounded-2xl bg-[#E8F4FD]"'
);
// Ear
content = content.replace(
  'className="bg-green-100 text-green-700 p-4 rounded-2xl"',
  'className="text-[#004085] p-3 rounded-2xl bg-[#E8F4FD]"'
);
// Volume2
content = content.replace(
  'className="bg-orange-100 text-orange-700 p-4 rounded-2xl"',
  'className="text-[#004085] p-3 rounded-2xl bg-[#E8F4FD]"'
);
// Accessibility
content = content.replace(
  'className="bg-purple-100 text-purple-700 p-4 rounded-2xl"',
  'className="text-[#004085] p-3 rounded-2xl bg-[#E8F4FD]"'
);

content = content.replace(
  /className="text-2xl font-bold mb-2"/g,
  'className="text-xl font-bold text-[#1A365D] mb-2"'
);
content = content.replace(
  /className="text-gray-600"/g,
  'className="text-lg text-[#1A365D] leading-relaxed"'
);

content = content.replace(
  'className="bg-[#0A192F] text-white p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"',
  'className="bg-[#002868] text-white rounded-3xl shadow-xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 w-full border-2 border-[#90CDF4]"'
);
content = content.replace(
  'className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"',
  'className="absolute top-0 right-0 w-64 h-64 bg-[#004085] rounded-full blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2 pointer-events-none"'
);
content = content.replace(
  'className="text-gray-300 max-w-2xl text-lg"',
  'className="text-[#BEE3F8] max-w-2xl text-lg mix-blend-screen leading-relaxed"'
);
content = content.replace(
  'className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-6 rounded-xl shrink-0 z-10"',
  'className="bg-white hover:bg-[#E8F4FD] active:bg-[#BEE3F8] text-[#002868] font-black text-xl px-8 py-6 rounded-2xl shadow-md transition-all h-auto w-full md:w-auto relative z-10 shrink-0 border-0"'
);
content = content.replace(
  'className="w-8 h-8 text-orange-500"',
  'className="w-8 h-8 text-white"'
);


// Section 6
content = content.replace(
  '<section className="py-20 bg-gray-900 border-t-4 border-orange-500 text-center">',
  '<section className="bg-white py-16 text-center border-t border-[#BEE3F8]">'
);
content = content.replace(
  'className="text-gray-400 font-bold tracking-widest uppercase text-sm mb-8"',
  'className="text-[#4A6FA5] font-bold tracking-widest uppercase text-sm mb-8"'
);
content = content.replace(
  'className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-60"',
  'className="flex flex-wrap justify-center gap-6 md:gap-12"'
);
content = content.replace(
  /className="text-2xl font-black text-white"/g,
  'className="text-xl font-bold text-[#1A365D]"'
);

// Section 7
content = content.replace(
  '<section className="py-32 bg-white text-center relative overflow-hidden">',
  '<section className="py-24 bg-gradient-to-br from-[#001a4d] via-[#002868] to-[#003a8c] text-center relative overflow-hidden">'
);
content = content.replace(
  '<h2 className="text-4xl md:text-6xl font-black text-[#0A192F] mb-8">Experience the Future of Indian GovTech.</h2>',
  '<h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight tracking-tight">Experience the Future of Indian GovTech.</h2>'
);
content = content.replace(
  'className="bg-[#0A192F] hover:bg-black text-white font-black text-xl px-12 py-8 rounded-2xl shadow-2xl transition-all hover:scale-105"',
  'className="bg-white hover:bg-[#E8F4FD] active:bg-[#BEE3F8] text-[#004085] font-bold text-xl px-12 py-8 rounded-2xl shadow-xl transition-all border-0 h-auto"'
);


fs.writeFileSync(target, content);
