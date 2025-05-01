#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");
const { exec } = require("child_process");
const readline = require("readline");

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: node download-video.js <m3u8_url> [output_filename]");
  console.log(
    "Example: node download-video.js https://example.com/video.m3u8 output.mp4"
  );
  process.exit(1);
}

// Configuration
const M3U8_URL = args[0];
const OUTPUT_FILENAME = args[1] || "output.mp4";
const TEMP_DIR = path.join(__dirname, "temp_segments");
const SEGMENTS_LIST = path.join(TEMP_DIR, "segments.txt");

// Create temp directory if it doesn't exist
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Function to download a file
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
  });
}

// Function to download m3u8 content
function downloadM3U8(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          resolve(data);
        });
        response.on("error", (err) => {
          reject(err);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

// Function to parse m3u8 content and extract segment URLs
function parseM3U8(content) {
  const lines = content.split("\n");
  const segmentUrls = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      if (i + 1 < lines.length && !lines[i + 1].startsWith("#")) {
        segmentUrls.push(lines[i + 1]);
      }
    }
  }

  return segmentUrls;
}

// Function to handle relative URLs
function resolveUrl(baseUrl, relativeUrl) {
  // Check if the URL is already absolute
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
    return relativeUrl;
  }

  // Extract base URL parts
  const urlObj = new URL(baseUrl);
  const basePath = urlObj.pathname.substring(
    0,
    urlObj.pathname.lastIndexOf("/") + 1
  );

  // Handle relative URLs
  if (relativeUrl.startsWith("/")) {
    // Absolute path relative to domain
    return `${urlObj.protocol}//${urlObj.host}${relativeUrl}`;
  } else {
    // Relative to current path
    return `${urlObj.protocol}//${urlObj.host}${basePath}${relativeUrl}`;
  }
}

// Function to create FFmpeg input file list
function createFFmpegInputFile(segmentPaths) {
  const fileContent = segmentPaths.map((path) => `file '${path}'`).join("\n");
  fs.writeFileSync(SEGMENTS_LIST, fileContent);
}

// Progress display
function updateProgress(current, total) {
  const percentage = Math.floor((current / total) * 100);
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(
    `Downloading: ${current}/${total} segments (${percentage}%)`
  );
}

// Main function
async function main() {
  try {
    console.log("Starting download process...");
    console.log(`URL: ${M3U8_URL}`);
    console.log(`Output: ${OUTPUT_FILENAME}`);

    // Download and parse m3u8 file
    const m3u8Content = await downloadM3U8(M3U8_URL);
    const segmentUrls = parseM3U8(m3u8Content);

    if (segmentUrls.length === 0) {
      console.error("No segments found in the m3u8 file.");
      return;
    }

    console.log(`Found ${segmentUrls.length} segments to download.`);

    // Download all segments
    const segmentPaths = [];

    for (let i = 0; i < segmentUrls.length; i++) {
      let url = segmentUrls[i];

      // Resolve URL if it's relative
      if (!url.startsWith("http")) {
        url = resolveUrl(M3U8_URL, url);
      }

      const segmentFilename = path.basename(url);
      const segmentPath = path.join(TEMP_DIR, segmentFilename);

      try {
        await downloadFile(url, segmentPath);
        segmentPaths.push(segmentPath);
        updateProgress(i + 1, segmentUrls.length);
      } catch (err) {
        console.error(`\nError downloading segment ${url}: ${err.message}`);
      }
    }

    console.log("\nAll segments downloaded. Merging with FFmpeg...");

    // Create input file for FFmpeg
    createFFmpegInputFile(segmentPaths);

    // Execute FFmpeg to merge segments
    exec(
      `ffmpeg -f concat -safe 0 -i "${SEGMENTS_LIST}" -c copy "${OUTPUT_FILENAME}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`FFmpeg error: ${error.message}`);
          return;
        }

        console.log(`Video successfully saved as ${OUTPUT_FILENAME}`);

        // Clean up temp files if needed
        console.log("Cleaning up temporary files...");
        fs.rmSync(TEMP_DIR, { recursive: true, force: true });

        console.log("Done!");
      }
    );
  } catch (err) {
    console.error(`An error occurred: ${err.message}`);
  }
}

// Run the main function
main();
