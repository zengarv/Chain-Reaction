// socket.ts
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3001", {
    transports: ["websocket"],
  });
  
  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
  });
  
  export default socket;
  