import { NEXT_URL } from "@/config";
import { EventCalendar } from "@/models";
import { getTokenExpired } from "@/globals";

export const createEventCalendar = async (data: EventCalendar) => {
    const itemToken = localStorage.getItem("jwtToken");
    let token = itemToken ? itemToken : false;

    const itemEmail = localStorage.getItem("email");
    const email = itemEmail ? itemEmail : "";

    const tokenBE = await getTokenExpired(token, email);
    if (tokenBE.isNew) {
      localStorage.setItem("jwtToken", tokenBE.token);
      token = tokenBE.token
    }
    const dataToSend = { data };
    const response = await fetch(`/api/calendar/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(dataToSend),
    });
    const res = await response.json();
    return res;
  };