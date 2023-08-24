"use strict";
const Env = use("Env");
const path = require("path");
const fs = require("fs");
const os = require("os");

const TIMEOUT = 10*60000; // Timeout in milliseconds (30 seconds)

class ChunkedUploadController {
  deletePartialStoredChunks(totalChunks) {
    const uploadPath = os.tmpdir();
    for (let i = 0; i < totalChunks; i++) {
      const tmpFilePath = path.join(uploadPath, `tempfile${index}.bin`);
      fs.unlinkSync(tmpFilePath); // Remove individual chunk files
    }
  }

  async upload({ request, response, session }) {
    const { chunk } = request.post();
    const { chunkNumber, totalChunks, filename } = request.only([
      "chunkNumber",
      "totalChunks",
      "filename",
    ]);
    const file = chunk;
    const chunkKey = `${filename}_${totalChunks}`;
    const chunks = session.get(chunkKey, []);
    chunks[chunkNumber] = Date.now();
    session.put(chunkKey, chunks);

    const timeoutId = setTimeout(() => {
      this.deletePartialStoredChunks(totalChunks); // Handle the timeout here, e.g., delete incomplete data or notify the client.
      session.forget(chunkKey); // Clean up session data
      response.status(408).send("Chunk upload timeout");
    }, TIMEOUT);

    if (!file) {
      return response.status(400).json({ message: "File not provided" });
    }
    const uploadPath = os.tmpdir();
    const chunkHash = `tempfile${chunkNumber}.bin`;
    const tmpFilePath = path.join(uploadPath, chunkHash);
    try {
      fs.writeFileSync(tmpFilePath, file, { flag: "w", encoding: "base64" });
      const allChunksReceived = chunks.length == totalChunks;
      if (allChunksReceived) {
        return this.combineChunks(totalChunks, filename)
          .then(() => {
            response
              .status(200)
              .json({ message: "File uploaded successfully" });
            session.forget(chunkKey);
            clearTimeout(timeoutId);
          })
          .catch((error) => {
            this.deletePartialStoredChunks(totalChunks);
            session.forget(chunkKey);
            clearTimeout(timeoutId);
          });
      } else {
        return response
          .status(200)
          .json({ message: "Chunk uploaded successfully" });
      }
    } catch (error) {
      this.deletePartialStoredChunks(totalChunks);
      console.error("Error creating write stream:", error);
    }
  }

  async combineChunks(totalChunks, filename) {
    const readStreams = [];
    const uploadPath = os.tmpdir();
    for (let i = 0; i < totalChunks; i++) {
      const tmpFilePath = path.join(uploadPath, `tempfile${i}.bin`);
      readStreams.push(
        fs.readFileSync(tmpFilePath, { flag: "r", encoding: "base64" })
      );
    }
    const backupPath = path.join(Env.get("STORAGE_PATH"), "backups");
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath);
    }
    const combinedFilePath = path.join(backupPath, filename);
    try {
      fs.writeFileSync(combinedFilePath, readStreams.toString(), {
        flag: "w",
        encoding: "base64",
      });
    } catch (error) {
      console.log("Error creating write stream:", error);
    }
    readStreams.forEach((readStream, index) => {
      const tmpFilePath = path.join(uploadPath, `tempfile${index}.bin`);
      fs.unlinkSync(tmpFilePath); // Remove individual chunk files
    });
  }
}
module.exports = ChunkedUploadController;
