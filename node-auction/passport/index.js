const passport = require("passport");

const local = require("./localStrategy");
const User = require("../models/user");
// 회원가입을 시켜줘야하니까 User 테이블에 넣어줘야 함.

module.exports = () => {
  passport.serializeUser((user, done) => {
    // serializeUser 메서드를 사용하여 사용자 정보를 session에 저장.
    // user === exUser
    done(null, user.id); // user.id만 추출하여 저장
  });
  // {세션쿠키 : 유저아이디}

  passport.deserializeUser((id, done) => {
    //  deserializeUser에서는 session에 저장된 값을 이용해서, 사용자 id을 찾은 후, HTTP Request의  리턴
    User.findOne({ where: { id } })
      .then((user) => done(null, user)) // req.user , req.session
      .catch((err) => done(err));
  });

  local();
};
