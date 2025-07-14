import * as fs from "fs/promises";
import * as path from "path";

export async function logError(error: any, context?: string) {
    const date = new Date();
    const fileName = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.log`;
    const logDirectory = path.join(process.cwd(), "logs");
    const logFilePath = path.join(logDirectory, fileName);

    let errorMessage = "";

    if (error instanceof Error) {
        errorMessage = error.stack || error.message;
    } else if (typeof error === "object" && error !== null) {
        errorMessage = JSON.stringify(error, null, 2);
    } else {
        errorMessage = String(error);
    }

    const logEntry = `[${date.toLocaleString()}]${context ? ` [${context}]` : ""} ERROR: ${errorMessage}\n\n`;

    try {
        await fs.mkdir(logDirectory, { recursive: true });
        await fs.appendFile(logFilePath, logEntry);
    } catch (err) {
        console.error(`Failed to write to log file: ${err}`);
    }
}