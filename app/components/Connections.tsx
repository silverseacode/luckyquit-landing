import { Colors } from "@/app/colors";
import { User } from "@/models";
import { View, TouchableOpacity, Dimensions, TextInput } from "react-native";
import { useRouter } from 'next/navigation'
import Image from "next/image";
import { useEffect, useState } from "react";
import { Modal } from "@mui/material";
import styles from "../components/connections.module.css";
import { SearchOutlined } from "@ant-design/icons";
interface IProps {
  data: User[];
  myUserId: string;
  userNameOrUserId: string;
  isUserName: boolean;
  user: User | undefined
}

const Connections = ({
  data,
  myUserId,
  userNameOrUserId,
  isUserName,
  user
}: IProps) => {
  const router = useRouter();
  const [openModal, setOpenModalConnections] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const handleChangeSearch = async (value: string) => {
    setSearchTerm(value);
  };

  function getFullName(person: { firstName: string; lastName: string }) {
    return `${person.firstName} ${person.lastName}`;
  }
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: data.length < 3 ? "flex-start" : "center",
          flexWrap: "wrap",
        }}
      >
        {data
          .map((person) => {
            return (
              <View
                key={person.userId}
                style={{
                  flexBasis: "30%",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 8,
                  margin: 5,
                  marginBottom: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    router.push(`/profile/${person.userId}/${isUserName}`);
                  }}
                >
                  {person.profilePicture !== "" &&
                  person.profilePicture !== undefined ? (
                    <Image
                      style={{ height: 130, width: 130, borderRadius: 8, objectFit: "cover" }}
                      height={80}
                      width={115}
                      src={person.profilePicture }
                      alt="profile picture"
                    />
                  ) : (
                    <View
                      style={{
                        height: 130,
                        width: 130,
                        backgroundColor: person.backgroundColor,
                        justifyContent: "center",
                        alignItems: "center",
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                      }}
                    >
                      <span
                        style={{ color: Colors.blackDefault, fontSize: 19 }}
                      >
                        {person.initials}
                      </span>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push(`/profile/${person.userId}/false`)}
                >
                  <span
                    style={{
                      fontWeight: "600",
                      fontSize: 16,
                      marginTop: 10,
                      marginBottom: 10,
                    }}
                  >
                    {`${person.firstName} ${person.lastName}`}
                  </span>
                </TouchableOpacity>
              </View>
            );
          })}
        
      </View>
      {data.length > 0 && (
          <TouchableOpacity onPress={() => setOpenModalConnections(true)}>
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  marginLeft: 0,
                  marginRight: 0,
                  paddingTop: 15,
                  color: Colors.primary,
                  textAlign: "center",
                }}
              >
                See all connections
              </span>
            </View>
          </TouchableOpacity>
        )}
      <Modal
        open={openModal}
        className={styles.modal}
        onClose={() => setOpenModalConnections(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className={styles.containerModal}>
          <View>
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
              <SearchOutlined
                style={{
                  position: "relative",
                  left: -60,
                  top: 35,
                  fontSize: 25,
                }}
              />
            </View>
            {data
              .filter(
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
              .map((item, index) => {
                item.mutualConnections = 0;
                if (item.following && user?.following) {
                  for (let i = 0; i < item.following.length; i++) {
                    for (let j = 0; j < user?.following?.length; j++) {
                      if (
                        item.following[i].userId === user?.following[j].userId
                      ) {
                        item.mutualConnections++;
                      }
                    }
                  }
                }
                return (
                  <View
                    key={index}
                    style={{
                      marginHorizontal: 20,
                      width: "90%",
                      backgroundColor: Colors.white,
                      paddingLeft: 20,
                      marginTop: 20,
                      borderRadius: 8,
                      padding: 20,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>{
                        router.push(`/profile/${item.userId}/false`);
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <View>
                          {item.profilePicture !== "" && item.profilePicture !== undefined ? (
                            <Image
                              style={{
                                height: 60,
                                width: 60,
                                borderRadius: 50,
                              }}
                              height={60}
                              width={60}
                              alt="profile picture"
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
                        <span
                          style={{
                            marginLeft: 10,
                            fontSize: 17,
                            color: Colors.blue,
                          }}
                        >{`@${item.userName}`}</span>
                      </View>
                      {item.mutualConnections > 0 && (
                        <View style={{ marginLeft: 70, marginTop: -10 }}>
                          <span style={{ color: Colors.darkGray }}>
                            {item.mutualConnections} mutual connections
                          </span>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
          </View>
        </div>
      </Modal>
    </>
  );
};

export default Connections