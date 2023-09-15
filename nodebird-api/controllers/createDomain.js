const { User, Domain } = require("../models");
const { v4: uuidv4 } = require("uuid");

exports.renderLogin = async (req, res, next) => {
  // 로그인
  try {
    const user = await User.findOne({
      where: { id: req.user?.id || null }, // 혹시나 로그인을 안했을 때 undefind가 될텐데 where에는 undefind가 들어가면 안되므로 null을 사용.
      include: { model: Domain },
    }); // 일단 나를 찾고, 나의 도메인까지 가져온다
    // 여기서 include를 사용하지 않고, passports/index.js의 deserializeUser에 미리 Domain을 등록해서 가져와도 된다.
    res.render("login", {
      user,
      domains: user?.Domains, // db에서의 유저의 도메인 렌더함
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.createDomain = async (req, res, next) => {
  // 도메인 등록
  try {
    await Domain.create({
      // model의 테이블명 일치
      UserId: req.user.id, // 여기서는 로그인한 사용자이므로 당연 있기 때문에 옵셔널 체이닝 사용안해도 됨.
      host: req.body.host,
      type: req.body.type,
      clientSecret: uuidv4(), // 여기서 uuid 패키지를 사용
    });
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
};
