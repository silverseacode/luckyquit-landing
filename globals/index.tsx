import { useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import { API_URL } from "@/config";

export const getTokenExpired = async (token: string | false, email: string) => {

  const isTokenExpired = () => {
    if (token) {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    }
    return false; // Token is not present or undefined
  };

  if (isTokenExpired()) {
    const newToken = await refreshToken(email);
    return {isNew: true, token: newToken.token}
  } else {
    return {isNew: false, token: token}
  }
};

export const refreshToken = async (email: string) => {
  try {
    const response = await fetch(`${API_URL}/refresh-token/${email}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const res = await response.json();
    return res;
  } catch (err) {
    console.log(err);
  }
};


