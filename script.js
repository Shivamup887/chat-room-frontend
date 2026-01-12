const params = new URLSearchParams(window.location.search);
const roomId = params.get("room");

let username = "";

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

// room full handling
socket.on("room-full", () => {
  alert("Room is full. Only 2 users allowed.");
  window.location.href = "index.html";
});