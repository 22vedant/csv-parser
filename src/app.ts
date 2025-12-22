import fs from "fs"
import { db } from "./firebase.ts"
import path from "path";
import csv from "csv-parser"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const inputDirectory = path.join(
//     __dirname,
//     "..",
//     "static",
//     "output-csvs",
// );

const inputDirectory = path.join(
    __dirname,
    "..",
    "static",
    "output",
    "customers"
);

const BATCH_LIMIT = 500

const processCsvFiles = (filePath: string, db) => {
    return new Promise<void>((resolve, reject) => {
        let batch = db.batch();
        let batchCount = 0;
        let totalWritten = 0;

        const stream = fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", async function (row) {
                try {
                    const docRef = db.collection("customers").doc();

                    batch.set(docRef, row);
                    batchCount++;

                    if (batchCount === BATCH_LIMIT) {
                        stream.pause();

                        await batch.commit();

                        totalWritten += batchCount;
                        batch = db.batch();
                        batchCount = 0;

                        stream.resume();
                    }
                } catch (err) {
                    stream.destroy();
                    reject(err);
                }
            })
            .on("end", async () => {
                try {
                    if (batchCount > 0) {
                        await batch.commit();
                        totalWritten += batchCount;
                    }
                    console.log(`✅ ${path.basename(filePath)} → ${totalWritten} docs`);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            })
            .on("error", reject);
    });
}

async function run() {
    const files = fs.readdirSync(inputDirectory)
        .filter(f => f.endsWith(".csv"))
        .sort();

    console.log(`Found ${files.length} CSV files`);

    for (const file of files) {
        console.log(`Processing ${file}`);
        await processCsvFiles(path.join(inputDirectory, file), db);
    }

    console.log(`All ${files.length} CSV files uploaded to Firestore`);
}
async function main() {
    console.time("Start Time");
    await run(); // wait for run to finish
    console.timeEnd("End Time"); // ends the timer correctly
}

main();
