const jwt = require("jsonwebtoken");

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
      req.headers.authoriztion, // 토큰은 보통  req.headers.authorization에 있는데, 꼭 그런건아니고 사용자에게 여기에 넣어달라고 요청.
      process.env.JWT_SECRET // 보안 철저
    );
    return next();
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpriredError") {
      // 유효기간 초과
      res.status(419).json({
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
