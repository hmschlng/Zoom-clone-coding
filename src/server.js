import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  })
})

const handleListen = () => console.log(`Listening on http://localhost:3000/`);

httpServer.listen(3000, handleListen);










































// import http from "http";
// import SocketIO from "socket.io";
// import express from "express";
// import { WebSocketServer } from "ws";

// const app = express();
// app.set("view engine", "pug");
// app.set("views", __dirname + "/views");
// app.use("/public", express.static(__dirname + "/public"));
// app.get("/", (req, res) => res.render("home"));

// const httpServer = http.createServer(app);
// const wsServer = SocketIO(httpServer);

// function publicRooms() {
//   const {
//     sockets: {
//       adapter: { sids, rooms },
//     },
//   } = wsServer;
//   const publicRooms = [];
//   rooms.forEach((_, key) => {
//     if (sids.get(key) === undefined) {
//       publicRooms.push(key);
//     }
//   });
//   return publicRooms;
// }

// function countRoom(roomName) {
//   return wsServer.sockets.adapter.rooms.get(roomName)?.size;
// }

// wsServer.on("connection", socket => {
//   socket["nickname"] = "Anonymous";
//   socket.onAny((event) => {
//     // console.log(wsServer.sockets.adapter)
//     console.log(`Socket Event:${event}`);
//   });
//   /** 마지막 인자로 들어온 함수(done)는 백에서 실행되는 것이 아니다 (심각한 보안문제)
//    * 이 함수는 백에서 그대로 인자로 되돌아와서 프론트에서 실행된다. */
//   socket.on("enter-room", (roomName, done) => {
//     socket.join(roomName);
//     done();
//     socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
//     wsServer.sockets.emit("room_change", publicRooms());
//   });
//   socket.on("new_message", (msg, room, done) => {
//     socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
//     done();
//   });
//   socket.on("nickname", (nick) => socket["nickname"] = nick);
//   socket.on("disconnect", () => wsServer.sockets.emit("room_change", publicRooms()));
//   socket.on("disconnecting", () => {
//     socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1));
//   });
// });

// const handleListen = () => console.log(`Listening on http://localhost:3000/`);

// httpServer.listen(3000, handleListen);











































// import http from "http";
// import WebSocket from "ws";
// import express from "express";

// const app = express();
// app.set("view engine", "pug");
// app.set("views", __dirname + "/views");
// app.use("/public", express.static(__dirname + "/public"));
// app.get("/", (req, res) => res.render("oldhome"));

// /* 
// 한 포트로 ws와 http를 둘다 돌리기 위한 설정 (http 서버 위에 ws를 얹는다는 느낌)
// 포트를 구분해서 ws를 따로 돌려도 됨. 
// */
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// function onSocketClose() {
//   console.log("Disconnected from the Browser ❌");
// }
// const sockets = [];
// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "Anonymous";
//   socket.on("close", onSocketClose);
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((user) =>
//           user.send(`${socket.nickname}: ${message.payload}`)
//         );
//         break;
//       case "nickname":
//         socket["nickname"] = message.payload;
//         break;
//     }
//   });
// });

// const handleListen = () => console.log(`Listening on http://localhost:3000/`);
// server.listen(3000, handleListen);