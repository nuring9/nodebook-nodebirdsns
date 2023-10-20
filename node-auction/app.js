const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");

dotenv.config(); // 위치 중요
// process.env.COOKIE_SECRET 사용가능

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const { sequelize } = require("./models");
const passportConfig = require("./passport");
const sse = require("./sse");
const webSocket = require("./socket");
const checkAuction = require("./checkAuction");

const app = express();
passportConfig();
checkAuction();
app.set("port", process.env.PORT || 8010);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true, // HTML 파일이 변경될 때에 템플릿 엔진을 reload하게 됨.
});
sequelize
  .sync({ force: false })
  // true면 서버 재시작 시 db날라감.
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

const sessionMiddleware = session({
  resave: false, //  변경사항 없는 session이 매번 다시 저장되는 걸 막음
  saveUninitialized: false, // empty session obj가 쌓이는 걸 방지
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true, // 자바스크립트 접근 금지
    secure: false, // https 관련 추후 배포시 변경.
  },
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(express.json()); // req.body를 ajax json 요청으로부터
app.use(express.urlencoded({ extended: false })); // req.body를 폼으로부터
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);

// passport 미들웨어 위치 중요! 꼭 express session 미들웨어 밑에 작성.
app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/auth", authRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

const server = app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});

webSocket(server, app);
sse(server);
