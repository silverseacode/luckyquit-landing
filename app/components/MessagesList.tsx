import { useEffect, useState } from "react";
import styles from "./messages-list.module.css";
import { View, Pressable} from "react-native";
import { Message, User } from "@/models";
import { getFollowersBE } from "@/helpers/followers";
import { getChatsBE } from "@/helpers/chats";
import { Colors } from "@/app/colors";
import ChatIcon from "@mui/icons-material/Chat";
import moment from "moment";
import { io } from "socket.io-client";
import _ from "lodash";
import axios from "axios";
import { API_URL } from "@/config";
import { useSocket } from "../Context/store";
import Image from "next/image";
interface IProps {
  setReceiver: (value: any) => void;
  messageSend: any;
  triggerChange: boolean;
  setTriggerChange: (value: boolean) => void;
  user: User | undefined;
  receiver: any;
}

const MessagesList = ({
  setReceiver,
  messageSend,
  triggerChange,
  setTriggerChange,
  user,
  receiver,
}: IProps) => {
  const socket = useSocket()
 
  const markConversationAsRead = async (idChat: string) => {
    
    const copyChats: Message[] = _.cloneDeep(chats);

    const filteredChats = copyChats
    let countMarkAsRead = 0
    const modifiedChats = filteredChats.map((chat) => {
      chat.messages.forEach((item) => {
        if(item.isRead === false) {
          countMarkAsRead++
        }
        item.isRead = true;
      });

      return chat;
    });
    console.log("modiefied chats", modifiedChats);

    socket?.emit("messages_read", {
      userId: user?.userId, //same as sender
      receiver: receiver,
      count: countMarkAsRead
    });

    setChats(modifiedChats);
    const sender = user?.userId;
    await axios.post(
      `${API_URL}/messages/updateToReadMessages/${sender}/${receiver}`
    );
  };

  //the conversations with new messages will appear at top of the
  // messages list we need the field .isRead if its false will appear bold
  // and the number of messages in red circle.  messages[{isRead}]

  //b5bf47db-5da5-49a3-9691-63edbee9a0cb
  const [followers, setFollowers] = useState<
    {
      isConnected: boolean;
      profilePicture: string;
      userId: string;
      firstName: string;
      lastName: string;
      initials: string;
      backgroundColor: string;
    }[]
  >([]);
  const [chats, setChats] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const getData = async () => {
    const itemUUID = localStorage.getItem("UUID");
    const UUID = itemUUID ? itemUUID : null;
    const dataFollowers = await getFollowersBE(UUID);
    setFollowers(dataFollowers?.response?.users ?? []);

    //obtengo solo el caht del sender
    //await Messages.find({ sender });
    //is returning my self in chats list
    const dataChats = await getChatsBE(UUID);

    const chatsArray = dataChats.response.chats;
    const followersArray = dataFollowers.response?.users;



    setReceiver(
      chatsArray[0]?.sender !== UUID
        ? chatsArray[0]?.sender
        : chatsArray[0]?.receiver
    );

    setChats(chatsArray);
    setIsLoading(false);
  };

  useEffect(() => {
    async function getInitialData() {
      setIsLoading(true);
      await getData();
    }

    getInitialData();
  }, []);

  useEffect(() => {
    async function getInitialData() {
      console.log("ENTRA123")
      await getData();
    }

    getInitialData();
  }, [messageSend]);

  useEffect(() => {
    if (triggerChange === true) {
      console.log("111 message send", messageSend)
      // let chatsFiltered = chats.filter(
      //   (item) => item?.sender !== user?.userId && item?.receiver !== receiver
      // );
      let chatsFiltered = _.cloneDeep(chats);
      if(!messageSend.isNew) {
        chatsFiltered[chatsFiltered.length - 1 ?? 0].messages.push(messageSend.messages);
      } else {
        chatsFiltered.unshift(messageSend.messages)
      }

      setChats(chatsFiltered);
    }
    
    setTriggerChange(false)
  }, [messageSend, triggerChange]);

  return (
    <div className={styles.container}>
      <div style={{ paddingTop: 20, paddingLeft: 20 }}>
        <h3 style={{ margin: 0 }}>Messages</h3>
      </div>
      {chats.map((item, index) => {
        let count = 0;
        //el sender siempre es el user.userId porque traigo  await Messages.find({ sender });
        const currentUserFullName = `${user?.firstName} ${user?.lastName}`
        
          item?.messages?.map((message) => {
            if (message.isRead === false && message.senderFullName !== currentUserFullName) {
              count++;
            }
          });
        

        let profilePicture;
        let name;
        let initials;
        let backgroundColor;
        if (item?.sender !== user?.userId) {
          profilePicture = item?.profilePictureSender;
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
          item?.messages?.[item?.messages?.length - 1]?.date,
          "M/D/YYYY, h:mm:ss A"
        );
        const date = moment(dateItem);
        const timeAgo = date.fromNow();
        return (
          <View
            key={index}
            style={{
              borderBottomWidth: 1,
              borderColor: "#f2f2f2",
              padding: 20,
              height: "100px",
              backgroundColor: "#FFF",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Pressable
                onPress={() => {
                  const itemFollower = followers.filter(
                    (itemFollower) => itemFollower.userId === item?.receiver
                  );
                  
                  setReceiver(
                    item?.sender !== user?.userId ? item?.sender : item?.receiver
                  );
                  //changed from itemFollower[0]
                  markConversationAsRead(item?._id);
                }}
              >
                {profilePicture !== "" && profilePicture !== undefined ? (
                  <Image
                    src={profilePicture }
                    height={50}
                    width={50}
                    alt="profile pic"
                    style={{ height: 50, width: 50, borderRadius: 50 }}
                  />
                ) : (
                  <View
                    style={{
                      height: 50,
                      width: 50,
                      borderRadius: 50,
                      backgroundColor: backgroundColor,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: Colors.blackDefault, fontSize: 16 }}>
                      {initials}
                    </span>
                  </View>
                )}
              </Pressable>
              <View style={{ marginLeft: 10 }}>
                <span>{`${name}`}</span>
                <span style={{ color: Colors.darkGray, marginTop: 5 }}>
                  {timeAgo}
                </span>
              </View>
            </View>

            <View
              style={{
                marginLeft: 60,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontWeight:
                    item?.messages?.[item?.messages?.length - 1]?.isRead === false
                      ? "600"
                      : "normal",
                }}
              >
                {item?.messages?.[item?.messages?.length - 1]?.message}
              </span>
              {item?.messages?.[item?.messages?.length - 1]?.senderFullName !== currentUserFullName && count > 0 && (
                <View
                  style={{
                    height: count < 10 ? 25 : 28,
                    width: count < 10 ? 25 : 28,
                    borderRadius: 50,
                    backgroundColor: "#FF2D55",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    top: -10,
                  }}
                >
                  <span style={{ color: Colors.white, fontSize: 16 }}>
                    {count}
                  </span>
                </View>
              )}
            </View>
          </View>
        );
      })}
      {chats.length === 0 && (
        <div className={styles.containerEmptyState}>
          {isLoading ? (
            <div className={styles.spinnerOverlay}>
              <div className={styles.spinnerContainer}></div>
            </div>
          ) : (
            <>
              <ChatIcon
                style={{
                  fontSize: 50,
                  color: Colors.darkGray,
                  textAlign: "center",
                }}
              />
              <p
                style={{
                  textAlign: "center",
                  fontSize: 18,
                  color: Colors.darkGray,
                }}
              >
                You don't have any conversation for the moment
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
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

export default MessagesList
