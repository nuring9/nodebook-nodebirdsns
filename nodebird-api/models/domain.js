const Sequelize = require("sequelize");

class Domain extends Sequelize.Model {
  static initiate(sequelize) {
    Domain.init(
      {
        host: {
          type: Sequelize.STRING(80), // 도메인 등록
          allowNull: false,
        },
        type: {
          type: Sequelize.ENUM("free", "premium"), // 무료고객 유료고객 둘중에 하나
          allowNull: false,
        },
        clientSecret: {
          type: Sequelize.UUID, // UUID는 고유한 아이디. 키 발급사용
          allowNull: false,
        },
      },
      {
        sequelize, // initiate의 두번째 인수는 테이블 옵션이다.
        timestamps: true, // createdAt, updatedAt 유저 생성일과 회원가입시간과 유저 정보 수정된 시간을 자동으로 기록.
        paranoid: true, // 게시글은 복구해달라고 할 수 있어서 ture
        modelName: "Domain", // 자바스크립트에서 쓰는 이름
        tableName: "domains", // db에서 쓰는 이름
      }
    );
  }

  static associate(db) {
    db.Domain.belongsTo(db.User); // User에 속해있다.
  }
}

module.exports = Domain;
