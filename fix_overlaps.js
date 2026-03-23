const fs = require('fs');
const path = require('path');

function replaceFileContent(filePath, replacers) {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    replacers.forEach(([search, replace]) => {
        content = content.replace(search, replace);
    });
    fs.writeFileSync(fullPath, content);
}

// 1. Fix the main /kiosk page overlap (absolute bottom-8 overlaps the center buttons)
replaceFileContent('src/app/(kiosk)/kiosk/page.tsx', [
    // Change the absolute positioning to relative flex box that pushes to bottom
    [
        'className="absolute bottom-8 left-0 w-full flex flex-col items-center gap-6"', 
        'className="w-full mt-auto mb-8 flex flex-col items-center gap-6 z-10"'
    ],
    // Change the main container to allow flex growth securely and padding to clear left toolbar
    [
        'className="h-full overflow-y-auto p-6 md:p-8 max-w-4xl mx-auto flex flex-col items-center justify-center w-full"',
        'className="h-full overflow-y-auto pt-16 pb-8 pl-24 pr-8 max-w-5xl mx-auto flex flex-col items-center justify-center w-full relative"'
    ],
    // Give some margin above the 4 access mode buttons
    [
        'grid grid-cols-2 md:grid-cols-4 gap-4 w-full justify-center',
        'grid grid-cols-2 md:grid-cols-4 gap-4 w-full justify-center px-4'
    ],
    // Make the Welcome text not bump into top if screen is short
    [
        'flex gap-6 mb-16',
        'flex gap-6 mb-10 mt-6'
    ]
]);

// 2. Fix Auth page overlaps
// Auth page has a small stepper that overlaps and lacks left padding
replaceFileContent('src/app/(kiosk)/kiosk/auth/page.tsx', [
    [
        'className="flex flex-col h-full bg-[#F0F7FF]"',
        'className="flex flex-col h-full bg-[#F0F7FF] pl-20"' // Clear the left toolbar
    ],
    [
        'className="w-full max-w-md mx-auto"',
        'className="w-full max-w-md mx-auto mt-6 z-10 relative"'
    ],
    // Remove the fixed top-24 right-8 DEMO MODE badge if it overlaps the ConnectivityBanner?
    // Actually, let's just make sure it stays nicely relative/absolute.
    [
        'fixed top-24 right-8 z-50 bg-[#FFFBEB] text-[#7B4A0A] px-4 py-2 border-2 border-[#FBD38D] font-bold rounded-lg shadow-md flex items-center gap-2',
        'absolute top-4 right-8 z-50 bg-[#FFFBEB] text-[#7B4A0A] px-4 py-2 border-2 border-[#FBD38D] font-bold rounded-lg shadow-md flex items-center gap-2'
    ],
    // Increase the stepper legibility / size slightly
    [
        'text-xs font-medium',
        'text-sm font-bold tracking-wide'
    ]
]);

// 3. Fix Dashboard page overlaps
replaceFileContent('src/app/(kiosk)/kiosk/dashboard/page.tsx', [
    [
        'className="h-full overflow-y-auto p-6 md:p-8"',
        'className="h-full overflow-y-auto p-6 pl-24 md:p-8 md:pl-28 max-w-7xl mx-auto w-full"'
    ]
]);

// 4. Fix Complaint page overlaps
replaceFileContent('src/app/(kiosk)/kiosk/complaint/page.tsx', [
    [
        'className="h-full overflow-y-auto p-6 md:p-8 max-w-4xl mx-auto"',
        'className="h-full overflow-y-auto p-6 pl-24 md:p-8 md:pl-28 max-w-5xl mx-auto w-full"'
    ]
]);

// 5. Fix Pay page overlaps
replaceFileContent('src/app/(kiosk)/kiosk/pay/page.tsx', [
    [
        'h-full overflow-y-auto p-6 md:p-8 max-w-4xl mx-auto w-full border-t-0',
        'h-full overflow-y-auto p-6 pl-24 md:p-8 md:pl-28 max-w-5xl mx-auto w-full border-t-0'
    ]
]);

// 6. Fix Electricity page overlaps
replaceFileContent('src/app/(kiosk)/kiosk/electricity/page.tsx', [
    [
        'className="flex-1 overflow-y-auto p-6"',
        'className="flex-1 overflow-y-auto p-6 pl-24 md:p-8 md:pl-28 max-w-7xl mx-auto w-full"'
    ]
]);

// 7. Fix Queue page overlaps
replaceFileContent('src/app/(kiosk)/kiosk/queue/page.tsx', [
    [
        'className="h-full overflow-y-auto p-6 md:p-8 ${highContrast ? \'bg-black text-white\' : \'bg-[#F0F7FF]\'}"',
        'className="h-full overflow-y-auto p-6 pl-24 md:p-8 md:pl-28 max-w-5xl mx-auto w-full ${highContrast ? \'bg-black text-white\' : \'bg-[#F0F7FF]\'}"'
    ]
]);

// 8. Fix Discovery page overlaps
replaceFileContent('src/app/(kiosk)/kiosk/discovery/page.tsx', [
    [
        'className="h-full overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto w-full"',
        'className="h-full overflow-y-auto p-6 pl-24 md:p-8 md:pl-28 max-w-6xl mx-auto w-full"'
    ]
]);

console.log("Applied padding-left classes to clear the AccessibilityToolbar, and fixed overlapping absolute containers.");
