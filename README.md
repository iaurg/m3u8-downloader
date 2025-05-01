# M3U8 Video Downloader

A simple and efficient command-line tool to download and merge video segments from M3U8 playlists.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D12.0.0-brightgreen.svg)](https://nodejs.org/)

## 📋 Overview

This tool allows you to download videos from M3U8 playlists (HTTP Live Streaming format). It automatically handles:

- Downloading the M3U8 manifest
- Parsing segment information
- Downloading all video segments
- Merging segments into a single video file using FFmpeg
- Cleaning up temporary files

## ✨ Features

- Simple command-line interface
- Support for both absolute and relative URLs in playlists
- Progress tracking during download
- Automatic cleanup of temporary files
- Handles HTTP Live Streaming (HLS) format

## 🔧 Requirements

- Node.js (v22.15.0 or higher)
- FFmpeg (must be installed and available in your PATH)

## 📥 Installation

### Clone the repository

```bash
git clone https://github.com/iaurg/m3u8-downloader.git
cd m3u8-downloader
```

### Install dependencies

```bash
npm install
```

### Make the script executable (Unix/Linux/MacOS)

```bash
chmod +x download-video.js
```

## 🚀 Usage

### Basic usage

```bash
node download-video.js <m3u8_url> [output_filename]
```

### Arguments

- `m3u8_url` (required): URL of the M3U8 playlist
- `output_filename` (optional): Name of the output video file (default: `output.mp4`)

### Examples

Download a video and save it as "output.mp4" (default filename):

```bash
node download-video.js https://example.com/video.m3u8
```

Download a video and specify the output filename:

```bash
node download-video.js https://example.com/video.m3u8 my-video.mp4
```

## 🔍 How It Works

1. The script downloads the M3U8 manifest file from the provided URL
2. It parses the manifest to extract URLs for all video segments
3. Each segment is downloaded to a temporary directory
4. FFmpeg is used to concatenate all segments into a single video file
5. Temporary files are cleaned up after processing

## ⚠️ Troubleshooting

### Common Issues

1. **FFmpeg not found**: Make sure FFmpeg is installed and added to your system PATH

   ```bash
   # Check if FFmpeg is installed
   ffmpeg -version
   ```

2. **Permission denied**: Make sure the script has executable permissions

   ```bash
   chmod +x download-video.js
   ```

3. **Network errors**: Check your internet connection and verify the M3U8 URL is accessible

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- This tool uses [FFmpeg](https://ffmpeg.org/) for video processing
- Inspired by the need for a simple M3U8 downloader
