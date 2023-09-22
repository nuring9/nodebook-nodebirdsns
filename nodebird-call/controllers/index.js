const axios = require("axios");

/*  
exports.test = async (req, res, next) => {
  // 토큰 테스트 임시 라우터
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
*/

const URL = process.env.API_URL; // 자주 쓰이기 때문에 변수로 분리
axios.defaults.headers.origin = process.env.ORIGIN; // origin 헤더 추가 (어디서 요청이 오는지 알 수 있게.. aip서버에 도메인 등록한 그 도메인.)

// getMyPosts와 searchHashtag 컨트롤러에서 공통적으로 사용하는 함수를 만든것.
// 토큰발급받고, 만료되었으면 갱신하고, api 요청 공통적인 일.
const request = async (req, api) => {
  try {
    if (!req.session.jwt) {
      // 토큰이 세션에 저장되어있지 않다면, 토큰을 발급.
      const tokenResult = await axios.post(`${URL}/token`, {
        clientSecret: process.env.CLIENT_SECRET,
      });
      req.session.jwt = tokenResult.data.token; // 발급받은 토큰을 세션에 저장.
    }
    return await axios.get(`${URL}${api}/`, {
      headers: { authorization: req.session.jwt },
    }); // 토큰을 발급 받은 뒤, 실제로 토큰을 넣어서 API 요청을 보낸다. 파라미터로 api 주소를 넣음.
    // http://localhost:8002/v1/posts/my 과 http://localhost:8002/v1/search/${req.params.hashtag}
  } catch (error) {
    console.error(error);
    if (error.response?.status === 419) {
      // 유효기간 만료되었으면 세션에서 그냥 지워버린다.
      delete req.session.jwt; // 만료된 토큰 구지 메모리에 저장되어있을 필요가 없다.
      return request(req, api); // 재귀함수로 다시 호출하면 세션이 없는상태이므로, 토큰을 새로 다시 발급. 토큰을 발급받자마자 다시 요청을 보내면 만료되어있지 않다.
    }
    throw error.response; // return 말고 throw 한 이유: getMyPosts의 result에서 에러가 발생하면 catch로 잡을 수 있다.
    // 위조되었거나 그 외 에러처리
  }
};

exports.getMyPosts = async (req, res, next) => {
  try {
    const result = await request(req, "/posts/my"); // api서버 라우터 주소
    res.json(result.data);
  } catch (error) {
    console.error(error);
    next(error);
  }

  // headers: { authorization: req.session.jwt }으로 결과가 들어있다.
};

exports.searchByHashtag = async (req, res, next) => {
  try {
    const result = await request(
      req,
      `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`
    ); // api서버 라우터 주소
    res.json(result.data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
