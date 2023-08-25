import { NEXT_URL } from "@/config";
import { getTokenExpired } from "@/globals";

export const getMeetingsBE = async (userId: string) => {
  try {
    const itemToken = localStorage.getItem("jwtToken");
    let token = itemToken ? itemToken : false;

    const itemEmail = localStorage.getItem("email");
    const email = itemEmail ? itemEmail : "";

    const tokenBE = await getTokenExpired(token, email);
    if (tokenBE.isNew) {
      localStorage.setItem("jwtToken", tokenBE.token);
      token = tokenBE.token;
    }
    const response = await fetch(
      `/api/meetings/calendar/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
};
