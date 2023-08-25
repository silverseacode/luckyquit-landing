import { TouchableOpacity, View} from "react-native";
import { useEffect, useState } from "react";
import { Coach } from "@/models";
import { getUser } from "@/helpers/users";
import { Colors } from "@/app/colors";
import { getInvitationsByUserIdAndFrom } from "@/helpers/invitations";
import { createInvitationBE, stopFollowingBE } from "@/helpers/followers";
import { Grid } from "@mui/material";
import { useRouter } from "next/navigation";
import Image from "next/image";
interface IProps {
  coach: Coach;
}

const FollowCard = ({ coach }: IProps) => {
  const [statusFollow, setStatusFollow] = useState<string>("rejected");

  const getStatusUserId = async () => {
    const itemUUID = localStorage.getItem("UUID");
    const UUID = itemUUID ? itemUUID : "";
    const invitationsUserId = await getInvitationsByUserIdAndFrom(
      coach.userId,
      UUID
    );
    const invitation = invitationsUserId?.response.invitation;
    setStatusFollow(invitation.status);
  };

  const stopFollowing = async () => {
    const itemUUID = localStorage.getItem("UUID");
    const UUID = itemUUID ? itemUUID : "";
    await stopFollowingBE(UUID, coach.userId);
    getStatusUserId();
  };

  const createInvitation = async () => {
    const currentUser = await getUser();
    const user = await getUser(coach.userId);
    const itemUUID = localStorage.getItem("UUID");
    const UUID = itemUUID ? itemUUID : "";
    const data = {
      from: UUID,
      to: coach.userId,
      userId: coach.userId,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      pictureFrom: currentUser.profilePicture?.split('/')[3]?.split?.("?")[0] ?? "",
      description: currentUser.descriptionAboutMe,
      aboutMe: "",
      profilePicture: "",
      descriptionAboutMe: "",
      request: "normal",
      initials: currentUser[0].initials,
      backgroundColor: currentUser[0].backgroundColor,
      date: new Date()
    };
    const res= await createInvitationBE(data);
    if (res.response.success === "ok") {
      await getStatusUserId();
    }
    // if (user?.isFollowers) {
    //   if (user?.os !== "android") {
    //     const dataPush = {
    //       token: user?.pushToken,
    //       title: `New follow request`,
    //       body: `@${user?.userName} wants to connect`,
    //       data: { isFrom: "Follow", follow: "network" },
    //     };
    //     await sendPushNotification(dataPush);
    //   } else {
    //     const pushNotification = {
    //       title: `New follow request`,
    //       body: `@${user?.userName} wants to connect`,
    //       data: { isFrom: "Follow", follow: "network" },
    //       token: user?.pushToken,
    //     };
    //     sendPushNotificationAndroid(pushNotification);
    //   }
    // }
  };
  const router = useRouter();
  return (
    <Grid item xs={6}>
    <View
      style={{
        borderWidth: 1,
        borderColor: Colors.lightGray,
        marginHorizontal: 15,
        borderRadius: 20,
        paddingBottom: 20,
        marginBottom: 20,

      }}
    >
      <View>
        <View
          style={{
            backgroundColor: Colors.lightGray,
            width: "100%",
            height: 70,
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,
          }}
        ></View>
      </View>

      <View
        style={{
          backgroundColor: Colors.white,
          paddingHorizontal: 20,
        }}
      >
        <>
          <TouchableOpacity
            onPress={() =>
              router.push(`/profile/${coach.userId}/false`)
            }
          >
            <View>
              {coach.profilePicture !== "" ? (
                <Image
                height={80}
                width={80}
                alt="profile picture"
                  style={{
                    height: 80,
                    width: 80,
                    borderRadius: 50,
                    top: -45,
                    position: "absolute",
                  }}
                  src={coach.profilePicture }
                />
              ) : (
                <View
                  style={{
                    height: 80,
                    width: 80,
                    borderRadius: 50,
                    backgroundColor: coach.backgroundColor,
                    justifyContent: "center",
                    alignItems: "center",
                    top: -45,
                    position: "absolute",
                  }}
                >
                  <span style={{ color: Colors.blackDefault, fontSize: 16 }}>
                    {coach.initials}
                  </span>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View style={{ marginTop: 50 }}>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/profile/${coach.userId}/false`)
                }
              >
                <span style={{ fontWeight: "600", fontSize: 17 }}>
                  {`${coach.firstName} ${coach.lastName}`}
                </span>
              </TouchableOpacity>

              <span
                style={{
                  color: Colors.darkGray,
                  fontSize: 17,
                  marginTop: 5,
                }}
              >
                {coach.descriptionAboutMe}
              </span>
              {/* <span
                style={{
                  color: Colors.darkGray,
                  fontSize: 17,
                  marginTop: 5,
                }}
              >
                {coach.followers.length}{" "}
                {coach.followers.length > 1 ? "followers" : "follower"}
              </span> */}
            </View>
            <TouchableOpacity
              style={{ zIndex: 3, elevation: 3 }}
              onPress={() => {
                
              router.push(`/profile/${coach.userId}/false`)
                // if (statusFollow === "rejected") {
                //   console.log("ENTRO TOUCHABLE");
                //   createInvitation();
                // } else if (statusFollow === "accepted") {
                //   stopFollowing();
                // }
              }}
            >
              <View
                style={{
                  borderRadius: 50,
                  height: 30,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 10,
                  backgroundColor:
                    statusFollow === "pending"
                      ? Colors.success
                      : Colors.primary,
                      width: statusFollow === "pending" ? 160 : 100,
                }}
              >
                <span
                  style={{
                    color: Colors.white,
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  {/* {statusFollow === "accepted" && "Following"}
                  {statusFollow === "rejected" && "Follow"}
                  {statusFollow === "pending" && "Pending invitation"} */}
                  See Profile
                </span>
              </View>
            </TouchableOpacity>
          </View>
        </>
      </View>
    </View>
    </Grid>
  );
};

export default FollowCard