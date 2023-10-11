const express = require("express");
const {
  renderMain,
  renderRoom,
  createRoom,
  enterRoom,
  removeRoom,
} = require("../controllers");

const router = express.Router();

router.get("/", renderMain); // 메인 화면 렌더링

router.get("/room", renderRoom); // 방 생성 화면 렌더링

router.post("/room", createRoom); // 방 생성 라우터

router.get("/room/:id", enterRoom); // 방 접속 라우터

router.delete("/room/:id", removeRoom); // 방 제거 라우터

module.exports = router;
