import { API_URL, NEXT_URL } from "@/config";
import { getTokenExpired } from "@/globals";
import { Post } from "@/models";
//import { getTokenExpired, useTokenExpired } from "../pages/globals";

export const login = async (
  email: string,
  password: string,
  hasChangedPassword: boolean
) => {
  const data = {
    email,
    password,
    hasChangedPassword,
  };
console.log("DATA ",data)
  const res = await fetch(`/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data }),
  });

  const response = res.json();
  return response;
};

export const loginGoogle = async (
  email: string,
) => {
  const data = {
    email,
  };
  const res = await fetch(`/api/users/loginGoogle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data }),
  });

  const response = res.json();
  return response;
};

export const signUp = async (data: { email: string; password: string }) => {
  try {
    const dataSend = { data };
    const response = await fetch(`/api/users/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataSend),
    });
    const res = await response.json();
    return res;
  } catch (err) {
    console.log(err);
  }
};

export const changePasswordBE = async (data: {
  email: string;
  password: string;
}) => {
  try {
    const dataSend = { data };
    const response = await fetch(`/api/users/changepassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataSend),
    });
    const res = await response.json();
    return res;
  } catch (err) {
    console.log(err);
  }
};

export const updateUserInfoBE = async (data: any) => {
  const dataToSend = { data };

  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }
  try {
    const response = await fetch(`/api/users/update-user-info`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + tokenBE.token,
      },
      body: JSON.stringify(dataToSend),
    });
    const res = await response.json();
    return res;
  } catch (error) {
    console.error(error);
  }
};

export const getUniqueUserName = async (username: string) => {
  // const itemToken = localStorage.getItem("jwtToken");
  // let token = itemToken ? itemToken : false;

  // const itemEmail = localStorage.getItem("email");
  // const email = itemEmail ? itemEmail : "";

  // const tokenBE = await getTokenExpired(token, email);
  // if (tokenBE.isNew) {
  //   localStorage.setItem("jwtToken", tokenBE.token);
  //   token = tokenBE.token;
  // }
  try {
    const response = await fetch(
      `/api/users/update-username/${username}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          //Authorization: "Bearer " + tokenBE.token,
        },
      }
    );
    const res = await response.json();
    return res;
  } catch (err) {
    console.log("error /api call verify", err);
  }
};

export const getUsersLookingForCoachBE = async () => {
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
    const response = await fetch(`/api/users/looking-coach`, {
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

export const getUsersLookingForQuittersBE = async () => {
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
    const response = await fetch(`/api/users/looking-quitter`, {
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

export const getUser = async (userId?: string) => {
  const itemUUID = localStorage.getItem("UUID");
  const UUID = itemUUID ? itemUUID : false;

  if (userId !== undefined || UUID !== null) {
    const response = await fetch(
      `/api/users/get-user/${userId ? userId : UUID}`,
      {
        method: "GET",
      }
    );
    const data = await response.json();
    return data;
  } else {
    return {};
  }
};

export const getUserByEmail = async (email: string) => {
  const response = await fetch(`/api/users/email/${email}`, {
    method: "GET",
  });
  const data = await response.json();
  return data;
};

export const getTimezoneBE = async (latitude: number, longitude: number) => {
  try {
    const response = await fetch(
      `${API_URL}/user/timezone/${latitude}/${longitude}`,
      {
        method: "GET",
      }
    );

    const dataRes = await response.json();
    return dataRes;
  } catch (err) {
    console.log(err);
  }
};

export const getRatingsBE = async (userId: string | boolean) => {
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
      `/api/users/get-ratings/${userId}`,
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

export const updatePaypalEmail = async (
  email: string,
  userId: string | undefined
) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const emailStorage = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, emailStorage);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }
  const response = await fetch(
    `/api/users/update-paypal-email/${email}/${userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    }
  );
  const res = await response.json();
  return res;
};

export const getUserByUserNameBE = async (userName: string) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }
  try {
    const response = await fetch(`/api/users/username/${userName}`, {
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

export const updateDescriptionAboutMeBE = async (data: {
  userId: string;
  descriptionAboutMe: string;
}) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }
  const dataSend = { data };
  try {
    const response = await fetch(`/api/users/descriptionAboutMe`, {
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
export const updateAboutProfileBE = async (data: {
  userId: string;
  aboutProfile: string;
}) => {
  const itemToken = localStorage.getItem("jwtToken");
  let token = itemToken ? itemToken : false;

  const itemEmail = localStorage.getItem("email");
  const email = itemEmail ? itemEmail : "";

  const tokenBE = await getTokenExpired(token, email);
  if (tokenBE.isNew) {
    localStorage.setItem("jwtToken", tokenBE.token);
    token = tokenBE.token;
  }
  const dataSend = { data };
  try {
    const response = await fetch(`/api/users/about`, {
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

export const udpdateAvailableForQuittersBE = async (data: {
  userId: string | undefined;
  available: boolean | undefined;
}) => {
  try {
    const dataSend = { data };

    const itemToken = localStorage.getItem("jwtToken");
    let token = itemToken ? itemToken : false;

    const itemEmail = localStorage.getItem("email");
    const email = itemEmail ? itemEmail : "";

    const tokenBE = await getTokenExpired(token, email);
    if (tokenBE.isNew) {
      localStorage.setItem("jwtToken", tokenBE.token);
      token = tokenBE.token;
    }
    const response = await fetch(`/api/users/available-quitter`, {
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

export const updateProfilePictureBE = async (data: {
  userId: string;
  profilePicture: string;
}) => {
  try {
    const dataSend = { data };

    const itemToken = localStorage.getItem("jwtToken");
    let token = itemToken ? itemToken : false;

    const itemEmail = localStorage.getItem("email");
    const email = itemEmail ? itemEmail : "";

    const tokenBE = await getTokenExpired(token, email);
    if (tokenBE.isNew) {
      localStorage.setItem("jwtToken", tokenBE.token);
      token = tokenBE.token;
    }
    const response = await fetch(`/api/users/profilePicture`, {
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

export const updateCertificatesBE = async (data: {
  userId: string;
  certificatePicture: string;
}) => {
  const dataSend = { data };
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
    const response = await fetch(`/api/users/update-certificates`, {
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

export const updateBackgroundPictureBE = async (data: {
  userId: string;
  backgroundPicture: string;
}) => {
  try {
    const dataSend = { data };

    const itemToken = localStorage.getItem("jwtToken");
    let token = itemToken ? itemToken : false;

    const itemEmail = localStorage.getItem("email");
    const email = itemEmail ? itemEmail : "";

    const tokenBE = await getTokenExpired(token, email);
    if (tokenBE.isNew) {
      localStorage.setItem("jwtToken", tokenBE.token);
      token = tokenBE.token;
    }
    const response = await fetch(`/api/users/backgroundPicture`, {
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

export const removeCertificatesBE = async (
  userId: string,
  fileName: string
) => {
  try {
    
    const response = await fetch(`/api/users/remove-certificate/${userId}/${fileName}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }
    });
    const res = await response.json();
    return res;
  } catch (error) {
    console.error(error);
  }
};

export const savePostIdLucky = async (post: Post, userId: string) => {
  
  const response = await fetch(`/api/users/savePostId/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({post}),
  });
  const res = await response.json();
  return res;
};