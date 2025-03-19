import React, { useEffect, useRef } from "react";
import "./App.css";

const App = () => {
  const containerRef = useRef(null);
  const zpRef = useRef(null);

  // Function to parse URL parameters
  const getUrlParams = (url = window.location.href) => {
    const urlStr = url.split("?")[1];
    return new URLSearchParams(urlStr);
  };

  useEffect(() => {
    // Load ZegoUIKitPrebuilt dynamically
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js";
    script.async = true;
    script.onload = () => initializeZego();
    document.body.appendChild(script);

    return () => {
      // Cleanup: Hang up call and remove script on unmount
      if (zpRef.current) {
        zpRef.current.hangUp();
      }
      document.body.removeChild(script);
    };
  }, []);

  const initializeZego = () => {
    const roomID = getUrlParams().get("roomID") || `room_${Math.floor(Math.random() * 1000)}`;
    const userID = Math.floor(Math.random() * 10000) + "";
    const userName = `userName${userID}`;
    const appID = 221417685; // Replace with your Zego appID
    const serverSecret = "be15e8ea06d70c26c704f87ed661b6aa"; // Replace with your serverSecret

    const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userID,
      userName
    );

    const zp = window.ZegoUIKitPrebuilt.create(kitToken);
    zpRef.current = zp;

    zp.joinRoom({
      container: containerRef.current,
      sharedLinks: [
        {
          name: "Invite Link",
          url: `${window.location.origin}${window.location.pathname}?roomID=${roomID}`,
        },
      ],
      scenario: {
        mode: window.ZegoUIKitPrebuilt.OneONoneCall,
      },
      showScreenSharingButton: true,
      showPreJoinView: true,
      turnOnCameraWhenJoining: true,
      turnOnMicrophoneWhenJoining: true,
      showRoomTimer: true,
      showUserName: true,
      showLayoutButton: true,
      showPinButton: true,
      showInviteButton: true,
      onJoinRoom: () => {
        console.log("Joined room successfully");
        document.getElementById("custom-controls").style.display = "flex";
      },
      onLeaveRoom: () => {
        console.log("Left the room");
        document.getElementById("custom-controls").style.display = "none";
      },
      onUserJoin: (user) => console.log(`${user.userName} joined the call`),
      onUserLeave: (user) => console.log(`${user.userName} left the call`),
    });

    // Add event listeners for custom controls
    document.getElementById("toggle-camera").addEventListener("click", () => {
      zp.turnCameraOn(null, !zp.getLocalVideoConfig().video);
    });
    document.getElementById("toggle-mic").addEventListener("click", () => {
      zp.turnMicrophoneOn(null, !zp.getLocalAudioConfig().mute);
    });
    document.getElementById("share-screen").addEventListener("click", () => {
      zp.startScreenSharing();
    });
    document.getElementById("hang-up").addEventListener("click", () => {
      zp.hangUp();
    });
  };

  return (
    <div className="App">
      <div ref={containerRef} id="root"></div>
      <div className="controls" id="custom-controls" style={{ display: "none" }}>
        <button className="control-btn" id="toggle-camera">
          Toggle Camera
        </button>
        <button className="control-btn" id="toggle-mic">
          Toggle Mic
        </button>
        <button className="control-btn" id="share-screen">
          Share Screen
        </button>
        <button className="control-btn" id="hang-up">
          Hang Up
        </button>
      </div>
    </div>
  );
};

export default App;
