const User = require("../models/user");
const bcrypt = require("bcrypt");
exports.join = async (req, res, next) => {
  const { nick, email, password } = req.body; // 구조분해 할당

  try {
    const exUser = await User.findOne({ where: { email } }); // 해당 이메일로 가입한 유저가 있는지 찾는다.
    if (exUser) {
      // 유저가 이미 있다면,
      return res.redirect("/join?error=exist"); // join.html의 alert("이미 존재하는 이메일입니다.");
    }
    const hash = await bcrypt.hash(password, 12); // 숫자가 높으면 높을수록 보안에 좋긴하지만 속도가 많이 느려지기 때문에 12가 적당.
    await User.create({
      email,
      nick,
      password: hash, // 사용자가 올린 패스워드를 그대로 사용하면 안되고 암호화 변경 코드 hash로 적용.
    });
    return res.redirect("/"); // 사용자 등록 완료 후 메인화면으로 리다이렉트
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.login = () => {};

exports.logout = () => {};
