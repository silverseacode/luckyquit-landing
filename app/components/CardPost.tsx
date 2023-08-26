import {
  View,
  TouchableOpacity,
  Platform,
  Pressable,
  TextInput,
} from "react-native";
import { useEffect, useState } from "react";
import moment from "moment";
import { Post, User } from "@/models";
import { getUser, savePostIdLucky } from "@/helpers/users";
import { Colors } from "@/app/colors";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Modal } from "@mui/material";
import styles from "../components/card-post.module.css";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import SearchIcon from "@mui/icons-material/Search";
import RadioButton from "./RadioButton";
import { saveMessageBE } from "@/helpers/chats";
import {
  sendPushNotification,
  sendPushNotificationAndroid,
} from "@/helpers/notifications";
import { v4 as uuidv4 } from "uuid";
import CloseIcon from '@mui/icons-material/Close';
interface IProps {
  post: Post;
  index: number;
  isChecked: boolean;
  sendLikeUpdated: (value: any) => void;
  timezone: string;
  deletePost: (value: number) => void;
  isFromProfile?: boolean;
  usersRecommendation: User[];
  user: User | undefined;
  followers: User[];
  socket: any;
  deletePostLuckyLocal: (id: string) => void;
}

const CardPost = ({
  post,
  sendLikeUpdated,
  index,
  isChecked,
  timezone,
  deletePost,
  isFromProfile,
  usersRecommendation,
  user,
  followers,
  socket,
  deletePostLuckyLocal
}: IProps) => {
  const router = useRouter();
  let totalNumberOfReplies = 0;
  post.comments?.map((comment) => {
    totalNumberOfReplies += comment.replies.length;
  });

  const totalComments = post.comments?.length + totalNumberOfReplies;
  const [userTokenReceiver, setUserTokenReceiver] = useState();
  const [osOwnerPost, setOsOwnerPost] = useState("");
  const [initials, setInitials] = useState("");
  const [backgroundColor, setBackgroundPicture] = useState("");
  const [isAllowLikesNotification, setIsAllowLikesNotification] =
    useState(true);
  useEffect(() => {
    async function getPostOwnerToken() {
      const res = await getUser(post.userId);
      const postOwner = res.response;
      setUserTokenReceiver(postOwner[0]?.pushToken);
      setIsAllowLikesNotification(postOwner[0]?.isLikes);
      setOsOwnerPost(postOwner[0]?.os);
      setInitials(postOwner[0]?.initials);
      setBackgroundPicture(postOwner[0]?.backgroundColor);
    }
    getPostOwnerToken();
  }, []);
  const [myUserId, setUserId] = useState("");
  useEffect(() => {
    async function saveUserId() {
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : "";
      setUserId(UUID);
    }
    saveUserId();
  });
  const userName = user?.userName;
  const existingLike = post.likes?.find(
    (like) => like?.userName === user?.userName
  );

  const toggleLike = () => {
    const like = {
      userName: user?.userName,
      profilePictureAws:
        user?.profilePicture?.split("/")[3]?.split("?")[0] ?? "",
      profilePicture: user?.profilePicture,
    };
    sendLikeUpdated({
      like: like,
      index: index,
      postId: post.idv4,
      ownerPostToken: userTokenReceiver,
      userId: post.userId,
      os: osOwnerPost,
      isAllowLikesNotification: isAllowLikesNotification,
      initials: initials,
      backgroundColor: backgroundColor,
    });
  };

  const goToCommentsScreen = () => {
    router.push(`/comments/${post.idv4}`);
  };

  let marginLeftLikeBy = 0;
  if (post.likes?.length < 3) {
    marginLeftLikeBy = 10;
  } else {
    marginLeftLikeBy = -10;
  }
  const dateItem = moment(post.timeAgo, "M/D/YYYY, h:mm:ss A");
  const date = moment(dateItem);
  const timeAgo = date.fromNow();

  let regex = /no-photo-post/;
  let regexUser = /no-photo-user/;

  const [isOpenModalShare, setOpenModalShare] = useState(false);
  const [infoOwnerPostShare, setInfoOwnerPostShare] = useState<Post>();
  const share = (data: any) => {
    setInfoOwnerPostShare(data);
    setOpenModalShare(true);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const handleChangeSearch = async (value: string) => {
    setSearchTerm(value);
  };

  function getFullName(person: { firstName: string; lastName: string }) {
    return `${person.firstName} ${person.lastName}`;
  }

  const [activeUserToShare, setActiveUserToShare] = useState<User>();

  const shareOnApp = async () => {
    //activeUserToShae save here item entero para campos receiver
    // hacer get user UUID para sender
console.log("ENTA SHARE OON APP")
    const userData = await getUser();
    const userSender: User = userData.response[0];
    console.log(1,userSender)
    const newUUID = uuidv4();
    const messageRamdomToGenerateNewMessage = newUUID;

    const currentDatetime = new Date();
    const options = { timeZone: activeUserToShare?.timezone[0] };
    const dateTimezone = currentDatetime.toLocaleString("en-US", options);
    const newMessageBE = {
      sender: userSender.userId,
      receiver: activeUserToShare?.userId,
      message: messageRamdomToGenerateNewMessage, ///TODO COMPLETE
      date: dateTimezone,
      profilePicture:
        userSender.profilePicture?.split?.("/")?.[3]?.split?.("?")[0] ?? "",
      isNotification: false,
      senderFullName: `${userSender?.firstName} ${userSender?.lastName}`,
      receiverFullName: `${activeUserToShare?.firstName} ${activeUserToShare?.lastName}`,
      receiverProfilePicture:
        activeUserToShare?.profilePicture.split?.("/")?.[3]?.split?.("?")[0] ??
        "",
      initialsSender: `${userSender?.firstName[0]} ${userSender?.lastName[0]}`,
      backgroundColorSender: userSender?.backgroundColor,
      initialsReceiver: `${activeUserToShare?.firstName[0]} ${activeUserToShare?.lastName[0]}`,
      backgroundColorReceiver: activeUserToShare?.backgroundColor,
      isShare: true,
      fullNameOwnerPost: `${infoOwnerPostShare?.firstName} ${infoOwnerPostShare?.lastName}`,
      profilePictureOwnerPost:
        infoOwnerPostShare?.pictureUser?.split?.("/")?.[3]?.split?.("?")?.[0] ??
        "", //do for this S3,
      initialsOwnerPost: infoOwnerPostShare?.initials,
      backgroundColorOwnerPost: infoOwnerPostShare?.backgroundColor,
      postPictureOwnerPost:
        infoOwnerPostShare?.picturePost?.split?.("/")?.[3]?.split?.("?")?.[0] ??
        "",
      timeAgoOwnerPost: infoOwnerPostShare?.timeAgo,
      descriptionOwnerPost: infoOwnerPostShare?.description,
      postIdOwnerPost: infoOwnerPostShare?.idv4,
      postUserIdOwnerPost: infoOwnerPostShare?.userId,
      likesOwnerPost: infoOwnerPostShare?.likes,
    };

    //handleSendToSocketMessage(newMessageBE);
    socket?.emit("send_message", newMessageBE);
    await saveMessageBE(newMessageBE);
    console.log("ACTIVE", activeUserToShare);

    if (
      activeUserToShare?.isChats &&
      activeUserToShare?.pushToken !== "" &&
      activeUserToShare?.pushToken !== undefined
    ) {
      if (activeUserToShare?.os !== "") {
        if (activeUserToShare?.os !== "android") {
          const data = {
            token: activeUserToShare?.pushToken,
            title: `New message`,
            body: `@${activeUserToShare?.userName} share a post`,
            data: { isFrom: "Message", receiver: userSender.userId },
          };
          await sendPushNotification(data);
        } else {
          const pushNotification = {
            title: `New message`,
            body: `@${activeUserToShare?.userName} share a post`,
            data: { isFrom: "Message", receiver: userSender.userId },
            token: activeUserToShare?.pushToken,
          };
          await sendPushNotificationAndroid(pushNotification);
        }
      }
    }

    setOpenModalShare(false);
  };

  const deletePostLucky = async (id: string) => {
    deletePostLuckyLocal(id);
    await savePostIdLucky(post, user?.userId);
  };

  return (
    <>
      <View
        style={{
          marginBottom: 40,
          marginHorizontal: 10,
          marginTop: 40,
          backgroundColor: Colors.white,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable
              onPress={() => {
                if(post.userName !== "12345-lucky-12345") {
                  router.push(`/profile/${post.userId}/false`)
                }
              }}
            >
              {post.pictureUser !== "" && !regexUser.test(post.pictureUser) ? (
                <View style={{ borderRadius: 50, height: 70, width: 70 }}>
                  <Image
                    alt={"profile pic"}
                    src={post.pictureUser}
                    width={70}
                    height={70}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 50,
                    }}
                  />
                </View>
              ) : (
                <View
                  style={{
                    height: 70,
                    width: 70,
                    borderRadius: 50,
                    backgroundColor: post.backgroundColor,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: Colors.blackDefault, fontSize: 18 }}>
                    {post.initials}
                  </span>
                </View>
              )}
            </Pressable>
            <View style={{ marginLeft: 15 }}>
              <View>
                <Pressable
                  onPress={() => {
                    if (post.userName !== "12345-lucky-12345") {
                      router.push(`/profile/${post.userId}/false`)
                    }
                  }}
                >
                  <View>
                    <span
                      style={{ fontSize: 17, fontWeight: "600", marginTop: 5 }}
                    >
                      {`${post.firstName} ${post.lastName}`}
                    </span>
                  </View>
                </Pressable>
                <View style={{ marginBottom: 10, marginTop: 5 }}>
                  <span style={{ fontSize: 13, color: Colors.darkGray }}>
                  {post.userId === "12345-lucky-12345"
                      ? "Official Account"
                      : timeAgo}
                  </span>
                </View>
              </View>
            </View>
          </View>
          {post.userName !== userName && (
            <TouchableOpacity onPress={() => share(post)}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: 79,
                }}
              >
                {post.userId !== "12345-lucky-12345" ? (
                <TouchableOpacity onPress={() => share(post)}>
                   <ShareIcon />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => deletePostLucky(post._id)}>
                  <CloseIcon style={{fontSize: 26}} />
                </TouchableOpacity>
              )}
               
              </View>
            </TouchableOpacity>
          )}
          {post.userName === userName && (
            <TouchableOpacity
              onPress={() => {
                deletePost(post.idv4);
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 16,
                }}
              >
                <DeleteIcon style={{ fontSize: 30, color: Colors.red }} />
              </View>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ marginTop: 20 }}>
          {post.picturePost !== "" && !regex.test(post.picturePost) && (
            <>
              <Image
                alt="image"
                height={300}
                src={post.picturePost}
                width={200}
                style={{
                  width: "100%",
                  height: 300,
                  borderRadius: 20,
                }}
              />

              <View
                style={{
                  borderRadius: 50,
                  backgroundColor: existingLike ? "#FF2D55" : Colors.white,
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  position: "absolute",
                  bottom: 20,
                  left: 30,
                }}
              >
                <Pressable onPress={() => toggleLike()}>
                  {!existingLike && (
                    <FavoriteIcon style={{ color: "#FF2D55" }} />
                  )}
                  {existingLike && (
                    <FavoriteBorderIcon
                      style={{ color: Colors.blackCardDarkMode }}
                    />
                  )}
                </Pressable>
              </View>
            </>
          )}
          {post.likes?.length > 0 &&
            !regex.test(post.picturePost) &&
            post.picturePost !== "" &&
            post.picturePost !== undefined &&
            post.picturePost !== null && (
              <View
                style={{
                  borderRadius: 20,
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  width: 50,
                  height: 30,
                  justifyContent: "center",
                  alignItems: "center",
                  position: "absolute",
                  bottom: 25,
                  left: 80,
                }}
              >
                <span
                  style={{
                    color: Colors.blackDefault,
                    opacity: 1,
                    fontWeight: "600",
                  }}
                >
                  {post.likes?.length}
                </span>
              </View>
            )}
        </View>

        <View style={{ marginTop: post.picturePost !== "" ? 15 : -10 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {post.likes
              ?.filter((item, index) => index < 3)
              .map((like, index) => {
                let image;

                if (like?.profilePicture !== "") {
                  image = like?.profilePicture;
                } else {
                  image = "/not-logged-in.png";
                }
                return (
                  <View key={index} style={{ flexDirection: "row" }}>
                    <Image
                      alt="profile picture like"
                      src={image}
                      width={33}
                      height={33}
                      style={{
                        width: 33,
                        height: 33,
                        borderRadius: 50,
                        borderWidth: 1,
                        borderColor: Colors.white,
                        position: "relative",
                        left: index > 0 ? (index === 2 ? -20 : -10) : 0,
                      }}
                    />
                  </View>
                );
              })}
            {post.likes?.length > 0 && (
              <View
                style={{ flexDirection: "row", marginLeft: marginLeftLikeBy }}
              >
                <span
                  style={{
                    color: Colors.darkGray,
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  Liked by{" "}
                </span>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Pressable
                    onPress={() =>
                      router.push(`/profile/${post.likes?.[0].userName}/true`)
                    }
                  >
                    <span
                      style={{ fontWeight: "600", fontSize: 14, marginLeft: 5 }}
                    >
                      {post.likes?.[0]?.userName}
                    </span>
                  </Pressable>
                  {post.likes?.length - 1 > 0 && (
                    <View style={{ flexDirection: "row" }}>
                      <span style={{ marginLeft: 5 }}>
                        and {post.likes?.length - 1} others
                      </span>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          <View
            style={{
              marginTop: post.picturePost !== "" ? 10 : 10,
              marginLeft: post.picturePost !== "" ? 0 : 15,
            }}
          >
            <span
              style={{ color: Colors.blackCardDarkMode, textAlign: "justify" }}
            >
              {post.description}
            </span>
          </View>

          {post.picturePost === "" && (
            <View
              style={{
                marginTop: 20,
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 10,
              }}
            >
              <Pressable onPress={() => toggleLike()}>
                {existingLike && <FavoriteIcon style={{ color: "#FF2D55" }} />}
                {!existingLike && (
                  <FavoriteBorderIcon
                    style={{ color: Colors.blackCardDarkMode }}
                  />
                )}
              </Pressable>
              <span style={{ fontSize: 16, marginLeft: 10 }}>Like</span>
            </View>
          )}

          <View
            style={{
              marginTop: post.picturePost !== "" ? 10 : 20,
              marginLeft: post.picturePost !== "" ? 0 : 15,
            }}
          >
            {post.comments?.length > 0 && post.allowComments && (
              <Pressable onPress={() => goToCommentsScreen()}>
                <span style={{ color: Colors.darkGray }}>
                  View all {totalComments} comments
                </span>
              </Pressable>
            )}
            {post.comments?.length === 0 && post.allowComments && post.userId !== "12345-lucky-12345" && (
              <Pressable onPress={() => goToCommentsScreen()}>
                <span style={{ color: Colors.darkGray }}>Add a comment</span>
              </Pressable>
            )}
          </View>
          {post.comments?.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                marginTop: 10,
                maxWidth: 270,
                marginLeft: post.picturePost !== "" ? 0 : 15,
              }}
            >
              <Pressable
                onPress={() =>
                  router.push(`/profile/${post.comments?.[0].userName}/true`)
                }
              >
                <span style={{ color: Colors.blackDefault, fontWeight: "800" }}>
                  {post.comments?.[0].userName}
                </span>
              </Pressable>
              <span
                style={{
                  color: Colors.darkGray,
                  marginLeft: 5,
                  fontWeight: "600",
                }}
              >
                {post.comments?.[0].comment}
              </span>
            </View>
          )}
        </View>
      </View>
      {/* {index % 2 === 0 && <ItemSeparator index={index} />} */}
      <Modal
        open={isOpenModalShare}
        onClose={() => {
          setOpenModalShare(false);
        }}
        className={styles.modalShare}
      >
        <div className={styles.containerModalShare}>
          <>
            {followers?.length === 0 && (
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  marginHorizontal: 30,
                }}
              >
                <PeopleIcon style={{ fontSize: 60 }} />
                <span
                  style={{
                    fontSize: 20,
                    color: "black",
                  }}
                >
                  You don't have connections.
                </span>
                <span
                  style={{
                    fontSize: 20,
                    textAlign: "center",
                  }}
                >
                  Start connecting with people to share posts.
                </span>
              </View>
            )}
            {followers?.length > 0 && (
              <>
                <View style={{ flexDirection: "row" }}>
                  <TextInput
                    style={{
                      marginHorizontal: 20,
                      width: "90%",
                      backgroundColor: Colors.lightGray,
                      color: Colors.blackCardDarkMode,
                      height: 50,
                      paddingLeft: 20,
                      borderRadius: 20,
                      marginTop: 20,
                    }}
                    value={searchTerm}
                    onChangeText={(value) => handleChangeSearch(value)}
                    placeholder="Search for connections"
                  />
                  <SearchIcon
                    style={{
                      position: "relative",
                      left: -60,
                      top: 35,
                      fontSize: 24,
                    }}
                    name="search1"
                  />
                </View>
                <div
                  className={styles.wrapperFollowers}
                >
                  {followers
                    ?.filter(
                      (item) =>
                        item.firstName
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        item.userName
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        item.lastName
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        getFullName(item)
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    )
                    .map((item) => {
                      return (
                        <View
                          key={item._id}
                          style={{
                            marginHorizontal: 20,
                            width: "90%",
                            backgroundColor: Colors.white,
                            marginLeft: -20,
                            marginTop: 20,
                            borderRadius: 8,
                            padding: 20,
                            borderBottomWidth: 1,
                            borderBottomColor: Colors.lightGray,
                          }}
                        >
                          <Pressable
                            onPress={() => setActiveUserToShare(item)}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <RadioButton
                                hasBorder={false}
                                colorInactive={Colors.darkGray}
                                active={
                                  activeUserToShare?.userId === item.userId
                                }
                                width={40}
                              />

                              <View>
                                {item.profilePicture !== "" ? (
                                  <Image
                                    height={60}
                                    width={60}
                                    style={{
                                      height: 60,
                                      width: 60,
                                      borderRadius: 50,
                                      objectFit: "cover",
                                    }}
                                    alt="profile pic"
                                    src={item.profilePicture}
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
                              </View>
                              <View
                                style={{ flexDirection: "row", maxWidth: 400 }}
                              >
                                <span
                                  style={{
                                    marginLeft: 10,
                                    fontSize: 17,
                                  }}
                                >{`${item.firstName} ${item.lastName}`}</span>
                                <span
                                  style={{
                                    marginLeft: 10,
                                    fontSize: 17,
                                    color: Colors.blue,
                                    maxWidth: 100,
                                  }}
                                >{`@${item.userName}`}</span>
                              </View>
                            </View>
                          </Pressable>
                        </View>
                      );
                    })}
                </div>
                {followers?.length > 0 &&
                  followers?.filter(
                    (item) =>
                      item.firstName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      item.userName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      item.lastName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      getFullName(item)
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  ).length > 0 && (
                    <View
                      style={{
                        justifyContent: "flex-end",
                        flexDirection: "row",
                        marginRight: 20,
                        
                      }}
                    >
                      <Pressable
                        onPress={() => {
                          if (activeUserToShare === undefined) return;
                          shareOnApp();
                        }}
                      >
                        <View
                          style={{
                            backgroundColor:
                              activeUserToShare === undefined
                                ? Colors.darkGray
                                : Colors.primary,
                            padding: 10,
                            width: 70,
                            borderRadius: 24,
                          }}
                        >
                          <span
                            style={{
                              color: Colors.white,
                              textAlign: "center",
                            }}
                          >
                            Share
                          </span>
                        </View>
                      </Pressable>
                    </View>
                  )}
              </>
            )}
          </>
        </div>
      </Modal>
    </>
  );
};

export default CardPost;
