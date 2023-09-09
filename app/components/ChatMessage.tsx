import { Colors } from "@/app/colors";
import {
  getMessagesBE,
  saveMessageBE,
  saveMessageBETrue,
} from "@/helpers/chats";
import {
  sendNotification,
  sendPushNotification,
  sendPushNotificationAndroid,
} from "@/helpers/notifications";
import { getUser, updatePaypalEmail } from "@/helpers/users";
import { Message, MessageBody, User } from "@/models";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import RadioButton from "./RadioButton";
import { Alert, Box, Fade, Modal, Popper, Snackbar } from "@mui/material";
import styles from "./chat-message.module.css";
import InfoIcon from "@mui/icons-material/Info";
import "react-datetime/css/react-datetime.css";
import Datetime from "react-datetime";
import { useRouter } from "next/navigation";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { InfoCircleOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import { useSocket } from "../Context/store";
import Image from "next/image";
import axios from "axios";
import { API_URL } from "@/config";
import mixpanel from "mixpanel-browser";
import NoPhotographyIcon from "@mui/icons-material/NoPhotography";
import moment from "moment";
import ShareIcon from "@mui/icons-material/Share";

type MessagesByDay = { [date: string]: Message[] };
interface IProps {
  setMessageSend: (value: any) => void;
  receiverParam: any;
  setTriggerChange: (value: boolean) => void;
  triggerChange: boolean;
  user: User | undefined;
}

const ChatMessage = ({
  user,
  receiverParam,
  setMessageSend,
  setTriggerChange,
  triggerChange,
}: IProps) => {
  const socket = useSocket();
  const [messages, setMessages] = useState<Message>();

  console.log("messages!!", messages);
  const markConversationAsRead = async () => {
    const copyChats: Message = _.cloneDeep(messages);

    let countMarkAsRead = 0;
    copyChats?.messages?.map((item) => {
      if (item.isRead === false) {
        countMarkAsRead++;
      }
    });

    socket?.emit("messages_read", {
      userId: user?.userId, //same as sender
      receiver: receiver,
      count: countMarkAsRead,
    });

    const sender = user?.userId;
    await axios.post(
      `${API_URL}/messages/updateToReadMessages/${sender}/${receiver?.userId}`
    );
  };

  useEffect(() => {
    if (messages !== undefined) {
      markConversationAsRead();
    }
  }, [messages]);

  //b5bf47db-5da5-49a3-9691-63edbee9a0cb
  const [receiver, setReceiver] = useState();

  const [sender, setSender] = useState("");
  const [senderFullName, setSenderFullName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [timezone, setTimezone] = useState("");

  const [isPlanEndExpire, setPlanExpire] = useState<boolean | undefined>(
    undefined
  );

  const [pushTokenReceiver, setPushTokenReceiver] = useState("");
  const [os, setOs] = useState("");
  const [receiverTypeOfUser, setReceiverTypeOfUser] = useState("");
  const [isAllowNotificationChats, setIsAllowNotificationChats] =
    useState(true);
  useEffect(() => {
    async function getPushTokenReceiver() {
      const receiverBE = await getUser(receiverParam);

      setPushTokenReceiver(receiverBE.response[0]?.pushToken ?? "");
      setReceiver(receiverBE.response[0]);

      setOs(receiverBE.response[0]?.os ?? "");
      setReceiverTypeOfUser(receiverBE.response[0]?.type ?? "");
      setIsAllowNotificationChats(receiverBE.response[0]?.isChats ?? true);
    }
    getPushTokenReceiver();
  }, [receiverParam]);
  const [initials, setInitials] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [emailPaypal, setEmailPaypal] = useState("");

  const prevReceiverIdRef = useRef(null);

  const [roomId, setRoomId] = useState("-");
  useEffect(() => {
    if (user?.userId !== undefined && receiver?.userId !== undefined) {
      const roomIdString = [user?.userId, receiver?.userId].sort().join("-");
      setRoomId(roomIdString);
    }
  }, [user, receiver]);

  useEffect(() => {
    async function getUserInfo() {
      const data = await getUser();
      const user = data.response[0];
      //este es el coach
      setEmailPaypal(user?.emailPaypal);
      setProfilePicture(user?.profilePicture);
      setTimezone(user?.timezone[0]);
      setSender(user.userId);
      setSenderFullName(`${user.firstName} ${user.lastName}`);
      setInitials(user.initials);
      setBackgroundColor(user.backgroundColor);
      let planEnd = new Date();
      let isPlanEndExpireLocal;
      if (user.quitters.length > 0) {
        user.quitters.map((quitter: { userId: string; planEnd: string }) => {
          if (quitter.userId === receiver?.userId) {
            planEnd = new Date(quitter.planEnd);
          }
        });
        const today = new Date();
        isPlanEndExpireLocal = today > planEnd;
        setPlanExpire(isPlanEndExpireLocal);
      } else {
        if (user.coaches.length > 0) {
          user.coaches.map((coach: { userId: string; planEnd: string }) => {
            if (coach.userId === receiver?.userId) {
              planEnd = new Date(coach.planEnd);
            }
          });
          const today = new Date();
          isPlanEndExpireLocal = today > planEnd;
          setPlanExpire(isPlanEndExpireLocal);
        }
      }
      if (receiver?.userId !== prevReceiverIdRef.current) {
        const dataMsg = await getMessagesBE(user.userId, receiver?.userId);
        const messagesArray = dataMsg.response.messages;
        setMessages(messagesArray);
      }
      prevReceiverIdRef.current = receiver?.userId;
    }

    getUserInfo();
  }, [receiver?.userId]);

  const [messageToSend, setMessageToSend] = useState("");

  const messagesByDay = (messages: Message | undefined) => {
    if (!messages) {
      return {};
    }
    return messages?.messages?.reduce((acc: MessagesByDay, message: any) => {
      //message.messages.forEach((msg) => {
      const messageDate = message.date;
      if (acc.hasOwnProperty(messageDate)) {
        acc[messageDate].push(message);
      } else {
        acc[messageDate] = [message];
      }
      //});
      return acc;
    }, {});
  };
  let regex = /no-photo-post/;
  let regexUser = /no-photo-user/;

  let lastDayOfTheWeek: string | null = null;
  let messageGroups;
  if (
    messages !== undefined &&
    messages !== null &&
    Object.keys(messages).length > 0
  ) {
    messageGroups = Object?.entries(messagesByDay(messages)).map(
      ([date, items]: any, index) => {
        const dayOfTheWeek = convertToDayOfTheWeek(date);

        // Only show the day of the week if it's different from the last one
        const shouldShowDayOfTheWeek = dayOfTheWeek !== lastDayOfTheWeek;
        lastDayOfTheWeek = dayOfTheWeek;
        const newUUID = uuidv4();

        return (
          <View key={newUUID}>
            {shouldShowDayOfTheWeek && (
              <View style={{ marginVertical: 10 }}>
                <span style={{ textAlign: "center", color: Colors.darkGray }}>
                  {dayOfTheWeek}
                </span>
              </View>
            )}
            {items.map((item: any, index: number) => {
              let profilePicture;
              let name;
              let initials;
              let backgroundColor;
              if (item?.sender !== user?.userId) {
                profilePicture = item?.profilePicture;
                name = item?.senderFullName;
                initials = item?.initialsSender;
                backgroundColor = item?.backgroundColorSender;
              } else {
                profilePicture = item?.receiverProfilePicture;
                name = item?.receiverFullName;
                initials = item?.initialsReceiver;
                backgroundColor = item?.backgroundColorReceiver;
              }

              const dateItem = moment(
                item.timeAgoOwnerPost,
                "M/D/YYYY, h:mm:ss A"
              );
              const date = moment(dateItem);
              const timeAgo = date.fromNow();
                console.log("item date defuat", item.dateDefault)
              const dateMessage = new Date(item.dateDefault)
              const formattedTime = dateMessage.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });

              return (
                <View key={`${item.senderFullName}${index}`}>
                  {!item.isNotification && (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      {profilePicture !== "" ? (
                        <Image
                          src={profilePicture}
                          height={35}
                          width={35}
                          alt="profile picture"
                          style={{
                            height: 35,
                            width: 35,
                            borderRadius: 50,
                            marginRight: 5,
                          }}
                        />
                      ) : (
                        <View
                          style={{
                            height: 35,
                            width: 35,
                            borderRadius: 50,
                            marginRight: 5,
                            backgroundColor: backgroundColor,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{ color: Colors.blackDefault, fontSize: 16 }}
                          >
                            {initials}
                          </span>
                        </View>
                      )}
                      <span style={{ fontWeight: "600" }}>{name}</span>
                      <span
                        style={{
                          marginLeft: 5,
                          color: Colors.darkGray,
                          fontSize: 12,
                        }}
                      >
                        {"\u2022"}{" "}
                        {formattedTime}
                      </span>
                    </View>
                  )}
                  {item.isShare !== true && (
                    <View style={{ marginLeft: 40, marginBottom: 20 }}>
                      <span
                        style={{
                          color: item.isNotification
                            ? Colors.darkGray
                            : Colors.blackDefault,
                          fontWeight: item.isNotification ? "600" : "normal",
                        }}
                      >
                        {item.message}
                      </span>
                    </View>
                  )}
                  {/* share post messae */}
                  {item.isShare === true && (
                    <TouchableOpacity
                      onPress={() => {
                        router.push(`/comments/${item.postIdOwnerPost}`);
                      }}
                    >
                      <View
                        style={{
                          margin: 20,
                          borderColor: Colors.darkGray,
                          borderWidth: 1,
                          padding: 15,
                          borderRadius: 6,
                        }}
                      >
                        <View
                          style={{ flexDirection: "row", marginBottom: 15 }}
                        >
                          <ShareIcon style={{ fontSize: 20 }} />
                          <span
                            style={{
                              marginLeft: 10,
                            }}
                          >
                            Shared with you:
                          </span>
                        </View>
                        <View style={{ flexDirection: "row" }}>
                          {item.profilePictureOwnerPost !== "" &&
                          !regexUser.test(item.profilePictureOwnerPost) &&
                          item.profilePictureOwnerPost !== undefined ? (
                            <View>
                              <Image
                                alt="onwer post pic"
                                width={45}
                                height={45}
                                style={{
                                  width: 45,
                                  height: 45,
                                  borderRadius: 24,
                                }}
                                src={item.profilePictureOwnerPost}
                              />
                            </View>
                          ) : (
                            <View
                              style={{
                                height: 45,
                                width: 45,
                                borderRadius: 50,
                                backgroundColor: item.backgroundColorOwnerPost,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  color: Colors.blackDefault,
                                  fontSize: 15,
                                }}
                              >
                                {item.initialsOwnerPost}
                              </span>
                            </View>
                          )}
                          <View
                            style={{ flexDirection: "column", marginLeft: 15 }}
                          >
                            <View>
                              <span
                                style={{
                                  fontSize: 16,
                                  fontWeight: "600",
                                  marginTop: 5,
                                  maxWidth: 160,
                                }}
                              >
                                {item.fullNameOwnerPost}
                              </span>
                            </View>
                            <View style={{ marginBottom: 10, marginTop: 5 }}>
                              <span
                                style={{
                                  fontSize: 13,
                                  color: Colors.darkGray,
                                }}
                              >
                                {timeAgo}
                              </span>
                            </View>
                          </View>
                        </View>
                        <span
                          style={{
                            color: Colors.blackCardDarkMode,
                            fontWeight: "600",
                            marginLeft: 15,
                            marginTop: 15,
                            marginBottom: 15,
                          }}
                        >
                          {item.descriptionOwnerPost}
                        </span>
                        <>
                          {item.postPictureOwnerPost !== undefined &&
                          item.postPictureOwnerPost !== "" &&
                          !regex.test(item.postPictureOwnerPost) ? (
                            <>
                              <Image
                                src={item.postPictureOwnerPost}
                                width={300}
                                height={300}
                                alt="shared pic"
                                style={{
                                  width: "100%",
                                  height: 300,
                                  borderRadius: 20,
                                }}
                              />
                            </>
                          ) : (
                            <View
                              style={{
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <NoPhotographyIcon style={{ fontSize: 100 }} />
                              <span
                                style={{
                                  margin: "10px 0px",
                                }}
                              >
                                This post doesn't have picture.
                              </span>
                            </View>
                          )}
                        </>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        );
      }
    );
  }

  const handleMessages = (messageSocket: MessageBody) => {
    setMessages((prevMessages) => {
      let copyMessages = _.cloneDeep(prevMessages);

      if (copyMessages?.messages !== undefined) {
        // const lastMessage =
        //   copyMessages.messages[copyMessages.messages.length - 1];
        // if (lastMessage?.message === messageSocket.message) {
        //   // Update the existing message
        //   lastMessage.profilePicture = messageSocket.profilePicture;
        //   lastMessage.senderFullName = messageSocket.senderFullName;
        //   lastMessage.date = messageSocket.date;
        //   lastMessage.message = messageSocket.message;
        //   lastMessage.isNotification = messageSocket.isNotification;
        //   lastMessage.initialsSender = messageSocket.initialsSender;
        //   lastMessage.backgroundColorSender =
        //     messageSocket.backgroundColorSender;

        //   lastMessage.receiverFullName = messageSocket.receiverFullName;
        //   lastMessage.receiverProfilePicture =
        //     messageSocket.receiverProfilePicture;
        //   lastMessage.initialsReceiver = messageSocket.initialsReceiver;
        //   lastMessage.backgroundColorReceiver =
        //     messageSocket.backgroundColorReceiver;
        //   setMessageSend({ isNew: false, messages: lastMessage });
        // } else {
        //   // Add a new message
        copyMessages.messages.push({
          profilePicture: messageSocket.profilePicture,
          senderFullName: messageSocket.senderFullName,
          date: messageSocket.date,
          message: messageSocket.message,
          isNotification: messageSocket.isNotification,
          initialsSender: messageSocket.initialsSender,
          backgroundColorSender: messageSocket.backgroundColorSender,
          receiverFullName: messageSocket.receiverFullName,
          receiverProfilePicture: messageSocket.receiverProfilePicture,
          initialsReceiver: messageSocket.initialsReceiver,
          backgroundColorReceiver: messageSocket.backgroundColorReceiver,
        });

        const existingMessage = {
          profilePicture: messageSocket.profilePicture,
          senderFullName: messageSocket.senderFullName,
          date: messageSocket.date,
          message: messageSocket.message,
          isNotification: messageSocket.isNotification,
          initialsSender: messageSocket.initialsSender,
          backgroundColorSender: messageSocket.backgroundColorSender,
          receiverFullName: messageSocket.receiverFullName,
          receiverProfilePicture: messageSocket.receiverProfilePicture,
          initialsReceiver: messageSocket.initialsReceiver,
          backgroundColorReceiver: messageSocket.backgroundColorReceiver,
        };
        console.log("111 existing", existingMessage);

        setMessageSend({ isNew: false, messages: existingMessage });
        //}
      } else {
        // Create a new message object
        const newMessage: Message = {
          sender: messageSocket.sender,
          receiver: messageSocket.receiver,
          receiverFullName: messageSocket.receiverFullName,
          receiverProfilePicture: messageSocket.receiverProfilePicture,
          initialsReceiver: messageSocket.initialsReceiver,
          backgroundColorReceiver: messageSocket.backgroundColorReceiver,
          initialsSender: messageSocket.initialsSender,
          backgroundColorSender: messageSocket.backgroundColorSender,
          senderFullName: messageSocket.senderFullName,
          profilePictureSender: messageSocket.profilePicture,
          messages: [
            {
              profilePicture: messageSocket.profilePicture,
              senderFullName: messageSocket.senderFullName,
              date: messageSocket.date,
              message: messageSocket.message,
              isNotification: messageSocket.isNotification,
              initialsSender: messageSocket.initialsSender,
              backgroundColorSender: messageSocket.backgroundColorSender,
              isRead: false,
              receiverFullName: messageSocket.receiverFullName,
              receiverProfilePicture: messageSocket.receiverProfilePicture,
              initialsReceiver: messageSocket.initialsReceiver,
              backgroundColorReceiver: messageSocket.backgroundColorReceiver,
            },
          ],
        };
        copyMessages = newMessage;
        setMessageSend({ isNew: true, messages: newMessage });
      }
      setTriggerChange((prevTrigger) => !prevTrigger);

      return copyMessages;
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (messageToSend.trim() === "") return;
    const currentDatetime = new Date();
    const options = { timeZone: timezone ?? "America/Los_Angeles" };
    const dateTimezone = currentDatetime.toLocaleString("en-US", options);
    const newMessageBE = {
      sender: sender,
      receiver: receiver?.userId,
      message: messageToSend,
      date: dateTimezone,
      profilePicture:
        profilePicture?.split?.("/")?.[3]?.split?.("?")?.[0] ?? "",
      isNotification: false,
      senderFullName,
      receiverFullName: `${receiver?.firstName} ${receiver?.lastName}`,
      receiverProfilePicture:
        receiver?.profilePicture?.split?.("/")?.[3]?.split?.("?")?.[0] ?? "",
      initialsSender: `${user?.firstName[0]} ${user?.lastName[0]}`,
      backgroundColorSender: user?.backgroundColor ?? "",
      initialsReceiver: `${receiver?.firstName[0]} ${receiver?.lastName[0]}`,
      backgroundColorReceiver: receiver?.backgroundColor,
      dateDefault: new Date()
    };

    const dateItem = moment(dateTimezone, "M/D/YYYY, h:mm:ss A");
    const date = moment(dateItem).toDate();

    const newMessageLocal = {
      sender: sender,
      receiver: receiver?.userId,
      message: messageToSend,
      date: formatDateAndTime(date),
      profilePicture: profilePicture,
      isNotification: false,
      senderFullName,
      receiverFullName: `${receiver?.firstName} ${receiver?.lastName}`,
      receiverProfilePicture: receiver?.profilePicture,
      initialsSender: `${user?.firstName[0]} ${user?.lastName[0]}`,
      backgroundColorSender: user?.backgroundColor ?? "",
      initialsReceiver: `${receiver?.firstName[0]} ${receiver?.lastName[0]}`,
      backgroundColorReceiver: receiver?.backgroundColor,
      dateDefault: new Date()
    };
    console.log("111 newMessageLocal", newMessageLocal);
    handleMessages(newMessageLocal);

    socket?.emit("send_message", newMessageBE);
    setMessageToSend("");
    await saveMessageBE(newMessageBE);

    const userId = receiverParam.hasOwnProperty("userId")
      ? receiverParam.userId
      : receiverParam;
    const receiverBE = await getUser(userId);

    const isAllowNotificationChatsLocal = receiverBE.reponse?.[0]?.isChats;
    if (isAllowNotificationChatsLocal) {
        if (os !== "android") {
          const data = {
            token: pushTokenReceiver,
            title: `New message`,
            body: `${senderFullName} write you a message`,
            data: { isFrom: "Message", receiver: user?.userId },
          };
          await sendPushNotification(data);
        } else {
          const pushNotification = {
            title: `New message`,
            body: `${senderFullName} write you a message`,
            data: { isFrom: "Message", receiver: user?.userId },
            token: pushTokenReceiver,
          };
          sendPushNotificationAndroid(pushNotification);
        }
    }
  };

  const [reevalute, setReevalute] = useState(false);

  useEffect(() => {
    socket?.on("new_message", async function (socketData: MessageBody) {
      const data = await getUser();
      const user = data.response[0];
      const currentDatetime = new Date();

      const options = { timeZone: user?.timezone[0] };
      const dateTimezone = currentDatetime.toLocaleString("en-US", options);

      const dateItem = moment(dateTimezone, "M/D/YYYY, h:mm:ss A");
      const date = moment(dateItem).toDate();

      const newMessage = {
        sender: socketData.sender,
        receiver: socketData.receiver,
        message: socketData.message,
        date: formatDateAndTime(date),
        profilePicture: socketData.profilePicture,
        isNotification: socketData.isNotification,
        senderFullName: socketData.senderFullName,
        receiverFullName: socketData.receiverFullName,
        receiverProfilePicture: socketData.receiverProfilePicture,
        initialsSender: socketData.initialsSender,
        backgroundColorSender: socketData.backgroundColorSender,
        initialsReceiver: socketData.initialsReceiver,
        backgroundColorReceiver: socketData.backgroundColorReceiver,
      };
      const dataBE = await saveMessageBETrue(newMessage);
      console.log("NEW_MESSAGE BE123!!", dataBE);

      const messageBE = dataBE.response.res;
      handleMessages(messageBE);
    });
  }, [socket]);

  const [isPlanModalOpen, showPlanModal] = useState(false);
  const [active, setActive] = useState("months");
  const [quantity, setQuantity] = useState("");

  const handleQuantity = (quantityInput: string) => {
    const regex = /^[0-9]+(\.[0-9]*)?$/;
    const sanitizedText = quantityInput
      .replace(/[^0-9.]/g, "") // Remove non-numeric and non-dot characters
      .replace(/\.(?=.*\.)/g, "") // Remove dots after the first one
      .replace(regex, "$&");

    setQuantity(sanitizedText);
  };

  const [price, setPrice] = useState("");

  const handlePrice = (priceInput: string) => {
    const regex = /^[0-9]+(\.[0-9]*)?$/;
    const sanitizedText = priceInput
      .replace(/[^0-9.]/g, "") // Remove non-numeric and non-dot characters
      .replace(/\.(?=.*\.)/g, "") // Remove dots after the first one
      .replace(regex, "$&");

    setPrice(sanitizedText);
  };
  const [isShowModalConfirmPayment, showModalConfirmPayment] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");


  const handleConfirmPayment = async () => {
    showModalConfirmPayment(false);

    await updatePaypalEmail(emailPaypal, user?.userId);

    const priceTotal = Number(price) + Number(price) * 0.1;
    const messageNotification = `${receiver?.firstName} ${receiver?.lastName} will receive a notification with a payment link with the plan duration of ${quantity} ${active} with the total price of $${priceTotal} USD`;
    const currentDatetime = new Date();
    const options = { timeZone: timezone };
    const dateTimezone = currentDatetime.toLocaleString("en-US", options);

    const newMessageBE = {
      sender: sender,
      receiver: receiver?.userId,
      message: messageNotification,
      date: dateTimezone,
      profilePicture:
        profilePicture?.split?.("/")?.[3]?.split?.("?")?.[0] ?? "",
      isNotification: true,
      senderFullName,
      receiverFullName: `${receiver?.firstName} ${receiver?.lastName}`,
      receiverProfilePicture:
        receiver?.profilePicture?.split?.("/")?.[3]?.split?.("?")?.[0] ?? "",
      initialsSender: `${user?.firstName[0]} ${user?.lastName[0]}`,
      backgroundColorSender: user?.backgroundColor ?? "",
      initialsReceiver: `${receiver?.firstName[0]} ${receiver?.lastName[0]}`,
      backgroundColorReceiver: receiver?.backgroundColor,
    };

    const newMessageLocal = {
      sender: sender,
      receiver: receiver?.userId,
      message: messageNotification,
      date: dateTimezone,
      profilePicture: profilePicture,
      isNotification: true,
      senderFullName,
      receiverFullName: `${receiver?.firstName} ${receiver?.lastName}`,
      receiverProfilePicture: receiver?.profilePicture,
      initialsSender: `${user?.firstName[0]} ${user?.lastName[0]}`,
      backgroundColorSender: user?.backgroundColor ?? "",
      initialsReceiver: `${receiver?.firstName[0]} ${receiver?.lastName[0]}`,
      backgroundColorReceiver: receiver?.backgroundColor,
    };

    //TODO: set socket
    socket?.emit("send_message", newMessageBE);
    handleMessages(newMessageLocal);
    await saveMessageBE(newMessageBE);

    const body = `${senderFullName} send you a payment link with the plan duration of ${quantity} ${active} with the total price of $${priceTotal} USD`;

    const newNotification = {
      sender: sender,
      receiver: receiver?.userId,
      date: dateTimezone,
      profilePictureSender:
        profilePicture?.split?.("/")?.[3]?.split?.("?")?.[0] ?? "",
      body,
      type: "payment",
      isRead: false,
      senderFullName,
      amountPayment: Number(price),
      calendarEvent: {
        quitterId: "",
        coachId: "",
        meetDate: "",
        duration: "",
        shortDescription: "",
      },
      payment: {
        type: active,
        quantity: Number(quantity),
      },
      initials: user?.initials,
      backgroundColor: user?.backgroundColor,
      expirationDate: textDatePlan
    };

    await sendNotification(newNotification);

    const dataSocket = {
      receiver: sender,
    };

    socket?.emit("send_notification_request", dataSocket);
    if (pushTokenReceiver !== "" && pushTokenReceiver !== undefined) {
      if (os !== "android") {
        const data = {
          token: pushTokenReceiver,
          title: `New payment link of coach`,
          body: `${senderFullName} sent you a payment link`,
          data: {
            isFrom: "ChatRoom",
            notification: "redirect to notification",
          },
        };
        await sendPushNotification(data);
      } else {
        const pushNotification = {
          title: `New payment link of coach`,
          body: `${senderFullName} sent you a payment link`,
          data: {
            isFrom: "ChatRoom",
            notification: "redirect to notification",
          },
          token: pushTokenReceiver,
        };
        sendPushNotificationAndroid(pushNotification);
      }
    }
    mixpanel.track("Payment web", {
      amountPayment: Number(price),
      payment: {
        type: active,
        quantity: Number(quantity),
      },
    });
  };

  const [isOpenPickerDateTime, showModalPickDateTime] = useState(false);
  const [datePickerVisible, showDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [textDate, setTextDate] = useState("");
  const handleConfirmDatePicker = () => {
    setDateWithoutFormatCall(new Date(dateTimeChoosed));
    const date = new Date(dateTimeChoosed);
    setShowErrorPicker("");
    const formattedDate = formatDateAndTime(date);
    setTextDate(formattedDate);
    setSelectedDate(date);
    showDatePicker(false);
  };
  const minDate = new Date();
  const [showErrorPicker, setShowErrorPicker] = useState("");
  const [openToastVideo, setOpenToastVideo] = useState(false);

  const handleConfirmVideoCall = async () => {
    setTextDate("");
    setShowErrorPicker("");
    const eventCalendar = {
      quitterId: receiver?.userId as string,
      coachId: sender,
      meetDate: selectedDate?.toLocaleString(),
      duration: activeDuration,
      shortDescription: `Videocall ${senderFullName} and ${receiver?.firstName} ${receiver?.lastName}`,
    };
    setOpenToastVideo(true);

    const currentDatetime = new Date();
    const options = { timeZone: timezone };
    const dateTimezone = currentDatetime.toLocaleString("en-US", options);

    const sender1 = messages?.sender;
    const receiver1 = messages?.receiver;

    const roomId = [sender1, receiver1].sort().join("-");

    const newNotification = {
      sender: sender,
      receiver: receiver?.userId,
      date: dateTimezone,
      profilePictureSender:
        profilePicture?.split?.("/")?.[3]?.split?.("?")?.[0] ?? "",
      body: `Save in calendar video call ${senderFullName} and ${
        receiver?.firstName
      } ${
        receiver?.lastName
      } with the duration of ${activeDuration} for ${selectedDate?.toLocaleString()}`,
      type: "event",
      isRead: false,
      senderFullName,
      calendarEvent: eventCalendar,
      amountPayment: 0,
      payment: {
        type: "",
        quantity: 0,
      },
      roomId: roomId,
      initials: user?.initials,
      backgroundColor: user?.backgroundColor,
    };

    await sendNotification(newNotification);
    const dataSocket = {
      receiver: sender,
    };

    socket?.emit("send_notification_request", dataSocket);
    if (pushTokenReceiver !== "" && pushTokenReceiver !== undefined) {
      if (os !== "android") {
        const data = {
          token: pushTokenReceiver,
          title: `New invitation to videocall`,
          body: `${senderFullName} schedule a videocall with you`,
          data: {
            isFrom: "ChatRoom",
            notification: "redirect to notification",
          },
        };
        await sendPushNotification(data);
      } else {
        const pushNotification = {
          title: `New invitation to videocall`,
          body: `${senderFullName} schedule a videocall with you`,
          data: {
            isFrom: "ChatRoom",
            notification: "redirect to notification",
          },
          token: pushTokenReceiver,
        };
        sendPushNotificationAndroid(pushNotification);
      }
    }
  };

  const [activeDuration, setActiveDuration] = useState("30min");

  const inputHowMany = useRef(null);
  const inputPrice = useRef(null);

  const [dateTimeChoosed, saveDateTimeChoosed] = useState();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen((previousOpen) => !previousOpen);
  };

  const canBeOpen = open && Boolean(anchorEl);
  const id = canBeOpen ? "transition-popper" : undefined;

  const [datePickerVisiblePlan, showDatePickerPlan] = useState(false);
  const [dateTimeChoosedPlan, saveDateTimeChoosedPlan] = useState();
  const [textDatePlan, setTextDatePlan] = useState("");
  const [datePlanWithoutFormat, setDateWithoutFormat] = useState();
  const [datePlanWithoutFormatCall, setDateWithoutFormatCall] = useState();

  const handleConfirmDatePickerPlan = () => {
    if (dateTimeChoosedPlan !== undefined) {
      setDateWithoutFormat(new Date(dateTimeChoosedPlan));
      const date = new Date(dateTimeChoosedPlan);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      const formattedResult = `${month}/${day}/${year}`;
      setTextDatePlan(formattedResult);
      showDatePickerPlan(false);
    }
  };

  const canHaveVideoCall = user?.type === "coach" || receiver?.type === "coach"
  return (
    <View style={{ backgroundColor: Colors.lightGray }}>
      <View
        style={{
          flexDirection: "row",
          marginTop: 5,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={() => {
            router.push(`/profile/${receiver?.userId}/false`);
          }}
        >
          <View
            style={{
              flexDirection: "row",
              marginHorizontal: 20,
              justifyContent: "space-between",
              width: 200,
            }}
          >
            <span style={{ color: Colors.blackCardDarkMode, fontSize: 18 }}>
              {`${receiver?.firstName} ${receiver?.lastName}`}
            </span>
          </View>
        </Pressable>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {roomId.trim() !== "-" && canHaveVideoCall &&
          <InfoCircleOutlined
            onClick={handleClick}
            style={{ fontSize: 25, marginRight: 25 }}
          />}
          <Popper id={id} open={open} anchorEl={anchorEl} transition>
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} timeout={350}>
                <Box
                  sx={{
                    border: 1,
                    borderRadius: 8,
                    p: 1,
                    bgcolor: "background.paper",
                  }}
                >
                  Videocalls are currently only available between web-to-web desktop.
                </Box>
              </Fade>
            )}
          </Popper>

          {roomId.trim() !== "-" && canHaveVideoCall && (
            <Pressable
              onPress={() => {
                router.replace(`/videocall/${roomId}/${receiver?.userId}`);
              }}
            >
              <View style={{ marginRight: 15 }}>
                <VideoCallIcon style={{ fontSize: 30 }} />
              </View>
            </Pressable>
          )}
        </View>
      </View>

      <div style={{ height: "410px", overflow: "hidden", overflowY: "scroll" }}>
        <ScrollView>
          {receiver !== undefined && (
            <View style={{ marginHorizontal: 10, paddingBottom: 120 }}>
              {messageGroups}
            </View>
          )}
        </ScrollView>
        <div className={styles.containerInput}>
          {user?.type === "coach" && receiverTypeOfUser !== "coach" && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  if (isPlanEndExpire === false) return;
                  setTextDatePlan("")
                    setPrice("");
                  showPlanModal(true);
                }}
              >
                <View
                  style={{
                    backgroundColor: Colors.red,
                    padding: 7,
                    marginRight: 10,
                    borderRadius: 6,
                    opacity: isPlanEndExpire === false ? 0.5 : 1,
                  }}
                >
                  <span style={{ color: Colors.white }}>
                    {isPlanEndExpire === false
                      ? "Plan in progress"
                      : "Configure payment link"}
                  </span>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => showModalPickDateTime(true)}>
                <View
                  style={{
                    backgroundColor: Colors.blue,
                    padding: 7,
                    borderRadius: 6,
                  }}
                >
                  <span style={{ color: Colors.white }}>
                    Schedule video call
                  </span>
                </View>
              </TouchableOpacity>
            </View>
          )}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {profilePicture !== "" && profilePicture !== undefined ? (
              <View
                style={{
                  borderRadius: 50,
                  height: 50,
                  width: 50,
                  marginRight: 10,
                }}
              >
                <Image
                  src={profilePicture}
                  width={50}
                  height={50}
                  alt="profile picture"
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 50,
                  }}
                />
              </View>
            ) : (
              <View
                style={{
                  height: 50,
                  width: 50,
                  borderRadius: 50,
                  backgroundColor: backgroundColor,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 10,
                }}
              >
                <span style={{ color: Colors.blackDefault, fontSize: 16 }}>
                  {initials}
                </span>
              </View>
            )}
            <div className={styles.input}>
              <TextInput
                value={messageToSend}
                onChangeText={setMessageToSend}
                placeholder={`Write a message...`}
                style={{
                  paddingLeft: 20,
                  borderRadius: 24,
                  width: "80%",
                  height: 40,
                  backgroundColor: Colors.lightGray,
                }}
              />

              <button
                style={{
                  border: "none",
                  height: "40px",
                  backgroundColor: Colors.primary,
                  borderRadius: 24,
                }}
                onClick={(e) => sendMessage(e)}
              >
                <span
                  style={{
                    color: Colors.white,
                    zIndex: 3,
                    opacity: 1,
                    marginRight: 7,
                    backgroundColor: Colors.primary,
                    textAlign: "center",
                    paddingLeft: 7,
                    height: "30px",
                    fontSize: 16,
                  }}
                >
                  Send
                </span>
              </button>
            </div>
          </View>
        </div>
      </div>
      <Modal
        open={isPlanModalOpen}
        className={styles.modal}
        onClose={() => showPlanModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className={styles.containerModal}>
          <div className={styles.modal}>
            <View style={{ marginTop: 20 }}>
              <span
                style={{
                  color: Colors.blackDefault,
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                Create Payment Plan For:{" "}
                <b>{`${receiver?.firstName} ${receiver?.lastName}`} </b>
              </span>
              <View style={{ marginTop: 20 }}>
                <span
                  style={{
                    color: Colors.blackDefault,
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  How much will be the{" "}
                  <span style={{ fontWeight: "600" }}>total</span> price in USD?
                </span>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    color: Colors.blackDefault,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  $
                </span>
                <View style={{ marginLeft: 15 }}>
                  <TextInput
                    value={price}
                    ref={inputPrice}
                    onChangeText={handlePrice}
                    style={{
                      borderRadius: 8,
                      width: 30,
                      backgroundColor: Colors.lightGray,
                      height: 20,
                    }}
                  />
                </View>
              </View>
              <View
                style={{
                  marginTop: 20,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View>
                  <span
                    style={{
                      textAlign: "center",
                      fontSize: 17,
                      marginBottom: 20,
                    }}
                  >
                    What is the expiration date of this plan?
                  </span>
                </View>
              </View>

              <div onClick={() => showDatePickerPlan(true)}>
                <div
                  style={{
                    backgroundColor: Colors.primary,
                    margin: "0px auto",
                    padding: 10,
                    borderRadius: 8,
                    width: 150,
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      color: Colors.white,
                      textAlign: "center",
                      borderRadius: 8,
                    }}
                  >
                    {textDatePlan === "" ? "Pick a date" : textDatePlan}
                  </span>
                </div>
              </div>
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  alignItems: "center",
                }}
              >
                <InfoIcon style={{ color: "orange", fontSize: 30 }} />
                <span style={{ maxWidth: 400, textAlign: "center" }}>
                  Take in consideration that it is a one time payment{" "}
                  <span style={{ fontWeight: "600" }}>not a subscription</span>.
                </span>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  alignItems: "center",
                }}
              >
                <InfoIcon style={{ color: "grey", fontSize: 25 }} />
                <span style={{ textAlign: "center", marginLeft: 10 }}>
                  The 10% of the price you put will go for Lucky Quit.
                </span>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  alignItems: "center",
                }}
              >
                <InfoIcon style={{ color: "grey", fontSize: 25 }} />
                <span style={{ textAlign: "center", marginLeft: 10 }}>
                  Also take into consideration PayPal fees for the price you
                  put.
                </span>
              </View>
              {errorMessage.length > 0 && (
                <View
                  style={{
                    marginTop: 20,
                    flexDirection: "row",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ color: Colors.red }}>{errorMessage}</span>
                </View>
              )}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 15,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setTextDatePlan("")
                    setPrice("");
                    showPlanModal(false);
                  }}
                >
                  <View
                    style={{
                      backgroundColor: Colors.darkGray,
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 40,
                      marginRight: 10,
                    }}
                  >
                    <span style={{ color: Colors.white }}>Cancel</span>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setErrorMessage("");
                    if (textDatePlan.trim() === "") {
                      setErrorMessage(
                        "You must complete the expiration date of the plan."
                      );
                      return;
                    }
                    const today = new Date();
                    today.setDate(today.getDate() + 1);
                    today.setHours(0, 0, 0);
                    today.setMilliseconds(0);
                    console.log(
                      2,
                      datePlanWithoutFormat.getTime() > today.getTime()
                    );
                    console.log(3, datePlanWithoutFormat.getTime());
                    console.log(4, today.getTime());
                    if (datePlanWithoutFormat.getTime() >= today.getTime()) {
                      // setErrorMessage(
                      //   "The selected date cannot be less than tomorrow"
                      // );
                      // return;
                    } else {
                      setErrorMessage(
                        "The selected date cannot be less than tomorrow"
                      );
                      return;
                    }
                    if (price.trim() === "") {
                      setErrorMessage(
                        "You must complete how much will be the price."
                      );
                      return;
                    }
                    showPlanModal(false);
                    showModalConfirmPayment(true);
                  }}
                >
                  <View
                    style={{
                      backgroundColor: Colors.primary,
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 40,
                    }}
                  >
                    <span style={{ color: Colors.white }}>Confirm</span>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </div>
        </div>
      </Modal>
      <Modal
        open={isShowModalConfirmPayment}
        className={styles.modalConfirm}
        onClose={() => showModalConfirmPayment(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className={styles.containerModalConfirm}>
          <TouchableWithoutFeedback
            onPress={() => {
              setQuantity("");
              setPrice("");
              showModalConfirmPayment(false);
            }}
          >
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>

          <View
            style={[
              styles.modalContentConfirm,
              { backgroundColor: Colors.white },
            ]}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View style={{ marginTop: 20, marginBottom: 20 }}>
                <span
                  style={{
                    color: Colors.blackDefault,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Confirm Send Payment
                </span>
              </View>
              <View>
                <span style={{ textAlign: "center" }}>
                  You will send a payment link with the plan duration of{" "}
                  <span style={{ fontWeight: "600" }}>
                    {quantity} {active}
                  </span>{" "}
                  to{" "}
                  <span
                    style={{ fontWeight: "600" }}
                  >{`${receiver?.firstName} ${receiver?.lastName}`}</span>{" "}
                  with{" "}
                  <span style={{ fontWeight: "600" }}>
                    the total price of ${Number(price).toFixed(2)} USD
                  </span>
                </span>
              </View>
              <>
                <View>
                  <span style={{ fontWeight: "600", marginVertical: 10 }}>
                    Is this your email of PayPal?
                  </span>
                </View>
                <View style={{ marginBottom: 15 }}>
                  <TextInput
                    editable={true}
                    value={emailPaypal}
                    autoCorrect={false}
                    autoCapitalize="none"
                    onChangeText={setEmailPaypal}
                    placeholder="Your PayPal email"
                    style={{
                      borderRadius: 8,
                      borderColor: Colors.primary,
                      borderWidth: 1,
                      width: 400,
                      padding: 8,
                      height: 45,
                    }}
                  />
                </View>
                <View style={{ flexDirection: "row", marginBottom: 10 }}>
                  <InfoIcon style={{ color: "orange", fontSize: 25 }} />
                  <span style={{ marginLeft: 10, fontWeight: "600" }}>
                    IMPORTANT: This is the email through which you will be paid
                    for your services.
                  </span>
                </View>
              </>
              <View style={{ marginTop: 20, flexDirection: "row" }}>
                <View style={{ marginRight: 5 }}>
                  <InfoIcon style={{ color: "orange", fontSize: 25 }} />
                </View>
                <View>
                  <span>Are you sure this information is correct?</span>
                  <span style={{ width: 410 }}>
                    When you confirm we will send a notification with the
                    payment link to{" "}
                    <span style={{ fontWeight: "600" }}>
                      {`${receiver?.firstName} ${receiver?.lastName}`}.{" "}
                    </span>
                  </span>
                </View>
              </View>
              <View
                style={{
                  marginTop: 20,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <InfoIcon
                  style={{ color: Colors.red, fontSize: 25, marginRight: 10 }}
                />
                <span
                  style={{ fontSize: 16, color: Colors.red, fontWeight: "600" }}
                >
                  This action cannot be undone.
                </span>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 20,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setQuantity("");
                    setPrice("");
                    showModalConfirmPayment(false);
                  }}
                >
                  <View
                    style={{
                      backgroundColor: Colors.darkGray,
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 40,
                      marginRight: 10,
                    }}
                  >
                    <span style={{ color: Colors.white }}>Cancel</span>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleConfirmPayment()}>
                  <View
                    style={{
                      backgroundColor: Colors.primary,
                      borderRadius: 8,
                      paddingVertical: 10,
                      paddingHorizontal: 40,
                    }}
                  >
                    <span style={{ color: Colors.white }}>Confirm</span>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </div>
      </Modal>

      <Modal
        open={isOpenPickerDateTime}
        className={styles.modalEvent}
        onClose={() => {
          setTextDate("");
          setShowErrorPicker("");
          showModalPickDateTime(false);
          setTextDate("");
          setShowErrorPicker("");
          showModalPickDateTime(false);
        }}
      >
        <div style={{height: showErrorPicker.length > 0 ? 360 : 330 }} className={styles.containerModalEvent}>
          <View style={{ backgroundColor: Colors.white }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View style={{ marginTop: 20 }}>
                <span style={{ fontSize: 16 }}>
                  Schedule a video call with{" "}
                  <b>{`${receiver?.firstName} ${receiver?.lastName}`}</b>
                </span>
              </View>
              <View>
                <TouchableOpacity onPress={() => showDatePicker(true)}>
                  <View
                    style={{
                      backgroundColor: Colors.primary,
                      padding: 10,
                      marginTop: 30,
                      borderRadius: 8,
                    }}
                  >
                    <span
                      style={{
                        color: Colors.white,
                        textAlign: "center",
                        borderRadius: 8,
                      }}
                    >
                      Pick a date and time
                    </span>
                  </View>
                  {textDate.length > 0 && (
                    <View style={{ marginTop: 20 }}>
                      <span>Your date selected for the video call is:</span>
                      <span style={{ fontWeight: "600" }}>{textDate}</span>
                    </View>
                  )}
                  
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 15,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>
                      Choose duration of the call
                    </span>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 15,
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setActiveDuration("15min")}
                    >
                      <View
                        style={{
                          borderRadius: 8,
                          backgroundColor:
                            activeDuration === "15min"
                              ? Colors.primary
                              : "#c9c5c5",
                          padding: 10,
                        }}
                      >
                        <span style={{ color: Colors.white }}>15min</span>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setActiveDuration("30min")}
                    >
                      <View
                        style={{
                          borderRadius: 8,
                          backgroundColor:
                            activeDuration === "30min"
                              ? Colors.primary
                              : "#c9c5c5",
                          padding: 10,
                        }}
                      >
                        <span style={{ color: Colors.white }}>30min</span>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setActiveDuration("45min")}
                    >
                      <View
                        style={{
                          borderRadius: 8,
                          backgroundColor:
                            activeDuration === "45min"
                              ? Colors.primary
                              : "#c9c5c5",
                          padding: 10,
                        }}
                      >
                        <span style={{ color: Colors.white }}>45min</span>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveDuration("1h")}>
                      <View
                        style={{
                          borderRadius: 8,
                          backgroundColor:
                            activeDuration === "1h"
                              ? Colors.primary
                              : "#c9c5c5",
                          padding: 10,
                        }}
                      >
                        <span style={{ color: Colors.white }}>1h</span>
                      </View>
                    </TouchableOpacity>
                  </View>
                  {showErrorPicker.length > 0 && (
                    <View style={{ marginTop: 20 }}>
                      <span style={{ color: Colors.red }}>
                        {showErrorPicker}
                      </span>
                    </View>
                  )}
                </TouchableOpacity>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: showErrorPicker.length > 0 ? 15 : 40  ,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      showModalPickDateTime(false);
                      setShowErrorPicker("");
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: Colors.darkGray,
                        borderRadius: 8,
                        paddingVertical: 10,
                        paddingHorizontal: 40,
                        marginRight: 10,
                      }}
                    >
                      <span style={{ color: Colors.white }}>Cancel</span>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {

                      setShowErrorPicker("");
                      if (textDate.trim() === "") {
                        setShowErrorPicker(
                          "You must complete the date and time of the meeting."
                        );
                        return;
                      }
                      const today = new Date();
                      today.setDate(today.getDate() + 1);
                      today.setHours(0, 0, 0);
                      today.setMilliseconds(0);
                      console.log(
                        22,
                        datePlanWithoutFormatCall.getTime() >= today.getTime()
                      );
                      console.log(3, datePlanWithoutFormatCall.getTime());
                      console.log(4, today.getTime());
                      if (datePlanWithoutFormatCall.getTime() >= today.getTime()) {
                        // setErrorMessage(
                        //   "The selected date cannot be less than tomorrow"
                        // );
                        // return;
                      } else {
                        console.log("ACA")
                        setShowErrorPicker(
                          "The selected date cannot be less than tomorrow"
                        );
                        return;
                      }


                      showModalPickDateTime(false);
                      handleConfirmVideoCall();
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: Colors.primary,
                        borderRadius: 8,
                        paddingVertical: 10,
                        paddingHorizontal: 40,
                      }}
                    >
                      <span style={{ color: Colors.white }}>Send Invite</span>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </div>
      </Modal>
      <Modal open={datePickerVisible} className={styles.modalPicker}>
        <div className={styles.containerModalPicker}>
          <p>Pick a date and time</p>
          <Datetime onChange={saveDateTimeChoosed} />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 40,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                showDatePicker(false);
              }}
            >
              <View
                style={{
                  backgroundColor: Colors.darkGray,
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 40,
                  marginRight: 10,
                }}
              >
                <span style={{ color: Colors.white }}>Cancel</span>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                handleConfirmDatePicker();
              }}
            >
              <View
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 40,
                }}
              >
                <span style={{ color: Colors.white }}>Accept</span>
              </View>
            </TouchableOpacity>
          </View>
        </div>
      </Modal>
      <Modal open={datePickerVisiblePlan} className={styles.modalPicker}>
        <div className={styles.containerModalPicker}>
          <p>Pick a date of expiration for the plan</p>
          <Datetime onChange={saveDateTimeChoosedPlan} />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 40,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                showDatePickerPlan(false);
              }}
            >
              <View
                style={{
                  backgroundColor: Colors.darkGray,
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 40,
                  marginRight: 10,
                }}
              >
                <span style={{ color: Colors.white }}>Cancel</span>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                handleConfirmDatePickerPlan();
              }}
            >
              <View
                style={{
                  backgroundColor: Colors.primary,
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 40,
                }}
              >
                <span style={{ color: Colors.white }}>Accept</span>
              </View>
            </TouchableOpacity>
          </View>
        </div>
      </Modal>
      <Snackbar
        open={openToastVideo}
        autoHideDuration={6000}
        onClose={() => setOpenToastVideo(false)}
      >
        <Alert
          onClose={() => setOpenToastVideo(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          You have sent the invitation for the video call
        </Alert>
      </Snackbar>
    </View>
  );
};

export const convertTimeMsg = (time: string) => {
  const timeStr = time;
  const timeParts = timeStr?.split(":");
  const hour = parseInt(timeParts[0], 10);
  const minute = parseInt(timeParts[1], 10);
  const minuteStr = minute < 10 ? `0${minute}` : `${minute}`; // add leading zero if needed
  const period = timeParts[2].substr(3); // Extract the period ('AM' or 'PM')
  const timeWithoutSeconds = [hour, minuteStr].join(":") + " " + period;
  return timeWithoutSeconds;
};

export function debounce(func: Function, delay = 4000) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

export const formatDateAndTime = (now: Date) => {
  const month =
    now.getMonth() + 1 < 10 ? `0${now.getMonth() + 1}` : now.getMonth() + 1;
  const day = now.getDate() < 10 ? `0${now.getDate()}` : now.getDate();
  const year = now.getFullYear();
  const hours = now.getHours() > 12 ? now.getHours() - 12 : now.getHours();
  const minutes =
    now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
  const ampm = now.getHours() >= 12 ? "PM" : "AM";

  const formattedDate = `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
  return formattedDate;
};

export const convertToDayOfTheWeek = (date: string) => {
  const dateStr = date;
  const dateParts = dateStr?.split("/");
  const year = parseInt(dateParts?.[2], 10);
  const month = parseInt(dateParts?.[0], 10) - 1; // Note: months are zero-indexed
  const day = parseInt(dateParts?.[1], 10);

  const dateObj = new Date(year, month, day);
  const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  return weekday;
};

export default ChatMessage;
