const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const {
  renderMain,
  renderJoin,
  renderGood,
  createGood,
} = require("../controllers");

const router = express.Router();

router.use((req, res, next) => {
  // 라우터들에서 공통적으로 사용할 수 있는 변수 res.locals
  res.locals.user = req.user;
  next();
});

router.get("/", renderMain);

router.get("/join", isNotLoggedIn, renderJoin);

router.get("/good", isLoggedIn, renderGood);

try {
  fs.readdirSync("uploads"); // 업로즈 폴더를 읽는다. (동기)
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads"); // 없으면 폴더 생성.
}
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(
        null,
        path.basename(file.originalname, ext) + new Date().valueOf() + ext
      );
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
router.post("/good", isLoggedIn, upload.single("img"), createGood);

module.exports = router;
