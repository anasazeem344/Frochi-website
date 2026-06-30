import { writeFileSync } from 'fs';
import { generateWordPressCode } from './WordPressCodeExporter';

const { html, css, js } = generateWordPressCode();

const template = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Frochi WordPress Export Test</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    ${js}
  </script>
</body>
</html>`;

writeFileSync('wordpress_test.html', template);
console.log('Successfully regenerated wordpress_test.html');
