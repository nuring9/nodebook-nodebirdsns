#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// 0,1번째 index는 노드와 그파일 이름이였다, 그래서 실제적으로 우리가 입력하는것은 2번 index부터 시작이기 때문에 2,3,4에 필요한 옵션을 넣어준다.
// npx cil html main .  -> main.html이 생성된다.
let rl;
let type = process.argv[2];
let name = process.argv[3];
let directory = process.argv[4] || ".";

const htmlTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Template</title>
  </head>
  <body>
    <h1>Hello</h1>
    <p>CLI</p>
  </body>
</html>
`;

const routerTemplate = `
const express = require('express');
const router = express.Router();
 
router.get('/', (req, res, next) => {
   try {
     res.send('ok');
   } catch (error) {
     console.error(error);
     next(error);
   }
});
 
module.exports = router;
`;

const exist = (dir) => {
  // 폴더 존재 확인 함수, fs모듈안에 들어있을 수 있지만 혹시나해서 직접 생성.
  try {
    // 특정 폴더 안에 파일이 있는지 fs.accessSync 사용. 옵션은 권한 관련된 것들인데, 숨겨진 파일이 아니다, 읽기 권한 있는 파일이다, 쓰기 권한이 있는 파일이다.
    fs.accessSync(
      dir,
      fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK
    );
    return true;
  } catch (e) {
    return false;
  }
};

// 경로가 a/b/c 다 하면, a폴더 먼저 만들어지고, 그 안에 b폴더 만들고, 그안에 c 폴더만드는 코드.
const mkdirp = (dir) => {
  // 경로 생성 함수
  const dirname = path
    .relative(".", path.normalize(dir))
    .split(path.sep)
    .filter((p) => !!p);
  dirname.forEach((d, idx) => {
    const pathBuilder = dirname.slice(0, idx + 1).join(path.sep);
    if (!exist(pathBuilder)) {
      fs.mkdirSync(pathBuilder);
    }
  });
};

const makeTemplate = () => {
  // 템플릿 생성 함수
  mkdirp(directory);
  if (type === "html") {
    // html 파일
    const pathToFile = path.join(directory, `${name}.html`);
    if (exist(pathToFile)) {
      console.error("이미 해당 파일이 존재합니다");
    } else {
      fs.writeFileSync(pathToFile, htmlTemplate);
      console.log(pathToFile, "생성 완료");
    }
  } else if (type === "express-router") {
    // js 파일
    const pathToFile = path.join(directory, `${name}.js`);
    if (exist(pathToFile)) {
      console.error("이미 해당 파일이 존재합니다");
    } else {
      fs.writeFileSync(pathToFile, routerTemplate);
      console.log(pathToFile, "생성 완료");
    }
  } else {
    console.error("html 또는 express-router 둘 중 하나를 입력하세요.");
  }
};

const dirAnswer = (answer) => {
  // 경로 설정
  directory = answer?.trim() || ".";
  rl.close();
  makeTemplate();
};

const nameAnswer = (answer) => {
  // 파일명 설정
  if (!answer || !answer.trim()) {
    // 이름을 입력하지 않으면,
    console.clear();
    console.log("name을 반드시 입력하셔야 합니다.");
    return rl.question("파일명을 설정하세요. ", nameAnswer);
  }
  name = answer;
  return rl.question(
    "저장할 경로를 설정하세요.(설정하지 않으면 현재경로) ",
    dirAnswer
  );
  // 파일 저장할 경로 질문
};

const typeAnswer = (answer) => {
  // 템플릿 종류 설정
  if (answer !== "html" && answer !== "express-router") {
    console.clear();
    console.log("html 또는 express-router만 지원합니다.");
    return rl.question("어떤 템플릿이 필요하십니까? ", typeAnswer);
  }
  type = answer;
  // 올바르게 대답을 했다면, type에 저장한다.
  return rl.question("파일명을 설정하세요. ", nameAnswer);
  // 그 다음 질문을 함.
};

const program = () => {
  if (!type || !name) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    console.clear();
    rl.question("어떤 템플릿이 필요하십니까? ", typeAnswer);
  } else {
    makeTemplate();
  }
};

program(); // 프로그램 실행부
