import express from "express";
import passport from "passport";

import { isLoggedIn, isNotLoggedIn } from "../middlewares";
import { join, login, logout } from "../controllers/auth";

const router = express.Router();

// app.js에서 작성한 auth 와 + /join 이되서 /auth/join이 된다.
// POST /auth/join
router.post("/join", isNotLoggedIn, join);

// POST /auth/login
router.post("/login", isNotLoggedIn, login);

// GET /auth/logout
router.get("/logout", isLoggedIn, logout);

// GET /auth/kakao
router.get("/kakao", passport.authenticate("kakao")); // 카카오톡 로그인 화면으로 redirect 해준다.

// auth/kakao -> 카카오 로그인 화면(성공여부 결과 후)-> auth/kakao/callback 로 redirect 되는 구조.

// GET /auth/kakao/callback
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/?error=카카오로그인 실패",
  }),
  (req, res) => {
    res.redirect("/"); // 성공 시에는 /로 이동
  }
);

export default router;
