const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const ColorHash = require("color-hash").default; // 2버전에서는 default를 붙여줘야함

dotenv.config();
const webSocket = require("./socket");
const indexRouter = require("./routes");
const connect = require("./schemas");

const app = express();
app.set("port", process.env.PORT || 8005);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});
connect();

const sessionMiddleware = session({
  // session을 변수로 분리
  resave: false, // 매 request 마다 세션을 계속 다시 저장하는 것을 끔.
  saveUninitialized: false, // empty session obj가 쌓이는 걸 방지해 서버 스토리지를 아낄 수 있음. 쿠키 사용 정책 준수
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true, // 자바스크립트 접근 금지
    secure: false, // https 관련 추후 배포시 변경.
  },
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/gif", express.static(path.join(__dirname, "uploads"))); // gif라는 주소로, uploads 폴더에 접근.
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // form으로 부터 querystring모듈 사용.
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);

app.use((req, res, next) => {
  if (!req.session.color) {
    const colorHash = new ColorHash();
    req.session.color = colorHash.hex(req.sessionID);
    console.log(req.session.color, req.sessionID);
  }
  next();
});

app.use("/", indexRouter);

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

webSocket(server, app, sessionMiddleware); // 서버, express app, sessionMiddleware를 웹소켓에 연결을 위해 넘겨줌.
