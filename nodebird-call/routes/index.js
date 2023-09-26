const express = require("express");
const { getMyPosts, searchByHashtag, renderMain } = require("../controllers");

const router = express.Router();

router.get("/myposts", getMyPosts);

router.get("/search/:hashtag", searchByHashtag);
// api 사용하는 입장에서는 라우터 이름을 조금씩 다르게 정했다.

router.get("/", renderMain); // 브라우저 화면

module.exports = router;
