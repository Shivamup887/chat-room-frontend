const params = new URLSearchParams(window.location.search);
const roomId = params.get("room");

const socket = io("https://chat-room-backend-w2ag.onrender.com");

socket.emit("join-room", roomId);

socket.on("message", (data) => {
  const div = document.createElement("div");
  div.classList.add("message");

  if (data.senderId === socket.id) {
    div.classList.add("right");
  } else {
    div.classList.add("left");
  }

  div.innerText = data.text;
  document.getElementById("messages").appendChild(div);

  // auto-scroll
  document.getElementById("messages").scrollTop =
    document.getElementById("messages").scrollHeight;
});


function sendMessage() {
  const input = document.getElementById("msg");
  socket.emit("chat-message", input.value);
  input.value = "";
}
