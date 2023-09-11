"use client";
import { Colors } from "@/app/colors";
import { View, TouchableOpacity, TextInput } from "react-native";
import { Image as ImageRN } from "react-native";

import {
  getRatingsBE,
  getUser,
  getUserByUserNameBE,
  removeCertificatesBE,
  udpdateAvailableForQuittersBE,
  updateAboutProfileBE,
  updateBackgroundPictureBE,
  updateDescriptionAboutMeBE,
  updatePaypalEmail,
  updateProfilePictureBE,
  updateSocialProfileBE,
} from "@/helpers/users";
import { useEffect, useRef, useState } from "react";
import { IRating, User } from "@/models";
import {
  createInvitationBE,
  getFollowersBE,
  stopFollowingBE,
} from "@/helpers/followers";
import moment from "moment";
import { CameraFilled, CloseOutlined, StarFilled } from "@ant-design/icons";
import EditIcon from "@mui/icons-material/Edit";
import { Modal, Switch } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Connections from "./Connections";
import styles from "../../app/components/profile.module.css";
import _ from "lodash";
import ProfilePosts from "./ProfilePosts";
import Rating from "./Rating";
import { sendRatingBE } from "@/helpers/ratings";
import { useRouter } from "next/navigation";
import Image from "next/image";
import InfoQuitters from "./InfoQuitters";
import axios from "axios";
import { API_URL } from "@/config";
import { useSocket } from "../Context/store";
import { getInvitationsByUserIdAndFrom } from "@/helpers/invitations";
import {
  sendPushNotification,
  sendPushNotificationAndroid,
} from "@/helpers/notifications";
import mixpanel from "mixpanel-browser";
import DeleteIcon from "@mui/icons-material/Delete";
import "../../app/globals.css";
import CloseIcon from "@mui/icons-material/Close";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
interface IProps {
  id: string;
  isUsername: boolean;
  //userContext: User
}

const ProfilePage = ({ id, isUsername }: IProps) => {
  const router = useRouter();
  const socket = useSocket();

  const [isPlanEndExpire, setPlanExpire] = useState<boolean | undefined>(true);

  const [user, setUser] = useState<User>();

  // useEffect(() => {
  //   setUser(userContext)
  // },[userContext])
  const [alreadyFollowing, setAlreadyFollowing] = useState(false);
  const [userCurrentType, setCurrentUserType] = useState("");
  const [userCurrent, setCurrentUser] = useState<User>();

  useEffect(() => {
    async function getCurrentUser() {
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : "";
      const res = await getUser(UUID);
      const user = res.response;
      setCurrentUserType(user[0].type);
      setCurrentUser(user[0]);
    }
    getCurrentUser();
  }, [id]);

  // const isFromNetwork = route.params.isFromNetwork;
  const [myUserId, setMyUserId] = useState("");
  const [followers, setFollowers] = useState([]);

  const [aboutMe, setAboutMe] = useState("");
  const [descriptionAboutMe, setDescriptionAboutMe] = useState("");

  const [mutualConnections, setMutualConnections] = useState(0);
  const [avg, setAvg] = useState(0);

  const [isLoadingInitial, setIsLoadingInitial] = useState(false);

  useEffect(() => {
    async function getRatings() {
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : "";
      const res = await getRatingsBE(id);
      console.log("res", res);
      if (res !== undefined) {
        const ratings = res.response.ratings;
        console.log(123, ratings);
        setRatings(ratings);

        let starsCount = 0;
        ratings?.map((item: { stars: number }) => {
          starsCount += item.stars;
        });
        const avg = Math.floor((starsCount / ratings.length) * 100) / 100;
        setAvg(ratings?.length === 0 ? 0 : avg);
      }
    }

    getRatings();
  }, []);
  const [followersConnections, setFollowersConnections] = useState<User[]>([]);

  useEffect(() => {
    async function getFollowers() {
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : "";
      const idLocal = id !== UUID ? UUID : id;
      const res = await getFollowersBE(idLocal, isUsername);
      const data = res.response;
      setFollowers(data.users);

      const idLocal1 = id !== UUID ? id : UUID;
      const data1 = await getFollowersBE(idLocal1);
      setFollowersConnections(data1.response.users);

      setMyUserId(UUID);
      const isFollowing = data.users.filter(
        (item: { userId: string }) => item.userId === id
      );
      if (isFollowing?.length > 0) {
        setAlreadyFollowing(true);
      }
      if (isPlanEndExpire === false) {
        setTextStatus("In a Plan");
      } else {
        if (statusInvite !== "pending") {
          if (isFollowing.length > 0 && isPlanEndExpire === true) {
            console.log("ENTROOO");
            setAlreadyFollowing(true);
            setTextStatus("Following");
          } else if (isPlanEndExpire === true && isFollowing.length === 0) {
            setAlreadyFollowing(false);
            setTextStatus("Follow");
          }
        }
      }
    }
    getFollowers();
  }, [setAlreadyFollowing, id, isUsername, isPlanEndExpire]);

  const [textStatus, setTextStatus] = useState("Follow");

  // const getStatusFollowUser = async (id: string) => {
  //   if (isUsername === true) {
  //     const userBE = await getUserByUserNameBE(id);
  //     setUser(userBE.response[0]);
  //   } else {
  //     const userBE = await getUser(id);
  //     setUser(userBE.response[0]);
  //   }
  // };
  const [statusInvite, setStatusInvite] = useState();
  useEffect(() => {
    setIsLoadingInitial(true);
    let userLocal: User;
    async function getInvitation(userId: string) {
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : "";
      const invitationsUserId = await getInvitationsByUserIdAndFrom(
        userId,
        UUID
      );
      console.log("oinvitationss", invitationsUserId);

      const invitation = invitationsUserId?.response.invitation;
      if (invitation !== undefined) {
        setStatusInvite(invitation.status);
        if (!alreadyFollowing && invitation.status === "pending") {
          setTextStatus("Pending invitation");
        }
      }
    }

    async function getUserById(id: string) {
      if (id !== undefined) {
        console.log(id);

        //const idLocal = id !== UUID ? UUID : id;
        const res = await getUser(id);
        const userBE = res.response;
        console.log(11, userBE);
        userLocal = userBE[0];
        setUser(userBE[0]);
        setEmailPaypal(userBE[0].emailPaypal);
        getRatings(userBE[0].userId);
        setAboutMe(userBE[0].aboutProfile);
        setImageProfileCertificate(userBE[0]?.certificates ?? []);
        setDescriptionAboutMe(userBE[0].descriptionAboutMe);
        let planEnd = undefined;
        let isPlanEndExpireLocal;

        const userLoggedData = await getUser();
        const userLogged = userLoggedData.response[0];
        if (userLogged.quitters.length > 0 || userLogged.coaches.length > 0) {
          if (userLogged.quitters.length > 0) {
            userLogged.quitters.map(
              (quitter: { userId: string; planEnd: string }) => {
                if (quitter.userId === userLocal.userId) {
                  const [month, day, year] = quitter.planEnd
                    .split("/")
                    .map(Number);
                  planEnd = new Date(year, month - 1, day);
                  console.log("HERE1", planEnd);
                }
              }
            );
          } else if (userLogged.coaches.length > 0) {
            userLogged.coaches.map(
              (coach: { userId: string; planEnd: string }) => {
                if (coach.userId === userLocal.userId) {
                  const [month, day, year] = coach.planEnd
                    .split("/")
                    .map(Number);
                  planEnd = new Date(year, month - 1, day);
                }
              }
            );
          }

          const today = new Date();

          console.log("TODAY", today);
          console.log("PLAN End", planEnd);

          isPlanEndExpireLocal = planEnd === undefined ? true : today > planEnd;
          //if its false not expired
          console.log("isPlanEndExpireLocal", isPlanEndExpireLocal);
          if (isPlanEndExpireLocal === false && alreadyFollowing) {
            setTextStatus("In a Plan");
          }

          setPlanExpire(isPlanEndExpireLocal);
        }

        getInvitation(userBE[0].userId);

        setIsLoadingInitial(false);
      }
    }
    async function getUserByUserName() {
      if (id !== undefined) {
        const res = await getUserByUserNameBE(id);
        const userBE = res.response;
        //username will be unique i use [0] because in dev can be more than one with
        //same user name
        console.log("GET USER BY USERNNAME", userBE);
        getRatings(userBE[0].userId);
        setEmailPaypal(userBE[0].emailPaypal);
        setAboutMe(userBE[0].aboutProfile);
        setImageProfileCertificate(userBE[0]?.certificates ?? []);
        setDescriptionAboutMe(userBE[0].descriptionAboutMe);
        userLocal = userBE[0];
        setUser(userBE[0]);
        const user = userBE[0];

        const itemUUID = localStorage.getItem("UUID");
        const UUID = itemUUID ? itemUUID : "";

        const userLoggedData = await getUser();
        const userLogged = userLoggedData[0];

        let planEnd = undefined;
        let isPlanEndExpireLocal;
        if (userLogged.quitters.length > 0 || userLogged.coaches.length > 0) {
          if (userLogged.quitters.length > 0) {
            userLogged.quitters.map(
              (quitter: { userId: string; planEnd: string }) => {
                if (quitter.userId === userBE[0].userId) {
                  const [month, day, year] = quitter.planEnd
                    .split("/")
                    .map(Number);
                  planEnd = new Date(year, month - 1, day);
                  console.log("HERE2", planEnd);
                }
              }
            );
          } else if (userLogged.coaches.length > 0) {
            userLogged.coaches.map(
              (coach: { userId: string; planEnd: string }) => {
                if (coach.userId === userBE[0].userId) {
                  const [month, day, year] = coach.planEnd
                    .split("/")
                    .map(Number);
                  planEnd = new Date(year, month - 1, day);
                }
              }
            );
          }

          const today = new Date();
          isPlanEndExpireLocal = planEnd === undefined ? true : today > planEnd;
          if (isPlanEndExpireLocal === false && alreadyFollowing) {
            setTextStatus("In a Plan");
          }
          setPlanExpire(isPlanEndExpireLocal);
        }

        getInvitation(userBE[0].userId);

        //setTimeout(() => {
        setIsLoadingInitial(false);
        //}, 4000);
      }
    }

    async function getRatings(userId: string) {
      const res = await getRatingsBE(userId);
      if (res !== undefined) {
        const ratings = res.response.ratings;
        let starsCount = 0;
        ratings?.map((item: { stars: number }) => {
          starsCount += item.stars;
        });
        const avg = Math.floor((starsCount / ratings.length) * 100) / 100;
        setAvg(ratings?.length === 0 ? 0 : avg);
      }
    }

    const getMutualConnections = async () => {
      let res = await getUser();
      let mySelf = res.response;
      mySelf = mySelf[0];
      let mutualConnections = 0;
      for (let i = 0; i < mySelf.followers.length; i++) {
        for (let j = 0; j < user?.followers?.length; j++) {
          if (mySelf.followers[i].userId !== user?.followers[j].userId) {
            mutualConnections++;
          }
        }
      }
      setMutualConnections(mutualConnections);
    };

    if (isUsername === "true") {
      getUserByUserName();
    } else {
      getUserById(id);
    }
    getMutualConnections();

    //}
  }, [id, isUsername]);
  //b5bf47db-5da5-49a3-9691-63edbee9a0cb
  const createInvitation = async (typeRequest: string) => {
    const itemUUID = localStorage.getItem("UUID");
    const UUID = itemUUID ? itemUUID : "";
    const data = {
      from: UUID,
      to: user?.userId ?? "",
      userId: user?.userId ?? "",
      firstName: userCurrent?.firstName ?? "",
      lastName: userCurrent?.lastName ?? "",
      pictureFrom:
        userCurrent?.profilePicture?.split?.("/")?.[3]?.split?.("?")?.[0] ?? "",
      description: userCurrent?.descriptionAboutMe ?? "",
      aboutMe: "",
      profilePicture: "",
      descriptionAboutMe: "",
      request: "normal",
      initials: userCurrent?.initials ?? "",
      backgroundColor: userCurrent?.backgroundColor ?? "",
      date: new Date(),
    };
    const response = await createInvitationBE(data);
    const userBE = await getUser(user?.userId);
    if (userBE.response[0]?.isFollowers) {
      if (user?.os !== "android") {
        const dataPush = {
          token: user?.pushToken,
          title: `New follow request`,
          body: `@${user?.userName} wants to connect`,
          data: { isFrom: "Follow", follow: "network" },
        };
        await sendPushNotification(dataPush);
      } else {
        const pushNotification = {
          title: `New follow request`,
          body: `@${user?.userName} wants to connect`,
          data: { isFrom: "Follow", follow: "network" },
          token: user?.pushToken,
        };
        sendPushNotificationAndroid(pushNotification);
      }
    }

    const dataSocket = {
      receiver: user?.userId,
    };

    socket?.emit("send_follow_request_notification", dataSocket);
  };
  const [openModalInfo, setOpenModalInfo] = useState(false);

  const [isEnableAbout, setIsEnableAbout] = useState(false);
  const [isEnableDescriptionAboutMe, setIsEnableDescriptionAboutMe] =
    useState(false);

  const saveDescriptionAboutMe = async () => {
    setIsEnableDescriptionAboutMe(false);
    await updateDescriptionAboutMeBE({
      userId: myUserId,
      descriptionAboutMe: descriptionAboutMe,
    });
  };

  const saveAbout = async () => {
    setIsEnableAbout(false);
    await updateAboutProfileBE({ userId: myUserId, aboutProfile: aboutMe });
  };

  const [imageProfile, setImageProfile] = useState<string | null>(null);
  const [imageBackground, setImageBackground] = useState<string | null>(null);

  const pickImage = async (
    isEditingProfilePic: boolean,
    url: string,
    file: File
  ) => {
    const formData = new FormData();
    formData.append("image", file);
    if (isEditingProfilePic) {
      setImageProfile(url);
      await axios.post(
        `${API_URL}/user/uploadImageProfile/${myUserId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    } else {
      setImageBackground(url);
      await axios.post(
        `${API_URL}/user/uploadImageBackground/${myUserId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    }
  };

  const [imagesCertificate, setImageProfileCertificate] = useState<
    { image: string; fileName: string }[]
  >([]);

  const [isUploadingCertificate, setIsUploadingCertificate] = useState(false);

  const uploadPhotoCertificates = async (url: string, file: File) => {
    setIsUploadingCertificate(true);

    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(
      `${API_URL}/user/uploadImageCertificate/${myUserId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    const { image, fileName } = response.data;
    const copyImages = _.cloneDeep(imagesCertificate);
    copyImages.push({ image: image, fileName: fileName });
    setImageProfileCertificate(copyImages);

    setIsUploadingCertificate(false);
  };
console.log("LENGTH", imagesCertificate)
  useEffect(() => {
    setEnableSwitch(user?.lookingQuitters);
  }, [user]);

  const [isEnabledSwitch, setEnableSwitch] = useState<boolean>();

  const toggleSwitch = async () => {
    setEnableSwitch((prev) => {
      async function update() {
        const data = {
          userId: user?.userId,
          available: !prev,
        };
        //TODO
        await udpdateAvailableForQuittersBE(data);
      }
      update();
      return !prev;
    });
  };

  const condition =
    user?.backgroundPicture === "" || user?.backgroundPicture === undefined;
  const [openModalLogout, setOpenModalLogout] = useState(false);

  const stopFollowing = async () => {
    const itemUUID = localStorage.getItem("UUID");
    const UUID = itemUUID ? itemUUID : "";
    await stopFollowingBE(UUID, id);
    setAlreadyFollowing(false);
  };

  const removePhoto = async (isProfilePic: boolean) => {
    if (isProfilePic) {
      setImageProfile(null);
      if (user) {
        user.profilePicture = "";
        setUser(user);
      }
      await updateProfilePictureBE({
        userId: myUserId,
        profilePicture: "",
      });
    } else {
      setImageBackground(null);
      if (user) {
        user.backgroundPicture = "";
        setUser(user);
      }
      await updateBackgroundPictureBE({
        userId: myUserId,
        backgroundPicture: "",
      });
    }
  };
  const inputRef = useRef(null);

  const [openModal, setOpenModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [addOne, setAddOne] = useState(false);
  const [ratings, setRatings] = useState<IRating[]>([]);
  const [comment, setComment] = useState("");
  const sendRating = async (isInput?: boolean) => {
    setAddOne(true);
    if (rating === 0) return;
    if (isInput && comment.trim() === "") return;
    const dataLocal = {
      userId: user?.userId,
      stars: rating,
      comment,
      firstName: user?.firstName,
      lastName: user?.lastName,
      profilePicture: user?.profilePicture,
      date: "",
      initials: user?.initials ?? "",
      backgroundColor: user?.backgroundColor ?? "",
    };

    const dataBE = {
      userId: user?.userId,
      stars: rating,
      comment,
      firstName: user?.firstName,
      lastName: user?.lastName,
      profilePicture:
        user?.profilePicture?.split?.("/")?.[3]?.split?.("?")?.[0] ?? "",
      date: "",
      initials: user?.initials ?? "",
      backgroundColor: user?.backgroundColor ?? "",
    };

    setComment("");
    setRating(0);
    setRatings((prevRatings) => [...prevRatings, dataLocal]);
    await sendRatingBE(dataBE);
  };

  const [openModalInfoQuitters, setOpenModalInfoQuitters] = useState(false);
  const [emailPaypal, setEmailPaypal] = useState("");

  const savePaypalEmailUpdate = async () => {
    await updatePaypalEmail(emailPaypal, user?.userId);
  };

  const [quittersNoExpire, setQuittersNoExpire] = useState();
  useEffect(() => {
    if (user?.quitters !== undefined && user?.quitters?.length > 0) {
      let isPlanEndExpireLocal;
      let quittersNoExpireLocal = [];
      const today = new Date();

      user?.quitters?.map((item) => {
        const [month, day, year] = item.planEnd.split("/").map(Number);
        const planEndDate = new Date(year, month - 1, day);
        console.log("PLAN END", planEndDate);
        console.log("TODAY", today);
        isPlanEndExpireLocal = today > planEndDate;
        console.log("isPlanEndExpireLocal", isPlanEndExpireLocal);

        if (!isPlanEndExpireLocal) {
          quittersNoExpireLocal.push(item);
        }
      });
      setQuittersNoExpire(quittersNoExpireLocal);
    }
  }, [user]);

  const removeCertificate = async (fileName: string, index: number) => {
    setIsUploadingCertificate(true);
    const newCertificates = imagesCertificate.filter(
      (item, indexItem) => item.fileName !== fileName
    );
    setImageProfileCertificate(newCertificates);

    await removeCertificatesBE(myUserId, fileName);
    setIsUploadingCertificate(false);
  };

  const [isErrorEmail, setIsErrorEmail] = useState(false);

  const handleValidationEmail = (value: string) => {
    setEmailPaypal(value);
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (value.trim().length > 0) {
      if (regex.test(value)) {
        setIsErrorEmail(false);
      } else {
        setIsErrorEmail(true);
      }
    } else {
      setIsErrorEmail(false);
    }
  };

  const [isEnableSocial, setIsEnableSocial] = useState(false);
  const [facebookUrl, setFacebook] = useState("");
  const [instagramUrl, setInstagram] = useState("");
  const [linkedinUrl, setLinkdn] = useState("");

  useEffect(() => {
    if (user !== undefined) {
      setFacebook(user.facebookUrl);
      setInstagram(user.instagramUrl);
      setLinkdn(user.linkedinUrl);
    }
  }, [user]);
  const [showErrorSocial, setShowErrorSocial] = useState("");
  const saveSocial = async () => {
    if (!isValidFacebook && facebookUrl.length > 0) {
      return;
    }
    if (!isValidInstagram && instagramUrl.length > 0) {
      return;
    }
    if (!isValidLinkedin && linkedinUrl.length > 0) {
      return;
    }

    setIsEnableSocial(false);
    await updateSocialProfileBE({
      userId: myUserId,
      facebookUrl,
      instagramUrl,
      linkedinUrl,
    });
  };

  const [isValidFacebook, setValidFacebook] = useState<boolean | undefined>();
  const [isValidInstagram, setValidInstagram] = useState<boolean | undefined>();
  const [isValidLinkedin, setValidLinkedin] = useState<boolean | undefined>();

  const validateFacebookUrl = (url: string) => {
    setFacebook(url);
    const pattern = /^https:\/\/www\.facebook\.com\/.*/;
    const isValid = pattern.test(url);
    setValidFacebook(isValid);
  };

  const validateInstagramUrl = (url: string) => {
    setInstagram(url);
    const pattern = /^https:\/\/www\.instagram\.com\/.*/;
    const isValid = pattern.test(url);
    setValidInstagram(isValid);
  };

  const validateLinkedinUrl = (url: string) => {
    setLinkdn(url);
    const pattern = /^https:\/\/www\.linkedin\.com\/.*/;
    const isValid = pattern.test(url);
    setValidLinkedin(isValid);
  };
  const [errorMaxSize, setErrorMaxSize] = useState("");

  const checkSizeOfUserImage = (event: any) => {
    const maxSizeAllowed = 50 * 1024 * 1024;
    const file = event.target.files[0];
    const fileSizeInBytes = file.size;
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
    return { isBigger: file && file.size > maxSizeAllowed, size: fileSizeInMB };
  };

  const checkSizeOfImageFile = (event: any) => {
    const maxSizeAllowed = 50 * 1024 * 1024;
    const file = event.target.files[0];
    const fileSizeInBytes = file.size;
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
    if (file && file.size > maxSizeAllowed) {
      setErrorMaxSize(
        `Your file is ${fileSizeInMB}MB in size, while the maximum allowed size is 50MB.`
      );
      return;
    } else {
      setErrorMaxSize("");
    }

    const url = URL.createObjectURL(file);

    uploadPhotoCertificates(url, file);
  };

  return (
    <>
      {isLoadingInitial ? (
        <div className={styles.spinnerOverlay}>
          <div className={styles.spinnerContainer}></div>
        </div>
      ) : (
        <>
          {isLoadingInitial ? (
            <View
              style={{
                backgroundColor: Colors.darkGray,
                width: "100%",
                height: 200,
              }}
            ></View>
          ) : (
            <View
              style={{
                backgroundColor: Colors.darkGray,
                width: "100%",
                height: 200,
              }}
            >
              {(imageBackground !== null || user?.backgroundPicture !== "") && (
                <ImageRN
                  width={200}
                  height={200}
                  style={{ objectFit: "cover", width: "100%", height: 200 }}
                  source={{
                    uri:
                      user?.backgroundPicture !== "" && imageBackground === null
                        ? user?.backgroundPicture
                        : imageBackground,
                  }}
                  alt="background"
                />
              )}
            </View>
          )}
          
          {!isLoadingInitial && (
            <View
              style={{
                backgroundColor: Colors.white,
                height: 260,
              }}
            >
              <View
                style={{
                  position: "relative",
                  top: -70,
                  marginLeft: 20,
                  paddingHorizontal: 20,
                }}
              >
                <View>
                  <View style={{ flexDirection: "row" }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      {!isLoadingInitial && (
                        <View style={{ flexDirection: "row" }}>
                          {imageProfile !== null ||
                          (user?.profilePicture !== "" &&
                            user?.profilePicture !== undefined) ? (
                            <Image
                              alt="profilepic"
                              height={130}
                              width={130}
                              style={{
                                borderRadius: 50,
                                height: 130,
                                width: 130,
                              }}
                              src={
                                imageProfile
                                  ? imageProfile
                                  : user?.profilePicture ?? ""
                              }
                            />
                          ) : (
                            <View
                              style={{
                                height: 130,
                                width: 130,
                                borderRadius: 50,
                                backgroundColor: user?.backgroundColor,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  color: Colors.blackDefault,
                                  fontSize: 35,
                                }}
                              >
                                {user?.initials}
                              </span>
                            </View>
                          )}
                          {myUserId === user?.userId && (
                            <TouchableOpacity>
                              {!isLoadingInitial && (
                                <View
                                  style={{
                                    backgroundColor: Colors.lightGray,
                                    height: 40,
                                    width: 40,
                                    borderRadius: 50,
                                    position: "absolute",
                                    top: 0,
                                    left: -30,
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderWidth: 1,
                                    borderColor: Colors.darkGray,
                                  }}
                                >
                                  {/* {imageProfile !== "" &&
                                    imageProfile !== null && (
                                      <TouchableOpacity
                                        onPress={() => removePhoto(true)}
                                      >
                                        <CloseOutlined
                                          style={{
                                            fontSize: 25,
                                            color: Colors.blackCardDarkMode,
                                          }}
                                        />
                                      </TouchableOpacity>
                                  //   )} */}
                                  {/* // {(imageProfile === "" || */}
                                  {/* //   imageProfile === null) && ( */}
                                  <label className={styles.label}>
                                    <input
                                      onChange={(event) => {
                                        setErrorMaxSize("")
                                        const isBiggerThanAllowed =
                                          checkSizeOfUserImage(event);
                                        if (isBiggerThanAllowed.isBigger) {
                                          setErrorMaxSize(
                                            `Your file is ${isBiggerThanAllowed.size}MB in size, while the maximum allowed size is 50MB.`
                                          );
                                          return;
                                        } else {
                                          setErrorMaxSize("");
                                        }
                                        const file = event.target.files[0];
                                        const url = URL.createObjectURL(file);
                                        (event.target as HTMLInputElement).value = "";
                                        pickImage(true, url, file);
                                      }}
                                      id="file"
                                      accept="image/jpeg,image/png"
                                      name="fileToUpload"
                                      type="file"
                                    />

                                    <CameraFilled
                                      style={{
                                        fontSize: 25,
                                        color: Colors.blackCardDarkMode,
                                      }}
                                    />
                                  </label>
                                  {/* // )} */}
                                </View>
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                      {errorMaxSize.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        marginTop: 120,
                      }}
                    >
                      <span style={{ color: Colors.red }}>{errorMaxSize}</span>
                    </div>
                  )}
                      {myUserId !== user?.userId && (
                        <View>
                          <TouchableOpacity
                            onPress={() => {
                              if (textStatus === "Pending invitation") return;
                              if (isPlanEndExpire === false) {
                                return;
                              }
                              if (!alreadyFollowing) {
                                setTextStatus("Pending invitation");
                                createInvitation("normal");
                              } else if (alreadyFollowing) {
                                setTextStatus("Follow");
                                stopFollowing();
                              }
                            }}
                          >
                            {!isLoadingInitial && (
                              <View
                                style={{
                                  borderRadius: 50,
                                  backgroundColor:
                                    textStatus === "Pending invitation" ||
                                    textStatus === "In a Plan"
                                      ? Colors.success
                                      : Colors.primary,
                                  width:
                                    textStatus === "Pending invitation"
                                      ? !isPlanEndExpire
                                        ? 100
                                        : 160
                                      : 100,
                                  height: 30,
                                  justifyContent: "center",
                                  alignItems: "center",
                                  flexDirection: "row",
                                }}
                              >
                                <span
                                  style={{
                                    color: Colors.white,
                                    fontWeight: "600",
                                    fontSize: 16,
                                    textAlign: "center",
                                  }}
                                >
                                  {textStatus !== "Pending invitation" &&
                                    isPlanEndExpire === true &&
                                    alreadyFollowing &&
                                    textStatus}
                                  {textStatus !== "Pending invitation" &&
                                    isPlanEndExpire === false &&
                                    alreadyFollowing &&
                                    textStatus}
                                  {textStatus !== "Pending invitation" &&
                                    !alreadyFollowing &&
                                    textStatus}
                                  {textStatus === "Pending invitation" &&
                                    "Pending invitation"}
                                </span>
                              </View>
                            )}
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    

                    {myUserId === user?.userId && (
                      <TouchableOpacity>
                        {!isLoadingInitial && (
                          <View
                            style={{
                              backgroundColor: Colors.lightGray,
                              height: 40,
                              width: 40,
                              borderRadius: 50,
                              position: "absolute",
                              top: 50,
                              left: -30,
                              flexDirection: "row",
                              justifyContent: "center",
                              alignItems: "center",
                              borderWidth: 1,
                              borderColor: Colors.darkGray,
                            }}
                          >
                            {/* {imageBackground !== "" &&
                              imageBackground !== null && (
                                <TouchableOpacity
                                  onPress={() => removePhoto(false)}
                                >
                                  <CloseOutlined
                                    style={{
                                      fontSize: 25,
                                      color: Colors.blackCardDarkMode,
                                    }}
                                  />
                                </TouchableOpacity>
                              )} */}
                            {/* {(imageBackground === "" ||
                              imageBackground === null) && ( */}
                            <label className={styles.label}>
                              <input
                                onChange={(event) => {
                                  setErrorMaxSize("")
                                  const isBiggerThanAllowed =
                                    checkSizeOfUserImage(event);
                                  if (isBiggerThanAllowed.isBigger) {
                                    setErrorMaxSize(
                                      `Your file is ${isBiggerThanAllowed.size}MB in size, while the maximum allowed size is 50MB.`
                                    );
                                    return;
                                  } else {
                                    setErrorMaxSize("")
                                  }
                                  const file = event.target.files[0];
                                  const url = URL.createObjectURL(file);
                                  (event.target as HTMLInputElement).value = "";
                                  pickImage(false, url, file);
                                }}
                                id="file"
                                accept="image/jpeg,image/png"
                                name="fileToUpload"
                                type="file"
                              />

                              <span>
                                <CameraFilled
                                  style={{
                                    fontSize: 25,
                                    color: Colors.blackCardDarkMode,
                                  }}
                                />
                              </span>
                            </label>
                            {/* )} */}
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {!isLoadingInitial && (
                    <View
                      style={{
                        marginTop: 20,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: 23, maxWidth: 220 }}>{`${
                        user?.firstName ?? ""
                      } ${user?.lastName ?? ""}`}</span>

                      <View
                        style={{
                          marginLeft: 15,
                          backgroundColor: Colors.darkGray,
                          padding: 10,
                          borderRadius: 50,
                        }}
                      >
                        <span style={{ color: Colors.white }}>
                          {user?.type?.toLocaleUpperCase() ?? ""}
                        </span>
                      </View>
                    </View>
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                    }}
                  >
                    {!isLoadingInitial && (
                      <textarea
                        ref={inputRef}
                        value={descriptionAboutMe}
                        rows={2}
                        readOnly={!isEnableDescriptionAboutMe}
                        maxLength={60}
                        onChange={(e) => setDescriptionAboutMe(e.target.value)}
                        style={{
                          borderRadius: 8,
                          marginLeft: 0,
                          width: 600,
                          fontSize: 16,
                          marginRight: 15,
                          border: "none",
                          resize: "none",
                          outline: isEnableDescriptionAboutMe
                            ? `inherit`
                            : "none",
                        }}
                      />
                    )}
                    {myUserId === user?.userId && (
                      <View style={{ position: "absolute", right: 0 }}>
                        {!isEnableDescriptionAboutMe && (
                          <TouchableOpacity
                            onPress={() => {
                              inputRef.current.focus();
                              setIsEnableDescriptionAboutMe(true);
                            }}
                          >
                            {!isLoadingInitial && (
                              <EditIcon
                                style={{
                                  color: Colors.blackDefault,
                                  fontSize: 25,
                                }}
                              />
                            )}
                          </TouchableOpacity>
                        )}

                        {isEnableDescriptionAboutMe && (
                          <TouchableOpacity
                            onPress={() => {
                              if (
                                descriptionAboutMe.length === 0 ||
                                emailPaypal.length === 0
                              )
                                return;
                              saveDescriptionAboutMe();
                              savePaypalEmailUpdate();
                            }}
                          >
                            <span
                              style={{
                                fontSize: 17,
                                color:
                                  descriptionAboutMe.length === 0
                                    ? Colors.darkGray
                                    : Colors.blackDefault,
                              }}
                            >
                              Done{" "}
                            </span>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                  {!isLoadingInitial && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginVertical: 10,
                      }}
                    >
                      <StarFilled style={{ color: "#FFD700", fontSize: 25 }} />
                      <span style={{ fontSize: 18, fontWeight: "600" }}>
                        {avg.toFixed(1)}/5
                      </span>
                      {user?.userId !== userCurrent?.userId && (
                        <TouchableOpacity onPress={() => setOpenModal(true)}>
                          <View
                            style={{
                              marginLeft: 10,
                              borderRadius: 50,
                              backgroundColor: "gold",
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                            }}
                          >
                            <span style={{ color: Colors.black }}>Rate</span>
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  {user?.type === "coach" && myUserId === user?.userId && (
                    <>
                      <View style={{ width: 155 }}>
                        <span>Your PayPal email: </span>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          width: 820,
                        }}
                      >
                        <textarea
                          ref={inputRef}
                          value={emailPaypal}
                          readOnly={!isEnableDescriptionAboutMe}
                          maxLength={55}
                          rows={1}
                          onChange={(e) =>
                            handleValidationEmail(e.target.value)
                          }
                          style={{
                            borderRadius: 8,
                            marginLeft: 0,
                            width: 540,
                            fontSize: 19,
                            marginRight: 15,
                            position: "relative",
                            border: "none",
                            resize: "none",
                            outline: isEnableDescriptionAboutMe
                              ? `inherit`
                              : "none",
                          }}
                        />
                        {isErrorEmail && (
                          <span style={{ color: Colors.red }}>
                            Invalid email format
                          </span>
                        )}
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>
          )}
          {user?.type === "coach" && myUserId === user?.userId && (
            <>
              <View
                style={{
                  marginTop: 10,
                  backgroundColor: Colors.white,
                  paddingHorizontal: 20,
                  paddingVertical: 20,
                }}
              >
                <span
                  style={{
                    paddingHorizontal: 20,
                    fontSize: 25,
                    color: Colors.blackCardDarkMode,
                  }}
                >
                  Coaching
                </span>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 10,
                  }}
                >
                  {quittersNoExpire !== undefined &&
                    quittersNoExpire?.length > 0 && (
                      <View
                        style={{
                          backgroundColor: Colors.primary,
                          padding: 5,
                          borderRadius: 50,
                          flexDirection: "row",
                          width: "auto",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: 10,
                          marginLeft: 23,
                          paddingLeft: 10,
                          paddingRight: 10,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => setOpenModalInfoQuitters(true)}
                          style={{
                            width: "100%",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            display: "flex",
                          }}
                        >
                          <span style={{ color: Colors.white, marginRight: 5 }}>
                            {quittersNoExpire?.length} Coaching
                          </span>

                          {quittersNoExpire?.length > 0 && (
                            <OpenInNewIcon
                              style={{ color: Colors.white, fontSize: 25 }}
                            />
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginLeft: user.quitters.length === 0 ? 40 : 0,
                      marginTop: 19,
                    }}
                  >
                    <span style={{ marginRight: 10, fontWeight: "600" }}>
                      Total earned:
                    </span>
                    <span
                      style={{
                        color: Colors.success,
                        fontWeight: "600",
                        fontSize: 20,
                      }}
                    >
                      ${Number(user.totalEarned ?? 0).toFixed(2)}
                    </span>
                  </View>
                </View>
              </View>
            </>
          )}

          <View
            style={{
              marginTop: 10,
              backgroundColor: Colors.white,
              paddingHorizontal: 20,
              paddingVertical: 20,
            }}
          >
            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 20,
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    paddingHorizontal: 20,
                    fontSize: 25,
                    color: Colors.blackCardDarkMode,
                  }}
                >
                  About
                </span>
                {myUserId === user?.userId && (
                  <View>
                    {!isEnableAbout && (
                      <TouchableOpacity onPress={() => setIsEnableAbout(true)}>
                        <EditIcon
                          style={{ color: Colors.blackDefault, fontSize: 25 }}
                        />
                      </TouchableOpacity>
                    )}
                    {isEnableAbout && (
                      <TouchableOpacity onPress={saveAbout}>
                        <span style={{ fontSize: 17 }}>Done</span>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
              {myUserId === user?.userId && isEnableAbout && (
                <View style={{ marginTop: 15 }}>
                  <textarea
                    value={aboutMe}
                    readOnly={!isEnableAbout}
                    maxLength={1000}
                    rows={30}
                    onChange={(e) => setAboutMe(e.target.value)}
                    placeholder={`Tell us a little about yourself and your interests.`}
                    style={{
                      borderRadius: 8,
                      marginLeft: 20,
                      fontSize: 19,
                      color: isEnableAbout
                        ? Colors.blackCardDarkMode
                        : Colors.darkGray,
                      border: "none",
                      resize: "none",
                      outline: isEnableDescriptionAboutMe ? `inherit` : "none",
                    }}
                  />
                </View>
              )}
              {!isEnableAbout && aboutMe?.length > 0 && (
                <div style={{ textAlign: "justify" }}>{aboutMe}</div>
              )}
            </View>
          </View>

          {user?.type === "coach" && (
            <View
              style={{
                marginTop: 10,
                backgroundColor: Colors.white,
                paddingHorizontal: 20,
                paddingVertical: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    paddingLeft: 20,
                    paddingRight: 20,
                    fontSize: 25,
                    color: Colors.blackCardDarkMode,
                  }}
                >
                  Social Media
                </span>
                {myUserId === user?.userId && (
                  <View>
                    {!isEnableSocial && (
                      <TouchableOpacity onPress={() => setIsEnableSocial(true)}>
                        <EditIcon name="edit" style={{ fontSize: 24 }} />
                      </TouchableOpacity>
                    )}
                    {isEnableSocial && (
                      <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity
                          style={{ marginRight: 15 }}
                          onPress={() => {
                            setValidFacebook(undefined);
                            setValidInstagram(undefined);
                            setValidLinkedin(undefined);
                            setShowErrorSocial("");
                            // setFacebook("");
                            // setInstagram("");
                            // setLinkdn("");
                            setShowErrorSocial("");
                            setIsEnableSocial(false);
                          }}
                        >
                          <CloseIcon style={{ fontSize: 24 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={saveSocial}>
                          <span
                            style={{
                              fontSize: 17,
                            }}
                          >
                            Save
                          </span>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
              {!isEnableSocial &&
                facebookUrl?.length == 0 &&
                instagramUrl?.length == 0 &&
                linkedinUrl?.length == 0 && (
                  <View style={{ marginHorizontal: 20, marginTop: 15 }}>
                    <span
                      style={{
                        color: "rgba(0,0,0,0.3)",
                        fontSize: 18,
                      }}
                    >
                      Not information provided.
                    </span>
                  </View>
                )}
              {!isEnableSocial && (
                <View
                  style={{
                    flexDirection: "row",
                    marginHorizontal: 0,
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                >
                  {facebookUrl?.length > 0 && (
                    <TouchableOpacity
                      style={{ marginLeft: 20 }}
                      onPress={() => (window.location.href = facebookUrl)}
                    >
                      <FacebookIcon
                        style={{ fontSize: 40, color: Colors.darkGray }}
                      />
                    </TouchableOpacity>
                  )}
                  {instagramUrl?.length > 0 && (
                    <TouchableOpacity
                      style={{ marginLeft: 20 }}
                      onPress={() => (window.location.href = instagramUrl)}
                    >
                      <InstagramIcon
                        style={{ fontSize: 40, color: Colors.darkGray }}
                      />
                    </TouchableOpacity>
                  )}
                  {linkedinUrl.length > 0 && (
                    <TouchableOpacity
                      style={{ marginLeft: 20 }}
                      onPress={() => (window.location.href = linkedinUrl)}
                    >
                      <LinkedInIcon
                        style={{ fontSize: 40, color: Colors.darkGray }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {myUserId === user?.userId && isEnableSocial && (
                <>
                  <View>
                    <TextInput
                      value={facebookUrl}
                      multiline
                      autoCapitalize="none"
                      placeholder="Put your Facebook profile URL"
                      editable={isEnableSocial}
                      maxLength={500}
                      onChangeText={validateFacebookUrl}
                      style={{
                        borderRadius: 8,
                        marginLeft: 20,
                        marginTop: 20,
                        maxWidth: 600,
                        fontSize: 19,
                        outline: "none",
                      }}
                    />
                  </View>
                  {isValidFacebook === false && (
                    <span
                      style={{
                        marginLeft: 18,
                        marginTop: 10,
                        marginBottom: 10,
                        color: Colors.red,
                        fontSize: 12,
                      }}
                    >
                      The url should start with https://www.facebook.com/
                    </span>
                  )}
                  <View>
                    <TextInput
                      value={instagramUrl}
                      multiline
                      autoCapitalize="none"
                      placeholder="Put your Instagram profile URL"
                      editable={isEnableSocial}
                      maxLength={500}
                      onChangeText={validateInstagramUrl}
                      style={{
                        borderRadius: 8,
                        marginLeft: 20,
                        maxWidth: 600,
                        fontSize: 19,
                        outline: "none",
                      }}
                    />
                  </View>
                  {isValidInstagram === false && (
                    <span
                      style={{
                        marginLeft: 18,
                        marginTop: 10,
                        marginBottom: 10,
                        color: Colors.red,
                        fontSize: 12,
                      }}
                    >
                      The url should start with https://www.instagram.com/
                    </span>
                  )}
                  <View>
                    <TextInput
                      value={linkedinUrl}
                      multiline
                      autoCapitalize="none"
                      placeholder="Put your Linkedin profile URL"
                      editable={isEnableSocial}
                      maxLength={500}
                      onChangeText={validateLinkedinUrl}
                      style={{
                        borderRadius: 8,
                        marginLeft: 20,
                        maxWidth: 600,
                        fontSize: 19,
                        outline: "none",
                      }}
                    />
                  </View>
                  {isValidLinkedin === false && (
                    <span
                      style={{
                        marginLeft: 18,
                        marginTop: 10,
                        marginBottom: 10,
                        color: Colors.red,
                        fontSize: 12,
                      }}
                    >
                      The url should start with https://www.linkedin.com/
                    </span>
                  )}
                </>
              )}
            </View>
          )}

          {myUserId !== user?.userId && imagesCertificate.length > 0 && (
            <View
              style={{
                marginTop: 10,
                backgroundColor: Colors.white,
                paddingHorizontal: 20,
                paddingVertical: 20,
              }}
            >
              <span
                style={{
                  paddingHorizontal: 20,
                  fontSize: 25,
                  color: Colors.blackCardDarkMode,
                }}
              >
                Certificates
              </span>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                  marginHorizontal: 20,
                  marginVertical: 20,
                }}
              >
                {imagesCertificate.map((image, index) => {
                  return (
                    <View key={index}>
                      <TouchableOpacity>
                        <View
                          key={index}
                          style={{
                            marginRight: 30,
                            marginBottom:
                              index === imagesCertificate.length - 1 ? -20 : 30,
                            flexBasis: "60%",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Image
                            height={170}
                            width={250}
                            alt="image"
                            style={{ height: 170, width: 250 }}
                            src={image.image}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {myUserId === user?.userId && user?.type === "coach" && (
            <View
              style={{
                marginTop: 10,
                backgroundColor: Colors.white,
                paddingHorizontal: 20,
                paddingVertical: 20,
              }}
            >
              <span
                style={{
                  paddingHorizontal: 20,
                  fontSize: 25,
                  color: Colors.blackCardDarkMode,
                }}
              >
                Certificates
              </span>
              {imagesCertificate.length < 3 && (
                <View
                  style={{
                    flexDirection: "row",
                    marginHorizontal: 20,
                    marginTop: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      borderRadius: 8,
                      marginRight: 15,
                      borderColor: Colors.primary,
                      borderWidth: 1,
                      paddingHorizontal: 15,
                      paddingVertical: 10,
                    }}
                  >
                    <View>
                      <label className={styles.label}>
                        <input
                          onChange={(event) => {
                            if (isUploadingCertificate) {
                              return;
                            }
                            checkSizeOfImageFile(event);
                            (event.target as HTMLInputElement).value = "";
                          }}
                          id="file"
                          accept="image/jpeg,image/png"
                          name="fileToUpload"
                          type="file"
                        />
                        <span style={{ color: Colors.primary }}>
                          {isUploadingCertificate
                            ? "Uplading..."
                            : "Upload Photo"}
                        </span>
                      </label>
                    </View>
                  </View>
                </View>
              )}
              {errorMaxSize.length > 0}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 20,
                }}
              >
                <span style={{ color: Colors.red }}>{errorMaxSize}</span>
              </div>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                  marginHorizontal: 20,
                  marginVertical: 20,
                }}
              >
                {imagesCertificate.map((image, index) => {
                  return (
                    <View key={index}>
                      <View
                        key={index}
                        style={{
                          marginRight: 30,
                          marginBottom:
                            index === imagesCertificate.length - 1 ? -20 : 30,
                          flexBasis: "60%",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Image
                          height={400}
                          width={500}
                          style={{
                            height: 400,
                            width: 500,
                            objectFit: "cover",
                          }}
                          src={image.image}
                          alt="image"
                        />
                      </View>
                      <View
                        style={{
                          elevation: 4,
                          zIndex: 4,
                          position: "absolute",
                          top: 60,
                          right: -50,
                          backgroundColor: Colors.lightGray,
                          height: 40,
                          width: 40,
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: 50,
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            if (isUploadingCertificate) return;
                            removeCertificate(image.fileName, index);
                          }}
                        >
                          <DeleteIcon
                            style={{ fontSize: 24, color: Colors.red }}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {followersConnections?.length > 0 && (
            <View
              style={{
                marginTop: 10,
                backgroundColor: Colors.white,
                paddingHorizontal: 20,
                paddingVertical: 20,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <span
                  style={{
                    paddingHorizontal: 20,
                    fontSize: 25,
                    color: Colors.blackCardDarkMode,
                    marginBottom: 15,
                  }}
                >
                  Connections
                  <span style={{ fontSize: 19 }}>
                    {" "}
                    ({followersConnections?.length})
                  </span>
                </span>
              </View>
              <View>
                <Connections
                  data={followersConnections}
                  myUserId={myUserId}
                  user={user}
                  userNameOrUserId={id}
                  isUserName={isUsername === "true" ? true : false}
                />
              </View>
            </View>
          )}
          <View
            style={{
              marginTop: 10,
              backgroundColor: Colors.white,
              paddingBottom: 40,
            }}
          >
            <ProfilePosts user={user} />
          </View>
        </>
      )}
      <Modal
        open={openModal}
        className={styles.modalRate}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className={styles.containerModalRate}>
          <>
            <View>
              <View
                style={{
                  backgroundColor: Colors.white,
                  paddingTop: 20,
                  paddingBottom: 20,
                }}
              >
                <Rating
                  addOne={addOne}
                  setAddOne={setAddOne}
                  ratings={ratings}
                  rating={rating}
                  setRating={setRating}
                />
              </View>
              <div className={styles.containerRatingsComments}>
                <View style={{ marginTop: 10 }}>
                  {ratings.map((item, index) => {
                    const counterArray = [];
                    for (let i = 0; i < item.stars; i++) {
                      counterArray.push(i);
                    }

                    return (
                      <View
                        key={index}
                        style={{
                          backgroundColor: Colors.white,
                          marginBottom: 10,
                          paddingBottom: 20,
                        }}
                      >
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <View
                              style={{
                                borderRadius: 50,
                                height: 50,
                                width: 50,
                              }}
                            >
                              {item.profilePicture !== "" &&
                              item.profilePicture !== undefined ? (
                                <Image
                                  src={item.profilePicture}
                                  width={50}
                                  height={50}
                                  alt="profile pic"
                                  style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 50,
                                    marginLeft: 9,
                                  }}
                                />
                              ) : (
                                <View
                                  style={{
                                    height: 50,
                                    width: 50,
                                    borderRadius: 50,
                                    backgroundColor: item.backgroundColor,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginLeft: 9,
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
                          </View>

                          <View
                            style={{
                              flexDirection: "row",
                              marginBottom: 15,
                            }}
                          >
                            <View
                              style={{ flexDirection: "row", marginLeft: 15 }}
                            >
                              <span>{`${item.firstName} ${item.lastName}`}</span>
                            </View>
                            {counterArray.map((item, index) => (
                              <>
                                <StarFilled
                                  style={{ marginLeft: 30, color: "#FFD700" }}
                                />
                              </>
                            ))}
                          </View>
                        </View>
                        <View style={{ marginLeft: 65 }}>
                          <span
                            style={{
                              fontSize: 17,
                              maxWidth: 340,
                              position: "relative",
                              top: "-13px",
                            }}
                          >
                            {item.comment}
                          </span>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </div>
            </View>

            <View
              style={{
                backgroundColor: "white",
                paddingHorizontal: 15,
                paddingBottom: 35,
                paddingTop: 25,
                borderTopWidth: 1,
                borderTopColor: "gray",
                position: "relative",
                top: 0,
              }}
            >
              <span
                style={{
                  color: Colors.darkGray,
                  position: "relative",
                  top: "-10px",
                  textAlign: "center",
                  fontSize: 16,
                }}
              >
                Choose a star and write a review
              </span>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  position: "relative",
                  top: "5px",
                }}
              >
                <View
                  style={{
                    borderRadius: 50,
                    height: 50,
                    width: 50,
                    marginRight: 10,
                  }}
                >
                  {user?.profilePicture !== "" &&
                  user?.profilePicture !== undefined ? (
                    <Image
                      src={user?.profilePicture}
                      width={50}
                      height={50}
                      alt="profile pic"
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 50,
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        height: 50,
                        width: 50,
                        borderRadius: 50,
                        backgroundColor: user?.backgroundColor,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{ color: Colors.blackDefault, fontSize: 16 }}
                      >
                        {user?.initials}
                      </span>
                    </View>
                  )}
                </View>
                <View
                  style={{
                    height: 40,
                    width: "85%",
                    borderColor: "gray",
                    borderWidth: 1,
                    paddingHorizontal: 10,
                    borderRadius: 50,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <TextInput
                    value={comment}
                    onChangeText={setComment}
                    placeholder={`Select your rate and add comment`}
                    style={{ width: 600 }}
                  />
                  <TouchableOpacity onPress={() => sendRating(true)}>
                    <span
                      style={{ color: Colors.primary, zIndex: 3, opacity: 1 }}
                    >
                      Rate
                    </span>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        </div>
      </Modal>

      <Modal
        className={styles.modalQuittersInfo}
        open={openModalInfoQuitters}
        onClose={() => setOpenModalInfoQuitters(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className={styles.containerModalQuittersInfo}>
          <InfoQuitters user={user} />
        </div>
      </Modal>
    </>
  );
};

export default ProfilePage;
