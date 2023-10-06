const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");

dotenv.config();
const webSocket = require("./socket");
const indexRouter = require("./routes");

const app = express();
app.set("port", process.env.PORT || 8005);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // form으로 부터 querystring모듈 사용.
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false, // 매 request 마다 세션을 계속 다시 저장하는 것을 끔.
    saveUninitialized: false, // empty session obj가 쌓이는 걸 방지해 서버 스토리지를 아낄 수 있음. 쿠키 사용 정책 준수
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true, // 자바스크립트 접근 금지
      secure: false, // https 관련 추후 배포시 변경.
    },
  })
);

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

webSocket(server); // 서버와 웹소켓을 연결
