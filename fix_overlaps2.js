const fs = require('fs');
const path = require('path');

function replaceFileContent(filePath, replacers) {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    replacers.forEach(([searchReg, replaceWith]) => {
        content = content.replace(searchReg, replaceWith);
    });
    fs.writeFileSync(fullPath, content);
}

replaceFileContent('src/app/(kiosk)/kiosk/queue/page.tsx', [
    [
        /className=\{`h-full overflow-y-auto p-6 md:p-8/g,
        'className={`h-full overflow-y-auto p-6 pl-24 md:p-8 md:pl-28 max-w-5xl mx-auto w-full'
    ]
]);

replaceFileContent('src/app/(kiosk)/kiosk/discovery/page.tsx', [
    [
        /className="h-full overflow-y-auto p-6 md:p-8 flex flex-col items-center"/g,
        'className="h-full overflow-y-auto p-6 pl-24 md:p-8 md:pl-28 flex flex-col items-center"'
    ]
]);

replaceFileContent('src/app/(kiosk)/kiosk/complaint/page.tsx', [
    [
        /className="h-full overflow-y-auto p-6 md:p-8"/g,
        'className="h-full overflow-y-auto p-6 pl-24 md:p-8 md:pl-28"'
    ]
]);

replaceFileContent('src/app/(kiosk)/kiosk/electricity/page.tsx', [
    [
        /className="flex-1 overflow-y-auto p-6/g,
        'className="flex-1 overflow-y-auto p-6 pl-24 md:p-8 md:pl-28 max-w-7xl mx-auto w-full'
    ]
]);

console.log("Fixed remaining pages.");
