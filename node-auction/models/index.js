const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];

const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;

const basename = path.basename(__filename);

fs.readdirSync(__dirname) // 현재 폴더의 모든 파일을 조회.
  .filter((file) => {
    // 숨김 파일, index.js , js 확장자가 아닌파일 제외
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    // filter 후 해당 파일의 모델 불러와서 init
    const model = require(path.join(__dirname, file));
    // 현재 폴더에 파일이름을 join 함. models+file, commonJS는 dynamic require을 할 수 있음.
    console.log(file, model.name);
    db[model.name] = model; // db 객체에 모델들을 하나씩 넣어줌.
    model.initiate(sequelize); // 모델들을 전부 다 initiate를 호출해줌.(연결)
  });

// 모델들을 다시 불러와서 associate가 있다면, initiate한 모델들을 associate도 호출해준다.
Object.keys(db).forEach((modelName) => {
  // associate 호출
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
