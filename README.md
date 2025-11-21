# RAR-App

A fully offline web application for multi-table data input and automatic PowerPoint (.pptx) report generation using a predefined template.

📌 Features
- Runs 100% locally
- Frontend built with HTML, CSS, JavaScript
- Backend using Node.js + Express.js
- All data stored in SQLite (embedded local database)
- Generate real PowerPoint (.pptx) files using PptxGenJS + Template
- Supports full CRUD operations across multiple tables
- Export report with 1 slide per user automatically
- Easy to distribute as a standalone folder or packaged as .exe

📄 License
Internal use only.


D:\Portable\node\node.exe -v
D:\Portable\node\npm -v
set PATH=D:\Portable\node;%PATH%
npm install
node app.js [or] npx.cmd nodemon app.js
npm run build 