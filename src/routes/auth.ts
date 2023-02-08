import { isEmpty, validate } from "class-validator";
import { Router, Request, Response } from "express";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import Verification from "../entities/Verification";
const nodemailer = require("nodemailer");
const AWS = require("aws-sdk");
AWS.config.loadFromPath(__dirname + "/../../aws_config.json");

const transporter = nodemailer.createTransport({
  SES: new AWS.SES({
    apiVersion: "2010-12-01",
  }),
});

const mapError = (errors: Object[]) => {
  return errors.reduce((prev: any, err: any) => {
    prev[err.property] = Object.entries(err.constraints)[0][1];
    return prev;
  }, {});
};
// 이메일 토큰 인증
const token_veryfy = async (req: Request, res: Response) => {
  const { email, token } = req.body;
  try {
    let errors: any = {};
    // 비워져있다면 error를 web으로 보내기
    console.log(errors, "validation failed");
    const user = await Verification.findOneBy({ email });

    if (token != user.identifier) {
      return res.status(401).json({ token: "인증번호 잘못 되었습니다." });
    }

    //token을 생성 dotenv로 변수관리

    console.log(token, "토큰");
    return res.json({ user, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};
// 이메일 인증
const email_verify = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const emailUser = await Verification.findOneBy({ email });
    if (emailUser) {
      let token = emailUser.identifier;
      transporter.sendMail(
        {
          from: "no-reply@lckfantasy.com",
          to: email,
          subject: "가입인증메일",
          text: `Email 인증번호 "` + token + `"입니다. \n입력해주세요.`,
        },
        (err, info) => {
          if (err) {
            console.log(err);
          }
          console.log("성공");
          console.log(info);
        }
      );
      return res.json(emailUser);
    } else {
      const token = String(Math.floor(Math.random() * 100000));
      let errors: any = {};

      transporter.sendMail(
        {
          from: "no-reply@lckfantasy.com",
          to: email,
          subject: "가입인증메일",
          text: `Email 인증번호 "` + token + `"입니다. 입력해주세요.`,
        },
        (err, info) => {
          if (err) {
            console.log(err);
          }
          console.log("성공");
          console.log(info);
        }
      );
      const verification = new Verification();

      // 엔티티에 정해 놓은 조건으로 user 데이터의 유효성 검사를 해줌.
      if (errors.length > 0) return res.status(400).json(mapError(errors));
      verification.email = email;
      verification.identifier = token;
      await verification.save();
      return res.json(verification);
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
};
// 회원가입
const register = async (req: Request, res: Response) => {
  const { email, username, password, token } = req.body;
  try {
    let errors: any = {};
    // Email과 username이 이미 사용된 것인지 확인
    const emailUser = await User.findOneBy({ email });
    const usernameUser = await User.findOneBy({ username });
    const tokencheck = await Verification.findOneBy({ email });
    console.log(email, username, "요청data");
    if (emailUser) errors.email = "이미 해당 email은 사용중입니다.";
    if (tokencheck.identifier != token) errors.token = "인증번호가 다릅니다.";
    if (usernameUser) errors.username = "이미 해당 username은 사용중입니다";
    const user = new User();
    user.email = email;
    user.username = username;
    user.password = password;

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    // 엔티티에 정해 놓은 조건으로 user 데이터의 유효성 검사를 해줌.
    errors = await validate(user);
    console.log(errors, "validation failed");
    if (errors.length > 0) return res.status(400).json(mapError(errors));

    await user.save();
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error });
  }
};
// 로그인
const login = async (req: Request, res: Response) => {
  console.log("login");
  const { password, username } = req.body;
  console.log(username, password, "request");
  try {
    let errors: any = {};
    // 비워져있다면 error를 web으로 보내기
    if (isEmpty(username))
      errors.username = "사용자 이름은 비워둘 수 없습니다.";
    if (isEmpty(password)) errors.password = "비밀번호는 비워둘 수 없습니다.";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }
    console.log(errors, "validation failed");
    const user = await User.findOneBy({ username });
    if (!user)
      return res
        .status(404)
        .json({ username: "사용자 이름이 등록되지 않았습니다." });

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ password: "비밀번호가 잘못 되었습니다." });
    }

    //token을 생성 dotenv로 변수관리
    const token = jwt.sign({ username }, process.env.JWT_TOKEN);

    // Cookie에 저장
    res.set(
      "Set-Cookie",
      cookie.serialize("token", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 1, // 하루
        path: "/",
      })
    );
    console.log(token, "토큰");
    return res.json({ user, cookie });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const router = Router();

router.post("/email_verify", email_verify);
router.post("/token_veryfy", token_veryfy);
router.post("/register", register);
router.post("/login", login);

export default router;
