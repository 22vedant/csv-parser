import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const splitFunc = (filename: string, outputFolder: string) => {
    const inputFilePath = path.join(
        __dirname,
        "..",
        "static",
        "input"
    );

    const inputFile = path.join(inputFilePath, filename)

    const outputDirectoryPath = path.join(
        __dirname,
        "..",
        "static",
        "output",
        outputFolder
    );

    const outputFilenamePrefix = "file-chunk";
    const MAX_ROWS_PER_FILE = 5000;

    fs.mkdirSync(outputDirectoryPath, { recursive: true });

    fs.readFile(inputFile, "utf8", (err, data) => {
        if (err) {
            console.error("Failed to read input file:", err);
            return;
        }

        const rows = data.trim().split("\n");
        const header = rows[0];
        const dataRows = rows.slice(1);

        const numChunks = Math.ceil(dataRows.length / MAX_ROWS_PER_FILE);

        for (let i = 0; i < numChunks; i++) {
            const start = i * MAX_ROWS_PER_FILE;
            const end = start + MAX_ROWS_PER_FILE;
            const chunkRows = dataRows.slice(start, end);

            const outputFilePath = path.join(
                outputDirectoryPath,
                `${outputFilenamePrefix}-${i + 1}.csv`
            );

            const fileContent = [header, ...chunkRows].join("\n");

            fs.writeFileSync(outputFilePath, fileContent, "utf8");
            console.log(`✅ Chunk ${i + 1} written → ${outputFilePath}`);
        }
    });
}

splitFunc("customers-1000000.csv", "customers")
