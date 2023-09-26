const express = require("express");
const {
  verifyToken,
  apiLimiter,
  corsWhenDomainMatches,
} = require("../middlewares");
const {
  createToken,
  tokenTest,
  getMyPosts,
  getPostsByHashtag,
} = require("../controllers/v2");

const router = express.Router();

/* CORS 에러 Header에 직접 넣어 해결하는 예, 응답의 헤더에 심어주기.
router.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4000");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  next();
});
*/

/*  cors 패키지 사용방법 1.
router.use(
  cors({
    origin: true, // true로 설정하게되면 모든 요청을 거의 다 받게됨.
    credentials: true, // 쿠키를 같이 사용할꺼면, 쿠키 요청까지 허용해야 한다.
    //  credentials: true 면 origin" '*'를 사용하지 못한다. '*' 모든 요청이라는 뜻이므로, 위와같이 직접 origin을 고정해주거나 true로 설정.
  })
);
*/

// cors 패키지 미들웨어 확장패턴 적용.
router.use(corsWhenDomainMatches);

//   POST /v2/token
router.post("/token", apiLimiter, createToken); // 토큰 발급 라우터, req.body.clientSecret

// POST /v2/test
router.get("/test", apiLimiter, verifyToken, tokenTest); // 토큰 테스트 라우터

// GET /v2/posts/my
router.get("/posts/my", apiLimiter, verifyToken, getMyPosts); // 내 게시글들

// GET /v2/posts/hashtag/:title
router.get("/posts/hashtag/:title", apiLimiter, verifyToken, getPostsByHashtag); // 해시태그 검색 게시글

module.exports = router;
