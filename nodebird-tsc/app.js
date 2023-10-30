"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const nunjucks_1 = __importDefault(require("nunjucks"));
const dotenv_1 = __importDefault(require("dotenv"));
const passport_1 = __importDefault(require("passport"));
dotenv_1.default.config; // 위치 중요
const page_1 = __importDefault(require("./routes/page"));
const auth_1 = __importDefault(require("./routes/auth"));
const post_1 = __importDefault(require("./routes/post"));
const user_1 = __importDefault(require("./routes/user"));
const models_1 = require("./models"); // models에서 sequelize를 가져옴.
const passport_2 = __importDefault(require("./passport")); // passport 설정을 불러옴.
const app = (0, express_1.default)();
(0, passport_2.default)(); // 패스포드 설정
app.set("port", process.env.PORT || 8007);
app.set("view engine", "html");
nunjucks_1.default.configure("views", {
    express: app,
    watch: true, // HTML 파일이 변경될 때에 템플릿 엔진을 reload하게 됨.
});
models_1.sequelize
    .sync({ force: false }) // 개발시에 테이블 잘못 만들었을 때 force: true 해둔 다음 서버 재시작하면 테이블들 싹 제거됬다가 다시 생성된다. 배포할땐 꼭 false
    .then(() => {
    console.log("데이터베이스 연결 성공");
})
    .catch((err) => {
    console.error(err);
});
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use("/img", express_1.default.static(path_1.default.join(__dirname, "uploads")));
app.use(express_1.default.json()); // req.body를 ajax json 요청으로부터
app.use(express_1.default.urlencoded({ extended: false })); // req.body를 폼으로부터
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
app.use((0, express_session_1.default)({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false, // https 관련 추후 배포시 변경.
    },
}));
// passport 미들웨어 위치 중요! 꼭 express session 미들웨어 밑에 작성.
app.use(passport_1.default.initialize()); // req.user, req.login, req.isAuthenticate, req.logout 생성.
app.use(passport_1.default.session()); // passport를 쿠키로 로그인을 도와주는 역할.
app.use("/", page_1.default);
app.use("/auth", auth_1.default);
app.use("/post", post_1.default);
app.use("/user", user_1.default);
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
exports.default = app;
