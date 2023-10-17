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
        timestamps: true,
        paranoid: true,
        modelName: "Good",
        tableName: "goods",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Good.belongsTo(db.User, { as: "Owner" }); // 경매를 생성한 사용자가 오너
    db.Good.belongsTo(db.User, { as: "Sold" }); // 물건을 낙찰 받은 사람이 솔드
    db.Good.hasMany(db.Auction); // 물건에 대해서 입찰이 여러번 발생.
  }
}

module.exports = Good;
