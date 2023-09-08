import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { TouchableOpacity, View, TextInput, Pressable } from "react-native";
import { useRouter } from "next/navigation";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import moment from "moment";
import {
  addComment,
  addLike,
  addLikeComment,
  addLikeReply,
  addReply,
  deleteCommentBE,
  deleteReplyBE,
  getPostByIdBE,
  removeLike,
  removeLikeComment,
  removeLikeReply,
} from "@/helpers/posts";
import { Comment, User } from "@/models";
import { getUser } from "@/helpers/users";
import {
  sendNotification,
  sendPushNotification,
  sendPushNotificationAndroid,
} from "@/helpers/notifications";
import { Colors } from "@/app/colors";
import { CloseOutlined, ShareAltOutlined } from "@ant-design/icons";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import MessageIcon from "@mui/icons-material/Message";
import styles from "../components/post-detail.module.css";
import { Modal } from "@mui/material";
import Image from "next/image";
import PeopleIcon from "@mui/icons-material/People";
import SearchIcon from "@mui/icons-material/Search";
import { useSocket } from "../Context/store";
import { v4 as uuidv4 } from "uuid";
import { saveMessageBE } from "@/helpers/chats";
import RadioButton from "./RadioButton";
import { getFollowersBE } from "@/helpers/followers";

export default function PostDetail({ postId }: any) {
  const router = useRouter();
  const socket = useSocket();
console.log("S", socket)
  const [postInfo, setPostInfo] = useState();

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function getPostById() {
      if (postId !== undefined) {
        setIsLoading(true);
        const post = await getPostByIdBE(postId);
        console.log("POST");
        if (post !== undefined) {
          setPostInfo(post.response.post);
          console.log("PSOT", post.response.post);
          setComments(post.response.post.comments);
        }

        setIsDeleting(true);
        setIsLoading(false);
      }
    }
    getPostById();
  }, [postId]);

  const [comment, setComment] = useState("");

  const inputRef = useRef(null);
  const scrollViewRef = useRef(null);
  const handleTextChange = (newText: string) => {
    setComment(newText);
  };
  const [comments, setComments] = useState<Comment[]>([]);

  const [pushTokenReceiver, setPushTokenReceiver] = useState("");
  const [os, setOs] = useState("");
  const [initials, setInitials] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [isAllowNotificationComments, setIsAllowNotificationComments] =
    useState(true);

  const [isAllowNotificationReplies, setIsAllowNotificationReplies] =
    useState(true);

  const [isAllowNotificationLikes, setIsAllowNotificationLikes] =
    useState(true);
  useEffect(() => {
    async function getReceiverPushToken() {
      console.log("postInfo?.userId",postInfo?.userId)
      const userRecevier = await getUser(postInfo?.userId);
      console.log("USER RECIEVER123", userRecevier)
      setPushTokenReceiver(userRecevier.response[0]?.pushToken);
      setOs(userRecevier.response[0]?.os);
      setInitials(userRecevier.response[0]?.initials);
      setBackgroundColor(userRecevier.response[0]?.backgroundColor);
      setIsAllowNotificationComments(userRecevier.response[0]?.isComments);
      setIsAllowNotificationReplies(userRecevier.response[0]?.isReplies);
      setIsAllowNotificationLikes(userRecevier.response[0]?.isLikes);
    }

    getReceiverPushToken();
  }, [postInfo]);

  const [userNameInInput, setUserNameInInput] = useState("");
  const [commentIdToReply, setCommentIdToReply] = useState("0");

  const [user, setUser] = useState<User>();
  const [userName, setUserName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [fullNameSender, setSenderFullName] = useState("");
  const [initialsMySelf, setInitialsMySelf] = useState("");
  const [backgroundColorMySelf, setBackgroundColorMySelf] = useState("");
  useEffect(() => {
    async function getUserInfo() {
      const res = await getUser();
      const userDb = res.response;
      setUser(userDb[0]);
      console.log("userDb[0].userName", userDb[0].userName);
      setUserName(userDb[0].userName);
      setProfilePicture(userDb[0].profilePicture);
      setSenderFullName(`${userDb[0].firstName} ${userDb[0].lastName}`);
      setInitialsMySelf(userDb[0].initials);
      setBackgroundColorMySelf(userDb[0].backgroundColor);
    }

    getUserInfo();
  }, []);

  const replyComment = (userName: string, commentId: string) => {
    setCommentIdToReply(commentId);
    setUserNameInInput(`@${userName}`);
    setComment(`@${userName} `);
    inputRef?.current?.focus();
  };

  const sendComment = async () => {
    if (isLoading) return;
    if (comment?.trim() === "") return;
    const regex = new RegExp(`^${userNameInInput}\\b`);

    const date = new Date();
    const options = { timeZone: user?.timezone[0] };
    const dateTimezone = date.toLocaleString("en-US", options);
    const idv4 = uuidv4();

    if (regex.test(comment) && userNameInInput !== "") {
      let newReplyLocal = {
        userName: userName,
        comment: comment,
        timezone: user?.timezone[0],
        timeAgo: dateTimezone,
        initials: initialsMySelf,
        backgroundColor: backgroundColorMySelf,
        likes: [],
        profilePicture: user?.profilePicture,
        idv4,
      };

      let newReplyDb = {
        userName: userName,
        comment: comment,
        timezone: user?.timezone[0],
        timeAgo: dateTimezone,
        initials: initialsMySelf,
        backgroundColor: backgroundColorMySelf,
        likes: [],
        profilePicture:
          user?.profilePicture?.split?.("/")?.[3]?.split?.("?")?.[0] ?? "",
        idv4,
      };
      const copyCommments = _.cloneDeep(comments);
      const indexComment = copyCommments.findIndex((comment) => {
        return comment?.idv4 === commentIdToReply;
      });

      copyCommments[indexComment].replies.push(newReplyLocal);
      setComments(copyCommments);

      await addReply(postId, commentIdToReply, newReplyDb);
      if (user?.userId !== postInfo?.userId) {
        const newNotification = {
          sender: user?.userId ?? "",
          receiver: postInfo?.userId,
          date: dateTimezone,
          profilePictureSender:
            profilePicture?.split?.("/")?.[3]?.split?.("?")?.[0] ?? "",
          body: `New reply from ${fullNameSender} in your post`,
          type: "reply",
          postId: postId,
          senderFullName: fullNameSender,
          initials: user?.initials ?? "",
          backgroundColor: user?.backgroundColor ?? "",
        };

        await sendNotification(newNotification);
        const dataSocket = {
          receiver: postInfo?.userId,
        };


        socket?.emit("send_notification_request", dataSocket);
        if (isAllowNotificationReplies) {
          if (os !== "android") {
            const pushNotification = {
              title: `New reply on your comment`,
              body: `@${userName} replied your comment`,
              data: { isFrom: "Comments", postId: postId },
              token: pushTokenReceiver,
            };
            sendPushNotification(pushNotification);
          } else {
            const pushNotification = {
              title: `New reply on your comment`,
              body: `@${userName} replied your comment`,
              data: { isFrom: "Comments", postId: postId },
              token: pushTokenReceiver,
            };
            sendPushNotificationAndroid(pushNotification);
          }
        }
      }
    } else {
      let newCommentLocal = {
        //_id: id,
        timezone: user?.timezone[0],
        userName: userName,
        timeAgo: dateTimezone,
        profilePicture: user?.profilePicture,
        comment: comment,
        likes: [],
        replies: [],
        initials: initialsMySelf,
        backgroundColor: backgroundColorMySelf,
        idv4,
      };

      let newCommentDb = {
        //_id: id,
        timezone: user?.timezone[0],
        userName: userName,
        timeAgo: dateTimezone,
        profilePicture:
          user?.profilePicture?.split?.("/")?.[3]?.split?.("?")?.[0] ?? "",
        comment: comment,
        likes: [],
        replies: [],
        initials: initialsMySelf,
        backgroundColor: backgroundColorMySelf,
        idv4,
      };
      const copyCommments = _.cloneDeep(comments);
      copyCommments.push(newCommentLocal);
      setComments(copyCommments);

      await addComment(postId, newCommentDb);

      if (user?.userId !== postInfo?.userId) {
        const newNotification = {
          sender: user?.userId ?? "",
          receiver: postInfo?.userId,
          date: dateTimezone,
          profilePictureSender:
            profilePicture?.split?.("/")?.[3]?.split?.("?")?.[0] ?? "",
          body: `New commment from ${fullNameSender} in your post`,
          type: "comment",
          postId: postId,
          senderFullName: fullNameSender,
          initials: user?.initials ?? "",
          backgroundColor: user?.backgroundColor ?? "",
        };

        await sendNotification(newNotification);
        const dataSocket = {
          receiver: postInfo?.userId,
        };

        console.log("USER id13", dataSocket.receiver)

        socket?.emit("send_notification_request", dataSocket);
        //if (isAllowNotificationComments) {
          if (os !== "android") {
            const pushNotification = {
              title: `New comment on your post`,
              body: `${fullNameSender} commented on your post`,
              data: { isFrom: "Comments", postId: postId },
              token: pushTokenReceiver,
            };
            sendPushNotification(pushNotification);
          } else {
            const pushNotification = {
              title: `New comment on your post`,
              body: `${fullNameSender} commented on your post`,
              data: { isFrom: "Comments", postId: postId },
              token: pushTokenReceiver,
            };
            sendPushNotificationAndroid(pushNotification);
          }
       //}

        
      }
    }
    setComment("");
    setUserNameInInput("");
    inputRef?.current?.blur();
  };

  const toggleLikeComment = async (index: number) => {
    if (isLoading) return;
    const copyData = _.cloneDeep(comments);
    const indexLike = copyData[index].likes.findIndex(
      (item, index) => item.userName === userName
    );
    if (indexLike !== -1) {
      copyData[index].likes = copyData[index].likes.filter(
        (item, index) => item.userName !== userName
      );
    } else {
      copyData[index].likes.push({ userName: userName });
    }
    setComments(copyData);
    if (indexLike !== -1) {
      await removeLikeComment(postId, copyData[index].idv4, userName);
    } else {
      console.log("copyData", copyData);
      await addLikeComment(postId, copyData[index].idv4, userName);
    }
  };

  const toggleLikeReply = async (indexComment: number, indexReply: number) => {
    if (isLoading) return;
    const copyData = _.cloneDeep(comments);
    const indexLike = copyData[indexComment].replies[
      indexReply
    ].likes.findIndex((reply, index) => reply.userName === userName);
    if (indexLike !== -1) {
      copyData[indexComment].replies[indexReply].likes = copyData[
        indexComment
      ].replies[indexReply].likes.filter(
        (reply, index) => reply.userName !== userName
      );
    } else {
      copyData[indexComment].replies[indexReply].likes.push({
        userName: userName,
      });
    }
    setComments(copyData);
    if (indexLike !== -1) {
      console.log("111postId", postId);
      console.log(
        "111copyData[indexComment].idv4",
        copyData[indexComment].idv4
      );

      console.log(
        "111vcopyData[indexComment].replies[indexReply].idv4",
        copyData[indexComment].replies[indexReply].idv4
      );
      console.log("11userName", userName);

      await removeLikeReply(
        postId,
        copyData[indexComment].idv4,
        copyData[indexComment].replies[indexReply].idv4,
        userName
      );
    } else {
      await addLikeReply(
        postId,
        copyData[indexComment].idv4,
        copyData[indexComment].replies[indexReply].idv4,
        userName
      );
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const deleteComment = async (commentId: number) => {
    setIsDeleting(true);
    let copyComments = _.cloneDeep(comments);
    copyComments = copyComments.filter(
      (comment) => comment?.idv4 !== commentId
    );
    setComments(copyComments);
    await deleteCommentBE(postId, commentId);
    setIsDeleting(false);
  };

  const deleteReply = async (commentId: number, replyId: number) => {
    setIsDeleting(true);
    let copyComments = _.cloneDeep(comments);
    const indexComment = copyComments.findIndex(
      (comment) => comment?.idv4 === commentId
    );
    copyComments[indexComment].replies = copyComments[
      indexComment
    ].replies.filter((reply) => reply?.idv4 !== replyId);
    setComments(copyComments);
    console.log("111 REPLY ID", replyId);
    await deleteReplyBE(postId, commentId, replyId);
    setIsDeleting(false);
  };
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const isAlreadyLiked = postInfo?.likes?.some(
      (like: { userName: string }) => like?.userName === userName
    );
    setIsLiked(isAlreadyLiked);
  }, [postInfo]);

  const toggleLike = async () => {
    if (isLoading) return;
    const likeLocal = {
      userName: user?.userName,
      profilePicture: user?.profilePicture,
    };
    const localPostInfo = _.cloneDeep(postInfo);
    const indexLike = localPostInfo.likes.findIndex(
      (item: { userName: string }) => item.userName == userName
    );
    if (indexLike !== -1) {
      localPostInfo.likes = localPostInfo.likes.filter(
        (item: { userName: string }) => item.userName !== userName
      );
    } else {
      localPostInfo.likes.push(likeLocal);
    }

    const likeDb = {
      userName: user?.userName,
      profilePicture:
        user?.profilePicture?.split?.("/")?.[3]?.split?.("?")?.[0] ?? "",
    };

    if (isLiked) {
      await removeLike(postId, likeDb);
    } else {
      await addLike(postId, likeDb);
      if (user?.userId !== postInfo?.userId) {
        const currentDatetime = new Date();
        const options = { timeZone: user?.timezone[0] };
        const dateTimezone = currentDatetime.toLocaleString("en-US", options);

        const newNotification = {
          sender: user?.userId ?? "",
          receiver: postInfo?.userId,
          date: dateTimezone,
          profilePictureSender:
            profilePicture?.split?.("/")?.[3]?.split?.("?")?.[0] ?? "",
          body: `New like from ${fullNameSender} in your post`,
          type: "like",
          postId: postId,
          senderFullName: fullNameSender,
          initials: user?.initials,
          backgroundColor: user?.backgroundColor,
        };

        await sendNotification(newNotification);
        const dataSocket = {
          receiver: user?.userId,
        };

        socket?.emit("send_notification_request", dataSocket);
        if (isAllowNotificationLikes) {
          if (os !== "android") {
            const pushNotification = {
              title: `New like on your post`,
              body: `@${userName} liked your post`,
              data: { isFrom: "Likes", postId: postId },
              token: pushTokenReceiver,
            };
            sendPushNotification(pushNotification);
          } else {
            const pushNotification = {
              title: `New like on your post`,
              body: `@${userName} liked your post`,
              data: { isFrom: "Comments", postId: postId },
              token: pushTokenReceiver,
            };
            sendPushNotificationAndroid(pushNotification);
          }
        }
      }
    }
    setIsLiked((prev) => !prev);
    setPostInfo(localPostInfo);
  };
  const [isViewMoreRepliesActive, setViewMoreReplies] = useState<
    { state: boolean; replyId: number; commentId: number }[]
  >([]);
  const viewMoreReplies = (infoViewMore: {
    state: boolean;
    replyId: number;
    commentId: number;
  }) => {
    setIsDeleting(true);
    const copyViewMoreReply = _.cloneDeep(isViewMoreRepliesActive);
    copyViewMoreReply?.push(infoViewMore);
    setViewMoreReplies(copyViewMoreReply);
  };

  const itemsInScreenReplies = 3;

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  //   useEffect(() => {
  //     const showSubscription = Keyboard.addListener("keyboardWillShow", (e) => {
  //       setKeyboardHeight(e.endCoordinates.height);
  //     });

  //     const hideSubscription = Keyboard.addListener("keyboardWillHide", () => {
  //       setKeyboardHeight(0);
  //     });

  //     return () => {
  //       showSubscription.remove();
  //       hideSubscription.remove();
  //     };
  //   }, []);

  const marginBottom = keyboardHeight > 0 ? keyboardHeight : 20;
  //const animationValue = useRef(new Animated.Value(0)).current;
  //if (isLoading) {
  //   const loopAnimation = () =>
  //     Animated.loop(
  //       Animated.timing(animationValue, {
  //         toValue: 1,
  //         duration: 1000,
  //         useNativeDriver: Constants.appOwnership !== "expo",
  //       })
  //     ).start();

  //   loopAnimation();

  //   const interpolatedWidth1 = animationValue.interpolate({
  //     inputRange: [0, 1],
  //     outputRange: [-145, 0],
  //   });
  let marginLeftLikeBy = 0;
  if (postInfo?.likes?.length < 3) {
    marginLeftLikeBy = 10;
  } else {
    marginLeftLikeBy = -10;
  }

  const dateItem = moment(postInfo?.timeAgo, "M/D/YYYY, h:mm:ss A");
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
  const [activeUserToShare, setActiveUserToShare] = useState<User>();

  function getFullName(person: { firstName: string; lastName: string }) {
    return `${person.firstName} ${person.lastName}`;
  }

  const shareOnApp = async () => {
    const userData = await getUser();
    const userSender: User = userData.response[0];
    const newUUID = uuidv4();
    const messageRamdomToGenerateNewMessage = newUUID;
    const currentDatetime = new Date();
    const options = { timeZone: activeUserToShare?.timezone[0] };
    const dateTimezone = currentDatetime.toLocaleString("en-US", options);
    const newMessageBE = {
      sender: userSender.userId,
      receiver: activeUserToShare?.userId,
      message: messageRamdomToGenerateNewMessage,
      date: dateTimezone,
      profilePicture:
        userSender.profilePicture?.split?.("/")?.[3]?.split?.("?")?.[0] ?? "",
      isNotification: false,
      senderFullName: `${userSender?.firstName} ${userSender?.lastName}`,
      receiverFullName: `${activeUserToShare?.firstName} ${activeUserToShare?.lastName}`,
      receiverProfilePicture:
        activeUserToShare?.profilePicture.split?.("/")?.[3]?.split?.("?")?.[0] ??
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

    socket?.emit("send_message", newMessageBE);

    await saveMessageBE(newMessageBE);

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
          sendPushNotificationAndroid(pushNotification);
        }
      }
    }
    setOpenModalShare(false);
  };

  const [followers, setFollowers] = useState<User[]>([]);
  useEffect(() => {
    async function getFollowers() {
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : "";
      const data = await getFollowersBE(UUID);

      setFollowers(data.response.users);
    }
    getFollowers();
  }, []);

  return (
    <>
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: Colors.backgroundGray,
          paddingBottom: 20,
          backgroundColor: "#fff",
        }}
      >
        <View
          style={{
            marginHorizontal: 20,
          }}
        >
          {!isLoading ? (
            <>
              <View
                style={{
                  marginTop: 20,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/profile/${postInfo?.userId}/false`)
                  }
                >
                  {!regexUser.test(postInfo?.pictureUser) &&
                  postInfo?.pictureUser !== "" &&
                  postInfo?.pictureUser !== undefined ? (
                    <View style={{ borderRadius: 50, height: 70, width: 70 }}>
                      <Image
                        src={postInfo?.pictureUser}
                        alt="picture"
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
                </TouchableOpacity>

                <View>
                  <TouchableOpacity
                    onPress={() =>
                      router.push(`/profile/${postInfo?.userId}/false`)
                    }
                  >
                    <View style={{ marginLeft: 10 }}>
                      <span
                        style={{ fontSize: 18 }}
                      >{`${postInfo?.firstName} ${postInfo?.lastName}`}</span>
                    </View>
                  </TouchableOpacity>
                  <View style={{ marginLeft: 10, marginTop: 3 }}>
                    <span style={{ fontSize: 14, color: Colors.darkGray }}>
                      {timeAgo}
                    </span>
                  </View>
                </View>
              </View>

              <View style={{ marginTop: 10 }}>
                <span style={{ fontSize: 17, color: Colors.blackCardDarkMode }}>
                  {postInfo?.description}
                </span>
              </View>
              {!regex.test(postInfo?.picturePost) &&
                postInfo?.picturePost !== undefined &&
                postInfo?.picturePost !== "" && (
                  <Image
                    height={300}
                    width={200}
                    style={{
                      height: 300,
                      width: "100%",
                      borderRadius: 8,
                      marginTop: 15,
                    }}
                    alt="pic"
                    src={postInfo?.picturePost}
                  />
                )}
            </>
          ) : (
            <View style={{ flexDirection: "row", height: 100 }}></View>
          )}
        </View>
      </View>
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: Colors.backgroundGray,
          paddingBottom: 10,
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          backgroundColor: "#FFF",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 12,
            marginLeft: 20,
          }}
        >
          <TouchableOpacity onPress={() => toggleLike()}>
            <View style={{ flexDirection: "row" }}>
              <View>
                {isLiked && (
                  <FavoriteIcon style={{ color: "#FF2D55", fontSize: 20 }} />
                )}
                {!isLiked && (
                  <FavoriteBorderIcon
                    style={{ color: Colors.blackCardDarkMode }}
                  />
                )}
              </View>
              <View>
                <span
                  style={{ fontWeight: "600", fontSize: 20, marginLeft: 10 }}
                >
                  Like
                </span>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 12,
            marginLeft: 20,
          }}
        >
          <View>
            <MessageIcon style={{ fontSize: 25 }}></MessageIcon>
          </View>
          <TouchableOpacity onPress={() => inputRef.current.focus()}>
            <View>
              <span style={{ fontWeight: "600", fontSize: 20, marginLeft: 10 }}>
                Comment
              </span>
            </View>
          </TouchableOpacity>
        </View>
        <Pressable onPress={() => share(postInfo)}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 12,
              marginLeft: 20,
            }}
          >
            <View>
              <ShareAltOutlined style={{ fontSize: 25, marginRight: 10 }} />
            </View>
            <View>
              <span
                style={{ fontWeight: "600", fontSize: 20, marginRight: 25 }}
              >
                Share
              </span>
            </View>
          </View>
        </Pressable>
      </View>
      {postInfo?.likes?.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 20,
            backgroundColor: Colors.white,
          }}
        >
          {postInfo?.likes
            .filter((item, index) => index < 3)
            .map(
              (
                like: { userName: string; profilePicture: string },
                index: number
              ) => {
                let image;

                if (like.profilePicture !== "") {
                  image = like.profilePicture;
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
              }
            )}
          {postInfo?.likes.length > 0 && (
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
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/profile/${postInfo?.likes[0].userName}/true`)
                  }
                >
                  <span style={{ fontWeight: "600", fontSize: 14 }}>
                    @{postInfo?.likes[0].userName}
                  </span>
                </TouchableOpacity>
                {postInfo?.likes.length - 1 > 0 && (
                  <View style={{ flexDirection: "row" }}>
                    <span style={{ marginLeft: 5 }}>
                      and {postInfo?.likes.length - 1} others
                    </span>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      )}
      <View style={{ backgroundColor: "#F2F9FE", minHeight: 250, height: 500 }}>
        {!isLoading && comments?.length === 0 && (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: 70,
            }}
          >
            <MessageIcon style={{ fontSize: 40 }} />
            <span
              style={{ fontSize: 20, marginTop: 20 }}
            >{`This post doesn't have comments.`}</span>
          </View>
        )}
        {isLoading && (
          <div className={styles.spinnerOverlay}>
            <div className={styles.spinnerContainer}></div>
          </div>
        )}
        <div
          className={styles.containerComments}
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 0,
            height: "100%",
            backgroundColor: "#F2F9FE",
            paddingBottom: 30,
          }}
        >
          {comments?.map((comment, index) => {
            const existingLike = comment?.likes?.find(
              (like) => like.userName === userName
            );
            const dateItem = moment(comment?.timeAgo, "M/D/YYYY, h:mm:ss A");
            const date = moment(dateItem);
            const timeAgo = date.fromNow();
            return (
              <View key={comment?.idv4} style={{ marginTop: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() =>
                      router.push(`/profile/${comment?.userName}/true`)
                    }
                  >
                    {comment?.profilePicture !== "" ? (
                      <View style={{ borderRadius: 50, height: 50, width: 50 }}>
                        <Image
                          src={comment?.profilePicture}
                          width={50}
                          height={50}
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
                          backgroundColor: comment?.backgroundColor,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{ color: Colors.blackDefault, fontSize: 16 }}
                        >
                          {comment?.initials}
                        </span>
                      </View>
                    )}
                  </TouchableOpacity>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "92.5%",
                    }}
                  >
                    <View
                      style={{
                        marginLeft: 10,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          router.push(`/profile/${comment?.userName}/true`)
                        }
                      >
                        <span
                          style={{
                            color: Colors.blackDefault,
                            fontWeight: "700",
                            fontSize: 17,
                            marginRight: 7,
                          }}
                        >
                          @{comment?.userName}
                        </span>
                      </TouchableOpacity>
                      <span style={{ color: Colors.darkGray }}>{timeAgo}</span>
                    </View>
                    <View>
                      {userName === comment?.userName && (
                        <TouchableOpacity
                          onPress={() => deleteComment(comment?.idv4)}
                        >
                          <View style={{ marginRight: 10 }}>
                            <DeleteIcon style={{ fontSize: 20 }} />
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    marginTop: 0,
                    marginLeft: 65,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ maxWidth: 270 }}>
                    <span style={{ color: Colors.blackDefault }}>
                      {comment?.comment}
                    </span>
                  </View>

                  <View style={{ marginTop: 10 }}>
                    {existingLike && (
                      <TouchableOpacity
                        onPress={() => toggleLikeComment(index)}
                      >
                        <FavoriteIcon
                          style={{ fontSize: 20, color: "#FF2D55" }}
                        />
                      </TouchableOpacity>
                    )}
                    {!existingLike && (
                      <TouchableOpacity
                        onPress={() => toggleLikeComment(index)}
                      >
                        <FavoriteBorderIcon style={{ fontSize: 20 }} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 3,
                    marginLeft: 65,
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      replyComment(comment?.userName, comment?.idv4)
                    }
                  >
                    <View>
                      <span
                        style={{ color: Colors.darkGray, fontWeight: "600" }}
                      >
                        Reply{" "}
                      </span>
                    </View>
                  </TouchableOpacity>

                  {comment?.likes.length > 0 && (
                    <span style={{ fontSize: 19, fontWeight: "600" }}>•</span>
                  )}
                  {comment?.likes.length > 0 && (
                    <View>
                      <span
                        style={{ color: Colors.darkGray, fontWeight: "600" }}
                      >
                        {" "}
                        {comment?.likes.length} Likes{" "}
                      </span>
                    </View>
                  )}
                </View>
                {comment?.replies.length > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      marginLeft: 65,
                      marginTop: 15,
                      alignItems: "center",
                    }}
                  >
                    <View style={{ marginRight: 5 }}>
                      <ReplyIcon style={{ fontSize: 25 }} />
                    </View>
                    <span>{comment?.replies.length} Reply</span>
                  </View>
                )}
                <View>
                  {comment?.replies
                    .filter(
                      (item, index) =>
                        index < itemsInScreenReplies ||
                        isViewMoreRepliesActive?.some((viewMore) => {
                          return (
                            viewMore.commentId == comment?._id && viewMore.state
                          );
                        })
                    )
                    .map((reply, indexReply) => {
                      const existingLike = reply.likes.find(
                        (like) => like.userName === userName
                      );

                      const commentWithoutUserName = reply.comment?.replace(
                        `@${reply.userName}`,
                        ""
                      );

                      const dateItem = moment(
                        reply.timeAgo,
                        "M/D/YYYY, h:mm:ss A"
                      );
                      const date = moment(dateItem);
                      const timeAgoReply = date.fromNow();

                      return (
                        <>
                          <View
                            key={reply._id}
                            style={{
                              marginTop: 20,
                              marginLeft: 65,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <TouchableOpacity
                                onPress={() =>
                                  navigation.navigate("Profile", {
                                    userId: reply.userName,
                                    isUserName: true,
                                  })
                                }
                              >
                                {reply.profilePicture !== "" ? (
                                  <View
                                    style={{
                                      borderRadius: 50,
                                      height: 35,
                                      width: 35,
                                    }}
                                  >
                                    <Image
                                      src={reply.profilePicture}
                                      width={35}
                                      height={35}
                                      style={{
                                        width: 35,
                                        height: 35,
                                        borderRadius: 50,
                                      }}
                                    />
                                  </View>
                                ) : (
                                  <View
                                    style={{
                                      height: 35,
                                      width: 35,
                                      borderRadius: 50,
                                      backgroundColor: reply.backgroundColor,
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: Colors.blackDefault,
                                        fontSize: 14,
                                      }}
                                    >
                                      {reply.initials}
                                    </span>
                                  </View>
                                )}
                              </TouchableOpacity>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  width: "94.2%",
                                }}
                              >
                                <View style={{ flexDirection: "row" }}>
                                  <View style={{ marginLeft: 10 }}>
                                    <TouchableOpacity
                                      onPress={() =>
                                        router.push(
                                          `/profile/${reply.userName}/true`
                                        )
                                      }
                                    >
                                      <span
                                        style={{
                                          color: Colors.blackCardDarkMode,
                                          fontWeight: "700",
                                          fontSize: 16,
                                        }}
                                      >
                                        @{reply.userName}
                                      </span>
                                    </TouchableOpacity>
                                  </View>
                                  <View style={{ marginLeft: 10 }}>
                                    {/* TODO TIME AGO */}
                                    <span
                                      style={{
                                        color: Colors.darkGray,
                                        fontSize: 13,
                                        marginTop: 3,
                                      }}
                                    >
                                      {timeAgoReply}
                                    </span>
                                  </View>
                                </View>
                                <View>
                                  {userName === reply.userName && (
                                    <TouchableOpacity
                                      onPress={() =>
                                        deleteReply(comment?.idv4, reply.idv4)
                                      }
                                    >
                                      <View style={{ marginRight: 10 }}>
                                        <DeleteIcon style={{ fontSize: 20 }} />
                                      </View>
                                    </TouchableOpacity>
                                  )}
                                </View>
                              </View>
                            </View>
                            <View
                              style={{
                                marginTop: 5,
                                flexDirection: "row",
                                justifyContent: "space-between",
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <View
                                  style={{
                                    flexDirection: "row",
                                  }}
                                >
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      width: 250,
                                      marginLeft: 45,
                                    }}
                                  >
                                    <span style={{ color: Colors.blue }}>
                                      <TouchableOpacity
                                        style={{
                                          flexDirection: "row",
                                          width: 250,
                                          //marginLeft: 45,
                                        }}
                                        onPress={() =>
                                          router.push(
                                            `/profile/${reply.userName}/true`
                                          )
                                        }
                                      >
                                        <span style={{ color: Colors.blue }}>
                                          @{reply.userName}
                                        </span>
                                        <span
                                          style={{
                                            color: Colors.black,
                                            marginLeft: 5,
                                          }}
                                        >
                                          {commentWithoutUserName}
                                        </span>
                                      </TouchableOpacity>
                                    </span>
                                  </View>
                                </View>
                              </View>
                              <View style={{ position: "relative", top: 10 }}>
                                {existingLike && (
                                  <TouchableOpacity
                                    onPress={() =>
                                      toggleLikeReply(index, indexReply)
                                    }
                                  >
                                    <FavoriteIcon
                                      style={{ color: "#FF2D55", fontSize: 20 }}
                                    ></FavoriteIcon>
                                  </TouchableOpacity>
                                )}
                                {!existingLike && (
                                  <TouchableOpacity
                                    onPress={() =>
                                      toggleLikeReply(index, indexReply)
                                    }
                                  >
                                    <FavoriteBorderIcon
                                      style={{ fontSize: 20 }}
                                    ></FavoriteBorderIcon>
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                marginTop: 10,
                                marginLeft: 47,
                                alignItems: "center",
                              }}
                            >
                              <TouchableOpacity
                                onPress={() =>
                                  replyComment(comment?.userName, comment?.idv4)
                                }
                              >
                                <View>
                                  <span
                                    style={{
                                      color: Colors.darkGray,
                                      fontWeight: "600",
                                      marginRight: 5,
                                    }}
                                  >
                                    Reply{" "}
                                  </span>
                                </View>
                              </TouchableOpacity>
                              {reply.likes.length > 0 && (
                                <span
                                  style={{ fontSize: 19, fontWeight: "600" }}
                                >
                                  •
                                </span>
                              )}
                              {reply.likes.length > 0 && (
                                <View>
                                  <span
                                    style={{
                                      color: Colors.darkGray,
                                      fontWeight: "600",
                                      marginLeft: 5,
                                    }}
                                  >
                                    {" "}
                                    {reply.likes.length} Likes
                                  </span>
                                </View>
                              )}
                            </View>
                          </View>
                          {indexReply === 2 &&
                            comment?.replies.length - itemsInScreenReplies >
                              0 &&
                            !isViewMoreRepliesActive?.some(
                              (viewMore) =>
                                viewMore.replyId === reply._id && viewMore.state
                            ) && (
                              <View style={{ marginLeft: 110, marginTop: 10 }}>
                                <TouchableOpacity
                                  onPress={() =>
                                    viewMoreReplies({
                                      state: true,
                                      replyId: reply._id,
                                      commentId: comment?._id,
                                    })
                                  }
                                >
                                  <span style={{ fontWeight: "600" }}>
                                    View{" "}
                                    {comment?.replies.length -
                                      itemsInScreenReplies}{" "}
                                    more replies
                                  </span>
                                </TouchableOpacity>
                              </View>
                            )}
                        </>
                      );
                    })}
                </View>
              </View>
            );
          })}
        </div>
      </View>
      {userNameInInput !== "" && (
        <View
          style={{
            backgroundColor: Colors.lightGray,
            height: 70,
            width: "100%",

            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: 18,
          }}
        >
          <span style={{ fontSize: 16 }}>
            Replying to{" "}
            <span style={{ color: Colors.blue }}>{userNameInInput}</span>
          </span>
          <CloseOutlined
            style={{ marginRight: 17, fontSize: 25 }}
            onClick={() => {
              setUserNameInInput("");
              setComment("");
            }}
          />
        </View>
      )}
      <View
        style={{
          marginBottom,
          bottom: 0,
          width: "100%",
          backgroundColor: "white",
          paddingHorizontal: 15,
          paddingBottom: 35,
          paddingTop: 25,
          borderTopWidth: 1,
          borderTopColor: "gray",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {profilePicture !== "" ? (
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
                backgroundColor: backgroundColorMySelf,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 10,
              }}
            >
              <span style={{ color: Colors.blackDefault, fontSize: 16 }}>
                {initialsMySelf}
              </span>
            </View>
          )}
          <View
            style={{
              height: 40,
              width: "86%",
              borderColor: "gray",
              borderWidth: 1,
              paddingHorizontal: 10,
              borderRadius: 50,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <input
              value={comment}
              ref={inputRef}
              className={styles.inputAddComment}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={`Add comment for ${postInfo?.firstName} ${postInfo?.lastName}`}
              style={{ borderRadius: 8, width: 500, outline: "none !important", border: "none !important" }}
            />

            <TouchableOpacity onPress={() => sendComment()}>
              <span style={{ color: Colors.primary, zIndex: 3, opacity: 1 }}>
                Post
              </span>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
}

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
