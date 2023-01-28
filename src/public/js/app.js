const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");
const micsSelect = document.getElementById("mics");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label == camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMics() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const mics = devices.filter((device) => device.kind === "audioinput");
    mics.forEach((mic) => {
      const option = document.createElement("option");
      option.value = mic.deviceId;
      option.innerText = mic.label;
      micsSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstraints = {
    audio: true,
    video: true,
  };

  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId, } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstraints
    );
    myFace.srcObject = myStream;

    if (!deviceId) {
      await getCameras();
      await getMics();
    }
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  // console.log(myStream.getAudioTracks());
  myStream
    .getAudioTracks()
    .forEach((track) => track.enabled = !track.enabled);
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

function handleCameraClick() {
  // console.log(myStream.getVideoTracks());
  myStream
    .getVideoTracks()
    .forEach((track) => track.enabled = !track.enabled);
  if (!cameraOff) {
    cameraBtn.innerText = "Camera On";
    cameraOff = true;
  } else {
    cameraBtn.innerText = "Camera Off";
    cameraOff = false;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find(sender => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

function handleMicChange() {
  console.log(micsSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);
micsSelect.addEventListener("input", handleMicChange);


// Welcome Form (join a room)
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  console.log("entered the room");
  await getMedia();
  console.log("got the media");
  makeConnection();
  console.log("made the RTC Peer connection");
  console.log("------------------------------");
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

socket.on("welcome", async () => {
  console.log(">>>>>>> Someone joined the room!!");
  const offer = await myPeerConnection.createOffer();
  console.log("So I created the offer");
  myPeerConnection.setLocalDescription(offer);
  console.log("and set the local description");
  socket.emit("offer", offer, roomName);
  console.log("and then sent the offer!!");
  console.log("------------------------------");
});

socket.on("offer", async offer => {
  console.log("I recieved the offer");
  myPeerConnection.setRemoteDescription(offer);
  console.log("so I set the remote description");
  const answer = await myPeerConnection.createAnswer();
  console.log("and created the answer");
  myPeerConnection.setLocalDescription(answer);
  console.log("and set the local description");
  socket.emit("answer", answer, roomName);
  console.log("and then sent the answer!!");
  console.log("------------------------------");
});

socket.on("answer", answer => {
  console.log("recieved the answer");
  myPeerConnection.setRemoteDescription(answer);
  console.log("set the remote description");

});

socket.on("ice", ice => {
  console.log("recieved candidate");
  myPeerConnection.addIceCandidate(ice);
  // console.log("added ICE Candidate");
});

function makeConnection() {
  // WebRTC P2P Connection
  myPeerConnection = new RTCPeerConnection({
    iceServers: [ // STUN Servers
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  socket.emit("ice", data.candidate, roomName);
  console.log("sent candidate");
}

function handleAddStream(data) {
  // const peersStream = document.getElementById("peersStream");
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream;
  console.log(">>>>>>> got an event from my peer!!");
  console.log("Peer's Stream", data.stream);
  console.log("My Stream", myStream);
}
































// const socket = io();

// const welcome = document.getElementById("welcome");
// const form = welcome.querySelector("form");
// const room = document.getElementById("room");
// room.hidden = true;

// let roomName = "";

// function addMessage(message) {
//   const ul = room.querySelector("ul");
//   const li = document.createElement("li");
//   li.innerText = message;
//   ul.appendChild(li);
// }

// function handleMessageSubmit(event) {
//   event.preventDefault();
//   const input = room.querySelector("#msg input");
//   socket.emit("new_message", input.value, roomName, () => {
//     addMessage(`You: ${input.value}`);
//     input.value = "";
//   });
// }

// function handleNicknameSubmit(event) {
//   event.preventDefault();
//   const input = room.querySelector("#name input");
//   socket.emit("nickname", input.value);
// }

// function showRoom() {
//   welcome.hidden = true;
//   room.hidden = false;
//   const h3 = room.querySelector("h3");
//   h3.innerText = `Room ${roomName}`;
//   const nameForm = room.querySelector("#name");
//   nameForm.addEventListener("submit", handleNicknameSubmit);
//   const msgForm = room.querySelector("#msg");
//   msgForm.addEventListener("submit", handleMessageSubmit);
// }

// function handleRoomSubmit(event) {
//   event.preventDefault();
//   const input = form.querySelector("input");
//   socket.emit(
//     "enter-room",
//     input.value,
//     showRoom  /* 마지막 인자는 무조건 콜백이어야 한다. */
//   );
//   roomName = input.value;
//   input.value = "";
// }

// form.addEventListener("submit", handleRoomSubmit);

// socket.on("welcome", (user, newCount) => {
//   const h3 = room.querySelector("h3");
//   h3.innerText = `Room ${roomName} (${newCount})`;
//   addMessage(`${user} has entered the room`);
// });

// socket.on("bye", (user, newCount) => {
//   const h3 = room.querySelector("h3");
//   h3.innerText = `Room ${roomName} (${newCount})`;
//   addMessage(`${user} has left the room`);
// });

// socket.on("new_message", addMessage);

// socket.on("room_change", (rooms) => {
//   const roomList = welcome.querySelector("ul");
//   roomList.innerHTML = "";
//   if (rooms.length === 0) {
//     return;
//   }
//   rooms.forEach((room) => {
//     const li = document.createElement("li");
//     li.innerText = room;
//     roomList.append(li);
//   });
// });





































// const msgList = document.querySelector("ul");
// const nickForm = document.querySelector("#nick")
// const msgForm = document.querySelector("#msg");

// const socket = new WebSocket(`ws://${window.location.host}`);

// function makeMessage(type, payload) {
//   const msg = { type, payload };
//   return JSON.stringify(msg);
// }

// function handleOpen() {
//   console.log("Connected to Server ✅");
// }

// socket.addEventListener("open", handleOpen);

// socket.addEventListener("message", function (message) {
//   const li = document.createElement("li");
//   li.innerText = message.data;
//   msgList.append(li);
//   console.log(message.data);
// });

// socket.addEventListener("close", () => {
//   console.log("Disconnected from Server ❌");
// });

// function handleMsgSubmit(event) {
//   event.preventDefault();
//   const input = msgForm.querySelector("input");
//   socket.send(makeMessage("new_message", input.value));
//   const li = document.createElement("li");
//   li.innerText = `You: ${input.value}`;
//   input.value = "";
// }

// function handleNickSubmit(event) {
//   event.preventDefault();
//   const input = nickForm.querySelector("input");
//   socket.send(makeMessage("nickname", input.value));
//   input.value = "";
// }

// msgForm.addEventListener("submit", handleMsgSubmit);
// nickForm.addEventListener("submit", handleNickSubmit);