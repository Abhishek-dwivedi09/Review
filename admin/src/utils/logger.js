import fs from "fs-extra";
import dayjs from "dayjs";
import path from "path";
import winston from "winston";

const logsDir = path.resolve("logs");
fs.ensureDirSync(logsDir);

const logger = winston.createLogger({
  name: "requestLogger",
  level: "info",
  exitOnError: false,
  format: winston.format.combine(
    winston.format.label({ label: "log" }),
    winston.format.errors({ stack: true }),
    winston.format.timestamp({
      format: () => dayjs().format("ddd MMM D YYYY HH:mm:ss Z"),
    }),
    winston.format.printf(
      (info) =>
        `[${info.level}] [${info.timestamp}] [${
          info.label
        }]: ${info.message.replace("\n", "")}`
    ),
    winston.format.align(),
    winston.format.padLevels(),
    winston.format.colorize({ all: true })
  ),
  transports: [
    new winston.transports.File({
      name: "file.system",
      filename: path.resolve("logs", "app.log"),
      maxsize: 5000000,
      maxFiles: 5,
      tailable: true,
    }),
  ],
});

//if (process.env.NODE_ENV !== 'production') {
logger.add(new winston.transports.Console());
//}

logger.stream = {
  write: function (message, encoding) {
    logger.info(message);
  },
};

export default logger;
