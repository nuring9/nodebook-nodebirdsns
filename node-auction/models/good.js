const Sequelize = require("sequelize");

class Good extends Sequelize.Model {
  static initiate(sequelize) {
    Good.init(
      {
        name: {
          type: Sequelize.STRING(40),
          allowNull: false,
        },
        img: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        price: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        timestamps: true, // createdAt, uddatedAt 생성
        paranoid: true, // deletedAt 생성
        modelName: "Good",
        tableName: "goods",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Good.belongsTo(db.User, { as: "Owner" }); // 경매를 생성한 사용자가 오너   Good은 Owner에 속해있다. (as로 이름변경)
    // 이제 Good 모델에는 OwnerID 특성이 추가됨. Owner의 주요 키가 들어있다.
    db.Good.belongsTo(db.User, { as: "Sold" }); // 물건을 낙찰 받은 사람이 솔드 , Good은 Sold에 속해있다. (as로 이름변경)
    // 이제 Good 모델에는 SoldId 특성이 추가됨. Sold의 주요 키가 들어있다.
    // db.User 관점에서는 hasMany가 된다. belongsTo와 hasMany의 관계성.
    db.Good.hasMany(db.Auction); // 물건에 대해서 입찰이 여러번 발생.
  }
}

module.exports = Good;
