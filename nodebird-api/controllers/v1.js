const { Domain, User } = require("../models");
const jwt = require("jsonwebtoken");

exports.createToken = async (req, res, next) => {
  const { clientSecret } = req.body;
  try {
    const domain = await Domain.findOne({
      // 도메인 소유자 찾기
      where: { clientSecret },
      include: [
        {
          model: User,
          attributes: ["id", "nick"],
        },
      ],
    });
    if (!domain) {
      // 도메인이 없을 경우를 대비
      return res.status(401).json({
        code: 401,
        message: "등록되지 않는 도메인입니다. 먼저 도메인을 등록하세요.",
      });
    }
    const token = jwt.sign(
      {
        // jwt.sign을 통해 토큰을 만들 수 있다. 토큰 내용을 넣는다.
        id: domain.User.id, // 사용자 id
        nick: domain.User.nick, //  사용자 닉네임, id와 nick이 내용물로 들어감.
      },
      process.env_JWTSECRET,
      { expiresIn: "1m", issuer: "nodebird" }
    ); // 마지막 옵션으로 유효기간을 적을 수 있다. 유효기간 1분, 발급자를 nodebird
    return res.json({
      code: 200,
      message: "토큰 발급되었습니다.",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      // 에러에 대해 응답을 하지않으면, 브라우저는 하염없이 기다리고 있기 때문에 응답을 해주는것이 좋다.
      code: 500,
      message: "서버 에러",
    });
  }
};

exports.tokenTest = async (req, res, next) => {
  res.json(res.locals.decoded); // 토큰 내용물들 그대로 다시 돌려주면 된다. (프론트에 표시해주는)
};
