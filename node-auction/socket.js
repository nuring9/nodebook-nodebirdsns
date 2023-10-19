const SocketIO = require("socket.io");

module.exports = (server, app) => {
  const io = SocketIO(server, { path: "/socket.io" }); // 클라이언트에서 연결을 맺을때 뒤에 패스까지 붙여야 서버로 연결됨.
  app.set("io", io); // io객체를 exprss에 저장. 라우터에서 socket.io 전송을 해야하기 때문. 전체에 저장 app.set / 요청에 저장 res.locals
  io.on("connection", (socket) => {
    // 웹 소켓 연결 시
    const req = socket.request; // 소켓안에 requrest가 있음.
    const {
      headers: { referer },
    } = req; // 현재 페이지에 요청한 이전 페이지의 uri 정보를 req에서 가져옴
    const roomId = new URL(referer).pathname.split("/").at(-1); // 경매방 이름. object id
    socket.join(roomId); // 방에 참가.
    socket.on("disconnect", () => {
      // 접속 해제
      socket.leave(roomId); // 방에 나감.
    });
  });
};
