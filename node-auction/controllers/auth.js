const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/user");

// 회원가입 컨트롤러
exports.join = async (req, res, next) => {
  const { email, nick, password, money } = req.body; // join.html 의 회원가입 form의 name따라 req.body를 만들어주기때문에 꺼내 쓸 수 있음.
  try {
    const exUser = await User.findOne({ where: { email } }); // 기존에 회원가입한 사용자가 있는지 찾는다.
    if (exUser) {
      // 만약 기존 사용자가 있다면,
      return res.redirect("join?error=이미 가입된 이메일입니다.");
      // 에러메세지 창으로 리다이렉트
    }
    const hash = await bcrypt.hash(password, 12);

    // 먼저 비밀번호를 암호화한다. 숫자는 20으로하면 높을수록 보안에 좋지만 속도가 느리기 때문에 12가 적당.
    // 기존 사용자가 없다면, 회원가입을 시켜준다. User 생성.
    await User.create({
      email,
      nick,
      password: hash,
      money,
    });
    return res.redirect("/");
    // 메인화면으로 리다이렉트 해서 로그인 할 수 있게 함.
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
// 회원가입은 passport랑 아무런 관계가 없다.

// 로그인 컨트롤러
exports.login = (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    // done이 호출되어 done(서버실패, 성공유저, 로직실패) -> (authError, user, info) 으로감.
    if (authError) {
      // 서버실패, 에러는 항상 에러처리 미들웨어로 넘겨줌.
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      // 유저가 없는 경우, 서버 에러도 아니고 성공유저도 아닌, 로직실패다. 에러메세지 띄어주기
      return res.redirect(`/?error=${info.message}`);
    }
    return req.login(user, (loginError) => {
      // 로그인 성공, user가 들어있음.
      if (loginError) {
        // 혹시 모를 로그인 에러처리 (거의 안나지만 넣어줌)
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect("/");
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙인다. 미들웨어 확장패턴
};

// 로그아웃 컨트롤러
exports.logout = (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
};
