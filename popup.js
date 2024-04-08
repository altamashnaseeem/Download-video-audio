// download video
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("downloadVideo")
    .addEventListener("click", downloadVideo);
  function downloadVideo() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var url = tabs[0].url;

      if (url) {
        // document.getElementById("url").innerText = "Current URL: " + url;
        const videoId = extractVideoId(url);
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        console.log("Video ID:", videoId);
        //extractAudio(videoUrl);
        getVideo(videoUrl);

        // fetchVideoDetail(videoId)
      } else {
        document.getElementById("url").innerText = "No URL available";
      }
    });
  }
});
// download audio
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("downloadAudio")
    .addEventListener("click", downloadAudio);
  function downloadAudio() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var url = tabs[0].url;

      if (url) {
        // document.getElementById("url").innerText = "Current URL: " + url;
        const videoId = extractVideoId(url);
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        extractAudio(videoUrl);

        // fetchVideoDetail(videoId)
      } else {
        document.getElementById("url").innerText = "No URL available";
      }
    });
  }
});

function extractVideoId(url) {
  // Regular expression to match the v parameter value in the URL
  const regex = /[?&]v=([^&]+)/;
  const match = url.match(regex); // Executing the regular expression on the URL
  if (match) {
    return match[1]; // Return the captured video ID
  }
  return null; // If URL doesn't contain the v parameter
}

async function extractAudio(videoUrl) {
  const response = await fetch(
    `http://localhost:3004/extract-audio?videoUrl=${encodeURIComponent(
      videoUrl
    )}`
  );

  const data = await response.json();

  const audioUrl = data.audioUrl;

  await fetchaudio(audioUrl);

  console.log("Audio URL:", audioUrl);

  // Use the audio URL as needed (e.g., play audio, display in HTML)
}

// async function fetchaudio(audioUrl) {
//   try {
//     const fileName = "audio_file.webm"; // Name for downloaded file

//     // Fetch the audio file from the provided URL
//     const response = await fetch(
//       `http://localhost:3004/fetch-audio?audiourl=${encodeURIComponent(
//         audioUrl
//       )}`
//     );

//     const blob = await response.blob();
//     // Create a URL for the audio blob

//     const url = window.URL.createObjectURL(blob);

//     // Create a temporary anchor element to trigger the download
//     const a = document.createElement("a");
//     a.style.display = "none";
//     a.href = url;
//     a.download = fileName;

//     // Append the anchor element to the document body and trigger the download
//     document.body.appendChild(a);
//     a.click();

//     // Clean up by revoking the object URL
//     window.URL.revokeObjectURL(url);
//   } catch (error) {
//     console.error("Error downloading audio:", error);
//   }
// }
function updateProgress(completedSize, totalSize) {
  const completedMB = (completedSize / (1024 * 1024)).toFixed(2);
  const remainingMB = ((totalSize - completedSize) / (1024 * 1024)).toFixed(2);
  const downloadStatus = document.getElementById('downloadStatus');
  downloadStatus.innerHTML = `Downloading...<br><br>${completedMB} MB completed <br><br> ${remainingMB} MB remaining`;
  if (completedSize >= totalSize) {
    downloadStatus.innerHTML="Downloaded"
}
}
async function getVideo(url) {
  //await fetch(`http://localhost:3004/extract-video?videourl=${encodeURIComponent(videoUrl)}`)
  try {
    const response = await fetch(
      `http://localhost:3004/extract-video?videourl=${encodeURIComponent(url)}`
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
  }


    const totalSize = parseInt(response.headers.get('Content-Length'));
     
    
    let receivedSize = 0
    
    updateProgress(0, totalSize)
    

    // Create a temporary anchor element to trigger the download
    const a = document.createElement("a");
    a.style.display = "none";
    document.body.appendChild(a);
   

    const chunks = [];
    const reader = response.body.getReader();
    let bytesRead = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      bytesRead += value.length;
      receivedSize = bytesRead;

      // Update progress
      updateProgress(receivedSize, totalSize);

      // Store chunks for creating blob
      chunks.push(value);
  }


     // Create blob from chunks
     const blob = new Blob(chunks);
    const videoUrl = URL.createObjectURL(blob);
    a.href = videoUrl;
    a.download = "video.mp4";
    a.click();

    // Clean up
    URL.revokeObjectURL(videoUrl);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error:", error);
  }
}


async function fetchaudio(audioUrl) {
  try {
    const fileName = "audio_file.mp3";

    const response = await fetch(
      `http://localhost:3004/fetch-audio?audiourl=${encodeURIComponent(
        audioUrl
      )}`
    );

    const totalSize = parseInt(response.headers.get("content-length"));
    
    let receivedSize = 0;

    const reader = response.body.getReader();

    function updateProgress() {
      const percentage = Math.floor((receivedSize / totalSize) * 100);
      const completedMB = (receivedSize / (1024 * 1024)).toFixed(2);
      const remainingMB = ((totalSize - receivedSize) / (1024 * 1024)).toFixed(2);
      
      const downloadStatus = document.getElementById("downloadStatus");
      downloadStatus.innerHTML = `Downloading...<br><br> ${completedMB} MB completed <br><br> ${remainingMB} MB remaining`;
      if(receivedSize>=totalSize){
        downloadStatus.innerHTML="Downloaded"
      }
    }
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      receivedSize += value.length;
      chunks.push(value);
      updateProgress();
    }

    const blob = new Blob(chunks, { type: response.headers.get("content-type") });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading audio:", error);
  }
}
