import express from "express"
import multer, { memoryStorage } from "multer";
import path from "path";
import fs from "fs"
import { Readable } from "stream";
import type { Request, Response } from "express";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PORT = 3000
const app = express()
const upload = multer({ storage: memoryStorage() });


app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    return res.json({
        message: "Ok"
    })
})

const inputDirectory = path.join(
    __dirname,
    "..",
    "static",
    "input",
);

app.post('/upload', upload.single("file"), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            message: "No file selected"
        })
    }
    const filename = path.parse(req.file.originalname).name;
    const outputPath = path.join(inputDirectory, `${filename}.csv`)

    const readable = Readable.from(req.file.buffer)

    const writable = fs.createWriteStream(outputPath)

    readable.pipe(writable)

    writable.on("finish", () => {
        res.json({
            message: "Uploaded message successfully"
        })
    })

    writable.on("error", (err) => {
        console.error(err);
        res.status(500).send("Write failed");
    })
})

app.listen(PORT, () => {
    console.log(`Listening on the server on port ${PORT}`);
})