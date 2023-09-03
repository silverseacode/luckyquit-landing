"use client";
import styles from "./header.module.css";
import Container from "@mui/material/Container";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import TextsmsIcon from "@mui/icons-material/Textsms";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Message, MessageBody, NotificationType, User } from "@/models";
import { getUser } from "@/helpers/users";
import { getChatsBE } from "@/helpers/chats";
import { useSocket } from "../app/Context/store";
import { getInvitationsBE } from "@/helpers/followers";
import { getNotificationsByUserId } from "@/helpers/notifications";
import { usePathname } from "next/navigation";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { auth } from "../config/firebase";
import Image from "next/image";

interface IHeader {
  isChangesWithoutSave?: boolean;
  setShowModal?: (value: boolean) => void;
}

const Header = ({isChangesWithoutSave,setShowModal}: IHeader) => {
  const pathname = usePathname();

  const router = useRouter();

  const navigateTo = (url: string) => {
    console.log(1, url);
    if(isChangesWithoutSave) {
      setShowModal(true)
      return
    }
    router.push(url);
  };
  const [userIdMySelf, setUserIdMySelf] = useState("");
  useEffect(() => {
    const itemUUID = localStorage.getItem("UUID");
    const UUID = itemUUID ? itemUUID : "";
    setUserIdMySelf(UUID);
  }, []);

  const [user, setUser] = useState<User>();
  const socket = useSocket();
  useEffect(() => {
    async function getInfo() {
      const data = await getUser();
      const user = data.response[0];
      setUser(user);

      if (socket !== undefined) {
        socket?.on("new_message", async function (socketData: MessageBody) {
          setNumberOfNewMessages((prev) => {
            return prev + 1;
          });
        });

        socket?.on(
          "mark_as_read",
          async function (socketData: { count: number }) {
            setNumberOfNewMessages((prev) => {
              return prev > 0 ? prev - socketData.count : 0;
            });
          }
        );
        socket?.on(
          "receive_follow_request_notification",
          async function (socketData: MessageBody) {
            setNumberOfNewRequest((prev) => {
              return prev + 1;
            });
          }
        );

        socket?.on(
          "receive_notification_request",
          async function (socketData: MessageBody) {
            console.log("ENTRO receive_notification_request");
            setNumberOfNewNotifications((prev) => {
              return prev + 1;
            });
          }
        );

        socket?.on(
          "mark_as_read_notification_request",
          async function (socketData: { count: number }) {
            setNumberOfNewNotifications((prev) => {
              return prev > 0 ? prev - socketData.count : 0;
            });
          }
        );

        //b5bf47db-5da5-49a3-9691-63edbee9a0cb
      }
    }
    getInfo();
  }, [socket]);

  const [numberOfNewMessages, setNumberOfNewMessages] = useState(0);
  const [numberOfNewRequest, setNumberOfNewRequest] = useState(0);
  const [numberOfNewNotifications, setNumberOfNewNotifications] = useState(0);
  useEffect(() => {
    async function getChats() {
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : null;
      const dataChats = await getChatsBE(UUID);
      const chats: Message[] = dataChats?.response?.chats;

      const currentUserFullName = `${user?.firstName} ${user?.lastName}`;

      let count = 0;
      chats?.map((chat) => {
        chat?.messages?.map((item) => {
          if (
            item.isRead === false &&
            item.senderFullName !== currentUserFullName
          ) {
            count++;
          }
        });
      });

      setNumberOfNewMessages(count);
    }

    async function getRequestFollow() {
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : null;
      const res1 = await getInvitationsBE(UUID);
      const data = res1?.response;
      const invitationsFiltered = data?.invitations?.filter(
        (item: { status: string; from: string }) =>
          item.status === "pending" && item.from !== user?.userId
      );

      setNumberOfNewRequest(invitationsFiltered?.length ?? 0);
    }
    let counter = 0;

    async function getNotifications() {
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : null;
      const data = await getNotificationsByUserId(UUID);
      const notifications: NotificationType[] = data?.response?.notifications;
      notifications?.map((item) => {
        if (item.isRead === false) {
          counter++;
        }
      });
      setNumberOfNewNotifications(counter ?? 0);
    }

    getChats();
    getRequestFollow();
    getNotifications();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("UUID");
    auth.signOut()
    router.replace("/login");
  };

  if (
    pathname === "/login" ||
    pathname === "/infoUser" ||
    pathname?.includes("videocall")
  )
    return null;

  return (
    <div style={{ width: "100%", backgroundColor: "#FFF" }}>
      <Container maxWidth="lg">
        <div className={styles.container}>
          <div className={styles.subContainer}>
            <div style={{flexDirection: "row", display: "flex", alignItems: "center"}}>
              <Image src={"/logo.png"} alt="logo" width={40} height={40} />
              <div style={{marginLeft: 5, fontSize: 18}}>Lucky Quit</div>
            </div>

            <div className={styles.menuItems}>
              <div onClick={() => navigateTo("/home")} className={styles.menuItem}>
                <HomeIcon
                  onClick={() => navigateTo("/home")}
                  style={{
                    fontSize: "26px",
                    color: pathname === "/home" ? "#000" : "rgba(0,0,0,0.6)",
                  }}
                />
                <div
                  onClick={() => navigateTo("/home")}
                  className={styles.menuItemText}
                  style={{
                    color: pathname === "/home" ? "#000" : "rgba(0,0,0,0.6)",
                  }}
                >
                  Home
                </div>
                {pathname === "/home" && (
                  <div className={styles.borderActiveRoute}></div>
                )}
              </div>
              <div onClick={() => navigateTo("/network")} className={styles.menuItem}>
                <PeopleIcon
                  onClick={() => navigateTo("/network")}
                  style={{
                    fontSize: "26px",
                    color: pathname === "/network" ? "#000" : "rgba(0,0,0,0.6)",
                  }}
                />
                <div
                  onClick={() => navigateTo("/network")}
                  className={styles.menuItemText}
                  style={{
                    color: pathname === "/network" ? "#000" : "rgba(0,0,0,0.6)",
                  }}
                >
                  Network{" "}
                  {numberOfNewRequest > 0 && (
                    <div
                      style={{
                        backgroundColor: "#FF2D55",
                        height: 17,
                        width: 17,
                        borderRadius: "50%",
                        color: "#FFF",
                        justifyContent: "center",
                        alignItems: "center",
                        display: "flex",
                        position: "absolute",
                        top: 10,
                        left: 25,
                      }}
                    >
                      {numberOfNewRequest}
                    </div>
                  )}
                </div>
                {pathname === "/network" && (
                  <div className={styles.borderActiveRoute}></div>
                )}
              </div>
              <div onClick={() => navigateTo("/messages")} className={styles.menuItem}>
                <TextsmsIcon
                  onClick={() => navigateTo("/messages")}
                  style={{
                    fontSize: "26px",
                    color:
                      pathname === "/messages" ? "#000" : "rgba(0,0,0,0.6)",
                  }}
                />
                <div
                  onClick={() => navigateTo("/messages")}
                  className={styles.menuItemText}
                  style={{
                    color:
                      pathname === "/messages" ? "#000" : "rgba(0,0,0,0.6)",
                  }}
                >
                  Messages{" "}
                  {numberOfNewMessages > 0 && (
                    <div
                      style={{
                        backgroundColor: "#FF2D55",
                        height: 17,
                        width: 17,
                        borderRadius: "50%",
                        color: "#FFF",
                        justifyContent: "center",
                        alignItems: "center",
                        display: "flex",
                        position: "absolute",
                        top: 10,
                        left: 28,
                      }}
                    >
                      {numberOfNewMessages}
                    </div>
                  )}
                </div>
                {pathname === "/messages" && (
                  <div className={styles.borderActiveRoute}></div>
                )}
              </div>
              <div  onClick={() => navigateTo("/notifications")} className={styles.menuItem}>
                <NotificationsIcon
                  onClick={() => navigateTo("/notifications")}
                  style={{
                    fontSize: "26px",
                    color:
                      pathname === "/notifications"
                        ? "#000"
                        : "rgba(0,0,0,0.6)",
                  }}
                />
                <div
                  onClick={() => navigateTo("/notifications")}
                  className={styles.menuItemText}
                  style={{
                    color:
                      pathname === "/notifications"
                        ? "#000"
                        : "rgba(0,0,0,0.6)",
                  }}
                >
                  Notifications
                  {numberOfNewNotifications > 0 && (
                    <div
                      style={{
                        backgroundColor: "#FF2D55",
                        height: 17,
                        width: 17,
                        borderRadius: "50%",
                        color: "#FFF",
                        justifyContent: "center",
                        alignItems: "center",
                        display: "flex",
                        position: "absolute",
                        top: 10,
                        left: 35,
                      }}
                    >
                      {numberOfNewNotifications}
                    </div>
                  )}
                </div>
                {pathname === "/notifications" && (
                  <div className={styles.borderActiveRoute}></div>
                )}
              </div>
              <div
                onClick={() => navigateTo(`/profile/${userIdMySelf}/false`)}
                className={styles.menuItem}
                style={{ position: "relative", top: "-3px" }}
              >
                <AccountCircleIcon
                  style={{ fontSize: 30, color: "rgba(0,0,0,0.6)" }}
                />
                <span style={{ color: "rgba(0,0,0,0.6)" }}>You</span>
                {pathname === `/profile/${user?.userId}/false` && (
                  <div className={styles.borderActiveRoute}></div>
                )}
              </div>

              <div className={styles.menuItem}>
                <LogoutIcon
                  onClick={() => {
                    handleLogout();
                  }}
                  style={{
                    fontSize: "26px",
                  }}
                />
                <div className={styles.menuItemText}>Logout</div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Header;
