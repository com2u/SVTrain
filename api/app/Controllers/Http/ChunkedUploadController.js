"use strict";
const Env = use("Env");
const path = require("path");
const fs = require("fs");
const os = require("os");
const glob = require("glob");
const { promisify } = require("util");
const globAsync = promisify(glob);
const uploadPath = os.tmpdir();
const TIMEOUT = 600000;
class ChunkedUploadController {
  async deletePartialStoredChunks(testUser) {
    const filePattern = `*_${testUser}.bin`;
    try {
      // Use await with the promisified globAsync function.
      const files = await globAsync(`${uploadPath}/${filePattern}`);
      for (const file of files) {
        const fileName = path.basename(file); // Use path.basename to get the file name.
        const tmpFilePath = path.join(uploadPath, fileName);
        fs.unlinkSync(tmpFilePath);
      }
    } catch (err) {
      console.error("Error reading files:", err);
    }
  }

  async upload({ request, response, session }) {
    const { chunk } = request.post();
    const { chunkNumber, totalChunks, filename, testUser } = request.only([
      "chunkNumber",
      "totalChunks",
      "filename",
      "testUser",
    ]);
    const file = chunk;
    const chunkKey = `${testUser}_${filename}_${totalChunks}`;
    const chunks = session.get(chunkKey, []);
    chunks[chunkNumber] = Date.now();
    session.put(chunkKey, chunks);

    // all the chunks received within 10 mins.
    if (chunks[chunkNumber] - chunks[0] > TIMEOUT) {
      this.deletePartialStoredChunks(testUser);
      return response.status(400).json({ message: "Timeout exceed" });
    }

    if (!file) {
      return response.status(400).json({ message: "File not provided" });
    }
    const chunkHash = `tempfile${chunkNumber}_${testUser}.bin`;
    const tmpFilePath = path.join(uploadPath, chunkHash);
    try {
      fs.writeFileSync(tmpFilePath, file, "base64");
      const allChunksReceived = chunks.length == totalChunks;
      if (allChunksReceived) {
        try {
          await this.combineChunks(filename, testUser, totalChunks);
          session.forget(chunkKey);
          this.deletePartialStoredChunks(testUser);
          return response
            .status(200)
            .json({ message: "All chunks received successfully" });
        } catch (error) {
          this.deletePartialStoredChunks(testUser);
          session.forget(chunkKey);
          return response
            .status(500)
            .json({ message: `All chunks does not received: ${error}` });
        }
      } else {
        return response
          .status(200)
          .json({ message: "Chunk uploaded successfully" });
      }
    } catch (error) {
      this.deletePartialStoredChunks(testUser);
      console.error("Error creating write stream:", error);
      return response
        .status(500)
        .json({ message: "Error while uploading file" });
    }
  }

  sortFileBasedOnIndex(files) {
    return files.sort(function (firstFile, secondFile) {
      const startIndexOfFirstFile = firstFile.indexOf("tempfile");
      const startIndexOfSecondFile = secondFile.indexOf("tempfile");
      const endIndexOfFirstFile = firstFile.indexOf("_user");
      const endIndexOfSecondFile = secondFile.indexOf("_user");
      const firstFileIndex = firstFile.substring(
        startIndexOfFirstFile + 8,
        endIndexOfFirstFile - 1
      );
      const secondFileIndex = secondFile.substring(
        startIndexOfSecondFile + 8,
        endIndexOfSecondFile - 1
      );
      return firstFileIndex - secondFileIndex;
    });
  }

  async combineChunks(filename, testUser) {
    const filePattern = `*_${testUser}.bin`;
    const backupPath = path.join(Env.get("STORAGE_PATH"), "backups");
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath);
    }
    const combinedFilePath = path.join(backupPath, filename);
    const outputStream = fs.createWriteStream(combinedFilePath);
    try {
      // Use await with the promisified globAsync function.
      const files = await globAsync(`${uploadPath}/${filePattern}`);
      if (files.length !== totalChunks) {
        throw "some chunks are missing.";
      }
      //sort file based on index number
      const sortedFiles = this.sortFileBasedOnIndex(files);
      for (const file of sortedFiles) {
        const fileData = fs.readFileSync(file, {
          flag: "r",
          encoding: "base64",
        });
        const fileBuffer = Buffer.from(fileData, "base64");
        outputStream.write(fileBuffer);
        const fileName = path.basename(file); // Use path.basename to get the file name.
        const tmpFilePath = path.join(uploadPath, fileName);
        fs.unlinkSync(tmpFilePath);
      }
      outputStream.on("error", (err) => {
        console.error("Error writing to the output stream:", err);
      });
      outputStream.end();
    } catch (err) {
      console.error("Error reading files:", err);
      throw err;
    }
  }
}
module.exports = ChunkedUploadController;
