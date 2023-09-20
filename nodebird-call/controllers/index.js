const axios = require("axios");

exports.test = async (req, res, next) => {
  // 토큰 테스트 라우터
  try {
    if (!req.session.jwt) {
      // 세션에 토큰이 없는 경우 발급 시도
      const tokenResult = await axios.post("http://localhost:8002/v1/token", {
        clientSecret: process.env.CLIENT_SECRET,
      }); // 토큰발급
      if (tokenResult.data?.code === 200) {
        // api controllers/v1.js의 code: 200 토큰 발급 성공.
        req.session.jwt = tokenResult.data.token; // 매번 토큰발급을 받게되면 낭비기 때문에, session에 토큰 저장.
        //  세선에 토큰이 있으면 새로 발급 안해도됨.
      } else {
        // 토큰발급 실패 시 실패 사유를 브라우저로 응답
        return res.json(tokenResult.data);
      }
    }

    // 세션에 jwt가 저장됬으면, 토큰 발급받아서 제대로 발급받았는지 테스트
    const result = await axios.get("http://localhost:8002/v1/test", {
      headers: { authorization: req.session.jwt }, //jwt토큰은 api서버에서 headers.authorization에 넣는다고 했었음.
    });
    return res.json(result.data);
  } catch (error) {
    console.error(error);
    if (error.response?.status === 419) {
      // 419는 토큰만료 에러 처리
      return res.json(error.response.data);
    }
    return next(error); // 토큰이 위조되었을땐 바로 에러미들웨어로 처리.
  }
};
