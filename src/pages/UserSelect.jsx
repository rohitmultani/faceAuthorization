import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";

function UserSelect() {
  const videoWidth = 640;
  const videoHeight = 360;
  const videoRef = useRef({});
  const photoRef = useRef(null);

  const [loadingModels, setLoadingModels] = useState(true);
  const [webcamActive, setWebcamActive] = useState(false);
  const [name, setName] = useState("");
  const [descriptors, setDescriptors] = useState([]);
  const [imgUrl, setImgUrl] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      const uri = "/models";
      await faceapi.nets.ssdMobilenetv1.loadFromUri(uri);
      await faceapi.nets.faceLandmark68Net.loadFromUri(uri);
      await faceapi.nets.faceRecognitionNet.loadFromUri(uri);
      setLoadingModels(false);
      
    };

    loadModels();
    
  }, []);

  const startWebcam = () => {
    // Check if videoRef.current exists
      console.log("done")
      navigator.mediaDevices
        .getUserMedia({ video: { width: videoWidth, height: videoHeight } })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          setWebcamActive(true);
        })
        .catch((error) => {
          console.error("Error accessing webcam:", error);
        });
        
  };

  const takePhoto = async () => {
    const width = 414;
    const height = width / (16 / 9);

    const video = videoRef.current;
    const photo = photoRef.current;

    photo.width = width;
    photo.height = height;

    const ctx = photo.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);

    const data = photo.toDataURL("image/png");
    setImgUrl(data);

    const img = await faceapi.fetchImage(data);
    const detections = await faceapi
      .detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors();

    setDescriptors(detections.map((detection) => detection.descriptor));
  };

  const handleInputChange = (event) => {
    setName(event.target.value);
  };

  const registerUser = async () => {
    console.log(name,imgUrl,descriptors)
    try {
      const response = await axios.post("/api/register", {
        username: name,
        imgUrl: imgUrl,
        descriptors: descriptors,
      });
      console.log("User registered successfully:", response.data);
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center w-full max-w-[720px] mx-auto">
      <h1 className="text-2xl font-semibold mx-auto">Register User</h1>
      {loadingModels ? (
        <div>Models loading...</div>
      ) : (
        <>
          <div className="camera">
            {/* {webcamActive && (
            <div className="camera">
              <video ref={videoRef} width={videoWidth} height={videoHeight} autoPlay playsInline></video>
              <canvas ref={photoRef} style={{ display: "none" }}></canvas>
              <button
                onClick={takePhoto}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
              >
                SNAP!
              </button>
            </div>
          )} */}
            
              <video ref={videoRef} width={videoWidth} height={videoHeight} autoPlay playsInline></video>
            
            <canvas ref={photoRef} style={{ display: "none" }}></canvas>
            <button
              onClick={startWebcam}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            >
              startWebcam
            </button>
            <button
              onClick={takePhoto}
              disabled={!webcamActive}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            >
              SNAP!
            </button>
          </div>
          <input
            type="text"
            placeholder="Enter user's name"
            value={name}
            onChange={handleInputChange}
            className="mt-4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <button
            onClick={registerUser}
            disabled={!descriptors.length || !name || !imgUrl}
            className="mt-4 inline-flex items-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600"
          >
            Register
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="ml-1.5 h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

export default UserSelect;
