
import express from "express";
import cors from "cors";
import ytdl from "ytdl-core";
import axios from "axios";
import { config } from "dotenv";
import request from 'request';
const app = express();
app.use(express.json());
app.use(cors());
config({ path: "./.env" });




app.get("/extract-video", async (req, res) => {
  const videoUrl = req.query.videourl;

  try {
    // Get basic video info
    const info = await ytdl.getInfo(videoUrl);
    // Get the highest quality video format available
    const format = ytdl.chooseFormat(info.formats, { quality: "highest" });
    // Start downloading
    const videoStream = ytdl(videoUrl, { quality: "highest" });
    // Set response headers
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${info.videoDetails.title}.mp4"`
    );
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Length", format.contentLength);

    // Pipe video stream to response
    videoStream.pipe(res);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

async function extractVideo(videoUrl) {
  try {
    // Get basic video info
    const info = await ytdl.getInfo(videoUrl);
    // Get the highest quality video format available
    const format = ytdl.chooseFormat(info.formats, { quality: "highest" });
    // Start downloading
    const videoStream = ytdl(videoUrl, { quality: "highest" });
    // Set response headers
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${info.videoDetails.title}.mp4"`
    );
    res.setHeader("Content-Type", "video/mp4");
    // Pipe video stream to response
    videoStream.pipe(res);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
}

app.get("/extract-audio", async (req, res) => {
  // Call your Node.js function here

  const audioUrl = await extractAudio(req.query.videoUrl);

  res.send({ audioUrl });
});

// app.get("/fetch-audio", async (req, res) => {
//   try {
//     const audioUrl = req.query.audiourl;

//     const audioStream = await axios({
//       url: audioUrl,
//       method: "GET",
//       responseType: "stream",
//     });

//     const contentLength = audioStream.headers["content-length"];
//     if (!contentLength) {
//       throw new Error("Content-Length header not found");
//     }

//     res.setHeader("Content-Length", contentLength);
//     audioStream.data.pipe(res);
//   } catch (error) {
//     console.error("Error fetching audio:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });
app.get("/fetch-audio", async (req, res) => {
  try {
    const audioUrl = req.query.audiourl;

    // Stream the audio directly to the response
    request.get(audioUrl).pipe(res);
  } catch (error) {
    console.error("Error fetching audio:", error);
    res.status(500).send("Internal Server Error");
  }
});
async function extractAudio(videoUrl) {
  try {
    // Get video info
    const info = await ytdl.getInfo(videoUrl);

    // Find the audio format with the highest bitrate
    const audioFormat = ytdl.chooseFormat(info.formats, {
      filter: "audioonly",
      quality: "highestaudio",
    });

    // Return the audio URL
    return audioFormat.url;
  } catch (error) {
    console.error("Error extracting audio:", error);
    return null;
  }
}

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
