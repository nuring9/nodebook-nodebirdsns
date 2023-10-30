import passport from "passport";
import { Strategy as kakaoStrategy } from "passport-kakao";
import User from "../models/user";

export default () => {
  // 카카오 로그인 설정
  passport.use(
    new kakaoStrategy(
      {
        clientID: process.env.KAKAO_ID!,
        callbackURL: "/auth/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log("profile", profile);
        try {
          const exUser = await User.findOne({
            where: { snsId: profile.id, provider: "kakao" },
          });
          if (exUser) {
            // 로그인
            done(null, exUser); // 로그인 마지막엔 꼭 done
          } else {
            // 회원가입
            const newUser = await User.create({
              email: profile._json?.kakao_account?.email,
              nick: profile.displayName,
              snsId: profile.id,
              provider: "kakao",
            });
            done(null, newUser); // 회원가입도 마찬가지로 마지막에 done
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
