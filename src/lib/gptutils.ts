const axios = require("axios");
const DODO_URL = process.env.DODO_URL || "https://api.ioak.io:8120";
const DODO_KEY = process.env.DODO_KEY || "a53dc337-a203-4980-bfc8-12f19acddd26";

export const predict = async (payload: any) => {
  try {
    const response = await axios.post(
      `${DODO_URL}/api/v1/chat/completions`,
      payload,
      {
        headers: {
          authorization: DODO_KEY,
        },
      }
    );

    if (response.status === 200) {
      if (
        response.data?.data?.choices.length > 0 &&
        response.data?.data?.choices[0]?.message?.content
      ) {
        const jsonContent = response.data?.data?.choices[0]?.message?.content
          .replace(/```json/g, "")
          .replace(/```/g, "");
        return JSON.parse(jsonContent) || null;
      }
    }
  } catch (err) {
    console.log("*", err);
    return {};
  }

  return null;
};
