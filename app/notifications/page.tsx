"use client";
import { Alert, Container, Modal, Snackbar } from "@mui/material";
import styles from "../components/notifications.module.css";
import Layout from "../../app/components/Layout";
import { View, TouchableOpacity, span, Pressable } from "react-native";
import { Colors } from "@/app/colors";
import { useEffect, useRef, useState } from "react";
import { NotificationType, User } from "@/models";
import {
  getNotificationsByUserId,
  sendPushNotification,
  sendPushNotificationAndroid,
  updateIsRejectedCalendar,
  updateIsRejectedPayment,
  updateToRead,
} from "@/helpers/notifications";
import _ from "lodash";
import { getUser } from "@/helpers/users";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { getTokenExpired } from "../../globals";
import { createEventCalendar } from "@/helpers/calendar";
import { useSocket } from "../Context/store";
import Image from "next/image";
import Header from "@/globals/Header";
import { useRouter } from "next/navigation";
import { API_URL } from "@/config";
import { saveMessageBE } from "@/helpers/chats";
import NotificationsIcon from "@mui/icons-material/Notifications";
export default function Notifications() {
  const router = useRouter();
  useEffect(() => {
    const itemUUID = localStorage.getItem("UUID");
    const UUID = itemUUID ? itemUUID : null;
    if (UUID === null) {
      router.replace("/login");
    }
    setCheckingUserId(false);
  }, [router]);
  const [allNotifications, setAllNotifications] =
    useState<NotificationType[]>();
  const [isCheckingUserId, setCheckingUserId] = useState(true);
  const [isPlan, setPlan] = useState([]);
  useEffect(() => {
    let isPlan: any = [];
    async function checkIfHasPlan() {
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : null;
      const res = await getUser(UUID);
      const user = res.response[0];
      allNotifications?.map((item) => {
        user.coaches.map((coach: any) => {
          if (coach.userId === item.sender) {
            isPlan[item.sender] = true;
          }
        });
      });
      console.log("iisPLan", isPlan);
      setPlan(isPlan);
    }

    checkIfHasPlan();
  }, [allNotifications]);

 
  const socket = useSocket();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  useEffect(() => {
    if (socket !== undefined) {
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : "";
      const data = {
        userId: UUID,
      };
      socket?.emit("notification_request_read", data);
    }
  }, [socket]);

  useEffect(() => {
    async function getNotifications() {
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : "";
      const data = await getNotificationsByUserId(UUID);
      const notifications = data.response.notifications;
      console.log("notif", notifications);
      setAllNotifications(notifications);
      const groupedNotifications = notifications.reduce((acc, notification) => {
        const key = `${
          notification.postId === "" ? notification._id : notification.postId
        }-${notification.type}`;
        if (!acc[key]) {
          acc[key] = {
            postId:
              notification.postId === ""
                ? notification._id
                : notification.postId,
            type: notification.type,
            _id: notification._id,
            notifications: [],
          };
        }
        acc[key].notifications.push(notification);
        return acc;
      }, {});

      console.log("grouped", groupedNotifications);

      const result = Object.values(groupedNotifications);

      let finalNotif = [];

      // Create a map to keep track of unique posts
      let uniquePosts = new Map();

      result.forEach((item) => {
        item.notifications.forEach((notif) => {
          if (
            notif.type === "comment" ||
            notif.type === "reply" ||
            notif.type === "like" ||
            notif.type === "payment" ||
            notif.type === "homework" ||
            notif.type === "event" ||
            notif.type === "connect"
          ) {
            const postId = notif.postId;
            const type = notif.type;
            const senderName = notif.senderFullName;
            console.log("result", result);
            const numOthers = item.notifications.length - 1;

            let action = "";
            if (notif.type === "comment") {
              action = "commented";
            }

            if (notif.type === "reply") {
              action = "replied";
            }

            if (notif.type === "like") {
              action = "liked";
            }
            let newNotif = notif;
            // Check if we've already added a notification for this post
            if (
              notif.type === "payment" ||
              notif.type === "event" ||
              notif.type === "connect" ||
              notif.type === "homework"
            ) {
              finalNotif.push(newNotif);
            } else {
              if (!uniquePosts.has(type + postId)) {
                // Create a new notification for this post

                if (newNotif.type !== "homework") {
                  if (numOthers !== 0) {
                    newNotif.body = `${senderName} and ${numOthers} more people ${action} on your post`;
                  } else {
                    newNotif.body = `${senderName} ${action} on your post`;
                  }
                }

                finalNotif.push(newNotif);

                // Add the post to our map so we know we've seen it
                uniquePosts.set(type + postId, true);
              }
            }
          }
        });
      });
      finalNotif?.reverse()
      setNotifications(finalNotif);
    }
    if (!isCheckingUserId) {
      getNotifications();
    }
  }, [isCheckingUserId]);

  useEffect(() => {
    return () => {
      async function changeToRead() {
        const notificationsFiltered = allNotifications?.filter(
          (item) => item.type !== "payment" && item.type !== "event"
        );
        const idsToChangetoRead = notificationsFiltered?.map(
          (item) => item._id
        );
        const data = {
          ids: idsToChangetoRead,
        };
        if (data.ids?.length > 0) {
          await updateToRead(data);
        }
      }

      changeToRead();
    };
  }, [allNotifications]);
  const [shouldShowCreditCardModal, showCreditCardModal] = useState(false);

  const rejectPayment = async (item: NotificationType, index: number) => {
    const data = { _id: item._id, isRejectedPayment: true };
    const copyNotifications = _.cloneDeep(notifications);
    copyNotifications[index].isRejectedPayment = true;
    copyNotifications[index].isRead = true;
    setNotifications(copyNotifications);
    await updateIsRejectedPayment(data);
  };

  const rejectCalendatEvent = async (item: NotificationType, index: number) => {
    const data = { _id: item._id, isRejectedCalendar: true };
    const copyNotifications = _.cloneDeep(notifications);
    copyNotifications[index].isRejectedCalendar = true;
    copyNotifications[index].isRead = true;
    setNotifications(copyNotifications);
    await updateIsRejectedCalendar(data);
  };

  const [notifToBeUpdated, setNotifToBeUpdated] = useState<{
    notif: NotificationType;
    index: number;
  }>();
  //const emailMySelf = process.env.NEXT_PUBLIC_MY_PAYPAL_EMAIL
  const emailMySelf = "sb-2l5c625357871@business.example.com";
  const [nameCurrentUser, setNameCurrentUser] = useState("");
  const [timezone, setTimezone] = useState("");
  const [quitterDataVar, setQuitterData] = useState<User>();
  const [coachDetails, setCoachDetails] = useState<User>();
  const [amountToPay, setAmountToPay] = useState<string | number>(0);

  const [expirationDate, setExpirationDate] = useState<string>("");
  const [startPlanDate, setStartPlanDate] = useState<string>("");
  const [currentNotif, setCurrentNotif] = useState();
  const seeDetails = async (notification: NotificationType) => {
    setPressedSeeDetails(true);
    setCurrentNotif(notification);
    const itemUUID = localStorage.getItem("UUID");
    const UUID = itemUUID ? itemUUID : "";

    const res = await getUser(notification.sender);
    const coachData = res.response;

    const res1 = await getUser(notification.receiver);
    const quitterData = res1.response;

    if (UUID === notification.sender) {
      // si yo estoy logeado y soy el sender
      // entonces quiero que la push notification que recibo
      // el plan se vencio con quien: con la otra parte del contrato
      setNameCurrentUser(
        `${quitterData[0].firstName} ${quitterData[0].lastName}`
      );
      setTimezone(quitterData[0].timezone[0]);
      setQuitterData(quitterData[0]);
    } else {
      setCoachDetails(coachData[0]);
      setNameCurrentUser(`${coachData[0].firstName} ${coachData[0].lastName}`);
    }

    const quitterTimezone = quitterData[0].timezone[0];
    const quantity = notification.payment?.quantity;
    const type = notification.payment?.type;
    // const currentDate = new Date();
    // /// make calculation then convert to timezone

    // if (type === "months") {
    //   currentDate.setMonth(currentDate.getMonth() + quantity);
    // }

    // if (type === "days") {
    //   currentDate.setDate(currentDate.getDate() + quantity);
    // }

    // if (type === "hours") {
    //   currentDate.setHours(currentDate.getHours() + quantity);
    // }
    setAmountToPay(notification.amountPayment);
    const options = { timeZone: quitterTimezone };

    const today = new Date();
    const currentDatetimeStart = today;
    const dateTimezoneStart = currentDatetimeStart.toLocaleString(
      "en-US",
      options
    );
    // const currentDatetime = currentDate;
    // const dateTimezone = currentDatetime.toLocaleString("en-US", options);
    // console.log("EXPIRATION DATE", dateTimezone);
    setStartPlanDate(dateTimezoneStart);
    setExpirationDate(notification.expirationDate);
    const message = `${notification.body}`;

    //setMessage(message);
    setTimeout(() => {
      showCreditCardModal(true);
      setTimeout(() => {
        if (iframeRef.current) {
          const data = {
            //clientId: process.env.NEXT_PUBLIC_CLIENT_ID_PAYPAL,
            clientId:
              "AaMMsWryLKfjq6scSA9wm-Yy-cdM1_hTFf-89tHvMpJJVg2-NgOkHMFe03DoMLmY5Zav3X0Gm1T-0DNp",
            emailMySelf,
            emailCoach: coachData[0].email,
            emailCoachPayPal: coachData[0].emailPaypal,
            emailQuitter: quitterData[0].email,
            amountToPay: notification.amountPayment,
            startPlanDate: dateTimezoneStart,
            expirationDate: notification.expirationDate,
            message,
            userIdQuitter: quitterData[0].userId,
            userIdCoach: coachData[0].userId,
            fullNameCoach: `${coachData[0].firstName} ${coachData[0].lastName}`,
            fullNameQuitter: `${quitterData[0].firstName} ${quitterData[0].lastName}`,
            token,
            isFromWeb: true,
          };

          iframeRef.current.contentWindow.postMessage(data, "*");
        }
      }, 3000);
    }, 2000);
  };

  const acceptEventCalendar = async (item: NotificationType, index: number) => {
    const eventCalendar = {
      quitterId: item.calendarEvent.quitterId,
      coachId: item.calendarEvent.coachId,
      meetDate: item.calendarEvent.meetDate,
      duration: item.calendarEvent.duration,
      shortDescription: item.calendarEvent.shortDescription,
      roomId: item.roomId,
    };

    //update isRejectedCalendar = false show in UI accepted
    const data = { _id: item._id, isRejectedCalendar: false };
    const copyNotifications = _.cloneDeep(notifications);
    copyNotifications[index].isRejectedCalendar = false;
    copyNotifications[index].isRead = true;
    setNotifications(copyNotifications);
    await updateIsRejectedCalendar(data);
    await createEventCalendar(eventCalendar);
  };

  const handlePressNotification = (type: string, postId?: string) => {
    if (type === "homework") {
      router.push(`/home`);
    }
    if (type === "comment" || type === "reply" || type === "like") {
      router.push(`/comments/${postId}`);
    }
  };

  const [token, setToken] = useState("");
  useEffect(() => {
    async function getToken() {
      const itemToken = localStorage.getItem("jwtToken");
      let token = itemToken ? itemToken : "";

      const itemEmail = localStorage.getItem("email");
      const email = itemEmail ? itemEmail : "";

      const tokenBE = await getTokenExpired(token, email);
      if (tokenBE.isNew) {
        localStorage.setItem("jwtToken", tokenBE.token);
        token = tokenBE.token;
      }
      setToken(token);
    }
    getToken();
  }, []);

  const iframeRef = useRef(null);
  useEffect(() => {
    const handleIframeMessage = async (event: any) => {
      //if (event.origin !== 'https://your-iframe-origin.com') return; // Validate the origin of the message
      if (event.data === "success") {
        showCreditCardModal(false);
        await addToQuitterAndCoach();
        setPressedSeeDetails(false);
        const data = {
          _id: notifToBeUpdated?.notif._id,
          isRejectedPayment: false,
        };
        const copyNotifications = _.cloneDeep(notifications);

        if (
          copyNotifications &&
          copyNotifications.length > 0 &&
          notifToBeUpdated
        ) {
          const index = notifToBeUpdated.index ?? 0;
          const notification = copyNotifications[index];
          if (notification) {
            copyNotifications[notifToBeUpdated?.index ?? 0].isRead = true;
            copyNotifications[notifToBeUpdated?.index ?? 0].isRejectedPayment =
              false;
          }
        }

        setNotifications(copyNotifications);

        await updateIsRejectedPayment(data);
      }
    };

    window.addEventListener("message", handleIframeMessage);

    return () => {
      window.removeEventListener("message", handleIframeMessage);
    };
  }, [currentNotif]);

  const sendMessageAlreadyPaid = async () => {
    const currentDatetime = new Date();
    const options = { timeZone: timezone };
    const dateTimezone = currentDatetime.toLocaleString("en-US", options);
    const newMessageBE = {
      sender: notifToBeUpdated?.notif.receiver,
      receiver: notifToBeUpdated?.notif.sender,
      message: `The quitter has payed the amount sent by ${notifToBeUpdated?.notif.senderFullName}`,
      date: dateTimezone,
      isRead: false,
      profilePicture: quitterDataVar?.profilePicture,
      senderFullName: `${quitterDataVar?.firstName} ${quitterDataVar?.lastName}`,
      receiverFullName: `${notifToBeUpdated?.notif.senderFullName}`,
      receiverProfilePicture: notifToBeUpdated?.notif.profilePictureSender,
      initialsSender: quitterDataVar?.initials,
      backgroundColorSender: quitterDataVar?.backgroundColor,
      initialsReceiver: notifToBeUpdated?.notif.initials,
      backgroundColorReceiver: notifToBeUpdated?.notif.backgroundColor,
    };

    socket.emit("send_message", newMessageBE);
    await saveMessageBE(newMessageBE);

    if (coachDetails?.os !== "") {
      if (coachDetails?.os !== "android") {
        const data = {
          token: coachDetails?.pushToken,
          title: `New message`,
          body: `${quitterDataVar?.firstName} ${quitterDataVar?.lastName} has payed your plan`,
          data: {
            isFrom: "Message",
            receiver: notifToBeUpdated?.notif.receiver,
          },
        };
        await sendPushNotification(data);
      } else {
        const pushNotification = {
          title: `New message`,
          body: `${quitterDataVar?.firstName} ${quitterDataVar?.lastName} has payed your plan`,
          data: {
            isFrom: "Message",
            receiver: notifToBeUpdated?.notif.receiver,
          },
          token: coachDetails?.pushToken,
        };
        await sendPushNotificationAndroid(pushNotification);
      }
    }
  };
  const [openToast, setOpenToast] = useState(false);
  const addToQuitterAndCoach = async () => {
    const itemToken = localStorage.getItem("jwtToken");
    let tokenLocal = itemToken ? itemToken : "";

    const itemEmail = localStorage.getItem("email");
    const email = itemEmail ? itemEmail : "";

    const tokenBE = await getTokenExpired(token, email);
    if (tokenBE.isNew) {
      localStorage.setItem("jwtToken", tokenBE.token);
      tokenLocal = tokenBE.token;
    }

    const res = await getUser(currentNotif.sender);
    const coachData = res.response[0];

    const res1 = await getUser(currentNotif.receiver);
    const quitterData = res1.response[0];

    const today = new Date();
    const options = { timeZone: quitterData.timezone[0] };

    const currentDatetimeStart = today;
    const dateTimezoneStart = currentDatetimeStart.toLocaleString(
      "en-US",
      options
    );

    const valuesFromRN = {
      emailMySelf,
      emailCoach: coachData?.email,
      emailCoachPayPal: coachData?.emailPaypal,
      emailQuitter: quitterData?.email,
      amountToPay: currentNotif?.amountPayment, //get this one
      startPlanDate: dateTimezoneStart, //put in state
      expirationDate: currentNotif?.expirationDate, //put in state
      userIdQuitter: quitterData?.userId,
      userIdCoach: coachData?.userId,
      fullNameCoach: `${coachData?.firstName} ${coachData?.lastName}`,
      fullNameQuitter: `${quitterData?.firstName} ${quitterData?.lastName}`,
      token: tokenLocal,
    };
    console.log("VALUES RN", valuesFromRN);
    try {
      const data = {
        user: {
          //este objeto va en el coach
          quitter: {
            planStart: valuesFromRN.startPlanDate.split(",")[0],
            planEnd: valuesFromRN.expirationDate,
            email: valuesFromRN.emailQuitter,
            amount: valuesFromRN.amountToPay,
            amountForUs: Number(valuesFromRN.amountToPay) * 0.1,
            userId: valuesFromRN.userIdQuitter,
            fullName: valuesFromRN.fullNameQuitter,
          },
          ///este objeto va en el quitter
          coach: {
            planStart: valuesFromRN.startPlanDate.split(",")[0],
            planEnd: valuesFromRN.expirationDate,
            email: valuesFromRN.emailCoach,
            amount: valuesFromRN.amountToPay,
            amountForUs: Number(valuesFromRN.amountToPay) * 0.1,
            userId: valuesFromRN.userIdCoach,
            fullName: valuesFromRN.fullNameCoach,
          },
        },
      };
      //http://52.53.194.42
      fetch(`${API_URL}/user/save-coach-quitter-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + valuesFromRN.token,
        },
        body: JSON.stringify({ data }),
      })
        .then((response) => response.json())
        .then((data) => {
          sendMessageAlreadyPaid();
          setOpenToast(true);
          // Toast.show({
          //   type: "success",
          //   text1: "Payment Successfull",
          //   text2: `Now ${notifToBeUpdated?.notif.senderFullName} is your coach!`,
          //   visibilityTime: 5000,
          // });
        });
    } catch (err) {
      console.log("FALLO SAVE COACH EMAl", err);
    }
  };

  const [pressedSeeDetails, setPressedSeeDetails] = useState(false);


  if (isCheckingUserId) return null;
  console.log("NOTIF", notifications);
  return (
    <>
      <Header />

      <div className={styles.container}>
        <Container maxWidth="sm">
          <div className={styles.subContainer}>
            <View>
              {notifications.map((item, index) => {
                return (
                  <View
                    key={item._id}
                    style={{
                      backgroundColor: !item.isRead ? "#E2F0FE" : Colors.white,
                      padding: 20,
                      borderBottomWidth: 1,
                      borderBottomColor: "#f2f2f2",
                    }}
                  >
                    <div
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        handlePressNotification(item.type, item.postId)
                      }
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        {item.profilePictureSender !== "" &&
                        item.profilePictureSender !== undefined ? (
                          <Image
                            width={60}
                            height={60}
                            alt="picture sender"
                            style={{ width: 60, height: 60, borderRadius: 50 }}
                            src={item.profilePictureSender}
                          />
                        ) : (
                          <View
                            style={{
                              height: 60,
                              width: 60,
                              borderRadius: 50,
                              backgroundColor: item.backgroundColor,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                color: Colors.blackDefault,
                                fontSize: 16,
                              }}
                            >
                              {item.initials}
                            </span>
                          </View>
                        )}
                        <View style={{ marginLeft: 10 }}>
                          <span style={{ maxWidth: 420 }}>{item.body}</span>
                        </View>
                      </View>
                    </div>
                    {item.type === "payment" && (
                      <View style={{ flexDirection: "row" }}>
                        {item.isRejectedPayment === undefined &&
                        !isPlan[item.sender] ? (
                          <>
                            <TouchableOpacity
                              onPress={() => rejectPayment(item, index)}
                            >
                              <View
                                style={{
                                  marginLeft: 70,
                                  borderRadius: 50,
                                  paddingVertical: 7,
                                  marginTop: 5,
                                  borderColor: Colors.primary,
                                  borderWidth: 1,
                                  width: 100,
                                }}
                              >
                                <span
                                  style={{
                                    textAlign: "center",
                                    color: Colors.primary,
                                  }}
                                >
                                  Reject
                                </span>
                              </View>
                            </TouchableOpacity>
                            <Pressable
                              onPress={() => {
                                if (pressedSeeDetails) return;
                                setNotifToBeUpdated({ notif: item, index });
                                seeDetails(item);
                              }}
                            >
                              <View
                                style={{
                                  marginLeft: 10,
                                  borderRadius: 50,
                                  paddingVertical: 7,
                                  marginTop: 5,
                                  backgroundColor: pressedSeeDetails
                                    ? Colors.darkGray
                                    : Colors.primary,
                                  width: 100,
                                }}
                              >
                                <span
                                  style={{
                                    textAlign: "center",
                                    color: Colors.white,
                                  }}
                                >
                                  See details
                                </span>
                              </View>
                            </Pressable>
                          </>
                        ) : (
                          <>
                            {(item.isRejectedPayment === false ||
                              isPlan[item.sender]) && (
                              <View
                                style={{
                                  marginLeft: 70,
                                  borderRadius: 50,
                                  paddingVertical: 7,
                                  marginTop: 5,
                                  backgroundColor: Colors.success,
                                  width: 90,
                                  flexDirection: "row",
                                  alignItems: "center",
                                  paddingHorizontal: 10,
                                  justifyContent: "space-between",
                                }}
                              >
                                <span
                                  style={{
                                    textAlign: "center",
                                    color: Colors.white,
                                  }}
                                >
                                  Payed
                                </span>
                                <CheckOutlined
                                  style={{ color: Colors.white, fontSize: 20 }}
                                />
                              </View>
                            )}
                            {item.isRejectedPayment === true && (
                              <View
                                style={{
                                  marginLeft: 70,
                                  borderRadius: 50,
                                  paddingVertical: 7,
                                  marginTop: 5,
                                  backgroundColor: Colors.red,
                                  width: 108,
                                  flexDirection: "row",
                                  alignItems: "center",
                                  paddingHorizontal: 10,
                                  justifyContent: "space-between",
                                }}
                              >
                                <span
                                  style={{
                                    textAlign: "center",
                                    color: Colors.white,
                                  }}
                                >
                                  Rejected
                                </span>
                                <CloseOutlined
                                  style={{ color: Colors.white, fontSize: 20 }}
                                />
                              </View>
                            )}
                          </>
                        )}
                      </View>
                    )}
                    {item.type === "event" && (
                      <View style={{ flexDirection: "row" }}>
                        {item.isRejectedCalendar === undefined ? (
                          <>
                            <TouchableOpacity
                              onPress={() => rejectCalendatEvent(item, index)}
                            >
                              <View
                                style={{
                                  marginLeft: 70,
                                  borderRadius: 50,
                                  paddingVertical: 7,
                                  marginTop: 5,
                                  borderColor: Colors.primary,
                                  borderWidth: 1,
                                  width: 100,
                                }}
                              >
                                <span
                                  style={{
                                    textAlign: "center",
                                    color: Colors.primary,
                                  }}
                                >
                                  Reject
                                </span>
                              </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => acceptEventCalendar(item, index)}
                            >
                              <View
                                style={{
                                  marginLeft: 10,
                                  borderRadius: 50,
                                  paddingVertical: 7,
                                  marginTop: 5,
                                  backgroundColor: Colors.primary,
                                  width: 100,
                                }}
                              >
                                <span
                                  style={{
                                    textAlign: "center",
                                    color: Colors.white,
                                  }}
                                >
                                  Accept
                                </span>
                              </View>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <>
                            {item.isRejectedCalendar === false && (
                              <View
                                style={{
                                  marginLeft: 70,
                                  borderRadius: 50,
                                  paddingVertical: 7,
                                  marginTop: 5,
                                  backgroundColor: Colors.success,
                                  width: 108,
                                  flexDirection: "row",
                                  alignItems: "center",
                                  paddingHorizontal: 10,
                                  justifyContent: "space-between",
                                }}
                              >
                                <span
                                  style={{
                                    textAlign: "center",
                                    color: Colors.white,
                                  }}
                                >
                                  Accepted
                                </span>
                                <CheckOutlined
                                  style={{ color: Colors.white, fontSize: 20 }}
                                />
                              </View>
                            )}
                            {item.isRejectedCalendar === true && (
                              <View
                                style={{
                                  marginLeft: 70,
                                  borderRadius: 50,
                                  paddingVertical: 7,
                                  marginTop: 5,
                                  backgroundColor: Colors.red,
                                  width: 108,
                                  flexDirection: "row",
                                  alignItems: "center",
                                  paddingHorizontal: 10,
                                  justifyContent: "space-between",
                                }}
                              >
                                <span
                                  style={{
                                    textAlign: "center",
                                    color: Colors.white,
                                  }}
                                >
                                  Rejected
                                </span>
                                <CloseOutlined
                                  style={{ color: Colors.white, fontSize: 20 }}
                                />
                              </View>
                            )}
                          </>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
              {notifications.length === 0 && (
                <div
                  style={{
                    flexDirection: "column",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 500,
                  }}
                >
                  <NotificationsIcon
                    style={{ fontSize: 70, color: Colors.darkGray }}
                  />
                  <p style={{ color: Colors.darkGray, marginTop: 50 }}>
                    You don't have notifications for the moment.
                  </p>
                </div>
              )}
            </View>
          </div>
        </Container>
      </div>
      <Modal
        open={shouldShowCreditCardModal}
        className={styles.modal}
        onClose={() => {
          setPressedSeeDetails(false);
          showCreditCardModal(false)
        }}
      >
        <div className={styles.containerModal}>
          <View>
            <iframe
              height={"419px"}
              ref={iframeRef}
              src={`${API_URL}/getPaymentButtons`}
              title="Web App"
            />
          </View>
        </div>
      </Modal>
      <Snackbar
        open={openToast}
        autoHideDuration={6000}
        onClose={() => setOpenToast(false)}
      >
        <Alert
          onClose={() => setOpenToast(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {`${coachDetails?.firstName} ${coachDetails?.lastName} is now your coach!`}
        </Alert>
      </Snackbar>
    </>
  );
}
