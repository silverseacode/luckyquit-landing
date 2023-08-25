import { NEXT_URL } from "@/config";
import { MessageBody } from "@/models";
import { getTokenExpired } from "@/globals";

export const getChatsBE = async (sender: string | null) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }
  const response = await fetch(`/api/chats/${sender}`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const data = await response.json();
  return data;
};

export const saveMessageBE = async (message: MessageBody) => {
  const data = { message };
  const itemToken = localStorage.getItem("jwtToken");
    let token = itemToken ? itemToken : false;

    const itemEmail = localStorage.getItem("email");
    const email = itemEmail ? itemEmail : "";

    const tokenBE = await getTokenExpired(token, email);
    if (tokenBE.isNew) {
      localStorage.setItem("jwtToken", tokenBE.token);
      token = tokenBE.token;
    }
  const response = await fetch(`/api/chats/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(data),
  });
  const res = await response.json();
  return res;
};
export function debounce(func: Function, delay = 4000) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

export const getMessagesBE = async (sender: string, receiver: string) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }
  console.log(44);
  const response = await fetch(
    `/api/chats/messages/${sender}/${receiver}`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  const data = await response.json();
  return data;
};
