import { Colors } from "@/app/colors";
import styles from "./chat.module.css";
import {
  View,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { useEffect, useState } from "react";
import { Message, User } from "@/models";
import { getFollowersBE } from "@/helpers/followers";
import { getChatsBE } from "@/helpers/chats";
import { SearchOutlined } from "@ant-design/icons";
import ChatMessage  from "../components/ChatMessage";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import Image from "next/image";
interface IProps {
  user: User | undefined;
  setReceiver: (value: any) => void;
  receiver: any;
  setMessageSend: (value: any) => void;
  setTriggerChange: (value: boolean) => void;
  triggerChange: boolean;
}

const Chat = ({
  user,
  setReceiver,
  receiver,
  setMessageSend,
  setTriggerChange,
  triggerChange,
}: IProps) => {
  const [searchTerm, setSearch] = useState("");
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
    const[isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    async function getInitialData() {
      setIsLoading(true)
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : null;
      const dataFollowers = await getFollowersBE(UUID);
      setFollowers(dataFollowers.response?.users ?? []);
      // if (dataFollowers.response?.users.length > 0) {
      //   setReceiver({ receiver: dataFollowers.response?.users[0] });
      // }
      setIsLoading(false)
    }

    getInitialData();
  }, []);

  return (
    <>
      <div
        style={{
          backgroundColor: "#FFF",
          padding: "20px",
          height: followers.length === 0 ? "100vh" : "200px",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            marginBottom: 20,
          }}
        >
          <TextInput
            style={{
              width: 600,
              backgroundColor: Colors.lightGray,
              color: Colors.blackCardDarkMode,
              height: 50,
              paddingLeft: 20,
              borderRadius: 20,
            }}
            value={searchTerm}
            onChangeText={(value) => setSearch(value)}
            placeholder="Search connection"
          />
          <View style={{ position: "relative", left: -40, top: 10 }}>
            <SearchOutlined
              style={{ fontSize: 25, color: Colors.blackCardDarkMode }}
            />
          </View>
        </View>
        <div className={styles.parentContainer}>
          <div className={styles.childContainer}>
            {followers
              .filter((item) => item.userId !== user?.userId)
              .filter(
                (item) =>
                  item?.firstName
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  item?.lastName
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
              )
              .map((item) => {
                return (
                  <div
                    style={{
                      marginRight: 20,
                      maxWidth: 400,
                      paddingBottom: 20,
                      flexDirection: "row",
                      display: "inline-flex"
                    }}
                    key={item.userId}
                  >
                    <View style={{ marginRight: 25 }}>
                      <Pressable
                        onPress={() => setReceiver(item.userId)}
                        //TODO: crea chatroom abajos
                      >
                        {item.profilePicture !== "" &&
                        item.profilePicture !== undefined ? (
                          <Image
                          alt="profile picture"
                            src={item.profilePicture }
                            height={60}
                            width={60}
                            style={{
                              height: 60,
                              width: 60,
                              borderRadius: 50,
                            }}
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
                                fontSize: 16
                                
                              }}
                            >
                              {item.initials}
                            </span>
                          </View>
                        )}
                      </Pressable>
                      <View style={{ marginLeft: 10, marginTop: 20 }}>
                        <span >{item.firstName}</span>
                        <span >{item.lastName}</span>
                      </View>
                    </View>
                    {item.isConnected && (
                      <View
                        style={{
                          height: 20,
                          width: 20,
                          borderRadius: 50,
                          backgroundColor: Colors.success,
                          position: "relative",
                          borderColor: Colors.white,
                          top: -70,
                          right: -38,
                          borderWidth: 2,
                        }}
                      ></View>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
        {followers.length === 0 && (
          <div className={styles.containerEmptyState}>
            {isLoading ? (
            <div className={styles.spinnerOverlay}>
              <div className={styles.spinnerContainer}></div>
            </div>
          ) : (
            <>
            <PeopleAltIcon
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
              You don't have any connections at the moment. Start connecting
              with people, and they will appear here.
            </p>
            </>
          )}
          </div>
        )}
      </div>

      {receiver && (
        <ChatMessage
          user={user}
          setTriggerChange={setTriggerChange}
          triggerChange={triggerChange}
          setMessageSend={setMessageSend}
          receiverParam={receiver}
        />
      )}
    </>
  );
};

export default Chat
