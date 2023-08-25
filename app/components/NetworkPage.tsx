import { View, TextInput, TouchableOpacity } from "react-native";
import RadioButton from "./RadioButton";
import { Colors } from "@/app/colors";
import { useEffect, useState } from "react";
import {
  getUser,
  getUsersLookingForCoachBE,
  getUsersLookingForQuittersBE,
} from "@/helpers/users";
import { Coach, User } from "@/models";
import {
  acceptInvitationBE,
  createInvitationBE,
  followBE,
  getBySearch,
  getCoachsBE,
  getInvitationsBE,
  rejectInvitationBE,
} from "@/helpers/followers";
import PeopleCloseCards from "./PeopleCloseCards";
import RecommendedForYou from "./RecommendedForYou";
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Modal } from "@mui/material";
import styles from "./network.module.css";
import GroupIcon from "@mui/icons-material/Group";
import { useRouter } from "next/navigation";
import { useSocket } from "../Context/store";
import Image from "next/image";
import {
  sendPushNotification,
  sendPushNotificationAndroid,
} from "@/helpers/notifications";
import mixpanel from "mixpanel-browser";

const NetworkPage = () => {
  const socket = useSocket();
  console.log("000 EL SOCKET", socket);
  const [isFollowing, setIsFollowing] = useState<string[]>([]);

  useEffect(() => {
    const dataSocket = {
      userId: user?.userId,
    };
    if (socket !== undefined) {
      socket?.emit("follow_request_read", dataSocket);
    }
  }, [socket]);

  const [searchTerm, setSearchTerm] = useState("");
  const [resultsSearch, setResultSearch] = useState([]);

  const [active, setActiveRadio] = useState("all");

  const handleChangeSearch = async (value: string) => {
    setSearchTerm(value);
    if (value.trim() !== "") {
      const data = await getBySearch(value, active);
      console.log("Search", data);
      if (data !== undefined) {
        setResultSearch(data.response);
      }
    }
  };

  const [invitations, setInvitations] = useState([]);
  const [byCity, setByCity] = useState([]);
  const [coachs, setCoachs] = useState([]);

  const [acceptedInvitationMessage, setAcceptedMessage] = useState("");
  const [usersRecommendation, setUsersRecommendation] = useState<User[]>([]);

  useEffect(() => {
    async function getInvitations() {
      const res = await getUser();
      const userDb = res.response;
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : "";
      console.log(1234, UUID);
      const res1 = await getInvitationsBE(UUID);
      const data = res1.response;
      console.log("data", data);
      const invitationsFiltered = data.invitations.filter(
        (item: { status: string; from: string }) =>
          item.status === "pending" && item.from !== userDb[0]?.userId
      );
      setInvitations(invitationsFiltered);
      console.log("USSER", userDb[0].userId);
      setUser(userDb[0]);

      if (userDb[0].type === "coach") {
        const data = await getUsersLookingForCoachBE();
        console.log(123, data);
        setUsersRecommendation(data.response.users);
      } else {
        const data = await getUsersLookingForQuittersBE();
        setUsersRecommendation(data.response.users);
      }
    }

    async function getCoachs() {
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : "";
      console.log("UU", UUID);
      const data = await getCoachsBE(UUID);
      console.log("DA", data);
      setCoachs(data.response.users);
    }

    getInvitations();
    //getByCity();
    getCoachs();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      handleChangeSearch(searchTerm);
    }
  }, [active]);
  const [receiverUserId, setReceiverUserId] = useState("");
  const acceptInvitation = async (
    index: number,
    invitationId: number,
    userId: string,
    from: string,
    fullName: string
  ) => {
    setReceiverUserId(userId);
    const updatedInvitations = invitations.filter(
      (item: { _id: number }, indexItem) => item._id !== invitationId
    );
    setInvitations(updatedInvitations);
    await acceptInvitationBE(invitationId, userId, from);
    const data = {
      userId: userId,
      userIdFrom: from,
    };
    setAcceptedMessage(fullName);

    await followBE(data);
    mixpanel.track("Accepted invitation connect web");
  };
  const [user, setUser] = useState<User>();

  const rejectInvitation = async (index: number, invitationId: number) => {
    const updatedInvitations = invitations.filter(
      (item: { _id: number }, indexItem) => item._id !== invitationId
    );

    const invitationsToModify = invitations.filter(
      (item: { _id: number }, indexItem) => item._id === invitationId
    );

    setInvitations(updatedInvitations);
    await rejectInvitationBE(
      invitationId,
      invitationsToModify[0].userId,
      invitationsToModify[0].from
    );
    mixpanel.track("Rejected invitation connect web");
  };
  const condition = invitations.filter(
    (item: { from: string; status: string }) =>
      item.status === "pending" && item.from !== user?.userId
  );
  const hasInvitations = condition.length > 0;


  const createInvitation = async (person: User) => {
    const currentUser = await getUser();
    //const user = await getUser(person.userId);
    const itemUUID = localStorage.getItem("UUID");
    const UUID = itemUUID ? itemUUID : "";
    const data = {
      from: UUID,
      to: person.userId,
      userId: person.userId,
      firstName: currentUser[0].firstName,
      lastName: currentUser[0].lastName,
      pictureFrom:
        currentUser[0].profilePicture?.split("/")?.[3].split?.("?")[0] ?? "",
      description: currentUser[0].descriptionAboutMe,
      aboutMe: "",
      profilePicture: "",
      descriptionAboutMe: "",
      request: "normal",
      initials: currentUser[0].initials,
      backgroundColor: currentUser[0].backgroundColor,
      date: new Date(),
    };
    setIsFollowing([...isFollowing, person.userId]);

    await createInvitationBE(data);
    if (user?.isFollowers) {
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
  };

  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();
  const [users, setUsers] = useState([]);
  useEffect(() => {
    async function getUsersLookingForCoach() {
      const data = await getUsersLookingForCoachBE();
      setUsers(data.response.users);
    }

    async function getUsersLookingForQuitters() {

      const data = await getUsersLookingForQuittersBE();
      setUsers(data.response.users);
    }

    if (user?.type === "coach") {
      getUsersLookingForCoach();
    }

    if (user?.type === "quitter") {
      getUsersLookingForQuitters();
    }
  }, [user]);
  
  return (
    <>
      <View
        style={{
          backgroundColor: Colors.white,
          padding: 20,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <TextInput
            style={{
              width: "100%",
              backgroundColor: Colors.lightGray,
              color: Colors.blackCardDarkMode,
              height: 50,
              paddingLeft: 20,
              borderRadius: 20,
            }}
            value={searchTerm}
            onChangeText={(value) => {
              console.log("entroo");
              handleChangeSearch(value);
            }}
            placeholder="Search"
          />

          <SearchOutlined
            style={{
              position: "relative",
              color: Colors.blackCardDarkMode,
              left: -40,
              top: 13,
              fontSize: 25,
            }}
          />
        </View>
        <View style={{ flexDirection: "row", marginTop: 15 }}>
          <TouchableOpacity onPress={() => setActiveRadio("coach")}>
            <View>
              <RadioButton
                label="Coach's"
                active={active === "coach"}
                hasBorder={false}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveRadio("quitter")}>
            <View>
              <RadioButton
                label="Quitter's"
                active={active === "quitter"}
                hasBorder={false}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveRadio("all")}>
            <View>
              <RadioButton
                label="All"
                active={active === "all"}
                hasBorder={false}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {searchTerm.length > 0 ? (
        <View style={{ backgroundColor: Colors.white, paddingRight: 20 }}>
          {resultsSearch?.map(
            (
              result: {
                firstName: string;
                lastName: string;
                profilePicture: string;
                userId: string;
                descriptionAboutMe: string;
                initials: string;
                backgroundColor: string;
              },
              index
            ) => {
              return (
                <View
                  key={`${result.firstName} ${result.lastName} ${index}`}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      mixpanel.track("Clicked on user after search web");
                      router.push(`/profile/${result.userId}/false`);
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <SearchOutlined
                        style={{ fontSize: 25, marginRight: 20 }}
                      />
                      {result.profilePicture !== "" && result.profilePicture !== undefined ? (
                        <Image
                          height={30}
                          width={30}
                          alt="profile pic"
                          style={{
                            height: 30,
                            width: 30,
                            borderRadius: 50,
                            marginRight: 10,
                          }}
                          src={result.profilePicture}
                        />
                      ) : (
                        <View
                          style={{
                            height: 30,
                            width: 30,
                            borderRadius: 50,
                            marginRight: 10,
                            backgroundColor: result.backgroundColor,
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
                            {result.initials}
                          </span>
                        </View>
                      )}
                      <span
                        style={{ marginRight: 20, maxWidth: 400 }}
                      >{`${result.firstName} ${result.lastName}`}</span>
                      <span style={{ color: Colors.darkGray, maxWidth: 180 }}>
                        {result.descriptionAboutMe}
                      </span>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }
          )}
        </View>
      ) : (
        <>
          {user?.type === "coach" && (
            <TouchableOpacity
              onPress={() => {
                setOpenModal(true);
                mixpanel.track("Clicked on actively looking users web");
              }}
            >
              <View
                style={{
                  backgroundColor: Colors.white,
                  marginTop: 10,
                  marginBottom: 10,
                  flexDirection: "row",
                  padding: 20,
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 17 }}>
                  More Quitters to Connect
                </span>
                <ArrowRightOutlined
                  style={{ fontSize: 25, color: Colors.primary }}
                />
              </View>
            </TouchableOpacity>
          )}
          {user?.type === "quitter" && (
            <TouchableOpacity onPress={() => setOpenModal(true)}>
              <View
                style={{
                  backgroundColor: Colors.white,
                  marginTop: 10,
                  marginBottom: 10,
                  flexDirection: "row",
                  padding: 20,
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 17 }}>
                  More Coaches to connect
                </span>
                <ArrowRightOutlined
                  style={{ fontSize: 25, color: Colors.primary }}
                />
              </View>
            </TouchableOpacity>
          )}
          <View
            style={{
              backgroundColor: Colors.white,
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            <View
              style={{
                paddingLeft: 15,
                marginBottom: 20,
                borderBottomWidth: 1,
                borderBottomColor: Colors.lightGray,
              }}
            >
              <View style={{ padding: 10 }}>
                <span
                  style={{
                    color: Colors.primary,
                    fontWeight: "600",
                    fontSize: 18,
                  }}
                >
                  Invitations
                </span>
              </View>
            </View>
            <View>
              {acceptedInvitationMessage.length > 0 && (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      marginLeft: 25,
                      paddingVertical: 10,
                      marginTop: -20,
                    }}
                  >
                    <span
                      style={{ fontSize: 15, maxWidth: 500 }}
                      // eslint-disable-next-line @next/next/no-html-link-for-pages
                    >
                      {`${acceptedInvitationMessage} is now a connection, send a`}{" "}
                      <a style={{ textDecoration: "none" }} href="/messages">
                        message
                      </a>
                    </span>
                  </View>
                </>
              )}
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.lightGray,
                }}
              >
                {invitations.map(
                  (
                    invitation: {
                      firstName: string;
                      lastName: string;
                      description: string;
                      mutualConnections: number;
                      pictureFrom: string;
                      from: string;
                      to: string;
                      _id: number;
                      userId: string;
                      initials: string;
                      backgroundColor: string;
                    },
                    index: number
                  ) => {
                    return (
                      <>
                        <View
                          key={invitation._id}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 20,
                            justifyContent: "space-between",
                            marginRight: 25,
                          }}
                        >
                          <View
                            style={{
                              marginHorizontal: 20,
                              flexDirection: "row",
                            }}
                          >
                            <TouchableOpacity
                              onPress={() =>
                                router.push(`/profile/${invitation.from}/false`)
                              }
                            >
                              {invitation.pictureFrom !== "" && invitation.pictureFrom !== undefined ? (
                                <View>
                                  <Image
                                    height={60}
                                    width={60}
                                    alt="picture from"
                                    style={{
                                      height: 60,
                                      width: 60,
                                      borderRadius: 50,
                                    }}
                                    src={invitation.pictureFrom}
                                  />
                                </View>
                              ) : (
                                <View
                                  style={{
                                    height: 60,
                                    width: 60,
                                    borderRadius: 50,
                                    backgroundColor: invitation.backgroundColor,
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
                                    {invitation.initials}
                                  </span>
                                </View>
                              )}
                            </TouchableOpacity>
                            <View style={{ marginLeft: 10, marginTop: 10 }}>
                              <TouchableOpacity
                                onPress={() =>
                                  router.push(
                                    `/profile/${invitation.from}/false`
                                  )
                                }
                              >
                                <View style={{ marginBottom: 5 }}>
                                  <span style={{ fontWeight: "600" }}>
                                    {`${invitation.firstName} ${invitation.lastName}`}
                                  </span>
                                </View>
                              </TouchableOpacity>
                              <View style={{ marginBottom: 5, maxWidth: 180 }}>
                                <span style={{ color: Colors.darkGray }}>
                                  {invitation.description}
                                </span>
                              </View>
                              {/* {invitation.mutualConnections > 0 && (
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  
                                  <span
                                    style={{
                                      color: Colors.darkGray,
                                      marginLeft: 5,
                                    }}
                                  >
                                    {invitation.mutualConnections} mutual{" "}
                                    {invitation.mutualConnections > 1
                                      ? "connections"
                                      : "connection"}
                                  </span>
                                </View>
                              )} */}
                              {/* <View
                                style={{
                                  backgroundColor: Colors.primary,
                                  width: 150,
                                  paddingVertical: 10,
                                  paddingHorizontal: 15,
                                  borderRadius: 50,
                                  position: "relative",
                                  top: 10,
                                }}
                              >
                                <span style={{ color: Colors.white }}>
                                  Coaching Request
                                </span>
                              </View> */}
                            </View>
                          </View>

                          <View
                            style={{ flexDirection: "row", marginLeft: 40 }}
                          >
                            <TouchableOpacity
                              onPress={() =>
                                rejectInvitation(index, invitation._id)
                              }
                            >
                              <View>
                                <CloseCircleOutlined
                                  style={{
                                    color: Colors.darkGray,
                                    fontSize: 30,
                                  }}
                                />
                              </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() =>
                                acceptInvitation(
                                  index,
                                  invitation._id,
                                  invitation.userId,
                                  invitation.from,
                                  `${invitation.firstName} ${invitation.lastName}`
                                )
                              }
                            >
                              <View>
                                <CheckCircleOutlined
                                  style={{
                                    fontSize: 30,
                                    marginLeft: 12,
                                    color: Colors.primary,
                                  }}
                                />
                              </View>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </>
                    );
                  }
                )}
                {!hasInvitations && (
                  <View
                    style={{
                      alignItems: "center",
                      paddingBottom: 15,
                      justifyContent: "center",
                      paddingTop: 20,
                    }}
                  >
                    <span style={{ fontSize: 17 }}>
                      You don't have any follower request
                    </span>
                  </View>
                )}
              </View>
            </View>
          </View>
          {usersRecommendation?.length > 0 && (
            <View
              style={{
                marginTop: 0,
              }}
            >
              <PeopleCloseCards
                user={user}
                createInvitation={(person: User) => createInvitation(person)}
                isFollowing={isFollowing}
                data={usersRecommendation}
              />
            </View>
          )}

          {/* {coachs?.length > 0 && (
            <View>
              <RecommendedForYou
                createInvitation={(person: Coach) => createInvitation(person)}
                data={coachs}
              />
            </View>
          )} */}
        </>
      )}
      <Modal
        className={styles.modal}
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className={styles.containerModal}>
          <>
            <View>
              {users?.map((item: User, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      width: "99%",
                      backgroundColor: Colors.white,
                      paddingLeft: 20,
                      borderRadius: 8,
                      padding: 20,
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.lightGray,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <TouchableOpacity
                        onPress={async () => {
                          router.push(`/profile/${item.userId}/false`);
                        }}
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <View>
                          {item.profilePicture !== "" &&
                          item.profilePicture !== undefined ? (
                            <Image
                              alt="profile pic"
                              height={60}
                              width={60}
                              style={{
                                height: 60,
                                width: 60,
                                borderRadius: 50,
                              }}
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
                        <span
                          style={{ marginLeft: 10, fontSize: 17 }}
                        >{`${item.firstName} ${item.lastName}`}</span>
                      </TouchableOpacity>
                      <span
                        style={{
                          marginLeft: 10,
                          fontSize: 17,
                          color: Colors.darkGray,
                        }}
                      >{`@${item.userName}`}</span>
                    </View>
                  </View>
                );
              })}
              {users?.length === 0 && (
                <View
                  style={{
                    justifyContent: "center",
                    marginTop: 200,
                    alignItems: "center",
                    marginHorizontal: 40,
                  }}
                >
                  <GroupIcon style={{ color: Colors.primary, fontSize: 60 }} />
                  <span
                    style={{ textAlign: "center", marginTop: 40, fontSize: 20 }}
                  >
                    {user?.type === "coach"
                      ? "For the moment there is no actives user looking for coaching."
                      : "For the moment there are not coaches available to receive new quitters."}
                  </span>
                </View>
              )}
            </View>
          </>
        </div>
      </Modal>
    </>
  );
};

export default NetworkPage;
