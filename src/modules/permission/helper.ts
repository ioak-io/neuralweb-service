const axios = require("axios");
const ONEAUTH_API = process.env.ONEAUTH_API || "http://localhost:4010/api";
const ONEAUTH_API_KEY = process.env.ONEAUTH_API_KEY || "1d9524a6-30df-4b3c-9402-503f4011896c";

export const addRole = async (email: string, companyId: string) => {
  let response = null;
  try {
    response = await axios.post(`${ONEAUTH_API}/212/admin/permission`, {
      action: "ADD",
      userEmail: email,
      roleName: "COMPANY_ADMIN",
      scope: companyId
    }, {
      headers: {
        authorization: ONEAUTH_API_KEY,
      },
    });
  } catch (err) {
    return {};
  }

  if (response.status === 200) {
    return response.data || null;
  }

  return null;
};

