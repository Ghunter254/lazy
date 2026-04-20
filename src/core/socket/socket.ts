import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

// Update cors as you wish ... this is for DEV ONLY !!!
export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        callback(null, true);
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket Connected: ${socket.id}`);
  });

  return io;
};

export const broadcast = (event: string, data: any) => {
  if (!io) {
    console.warn("Broadcast attempted before Socket.io was initialized!");
    return;
  }
  console.log(` Broadcasting: ${event}`);
  io.emit(event, data);
};
