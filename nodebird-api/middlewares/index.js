const jwt = require("jsonwebtoken");
const reteLimit = require("express-rate-limit");
const cors = require("cors");
const Domain = require("../models/domain");

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    // "IsAuthenticated"는 인증이 성공적으로 완료되었는지 여부,
    next();
  } else {
    res.status(403).send("로그인 필요");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent("로그인한 상태입니다.");
    res.redirect(`/?error=${message}`);
  }
};

exports.verifyToken = (req, res, next) => {
  try {
    res.locals.decoded = jwt.verify(
      // jwt.verif로 토큰 검사가 끝나면, 내용물을 decoded 안에 넣는다.
      req.headers.authorization, // 토큰은 보통  req.headers.authorization에 있는데, 꼭 그런건아니고 사용자에게 여기에 넣어달라고 요청.
      process.env.JWT_SECRET // 보안 철저
    );
    return next();
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      // TokenExpiredError 유효기간 초과
      return res.status(419).json({
        code: 419,
        message: "토큰이 만료되었습니다.",
      });
    }
    return res.status(401).json({
      code: 401, // 419, 401은 아무값인데, 프론트랑 합의 후 사용하면 된다.
      message: "유효하지 않는 토큰입니다.",
    });
  }
};

exports.apiLimiter = reteLimit({
  windowMs: 60 * 1000, // 1분
  max: 10, // 최대 1분에 열번번만.
  handler(req, res) {
    // api 요청 추가 시 응답 핸들러
    res.status(this.statusCode).json({
      code: this.statusCode,
      message: "1분에 한번만 요청",
    });
  },
});

/* 미들웨어 확장 패턴으로 일반회원과 프리미엄 회원 구분하여 limit 적용 예:
exports.apiLimiter = async (req, res, next) => {
  let user;
  if (res.locals.decoded) {
    user = await User.findOne({ where: { id: res.locals.decoded.id } });
  }
  reteLimit({
    windowMs: 60 * 1000, // 1분
    max: user?.type === premium ? 1000 : 10, // 최대 1분에 열번번만.
    handler(req, res) {
      // api 요청 추가 시 응답 핸들러
      res.status(this.statusCode).json({
        code: this.statusCode,
        message: "1분에 한번만 요청",
      });
    },
  })(req, res, next);
};
*/

exports.deprecated = (req, res) => {
  // 예전 버전 사용 금지 미들웨어
  res.status(410).json({
    code: 410,
    message: "새로운 버전 나왔으니, 새로운 버전을 사용하세요.",
  });
};

exports.corsWhenDomainMatches = async (req, res, next) => {
  const domain = await Domain.findOne({
    where: { host: new URL(req.get("origin")).host }, // origin header를 가져와서 url 분석을 통해서, host만 추출.
    // new URL로 감싼 다음 host를 추출하면 http가 떨어진다.
  });
  if (domain) {
    cors({
      origin: req.get("origin"), // http가 붙어있음.
      credentials: true,
    })(req, res, next);
  } else {
    next();
  }
};
