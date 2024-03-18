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

function appendToLog(message) {
    fs.appendFile(logFilePath, `${new Date().toISOString()} - ${message}\n`, (err) => {
        if (err) {
            console.error('Error appending to log file:', err);
        } else {
            console.log('Log entry appended successfully.');
        }
    });
}

export const info = (message) => {
    logger.info(message);
    appendToLog(`INFO: ${message}`);
};

export const warn = (message) => {
    logger.warn(message);
    appendToLog(`WARNING: ${message}`);
};

export const error = (message) => {
    logger.error(message);
    appendToLog(`ERROR: ${message}`);
};

export const debug = (message) => {
    logger.debug(message);
    appendToLog(`DEBUG: ${message}`);
};

export const fatal = (message) => {
    logger.fatal(message);
    appendToLog(`FATAL: ${message}`);
};

export default logger;
