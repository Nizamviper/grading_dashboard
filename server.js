const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const upload = multer({ dest: "uploads/" });


// ✅ CLEAN TEXT FUNCTION (fix weird characters)
function cleanText(text) {
    if (!text) return "";

    return text
        .toString()
        .replace(/[^\x00-\x7F]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}


// ✅ FILE UPLOAD API
app.post("/upload", upload.single("file"), (req, res) => {

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let data = xlsx.utils.sheet_to_json(sheet);

    // clean every string cell
    data = data.map(row => {
        for (let key in row) {
            if (typeof row[key] === "string") {
                row[key] = cleanText(row[key]);
            }
        }
        return row;
    });

    // optional: delete uploaded temp file
    fs.unlinkSync(req.file.path);

    res.json(data);
});


app.listen(3000, () =>
    console.log("🚀 Running → http://localhost:3000")
);
