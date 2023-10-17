const { Op } = require("sequelize");
const { Good } = require("../models");

// res.locals.user + res.render의 두번째 인수객체랑 합쳐져서 넘어간다.

exports.renderMain = async (req, res, next) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // 어제 시간
    const goods = await Good.findAll({
      where: { SoldId: null, createdAt: { [Op.gte]: yesterday } },
      // 시퀄라이즈 문법인데, 예를들어 SQL에서는  WHEHE SoldId IS NULL && createdAt >= '2022-12-24" 이렇게 표현.
      // 경매가 24시간 진행되기 때문에 어제껀 있어도 그제껀 없다. 어제 이후로 생성된 상품중에 24시간 전부터 생성된 상품중에 SoldId:낙찰자가 없는 거가 현재 진행중인 경매다.
    });
    res.render("main", {
      // 진행중인 상품들을 main화면에 렌더링
      title: "NodeAuction",
      goods,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.renderJoin = (req, res) => {
  res.render("join", {
    title: "회원가입 - NodeAuction",
  });
};

exports.renderGood = (req, res) => {
  res.render("Good", {
    title: "상품 등록 - NodeAuction",
  });
};

// 상품 생성하는 컨트롤러
exports.createGood = async (req, res, next) => {
  try {
    const { name, price } = req.body;
    await Good.create({
      OwnerId: req.user.id,
      name,
      img: req.file.filename,
      price,
    });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
};
