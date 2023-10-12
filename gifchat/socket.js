const SocketIO = require("socket.io");
const { removeRoom } = require("./services");

module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, { path: "/socket.io" });
  app.set("io", io);
  // io를 express에 저장. 라우터에서 socket.io를 전송해야하기 때문.
  // 전체에 값을 저장하는것을 app.set
  // 요청에 값을 저장하는것을 res.locals

  const room = io.of("/room");
  const chat = io.of("/chat");

  const wrap = (middleware) => (socket, next) =>
    middleware(socket.request, {}, next);
  chat.use(wrap(sessionMiddleware));

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
      // 세션 미들웨어 사용으로, 이제 시스템 메세지를 낼 수 있다.
      socket.to(data).emit("join", {
        user: "system",
        chat: `${socket.request.session.color}님이 입장하셨습니다.`,
      });
      // socket.leave(data); 방을 떠날때
    });

    socket.on("disconnect", async () => {
      console.log("chat 네임스페이스 접속 해제");
      const { referer } = socket.request.headers; // 브라우저 전체 주소에서,
      const roomId = new URL(referer).pathname.split("/").at(-1); // 방 아이디만 추출 함.
      // 방에 참가자가 0명이면 다 나갔다는 뜻.
      const currentRoom = chat.adapter.rooms.get(roomId); // 현재 방의 정원구하는 법.
      const userCount = currentRoom?.size || 0; // 방의 현재 참가자
      if (userCount === 0) {
        await removeRoom(roomId); // removeRoom는 서비스를 만들어서 가져와 사용.
        room.emit("removeRoom", roomId); // 네임스페이스에 이 방이 제거됬다고 알려서 실시간으로 그 방을 없애줌.
        console.log("방 제거 요청 성공");
      } else {
        // 아래 메세지는 0명인 방에 보낼 이유가 없다. 어차피 삭제된 방이기 때문에 else로 구분 지어줌.
        socket.to(roomId).emit("exit", {
          user: "system",
          chat: `${socket.request.session.color}님이 퇴장하셨습니다.`,
        });
      }
    });
  });
};
