const SocketIO = require("socket.io");

module.exports = (server, app) => {
  const io = SocketIO(server, { path: "/socket.io" });
  app.set("io", io);
  // io를 express에 저장. 라우터에서 socket.io를 전송해야하기 때문.
  // 전체에 값을 저장하는것을 app.set
  // 요청에 값을 저장하는것을 res.locals

  const room = io.of("/room");
  const chat = io.of("/chat");

  room.on("connection", (socket) => {
    console.log("room 네임스페이스에 접속");
    socket.on("disconnect", () => {
      console.log("room 네임스페이스 접속 해제");
    });
  });

  chat.on("connection", (socket) => {
    console.log("chat 네임스페이스에 접속");

    socket.on("join", (data) => {
      // data는 브라우저에서 보낸 방 아이디, chat.html의 join.
      socket.join(data); // 네임스페이스 아래에 존재하는 방에 접속.
      // socket.leave(data); 방을 떠날때
    });

    socket.on("disconnection", () => {
      console.log("chat 네임스페이스 접속 해제");
    });
  });
};
