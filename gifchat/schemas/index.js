const mongoose = require("mongoose");

const { NODE_ENV, MONGO_ID, MONGO_PASSWORD } = process.env;
MONGO_URL = `mongodb://${MONGO_ID}:${MONGO_PASSWORD}@localhost:27017/admin`;

const connect = () => {
  if (NODE_ENV !== "production") {
    // process.env.NODE_ENV에서 process.env 생략 가능해짐.
    mongoose.set("debug", true);
  }
  mongoose
    .connect(MONGO_URL, {
      dbName: "gifchat", // 두번째 인수로 dbName 옵션을 줘서 nodejs 데이터베이스를 사용하게 함.
      useNewUrlParser: true, // 입력하지 않아도 되지만 콘솔에 경고 메시지가 나타나므로 넣음.
    })
    .then(() => {
      console.log("몽고디비 연결 성공");
    })
    .catch((err) => {
      console.error("몽고디비 연결 에러", err);
    });
};
// 몽구스 커넥션에 이벤트 리스너를 달아 에러 발생 시 에러 내용을 기록하고, 연결 종료 시 재연결을 시도.
mongoose.connection.on("error", (error) => {
  console.error("몽고디비 연결 에러", error);
});
mongoose.connection.on("disconnected", () => {
  console.error("몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.");
  connect();
});

module.exports = connect;
