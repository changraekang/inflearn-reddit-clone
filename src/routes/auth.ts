import { validate } from "class-validator";
import { Router, Request, Response } from "express";
import { User } from "../entities/User";

const mapError = (errors: Object[]) => {
  return errors.reduce((prev: any, err: any) => {
    prev[err.property] = Object.entries(err.constraints)[0][1];
    return prev;
  }, {});
};

const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  try {
    let errors: any = {};
    // Email과 username이 이미 사용된 것인지 확인

    const emailUser = await User.findOneBy({ email });
    const usernameUser = await User.findOneBy({ username });

    if (emailUser) errors.email = "이미 해당 email은 사용중입니다.";
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

    if (errors.length > 0) return res.status(400).json(mapError(errors));

    await user.save();
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

const router = Router();

router.post("/register", register);

export default router;
