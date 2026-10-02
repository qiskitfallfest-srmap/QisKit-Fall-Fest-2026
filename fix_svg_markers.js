const fs = require('fs');
let content = fs.readFileSync('components/campus/InteractiveCampusMap.tsx', 'utf-8');

// Fix 1: Gate 3 Marker
content = content.replace(
  /<circle cx="740" cy="310" r="14"([\s\S]*?)<\/circle>/g,
  `<g transform="translate(740, 310)">
                  <circle cx="0" cy="0" r="14"$1</circle>
                </g>`
);

// Fix 2: Destination Arrival Marker
content = content.replace(
  /<circle\s+cx=\{currentRoute\.destPoint\.x\}\s+cy=\{currentRoute\.destPoint\.y\}\s+r="14"([\s\S]*?)<\/circle>/g,
  `<g transform={\`translate(\${currentRoute.destPoint.x}, \${currentRoute.destPoint.y})\`}>
                  <circle cx="0" cy="0" r="14"$1</circle>
                </g>`
);

// Fix 3: Active Destination Beacon
content = content.replace(
  /<circle\s+cx=\{currentRoute\.destPoint\.x\}\s+cy=\{currentRoute\.destPoint\.y\}\s+r="12"([\s\S]*?)<\/circle>/g,
  `<g transform={\`translate(\${currentRoute.destPoint.x}, \${currentRoute.destPoint.y})\`}>
                  <circle cx="0" cy="0" r="12"$1</circle>
                </g>`
);

fs.writeFileSync('components/campus/InteractiveCampusMap.tsx', content);
