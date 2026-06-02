const fs = require('fs');
const path = require('path');

function search(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            search(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('Karim')) {
                console.log(fullPath);
            }
        }
    }
}

search('c:\\Users\\ayoub\\OneDrive\\Desktop\\pfe\\cabinet_managment\\cabinet_managment\\src');
