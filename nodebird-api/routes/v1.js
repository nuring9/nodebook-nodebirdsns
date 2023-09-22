const express = require("express");
const { verifyToken } = require("../middlewares");
const {
  createToken,
  tokenTest,
  getMyPosts,
  getPostsByHashtag,
} = require("../controllers/v1");

const router = express.Router();

//   POST /v1/token
router.post("/token", createToken); // 토큰 발급 라우터, req.body.clientSecret

// POST /v1/test
router.get("/test", verifyToken, tokenTest); // 토큰 테스트 라우터

// GET /v1/posts/my
router.get("/posts/my", verifyToken, getMyPosts); // 내 게시글들

// GET /v1/posts/hashtag/:title
router.get("/posts/hashtag/:title", verifyToken, getPostsByHashtag); // 해시태그 검색 게시글

module.exports = router;
