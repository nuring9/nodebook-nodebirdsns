const express = require("express");
const { getMyPosts, searchByHashtag } = require("../controllers");

const router = express.Router();

// POST /test  이제 토큰 test 안해도 됨. 라우터 삭제.
// router.get("/test", test);

router.get("/myposts", getMyPosts);

router.get("/search/:hashtag", searchByHashtag);

// api 사용하는 입장에서는 라우터 이름을 조금씩 다르게 정했다.

module.exports = router;
