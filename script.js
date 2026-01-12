const params = new URLSearchParams(window.location.search);
const roomId = params.get("room");

const socket = io("https://chat-room-backend-w2ag.onrender.com", {
  transports: ["websocket"]
});

socket.emit("join-room", roomId);

socket.on("connect", () => {
  console.log("CONNECTED:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("CONNECTION ERROR:", err.message);
});

socket.on("message", (data) => {
  console.log("MESSAGE RECEIVED:", data);

  if (!data || !data.text) return;

  const div = document.createElement("div");
  div.classList.add("message");

  if (data.senderId === socket.id) {
    div.classList.add("right");
  } else {
    div.classList.add("left");
  }

  div.innerText = data.text;
  document.getElementById("messages").appendChild(div);

  document.getElementById("messages").scrollTop =
    document.getElementById("messages").scrollHeight;
});

function sendMessage() {
  const input = document.getElementById("msg");
  const text = input.value.trim();
  if (!text) return;

  socket.emit("chat-message", text);
  input.value = "";
}
