"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middlewares_1 = require("../middlewares");
const page_1 = require("../controllers/page");
const router = express_1.default.Router();
// 라우터들에서 공통적으로 사용할 수 있는 변수가 res.locals가 있는데 공통적으로 원하는 데이터를 담는다.
// 지금은 사용하지않지만 나중에 사용하기 때문에 일단 빈 데이터들을 담는다. user는 null에서 변경 함.
router.use((req, res, next) => {
    var _a, _b, _c, _d, _e, _f;
    res.locals.user = req.user; // 사용자 정보
    res.locals.followerCount = ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.Followers) === null || _b === void 0 ? void 0 : _b.length) || 0; // 내 팔로워 수, 로그인을 안했을 경우도 고려해야하므로 옵셔널 체이닝과 0을 넣어줌.
    res.locals.followingCount = ((_d = (_c = req.user) === null || _c === void 0 ? void 0 : _c.Followings) === null || _d === void 0 ? void 0 : _d.length) || 0; // 팔로잉 수, 로그인을 안했을 경우도 고려해야하므로 옵셔널 체이닝과 0을 넣어줌.
    res.locals.followingIdList = ((_f = (_e = req.user) === null || _e === void 0 ? void 0 : _e.Followings) === null || _f === void 0 ? void 0 : _f.map((f) => f.id)) || []; // 팔로잉 한사람 id 리스트 , 위와 동일하게 []빈배열 넣어줌.
    next(); // 미들웨어는 항상 마지막에 next 호출.
});
// 로그인페이지는 필요없음. 왼쪽에 고정되어 있어서 라우터로 만들지 않음.
// 라우터의 마지막 미들웨어를 컨트롤러라고 부르는다.
router.get("/profile", middlewares_1.isLoggedIn, page_1.renderProfile); // 로그인 한 사람만 renderProfile
router.get("/join", middlewares_1.isNotLoggedIn, page_1.renderJoin); // 로그인 안한 사람만 renderJoin
router.get("/hashtag", page_1.renderHashtag); // hashtag/hashtag=고양이 구조에서 hashtag의 정보(고양이)는 req.query.hashtag가 된다.
router.get("/", page_1.renderMain);
exports.default = router;
