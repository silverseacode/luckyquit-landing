import { NEXT_URL } from "@/config";
import { getTokenExpired } from "@/globals";

export const saveModulesAndExercises = async (data: {
  userId: string;
  quitterUserId: string;
  totalDays: string;
  isReadyForQuitter?: boolean;
  modules: {
    [key: string]: {
      title: string;
      short: string;
      thumb: string;
      day: number;
      uploadedImage: string;
      video: string;
      youTubeId: string;
      fullDescription: string;
    }[];
  };
  exercises: {
    [key: string]: {
      title: string;
      short: string;
      thumb: string;
      day: number;
      uploadedImage: string;
      video: string;
      youTubeId: string;
      fullDescription: string;
    }[];
  };
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
      token = tokenBE.token
    }
    const response = await fetch(`/api/modules/save`, {
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

export const getByQuitterNullAndCoachIdBE = async (coachUserId: string) => {
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
      `/api/modules/getByQuitterNullAndCoachId/${coachUserId}`,
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

export const getModulesAndExercisesByQuitterUserId = async (
  quitterUserId: string
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
      `/api/modules/getModulesAndExercisesByQuitterUserId/${quitterUserId}`,
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


export const getModulesAndExercisesByQuitterUserIdWithS3 = async (
  quitterUserId: string
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
      `/api/modules/getModulesAndExercisesByQuitterUserIdWithS3/${quitterUserId}`,
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

export const getByQuitterIdAndCoachId = async (
  quitterUserId: string,
  coachUserId: string,
  isHomework = false
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
      `/api/modules/coach/${quitterUserId}/${coachUserId}/${isHomework}`,
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
