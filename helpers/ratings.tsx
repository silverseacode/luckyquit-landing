import { NEXT_URL } from "@/config";
import { getTokenExpired } from "@/globals";

export const sendRatingBE = async (data: {
  userId: string;
  stars: number;
  comment: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}) => {
  try {
    const itemToken = localStorage.getItem("jwtToken");
    let token = itemToken ? itemToken : false;

    const itemEmail = localStorage.getItem("email");
    const email = itemEmail ? itemEmail : "";

    const tokenBE = await getTokenExpired(token, email);
    if (tokenBE.isNew) {
      localStorage.setItem("jwtToken", tokenBE.token);
      token = tokenBE.token
    }
    const response = await fetch(`/api/ratings/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(dataSend),
    });
    const res = await response.json();
    return res;
  } catch (error) {
    console.error(error);
  }
};
