const params = new URLSearchParams(window.location.search);
const roomId = params.get("room");

let username = "";
let localStream = null;
let peerConnection = null;
let inCall = false;

// IMPORTANT: Replace YOUR_RENDER_URL with your actual Render backend URL
const socket = io("https://chat-room-backend-w2ag.onrender.com", {
  transports: ["polling", "websocket"]
});

// try joining room
socket.emit("join-room", roomId);

// set username
function setUsername() {
  const input = document.getElementById("usernameInput");
  const name = input.value.trim();

  if (!name) {
    alert("Please enter your name");
    return;
  }

  username = name;

  document.getElementById("usernameSection").style.display = "none";
  document.getElementById("chatSection").style.display = "block";
}

function closeChat() {
  socket.disconnect();
  window.location.href = "index.html";
}

async function getAudioStream() {
  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
}

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

function createPeerConnection() {
  peerConnection = new RTCPeerConnection(rtcConfig);

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    const audio = document.createElement("audio");
    audio.srcObject = event.streams[0];
    audio.autoplay = true;
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  };
}

async function startCall() {
  if (inCall) return;

  inCall = true;

  await getAudioStream();
  createPeerConnection();

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  socket.emit("call-offer", offer);
}

socket.on("call-offer", async (offer) => {
  const accept = confirm("Incoming voice call. Accept?");
  if (!accept) return;

  inCall = true;

  await getAudioStream();
  createPeerConnection();

  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  socket.emit("call-answer", answer);
});

socket.on("call-answer", async (answer) => {
  await peerConnection.setRemoteDescription(answer);
});

socket.on("ice-candidate", async (candidate) => {
  if (candidate && peerConnection) {
    await peerConnection.addIceCandidate(candidate);
  }
});

function endCall() {
  if (!inCall) return;

  peerConnection.close();
  localStream.getTracks().forEach(t => t.stop());

  peerConnection = null;
  localStream = null;
  inCall = false;
}

// receive messages
socket.on("message", (data) => {
  const messages = document.getElementById("messages");
  const div = document.createElement("div");
  div.classList.add("message");

  if (data.senderId === "system") {
    div.classList.add("left");
    div.innerText = data.text;
  } else {
    if (data.senderId === socket.id) {
      div.classList.add("right");
    } else {
      div.classList.add("left");
    }
    div.innerText = `${data.username}: ${data.text}`;
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});

// send message
function sendMessage() {
  const input = document.getElementById("msg");
  const text = input.value.trim();

  if (!text || !username) return;

  socket.emit("chat-message", {
    text,
    username
  });

  input.value = "";
}

function confirmCall() {
  const ok = confirm("Do you want to start a voice call?");
  if (ok) {
    startCall();
  }
}

// room full handling
socket.on("room-full", () => {
  alert("Room is full. Only 2 users allowed.");
  window.location.href = "index.html";
});


