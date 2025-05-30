// socket.ts
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3001", {
    transports: ["websocket", "polling"], // Allow fallback to polling if websocket fails
    timeout: 60000,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });
  
  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
  });

  socket.on("connect", () => {
    console.log("Connected to server successfully");
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected from server:", reason);
  });
  
  export default socket;
  