const params = new URLSearchParams(window.location.search);
const roomId = params.get("room");

const socket = io("https://chat-room-backend-w2ag.onrender.com");

socket.emit("join-room", roomId);

socket.on("message", (msg) => {
  const div = document.createElement("div");
  div.innerText = msg;
  document.getElementById("messages").appendChild(div);
});

function sendMessage() {
  const input = document.getElementById("msg");
  socket.emit("chat-message", input.value);
  input.value = "";
}

