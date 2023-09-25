const express = require("express");
const { verifyToken, apiLimiter } = require("../middlewares");
const {
  createToken,
  tokenTest,
  getMyPosts,
  getPostsByHashtag,
} = require("../controllers/v2");

const router = express.Router();

//   POST /v2/token
router.post("/token", apiLimiter, createToken); // 토큰 발급 라우터, req.body.clientSecret

// POST /v2/test
router.get("/test", apiLimiter, verifyToken, tokenTest); // 토큰 테스트 라우터

// GET /v2/posts/my
router.get("/posts/my", apiLimiter, verifyToken, getMyPosts); // 내 게시글들

// GET /v2/posts/hashtag/:title
router.get("/posts/hashtag/:title", apiLimiter, verifyToken, getPostsByHashtag); // 해시태그 검색 게시글

module.exports = router;
