import * as fs from "fs/promises";
import * as path from "path";

/**
 * Formats the current date and time into a standardized log timestamp string.
 * @returns A string in the format "[HH:MM:SS AM/PM] [MM/DD/YYYY]".
 */
export function formatLogTimestamp(): string {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: true });
    const date = now.toLocaleDateString('en-US');
    return `[${time}] [${date}]`;
}

/**
 * Logs an error to a file and the console.
 * @param error The error to log.
 * @param context Optional context to include in the log entry.
 */
export async function logError(error: any, context?: string): Promise<void> {
    const date = new Date();
    const fileName = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.log`;
    const logDirectory = path.join(process.cwd(), "logs");
    const logFilePath = path.join(logDirectory, fileName);

    let errorMessage = "";

    if (error instanceof Error) {
        errorMessage = error.stack || error.message;
    } else if (typeof error === "object" && error !== null) {
        const cache = new Set();
        errorMessage = JSON.stringify(error, (key, value) => {
            if (typeof value === "object" && value !== null) {
                if (cache.has(value)) {
                    return;
                }
                cache.add(value);
            }
            return value;
        }, 2);
    } else {
        errorMessage = String(error);
    }

    const logEntry = `[${date.toLocaleString()}]${context ? ` [${context}]` : ""} ERROR: ${errorMessage}\n\n`;

    console.error(`[${date.toLocaleString()}] New error logged: ${errorMessage.split('\n')[0]}`);

    try {
        await fs.mkdir(logDirectory, { recursive: true });
        await fs.appendFile(logFilePath, logEntry);
    } catch (err) {
        console.error(`Failed to write to log file: ${err}`);
    }
}