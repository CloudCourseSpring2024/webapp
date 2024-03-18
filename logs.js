import fs from 'fs';
import Logger from 'node-json-logger';

const logFilePath = '/var/log/google-cloud-ops-agent/myapp.log';

// Create a write stream with error handling
let logStream;
try {
    logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
} catch (err) {
    console.error('Error creating log stream:', err);
    // Handle the error, such as logging to console or a fallback location
}

const options = {
    level: 'warn', // Set log level to capture warning messages and above
    // Override the stream where logs are written (default is process.stdout)
    stream: logStream
};

const logger = new Logger(options);

async function appendToLog(message) {
    try {
        await fs.promises.appendFile(logFilePath, `${new Date().toISOString()} - ${message}\n`);
        console.log('Log entry appended successfully.');
    } catch (err) {
        console.error('Error appending to log file:', err);
    }
}

export const info = async (message) => {
    logger.info(message);
    await appendToLog(`INFO: ${message}`);
};

export const warn = async (message) => {
    logger.warn(message);
    await appendToLog(`WARNING: ${message}`);
};

export const error = async (message) => {
    logger.error(message);
    await appendToLog(`ERROR: ${message}`);
};

export const debug = async (message) => {
    logger.debug(message);
    await appendToLog(`DEBUG: ${message}`);
};

export const fatal = async (message) => {
    logger.fatal(message);
    await appendToLog(`FATAL: ${message}`);
};

export default logger;
