"use client";
import React, { useEffect } from "react";

import { useState } from "react";
import { Colors } from "@/app/colors";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import CallEndIcon from "@mui/icons-material/CallEnd";
import styles from "../../../components/videocall.module.css";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import { SOCKET_URL } from "@/config";
export default function VideoCall({ params }: any) {
  const router = useRouter();
  ///useEffect(() => {
  const itemUUID = localStorage.getItem("UUID");
  const UUID = itemUUID ? itemUUID : null;
  if (UUID === null) {
    router.push(`/login`);
  }
  //},[])
  const [socket, setSocket] = useState();
  let videoElement;
  useEffect(() => {
    const socket = io(`${SOCKET_URL}`);

    setSocket(socket);
  }, []);

  let peers = {};
  const [chatContainer, setChatContainer] = useState();
  const [remoteVideoContainer, setRemoteVideoContainer] = useState();
  const [toggleButton, setToggleButton] = useState();
  const [userVideo, setUserVideo] = useState();
  const [isCamEnabled, setCamEnabled] = useState(true);
  useEffect(() => {
    const chatContainer = document.getElementById("left");
    const remoteVideoContainer = document.getElementById("right");
    const toggleButton = document.getElementById("toggle-cam");
    const userVideo = document.getElementById("user-video");
    setChatContainer(chatContainer);
    setRemoteVideoContainer(remoteVideoContainer);
    setToggleButton(toggleButton);
    setUserVideo(userVideo);

    toggleButton?.addEventListener("click", async () => {
      const videoTrack = userStream
        ?.getTracks()
        .find((track) => track.kind === "video");
      console.log("videotrack", videoTrack);
      if (videoTrack !== undefined && toggleButton !== undefined) {
        if (videoTrack.enabled) {
          videoTrack.enabled = false;
          const video1 = document.getElementById("user-video");
          if (video1) {
            for (const track of video1.srcObject.getTracks()) {
              track.stop();
            }
            video1.srcObject = null;
          }
          setCamEnabled(false);
        } else {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          userStream = stream;
          if (userVideo) {
            userVideo.srcObject = stream;
          }
          videoTrack.enabled = true;
          setCamEnabled(true);
        }
      }
    });

    init();
  }, [socket]);

  // function stopCamera() {
  //   //const video = document.querySelector(".remote-video");
  //   const video1 = document.getElementById("user-video");
  //   // console.log("VIDEO 1", video1);
  //   // if (video) {
  //   //   for (const track of video.srcObject.getTracks()) {
  //   //     track.stop();
  //   //   }
  //   //   video.srcObject = null;
  //   // }
  //   if (video1) {
  //     for (const track of video1.srcObject.getTracks()) {
  //       track.stop();
  //     }
  //     video1.srcObject = null;
  //   }
  // }

  let userStream;
  let isAdmin = false;
  function callOtherUsers(otherUsers, stream) {
    if (!otherUsers.length) {
      isAdmin = true;
    }
    otherUsers.forEach((userIdToCall) => {
      const peer = createPeer(userIdToCall);
      peers[userIdToCall] = peer;
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });
    });
  }
  //ctLqhSip18fvGDMrAAAN
  //Yp3K7b30kPTvTu9WAAAP

  const [isRemoteStreamReady, setRemoteStreamReady] = useState(false);

  function createPeer(userIdToCall) {
    console.log(
      "userIdToCalluserIdToCalluserIdToCalluserIdToCall",
      userIdToCall
    );

    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
      ],
    });
    peer.onnegotiationneeded = () =>
      userIdToCall ? handleNegotiationNeededEvent(peer, userIdToCall) : null;
    peer.onicecandidate = handleICECandidateEvent;
    peer.ontrack = (e) => {
      console.log("ENTRA", e.streams);
      const remoteVideoContainerExist = document.querySelector(
        ".remote-video-container"
      );
      console.log("ENTO ON TRACK", remoteVideoContainerExist);
      if (remoteVideoContainerExist === null) {
        const container = document.createElement("div");
        container.classList.add("remote-video-container");
        const video = document.createElement("video");
        video.srcObject = e.streams[0];
        video.autoplay = true;
        video.playsInline = true;
        videoElement = video;
        video.classList.add("remote-video");
        container.appendChild(video);
        setRemoteStreamReady(true);

        if (isAdmin) {
          const button = document.createElement("button");

          button.classList.add("button");
          button.setAttribute("user-id", userIdToCall);
          container.appendChild(button);
        }
        container.id = userIdToCall;
        remoteVideoContainer.appendChild(container);
      }
    };

    return peer;
  }

  async function handleNegotiationNeededEvent(peer, userIdToCall) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
      sdp: peer.localDescription,
      userIdToCall,
    };
    socket?.emit("peer connection request", payload);
  }

  async function handleReceiveOffer({ sdp, callerId }, stream) {
    const peer = createPeer(callerId);
    peers[callerId] = peer;
    const desc = new RTCSessionDescription(sdp);
    await peer.setRemoteDescription(desc);

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    const payload = {
      userToAnswerTo: callerId,
      sdp: peer.localDescription,
    };

    socket?.emit("connection answer", payload);
  }

  function handleAnswer({ sdp, answererId }) {
    const desc = new RTCSessionDescription(sdp);
    peers[answererId].setRemoteDescription(desc).catch((e) => console.log(e));
  }

  function handleICECandidateEvent(e) {
    if (e.candidate) {
      Object.keys(peers).forEach((id) => {
        const payload = {
          target: id,
          candidate: e.candidate,
        };
        socket?.emit("ice-candidate", payload);
      });
    }
  }

  function handleReceiveIce({ candidate, from }) {
    const inComingCandidate = new RTCIceCandidate(candidate);
    peers[from]?.addIceCandidate(inComingCandidate);
  }
  //try random url
  function handleDisconnect(userId) {
    console.log("DISCONNECT");
    delete peers[userId];
    socket?.close();
    document.getElementById(userId)?.remove();
    const remoteVideos = document.querySelectorAll(".remote-video");
    remoteVideos.forEach((video) => {
      video.remove();
    });
    const userVideo = document.querySelectorAll(".user-video");
    userVideo.forEach((video) => {
      video.remove();
    });
    setMute(true);

    router.replace("/messages");
  }

  function handleDisconnectButton() {
    const video1 = document.getElementById("user-video");
    if (video1) {
      for (const track of video1.srcObject.getTracks()) {
        track.stop();
      }
      video1.srcObject = null;
    }
    socket?.close();
    console.log("ENTRO");
    socket?.emit("leaves screen");
    const remoteVideos = document.querySelectorAll(".remote-video");
    remoteVideos.forEach((video) => {
      video.remove();
    });
    const userVideo = document.querySelectorAll(".user-video");
    userVideo.forEach((video) => {
      video.remove();
    });
    setMute(true);
    router.replace("/messages");
  }

  function hideCam() {
    const videoTrack = userStream
      .getTracks()
      .find((track) => track.kind === "video");
    videoTrack.enabled = false;
    // myVideo?.current.srcObject
    //   .getVideoTracks()
    //   .forEach((track) => track.stop());
  }

  function showCam() {
    const videoTrack = userStream
      .getTracks()
      .find((track) => track.kind === "video");
    videoTrack.enabled = true;
  }
  const [myVideo, setMyVideo] = useState();
  async function init() {
    socket?.on("connect", async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      userStream = stream;
      setMyVideo(userStream);
      if (userVideo) {
        userVideo.srcObject = stream;
      }
      const roomId = params.roomId;
      console.log("ROOOM ID", roomId);

      socket?.emit("user joined room", roomId);

      socket?.on("all other users", (otherUsers) =>
        callOtherUsers(otherUsers, stream)
      );
      socket?.on("connection offer", (payload) =>
        handleReceiveOffer(payload, stream)
      );

      socket?.on("connection answer", handleAnswer);

      socket?.on("ice-candidate", handleReceiveIce);

      socket?.on("user disconnected", (userId) => handleDisconnect(userId));

      socket?.on("hide cam", hideCam);

      socket?.on("show cam", showCam);

      //socket?.on("server is full", () => alert("chat is full"));
    });
  }

  const [isMute, setMute] = useState(false);
  console.log("ismuute", isMute);
  const mute = () => {
    setMute((prev) => !prev);
    // me parece que solo tendria que mutear a el mismo a <video>
    // const elements = document.getElementsByClassName("remote-video");
    // const videoElement = elements[0]; // Assuming there is only one element with the given class
    // if (videoElement) {
    //   videoElement.muted = !videoElement.muted ? true : false;
    // }
  };
  return (
    <>
      <div id="chat-container" className={styles["chat-container"]}>
        <div id="left" className={styles["myStream"]}>
          <video
            muted={isMute}
            autoPlay
            id="user-video"
            className={styles["user-video"]}
          ></video>
        </div>
        <div className={styles["containerRemoteStream"]}>
          <div id="right" className={styles["remoteStream"]}></div>
          <div className={styles["controls"]}>
            <div
              onClick={() => handleDisconnectButton()}
              style={{
                height: 60,
                width: 60,
                borderRadius: "50%",
                backgroundColor: Colors.lightGray,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 40,
                cursor: "pointer",
              }}
            >
              <CallEndIcon style={{ fontSize: 40, color: Colors.red }} />
            </div>
            <div
              id="toggle-cam"
              style={{
                height: 60,
                width: 60,
                borderRadius: "50%",
                backgroundColor: Colors.lightGray,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 40,
                cursor: "pointer",
              }}
            >
              {isCamEnabled ? (
                <VideocamIcon style={{ fontSize: 40 }} />
              ) : (
                <VideocamOffIcon style={{ fontSize: 40 }} />
              )}
            </div>
            <div
              onClick={() => mute()}
              style={{
                height: 60,
                width: 60,
                borderRadius: "50%",
                backgroundColor: Colors.lightGray,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              {isMute ? (
                <MicOffIcon style={{ fontSize: 40 }} />
              ) : (
                <MicIcon style={{ fontSize: 40 }} />
              )}
            </div>
            {/* <div
              onClick={stopCamera}
              style={{ background: "white", color: "black" }}
            >
              acaaa
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}
