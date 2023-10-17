const express = require("express");
const {
  renderMain,
  renderRoom,
  createRoom,
  enterRoom,
  removeRoom,
  sendChat,
  sendGif,
} = require("../controllers");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
// multer를 사용하면 fs, paht가 같이 사용됨.

const router = express.Router();

router.get("/", renderMain); // 메인 화면 렌더링

router.get("/room", renderRoom); // 방 생성 화면 렌더링

router.post("/room", createRoom); // 방 생성 라우터

router.get("/room/:id", enterRoom); // 방 접속 라우터

router.delete("/room/:id", removeRoom); // 방 제거 라우터

router.post("/room/:id/chat", sendChat); // 채팅 보내는 화면 렌더링

try {
  fs.readdirSync("uploads"); // 업로즈 디렉토리를 읽는다.
} catch (err) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads"); // 없으면 디렉토리 생성.
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, "uploads/"); // uploads 폴더에 저장.
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname); // 파일 이름에서 확장자 추출
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
      // 파일 이름에서 확장자를 떼고, 현재 날짜를 더해준 다음 다시 확장자를 붙여줌.
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 파일 사이즈 5MG
});

router.post("/room/:id/gif", upload.single("gif"), sendGif); // gif 이미지 업로드 라우터

module.exports = router;
