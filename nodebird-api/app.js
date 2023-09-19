const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const passport = require("passport");
// process.env.COOKIE_SECRET 없음
dotenv.config(); // 위치 중요
// process.env.COOKIE_SECRET 있음
const authRouter = require("./routes/auth");
const indexRouter = require("./routes");
const v1Router = require("./routes/v1");

const { sequelize } = require("./models"); // models에서 sequelize를 가져옴.
const passportConfig = require("./passport"); // passport 설정을 불러옴.

const app = express();
passportConfig(); // 패스포드 설정
app.set("port", process.env.PORT || 8002);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});
sequelize
  .sync({ force: false }) // 개발시에 테이블 잘못 만들었을 때 force: true 해둔 다음 서버 재시작하면 테이블들 싹 제거됬다가 다시 생성된다. 배포할땐 꼭 false
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // req.body를 ajax json 요청으로부터
app.use(express.urlencoded({ extended: false })); // req.body를 폼으로부터
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false, //  변경사항 없는 session이 매번 다시 저장되는 걸 막아 작동 효율을 높임.
    saveUninitialized: false, // empty session obj가 쌓이는 걸 방지해 서버 스토리지를 아낄 수 있다. 기본정책이 false
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true, // 자바스크립트 접근 금지
      secure: false, // https 관련 추후 배포시 변경.
    },
  })
);
// passport 미들웨어 위치 중요! 꼭 express session 미들웨어 밑에 작성.
app.use(passport.initialize()); // req.user, req.login, req.isAuthenticate, req.logout 생성.
app.use(passport.session()); // passport를 쿠키로 로그인을 도와주는 역할.

app.use("/auth", authRouter);
app.use("/", indexRouter);
app.use("/v1", v1Router);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  // 미들웨어 에러처리 매개변수 4개사용.
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {}; // 개발시에만 에러보이게
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});
