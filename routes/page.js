const express = require("express");
const router = express.Router();
const {
  renderJoin,
  renderProfile,
  renderMain,
} = require("../controllers/page");

// 라우터들에서 공통적으로 사용할 수 있는 변수가 res.locals가 있는데 공통적으로 원하는 데이터를 담는다.
// 지금은 사용하지않지만 나중에 사용하기 때문에 일단 빈 데이터들을 담는다.
router.use((req, res, next) => {
  res.locals.user = null;
  res.locals.followerCount = 0;
  res.locals.followingCount = 0;
  res.locals.followingIdList = [];
  next(); // 미들웨어는 항상 마지막에 next 호출.
});

// 로그인페이지는 필요없음. 왼쪽에 고정되어 있어서 라우터로 만들지 않음.

router.get("/profile", renderProfile); // 라우터의 마지막 미들웨어를 컨트롤러라고 부르는다.

router.get("/join", renderJoin);

router.get("/", renderMain);

module.exports = router;
