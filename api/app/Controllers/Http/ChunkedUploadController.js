"use strict";
const Env = use("Env");
const path = require("path");
const fs = require("fs");
const os = require("os");

const TIMEOUT = 10*60000; // Timeout in milliseconds (30 seconds)
let chunks = []; // storing chunk's timestamp

class ChunkedUploadController {
  storeChunkTimeStamp(chunkIndex) {
    chunks[chunkIndex] = Date.now(); // Update timestamp for chunk
  }

  checkMissingChunk(totalChunks) {
    if (chunks.length != totalChunks) {
      return response.status(400).json({
        error: "Chunk Missing",
        message:
          "Not all chunks were received within the specified time frame.",
      });
    }
  }

  chunkProcessing(response) {
    const now = Date.now();
    for (const chunkIndex in chunks) {
      if (now - chunks[chunkIndex] > TIMEOUT) {
        const uploadPath = os.tmpdir();
        for (const index in chunks) {
          const tmpFilePath = path.join(uploadPath, `tempfile${index}.bin`);
          fs.unlinkSync(tmpFilePath); // Remove individual chunk files
        }

        return response.status(400).json({
          error: "Chunk Timeout",
          message:
            "The upload process took too long within the specified time frame.",
          hint: "Please ensure a stable internet connection and make sure all chunks are sent in a timely manner.",
        });
      }
    }
  }

  notifyLastChunkReceived() {
    chunks = [];
  }

  async upload({ request, response }) {
    const { chunk } = request.post();
    const { chunkNumber, totalChunks, filename } = request.only([
      "chunkNumber",
      "totalChunks",
      "filename",
    ]);
    const file = chunk;
    if (!file) {
      return response.status(400).json({ message: "File not provided" });
    }
    this.storeChunkTimeStamp(chunkNumber);
    const uploadPath = os.tmpdir();
    const chunkHash = `tempfile${chunkNumber}.bin`;
    const tmpFilePath = path.join(uploadPath, chunkHash);
    try {
      fs.writeFileSync(tmpFilePath, file, { flag: "a", encoding: "base64" });
      this.chunkProcessing(response);
      if (Number(chunkNumber) === Number(totalChunks) - 1) {
        return this.combineChunks(totalChunks, filename)
          .then(() => {
            response
              .status(200)
              .json({ message: "File uploaded successfully" });

            this.notifyLastChunkReceived();
          })
          .catch((error) => {
            // reject(error);
            this.notifyLastChunkReceived();
          });
      } else {
        return response
          .status(200)
          .json({ message: "Chunk uploaded successfully" });
      }
    } catch (error) {
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
      fs.writeFileSync(combinedFilePath, readStreams.toString(), { flag: "w", encoding: "base64" });
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
