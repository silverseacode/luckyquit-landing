import { NEXT_URL } from "@/config";
import { User } from "@/models";
import { getTokenExpired } from "@/globals";

export const getFollowersBE = async (userId: string | null, isUserName = false) => {
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
    const response = await fetch(`/api/followers/${userId}/${isUserName}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const getBySearch = async (searchTerm: string, type: string) => {
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
    const response = await fetch(
      `/api/followers/search/${searchTerm}/${type}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      }
    );

    const dataRes = await response.json();
    return dataRes;
  } catch (err) {
    console.log(err);
  }
};

export const getInvitationsBE = async (userId: string) => {
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
    const response = await fetch(
      `/api/followers/invitations/${userId}`,
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

export const getCoachsBE = async (userId: string) => {
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
    const response = await fetch(`/api/followers/coachs/${userId}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const dataRes = await response.json();
    return dataRes;
  } catch (err) {
    console.log(err);
  }
};

export const acceptInvitationBE = async (
  invitationId: number,
  userId: string,
  from: string
) => {
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
    const response = await fetch(
      `/api/followers/accept-invitation/${invitationId}/${userId}/${from}`,
      {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    const res = await response.json();
    return res;
  } catch (err) {
    console.log(err);
  }
};

export const followBE = async (data: {
  userId: string;
  userIdFrom: string | undefined;
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
    const dataSend = { data };
    const response = await fetch(`/api/followers/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(dataSend),
    });
    const res = await response.json();
    return res;
  } catch (err) {
    console.log(err);
  }
};

export const rejectInvitationBE = async (
  invitationId: number,
  userId: string,
  from: string
) => {
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
    const response = await fetch(
      `/api/followers/reject-invitation/${invitationId}/${userId}/${from}`,
      {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    const res = await response.json();
    return res;
  } catch (err) {
    console.log(err);
  }
};

export const stopFollowingBE = async (
  userId: string,
  userIdToStopFollowing: string | undefined
) => {
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
    const response = await fetch(
      `/api/followers/stop/${userId}/${userIdToStopFollowing}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
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

export const createInvitationBE = async (data: User) => {
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
    const dataSend = { data };
    const response = await fetch(
      `/api/followers/invitation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(dataSend),
      }
    );
    const res = await response.json();
    return res;
  } catch (err) {
    console.log(err);
  }
};
