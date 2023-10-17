// 로그인 했는지 판단하는 미들웨어
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    // inAuthenticated 호출은 인증이 성공적으로 완료되었는지 여부
    // 인증이 성공되었으면 다음으로 넘어감.
    next();
  } else {
    // 만약 인증이 되지 않으면 로그인 필요
    res.status(403).send("로그인 필요");
  }
};

// 로그인을 안했는지 판단하는 미들웨어
exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // 로그인 안했다면 그냥 넘어가고,
    next();
  } else {
    // 만약 로그인 했을 경우 메세지 띄워주기
    const message = encodeURIComponent("로그인한 상태입니다.");
    res.redirect(`/?error=${message}`);
  }
};
