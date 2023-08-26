"use client"
import { API_URL, SOCKET_URL } from "@/config";
import { getUser } from "@/helpers/users";
import React, { createContext, useMemo, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(undefined);

export const SocketProvider = ({children}) => {
  const [socket, setSocket] = useState();

  useEffect(() => {
    async function getInfo() {
      console.log("SOCKET URL123", SOCKET_URL)
      const socket = io(`${SOCKET_URL}`);

      const data = await getUser();
      const user = data.response[0];
      socket?.emit("user_connected", {
        userId: user?.userId,
        profilePicture: user?.profilePicture,
        firstName: user?.firstName,
        lastName: user?.lastName,
      });
      setSocket(socket);
    }

    getInfo();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
