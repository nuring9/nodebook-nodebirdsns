const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const User = require("../models/user");

module.exports = () => {
  passport.use(
    new LocalStrategy(
      // 로그인 전략
      {
        usernameField: "email", // req.body.email
        passwordField: "password", // req.body.password
      },
      async (email, password, done) => {
        // done(서버실패, 성공유저, 로직실패)
        try {
          const exUser = await User.findOne({ where: { email } }); // 사용자가 이메일이 있는지 확인
          if (exUser) {
            // 이메일이 있으면, 비밀번호를 비교
            const result = await bcrypt.compare(password, exUser.password); // bcrypt의 compare메서드로 비교할 수 있음.
            // req.body.password(사용자가 입력한 비밀번호)와 exUser.password(db에 저장된 비밀번호) 비교
            if (result) {
              //  done(서버실패, 성공유저, 로직실패) 이므로 비밀번호가 일치한다면, 성공했으므로 사용자를 넣어줌.
              done(null, exUser);
            } else {
              done(null, false, { message: "비밀번호가 일치하지 않습니다." }); // 로직 실패 메세지: 서버실패도 없고, 로그인을 시켜주면 안되는 경우.
            }
          } else {
            done(null, false, { message: "가입되지 않은 회원입니다." }); // 사용자가 없는 경우 로직 실패
          }
        } catch (error) {
          console.error(error);
          done(error); // 서버실패
        }
      }
    )
  );
};
