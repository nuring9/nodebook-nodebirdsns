const SocketIO = require("socket.io");

module.exports = (server) => {
  const io = SocketIO(server, { path: "/socket.io" });

  io.on("connection", (socket) => {
    // 웹소켓 연결 시
    const req = socket.request; // soket에 request 속성이 있음.
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress; // ip 가져오는 방법은 동일
    console.log("새로운 클라이언트 접속", ip, socket.id, req.id); // socket.io는 연결할때마다 소켓에 아이디를 하나씩 부여함. 이 아이디로 특정인에게 메세지를 보낼수도 있고, 연결을 끊을 수도 있다.

    socket.on("disconnect", () => {
      // 접속 해제
      console.log("클라이언트 접속 해제", ip, socket.id);
      clearInterval(socket.interval);
    });

    socket.on("error", (error) => {
      // 에러 시
      console.log(error);
    });

    socket.on("reply", (data) => {
      // 클라이언트로부터 메시지
      console.log(data); //  toString하지 않아도 됨.
    });

    socket.interval = setInterval(() => {
      // 3초마다 클라이언트로 메세지 전송
      // socket은 알아서 연결 체크해주므로 if문을 따로 사용하지 않아도 됨.
      socket.emit("news", "Hello Socket.IO");
    }, 3000);
  });
};
