import { API_URL, NEXT_URL } from "@/config";
import { getTokenExpired } from "@/globals";

export const sendNotification = async (data: any) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }
  const dataToSend = { data };
  const response = await fetch(
    `/api/notifications/new-notification`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(dataToSend),
    }
  );
  const res = await response.json();
  return res;
};

export const getNotificationsByUserId = async (userId: string) => {
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
    const response = await fetch(`/api/notifications/${userId}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const updateIsRejectedPayment = async (body: {
  _id: string | undefined;
  isRejectedPayment: boolean;
}) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token
  }
  const dataSend = body;
  try {
    const response = await fetch(
      `/api/notifications/update/payment-status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(dataSend),
      }
    );
    const res = await response.json();
    return res;
  } catch (error) {
    console.error(error);
  }
};

export const updateIsRejectedCalendar = async (body: {
  _id: string | undefined;
  isRejectedCalendar: boolean;
}) => {
  const itemToken = localStorage.getItem("jwtToken");
    let token = itemToken ? itemToken : false;

    const itemEmail = localStorage.getItem("email");
    const email = itemEmail ? itemEmail : "";

    const tokenBE = await getTokenExpired(token, email);
    if (tokenBE.isNew) {
      localStorage.setItem("jwtToken", tokenBE.token);
      token = tokenBE.token
    }
  const dataSend = body;
  try {
    const response = await fetch(
      `/api/notifications/update/calendar-status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(dataSend),
      }
    );
    const res = await response.json();
    return res;
  } catch (error) {
    console.error(error);
  }
};

export const updateToRead = async (data: { ids: (string | undefined)[] }) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token
  }
  const dataSend = data.ids;
  try {
    const response = await fetch(`/api/notifications/update/read`, {
      method: "PUT",
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
export const sendPushNotification = async(pushNotification: any) => {
  try {
    const response = await fetch(`/api/notifications/push-ios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pushNotification),
    });
    const res = await response.json();
    return res;
  } catch (error) {
    console.error(error);
  }
}

export const sendPushNotificationAndroid = async(pushNotification: any) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token
  }
  try {
    const response = await fetch(`/api/notifications/push-android`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pushNotification),
    });
    const res = await response.json();
    return res;
  } catch (error) {
    console.error(error);
  }
}