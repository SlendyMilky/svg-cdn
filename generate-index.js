const fs = require('fs');
const path = require('path');

function generateIndexHtml(dirPath) {
    const files = fs.readdirSync(dirPath);
    let htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Index of ${path.basename(dirPath)}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
    <link rel="icon" href="/favicon.ico" type="image/x-icon">
    <style>
        body {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            height: 100vh;
            margin: 0;
            color-scheme: light dark;
            flex-direction: column;
        }
        .background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('/background.avif') no-repeat center center;
            background-size: cover;
            filter: blur(20px);
            z-index: -1;
        }
        #file-list {
            border: 2px solid #ccc;
            border-radius: 10px;
            padding: 20px;
            width: 80%;
            overflow-y: visible;
            color: #3341be;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        #project-icon {
            width: 100px;
            height: auto;
            margin-bottom: 20px;
        }
        h1 {
            text-align: center !important;
        }
        footer {
            margin-top: 20px;
            font-size: 0.8em;
            align-self: center;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td {
            padding: 10px;
            vertical-align: middle;
        }
        .file-item img {
            width: 50px;
            height: auto;
            margin-right: 10px;
        }
        .toast-nav {
            position: fixed;
            top: 10px;
            right: 10px;
            background-color: rgba(255, 255, 255, 0.8);
            border-radius: 5px;
            padding: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .toast-nav a {
            margin: 0 5px;
            text-decoration: none;
            color: #3341be;
        }
        .copy-button {
            background-color: #3341be;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="background"></div>
    <a href="/"><img id="project-icon" src="/favicon.ico" alt="Icone du projet"></a>
    <div class="toast-nav">
        <a href="/assets/index.html">Assets</a>
        <a href="/assets/sbb/index.html">SBB</a>
        <!-- Add more links as needed -->
    </div>
    <div id="file-list">
        <h1>Index of ${path.basename(dirPath)}</h1>
        <table>
`;

    files.forEach(file => {
        if (file === 'index.html') return; // Exclude index.html files
        const filePath = path.join(dirPath, file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        const fileIcon = isDirectory ? '📁' : `<img src="${file}" alt="${file}">`;
        const fileUrl = `${dirPath}/${file}`;
        htmlContent += `<tr class="file-item"><td><a href="${file}">${file}${isDirectory ? '/' : ''}</a></td><td>${fileIcon}</td><td><button class="copy-button" onclick="navigator.clipboard.writeText('${fileUrl}')">📋</button></td></tr>\n`;
    });

    htmlContent += `
        </table>
    </div>
    <footer>
        &copy; 2024 - <span id="current-year"></span> with ❤️ by 
        <a href="https://github.com/SlendyMilky" target="_blank">Slendy_Milky</a>
    </footer>
    <script>
        document.getElementById('current-year').textContent = new Date().getFullYear();
    </script>
</body>
</html>
`;

    fs.writeFileSync(path.join(dirPath, 'index.html'), htmlContent);
}

function updateRootIndexHtml() {
    const rootIndexPath = path.join(__dirname, 'index.html');
    let rootHtmlContent = fs.readFileSync(rootIndexPath, 'utf-8');

    const startMarker = '<!-- START GENERATED INDEX -->';
    const endMarker = '<!-- END GENERATED INDEX -->';

    const files = fs.readdirSync(path.join(__dirname, 'assets'));
    let generatedIndex = '<div id="assets-index"><h2>Index des assets</h2><ul>';

    files.forEach(file => {
        const filePath = path.join(__dirname, 'assets', file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        if (isDirectory) {
            generatedIndex += `<li><a href="/assets/${file}/index.html">${file}</a></li>`;
        }
    });

    generatedIndex += '</ul></div>';

    const startIndex = rootHtmlContent.indexOf(startMarker);
    const endIndex = rootHtmlContent.indexOf(endMarker) + endMarker.length;

    if (startIndex !== -1 && endIndex !== -1) {
        rootHtmlContent = rootHtmlContent.slice(0, startIndex + startMarker.length) + '\n' + generatedIndex + '\n' + rootHtmlContent.slice(endIndex);
    } else {
        rootHtmlContent += `\n${startMarker}\n${generatedIndex}\n${endMarker}\n`;
    }

    fs.writeFileSync(rootIndexPath, rootHtmlContent);
}

function walkDir(dirPath) {
    generateIndexHtml(dirPath);
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            walkDir(filePath);
        }
    });
}

walkDir(path.join(__dirname, 'assets'));
updateRootIndexHtml();