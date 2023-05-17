import * as Helper from "./helper";
import * as userService from "../service";

const selfRealm = 100;

export const createUserInviteEndpoint = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const userInvite: any = await Helper.updateUserInvite(
    req.params.space,
    req.body,
    userId
  );
  res.status(200);
  res.send(userInvite);
  res.end();
};

export const registerUserInvite = async (
  space: string,
  companyId: any,
  userId: string,
  email: string
) => {
  return await Helper.registerUserInvite(space, companyId, userId, email);
};

export const getUserInvite = async (req: any, res: any) => {
  const userId = req.user.user_id;
  const userInviteList: any = await Helper.getUserInvite(req.params.space);
  res.status(200);
  res.send(userInviteList);
  res.end();
};
