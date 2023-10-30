import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import session from "express-session";
import nunjucks from "nunjucks";
import dotenv from "dotenv";
import passport from "passport";

dotenv.config; // 위치 중요
import pageRouter from "./routes/page";
import authRouter from "./routes/auth";
import postRouter from "./routes/post";
import userRouter from "./routes/user";

import { sequelize } from "./models"; // models에서 sequelize를 가져옴.
import passportConfig from "./passport"; // passport 설정을 불러옴.

const app = express();
passportConfig(); // 패스포드 설정
app.set("port", process.env.PORT || 8007);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app, // express에 app 객체 연결
  watch: true, // HTML 파일이 변경될 때에 템플릿 엔진을 reload하게 됨.
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
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(express.json()); // req.body를 ajax json 요청으로부터
app.use(express.urlencoded({ extended: false })); // req.body를 폼으로부터
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET!,
    cookie: {
      httpOnly: true, // 자바스크립트 접근 금지
      secure: false, // https 관련 추후 배포시 변경.
    },
  })
);
// passport 미들웨어 위치 중요! 꼭 express session 미들웨어 밑에 작성.
app.use(passport.initialize()); // req.user, req.login, req.isAuthenticate, req.logout 생성.
app.use(passport.session()); // passport를 쿠키로 로그인을 도와주는 역할.

app.use("/", pageRouter);
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/user", userRouter);

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

export default app;
