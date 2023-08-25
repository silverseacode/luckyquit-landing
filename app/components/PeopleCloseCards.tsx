import { View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { User } from "@/models";
import { Colors } from "@/app/colors";
import { useRouter } from "next/navigation";
import Image from "next/image";
interface IProps {
  data: User[];
  isFollowing: string[];
  user: User | undefined;
  createInvitation: (person: User) => void;
}

const PeopleCloseCards = ({
  data,
  isFollowing,
  user,
  createInvitation,
}: IProps) => {
  const [indexHasMany, setIndexHowMany] = useState(4);

  const showFiveMoreCity = () => {
    setIndexHowMany((prev) => prev + 4);
  };
  console.log(11,data)
  const maxToShow = 50;
  const condition = indexHasMany <= data.length || indexHasMany > maxToShow;
  const router = useRouter();
  return (
        <View style={{ backgroundColor: Colors.white }}>
          {data
            .filter((item, index) => {
              return index < indexHasMany;
            })
            .filter((item) => item.userId !== user?.userId)
            .filter((item) => {
              if (user?.following && user?.following?.length > 0) {
                user?.following?.map((followingUser) => {
                  if (followingUser.userId !== item.userId) {
                    return item;
                  }
                });
              } else {
                return item;
              }
            }).length > 0 && (
            <View style={{ padding: 20, paddingLeft: 25 }}>
              <span style={{ fontSize: 17, fontWeight: "600" }}>
                {user?.type === "coach" ? "Quitters" : "Coaches"}
              </span>
            </View>
          )}
      
          <View>
            <View style={{ flexDirection: "row", marginLeft: 11, flexWrap: "wrap" }}>
              {data
                .filter((item, index) => {
                  return index < indexHasMany;
                })
                .filter((item) => item.userId !== user?.userId)
                .filter((item) => {
                  if (user?.following && user?.following?.length > 0) {
                    user?.following?.map((followingUser) => {
                      if (followingUser.userId !== item.userId) {
                        return item;
                      }
                    });
                  } else {
                    return item;
                  }
                })
                .map((person, index) => {
                  return (
                    <View
                      key={index}
                      style={{
                        flexBasis: "31.7%",
                        paddingHorizontal: 5,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: Colors.lightGray,
                        borderRadius: 8,
                        padding: 20,
                        margin: 5,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                       
                          router.push(`/profile/${person.userId}/false`)
                        }
                      >
                        {person.profilePicture !== "" && person.profilePicture !== undefined ? (
                          <Image
                          alt="profile pic"
                          height={80}
                          width={80}
                            style={{ height: 80, width: 80, borderRadius: 50 }}
                            src={person.profilePicture }
                          />
                        ) : (
                          <View
                            style={{
                              height: 80,
                              width: 80,
                              borderRadius: 50,
                              backgroundColor: person.backgroundColor,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ color: Colors.blackDefault, fontSize: 16 }}>
                              {person.initials}
                            </span>
                          </View>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          router.push(`/profile/${person.userId}/false`)
                        }
                      >
                        <span style={{ fontWeight: "600", fontSize: 16, marginTop: 5 }}>
                          {`${person.firstName} ${person.lastName}`}
                        </span>
                      </TouchableOpacity>
                      <span  style={{ color: Colors.darkGray, marginTop: 5, textAlign: "center", fontSize: 14 }}>
                        {person.descriptionAboutMe}
                      </span>
                      <TouchableOpacity
                        onPress={() => {
                          router.push(`/profile/${person.userId}/false`)
                          //createInvitation(person);
                        }}
                      >
                        <View
                          style={{
                            borderRadius: 50,
                            borderWidth:isFollowing.some((item) => item === person.userId)
                            ? 0
                            : 1,
                          borderColor: isFollowing.some((item) => item === person.userId)
                            ? "unset"
                            : Colors.blue,
                          width: 120,
                          height: 30,
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: 10,
                          flexDirection: "row",
                        }}
                      >
                        {/* {isFollowing.some((item) => item === person.userId) && (
                          // <AntDesign
                          //   name='check'
                          //   size={20}
                          //   color={Colors.darkGray}
                          // />
                          // TODO
                        )} */}
    
                        <span
                          style={{
                            color: isFollowing.some((item) => item === person.userId)
                              ? Colors.darkGray
                              : Colors.blue,
                            fontWeight: "600",
                            fontSize: 16,
                            marginLeft: 5,
                          }}
                        >
                          {/* {isFollowing.some((item) => item === person.userId)
                              ? "Pending"
                              : "Connect"} */}
                          See Profile
                        </span>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
          </View>
          {condition && (
            <TouchableOpacity onPress={() => showFiveMoreCity()}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 15,
                }}
              >
                <span
                  style={{ color: Colors.blue, fontSize: 18, fontWeight: "600" }}
                >
                  Show 4 more
                </span>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
  );
};

export default PeopleCloseCards