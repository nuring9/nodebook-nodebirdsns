const Post = require("../models/post");
const User = require("../models/user");
// const { Post, User } = require("../models") 로도 대체 가능

exports.renderProfile = (req, res) => {
  // 컨트롤러는 서비스를 호출한다.
  res.render("profile", { title: "내 정보 - NodeBird" });
};
// res.loclas도 프론트로 넘어가지만, res.render의 두번째 인수도 프론트로 넘어간다.
// 즉, res.loclas와 두번째 인수(객체)가 합쳐져서 넘어감. 프론트로 넘기고싶은 정보들으 두번째 인수로 다 적으면 된다.

exports.renderJoin = (req, res) => {
  res.render("join", { title: "회원 가입 - NodeBird" });
};

exports.renderMain = async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ["id", "nick"], // 비밀번호는 보내면 안되기 때문에 제외
      },
      order: [["createdAt", "DESC"]], // 내림차순으로 최신순으로 정령
    });
    res.render("main", {
      title: "NdoeBird",
      twits: posts, // 게시글 나열
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// 라우터가 있으면 라우터 -> 컨트롤러 -> 서비스(아직 서비스를 만들진 않음.) 이 구조로 호출함.
// 컨트롤러는 요청과 응답이 뭔지 안다고 보면되고, 서비스는 요청, 응답을 모른다.
