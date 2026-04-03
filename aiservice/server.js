// process.on("uncaughtException", (err) => {
//     console.error("Uncaught Exception:", err);
// });

// process.on("unhandledRejection", (err) => {
//     console.error("Unhandled Rejection:", err);
// });

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const cors = require("cors");
const app = express();
const PORT = 3080;
app.use(cors());

// Create uploads folder if not exists
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// Multer setup
const upload = multer({ dest: "uploads/" });

// Paragraph extraction logic
function extractParagraphs(text) {
    return text
        // join broken lines
        .replace(/\n(?=[a-z])/g, " ")
        // split paragraphs
        .split(/\n\s*\n/)
        // clean
        .map(p => p.replace(/\n/g, " ").trim())
        .filter(p => p.length > 50);
}

// API route
app.post("/extract", upload.single("pdf"), async (req, res) => {
    try {
        // 🔥 CHECK FIRST
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("File received:", req.file);

        const filePath = req.file.path;

        // const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(req.file.buffer);

        const paragraphs = extractParagraphs(data.text);

        fs.unlinkSync(filePath);

        res.json({ paragraphs });

    } catch (error) {
        console.error("ERROR:", error); // IMPORTANT
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});