const { Op } = require("sequelize");
const { Good, Auction, User, sequelize } = require("../models");
const schedule = require("node-schedule");

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
    const good = await Good.create({
      OwnerId: req.user.id,
      name,
      img: req.file.filename,
      price,
    });
    const end = new Date(); // 현재시간
    end.setDate(end.getDate() + 1); // 하루 뒤
    const job = schedule.scheduleJob(end, async () => {
      const success = await Auction.findOne({
        where: { GoodId: good.id },
        order: [["bid", "DESC"]], // 입찰가로 내림차순으로 정렬했을 때 제일 큰 가격이 입찰가
      });
      await good.setSold(success.UserId); // good(상품)의 sold가 낙찰자이기 때문에, 거기에 낙찰자 id를 넣어준다.
      console.log(setSold);
      await User.update(
        {
          money: sequelize.literal(`money - ${success.bid}`), // money에서 낙찰가를 뺀다.
          // 구현해야할 SQL문이 "SET money = money - 1000000"인데, 이 부분을 시퀄라이즈 자바스크립트로는 표현하기 함들다.
          // 그래서 sequelize의 literal을 사용하여 SQL문을 그대로 넣어줄 수 있다. 즉, 인자에 적힌 스트링을 그대로 SQL 문법으로 변환.
        },
        {
          where: { id: success.UserId }, // 낙찰자
        }
      );
    });
    //job에 이벤트리스터를 달아서 혹시나 에러가 났을 때와 성공했을 때 처리.
    job.on("error", console.error); // 에러 로깅
    job.on("success", () => {
      console.log(`${good.id} 스케줄링 성공`);
    });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// 해당 상품과 기존 입찰 정보들을 불러온 뒤 렌더링.
exports.renderAuction = async (req, res, next) => {
  try {
    const [good, auction] = await Promise.all([
      Good.findOne({
        where: { id: req.params.id },
        include: {
          model: User,
          as: "Owner",
        },
      }),
      Auction.findAll({
        where: { GoodId: req.params.id },
        include: { model: User },
        order: [["bid", "ASC"]],
      }),
    ]);
    res.render("auction", {
      // auction.html의 상품 정보(상품, 입찰내역)를 불러온다.
      title: `${good.name} - NodeAuction`,
      good,
      auction,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 클라이언트로부터 받은 입찰 정보.
exports.bid = async (req, res, next) => {
  try {
    const { bid, msg } = req.body; // 프론트로부터 입찰가격과 메세지를 받는다.
    const good = await Good.findOne({
      where: { id: req.params.id },
      include: { model: Auction },
      order: [[{ model: Auction }, "bid", "DESC"]], // include된 객체의 bid를 내림차순으로 정령
    });
    // 상품을 찾아서 제약 조건들을 검사할 수 있다.

    if (!good) {
      // 상품이 없을 경우,
      return res.status(404).send("해당 상품은 존재하지 않습니다.");
    }
    if (good.price >= bid) {
      // 상품의 가격이 입력한 입찰가보다 크거나 같으면, 즉, 입찰가격을 낮게 입력.
      return res.status(403).send("시작 가격보다 높게 입찰해야 합니다.");
    }
    if (new Date(good.createdAt).valueOf() + 24 * 60 * 60 * 1000 < new Date()) {
      // 상품 생성시간을 밀리초로 변환 후, 24시간이 지금 시간보다 작은 경우. 즉, 24시간이 지나지 않았는지
      return res.status(403).send("경매가 이미 종료되었습니다");
    }
    if (good.Auctions[0]?.bid >= bid) {
      // 상품들중 하나라도 있다면, 상품의 입찰가가 입력한 입찰보다 크거나 같으면. 즉, 새로운 입찰가가 더 높은지
      return res.status(403).send("이전 입찰가보다 높아야 합니다");
    }
    const result = await Auction.create({
      // 데이터 생성
      bid,
      msg,
      UserId: req.user.id,
      GoodId: req.params.id,
    });
    // 실시간으로 입찰 내역 전송
    req.app.get("io").to(req.params.id).emit("bid", {
      bid: result.bid,
      msg: result.msg,
      nick: req.user.nick,
    });
    return res.send("ok");
  } catch (err) {
    console.error(err);
    return next(err);
  }
};
