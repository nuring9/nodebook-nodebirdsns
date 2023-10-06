const WebSocket = require("ws");

module.exports = (server) => {
  const wss = new WebSocket.Server({ server }); // app의 server를 websocket의 Server에 연결.

  wss.on("connection", (ws, req) => {
    // 웹소켓 연결 시
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress; // ip 가져오는 방법 2가지.
    console.log("새로운 클라이언트 접속", ip);
    ws.on("message", (message) => {
      // 클라이언트로부터 메세지
      console.log(message.toString()); // 버퍼이기 때문에 toString으로 바꿔줘야함.
    });
    ws.on("error", (error) => {
      // 에러 시
      console.log(error);
    });
    ws.on("close", () => {
      // 연결 종료 시
      console.log("클라이언트 접속 해제", ip);
      clearInterval(ws.interval);
    });

    ws.interval = setInterval(() => {
      // 3초마다 클라이언트로 메세지 전송
      if (ws.readyState === ws.OPEN) {
        // 웹소켓에 있는 readyState가 OPEN 상태일 때 메세지를 보낸다.
        ws.send("서버에서 클라이언트로 메세지를 보냅니다.");
      }
    }, 3000);
  });
};
