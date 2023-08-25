import { getUser } from "@/helpers/users";
import { Module, User } from "@/models";
import { useEffect, useState } from "react";

import { TouchableOpacity, View, TextInput, Pressable } from "react-native";
import RadioButton from "./RadioButton";
import { Colors } from "@/app/colors";
import { getByQuitterIdAndCoachId } from "@/helpers/modules";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  RightCircleOutlined,
} from "@ant-design/icons";
import styles from "../components/homework.module.css";
import Image from "next/image";
import ModulesAndExercisesFullScreen from "./ModulesAndExercisesFullScreen";
import NoPhotographyIcon from "@mui/icons-material/NoPhotography";
const Homework = () => {
  const [currentDay, setCurrentDay] = useState(1);

  const [days, setDays] = useState("30");

  const [inputValues, setInputValues] = useState<Module>({
    "1": [
      {
        title: "",
        short: "",
        thumb: "",
        day: 1,
        fullDescription: "",
        uploadedImage: "",
        video: "",
        youTubeId: "",
      },
    ],
  });
  const [inputValuesEx, setInputValuesEx] = useState<Module>({
    "1": [
      {
        title: "",
        short: "",
        thumb: "",
        day: 1,
        fullDescription: "",
        uploadedImage: "",
        video: "",
        youTubeId: "",
      },
    ],
  });

  const [coachs, setCoachs] = useState<TypeUser[]>([]);
  const [coachSelected, setSelectedCoach] = useState("");

  const [userCoach, setUserCoach] = useState<User>();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getModules() {
      setIsLoading(true);
      const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : "";
      const res = await getUser(UUID);
      const userDb = res.response;
      const userMySelf: User = userDb[0];
      //uuid en este caso va ahacer lo mismo que quitterUserId

      setCoachs(userMySelf.coaches.length > 0 ? userMySelf.coaches : []);
      setSelectedCoach(userMySelf.coaches[0].userId);
      const userCoachLocal = await getUser(userMySelf.coaches[0].userId);
      setUserCoach(userCoachLocal[0]);

      //get modules by quitterId and CoachId ,
      // the first [0] coach id initit selected and ia get that one here
      console.log("COACH ID", userMySelf.coaches[0].userId);
      const res1 = await getByQuitterIdAndCoachId(
        UUID,
        userMySelf.coaches[0].userId
      );
      console.log("RES1", res1);
      if (res1 !== undefined) {
        const modules = res1.reponse;
        console.log("MODULESs", modules);
        if (modules?.module !== null && modules?.module !== undefined) {
          setDays(modules.module.totalDays ?? 0);
          setInputValues(modules.module.modules ?? []);
          setInputValuesEx(modules.module.exercises ?? []);
        }
      }
    }
    setIsLoading(false);

    getModules();
  }, []);

  useEffect(() => {
    async function getModules() {
      if (coachSelected !== "") {
        setIsLoading(true);
        const userCoachLocal = await getUser(coachSelected);
        setUserCoach(userCoachLocal[0]);
        const itemUUID = localStorage.getItem("UUID");
        const UUID = itemUUID ? itemUUID : "";
        //here i get by quitterid and coach id , the coach id the one selected
        const res = await getByQuitterIdAndCoachId(UUID, coachSelected);
        if (res !== undefined) {
          const modules = res.response;
          console.log(3, modules);
          console.log(
            "Object.values(modules.module).length",
            Object.values(modules.module).length
          );
          if (
            modules.module.length > 0 ||
            Object.values(modules.module).length > 0
          ) {
            setDays(modules.module.totalDays);
            setInputValues(modules.module.modules);
            setInputValuesEx(modules.module.exercises);
          } else {
            setInputValues({});
            setInputValuesEx({});
          }
        }
      }

      setIsLoading(false);
    }
    getModules();
  }, [coachSelected]);

  const handleRedirectionToChat = async () => {
    //navigation.navigate("ChatRoom", { receiver: userCoach });
  };

  const LoadingState = () => {
    // return (
    //   <View
    //     style={{
    //       justifyContent: "center",
    //       alignItems: "center",
    //       height: "100%",
    //     }}
    //   >
    //     <Animated.View
    //       style={{
    //         transform: [{ rotate: spin }],
    //         left: -15,
    //         top: 5,
    //         flexDirection: "row",
    //         justifyContent: "center",
    //       }}
    //     >
    //       <ActivityIndicator
    //         style={{ position: "absolute", top: 20 }}
    //         size="large"
    //         color={Colors.black}
    //       />
    //     </Animated.View>
    //   </View>
    // );
  };

  const [valueModuleSelected, saveValueModule] = useState({
    value: {
      title: "",
      short: "",
      thumb: "",
      day: 1,
      uploadedImage: "",
      video: "",
      youTubeId: "",
      fullDescription: "",
    },
    index: -1,
  });

  const [showFull, setShowFull] = useState(false);

  const [allInputValuesVar, setAllInputValues] = useState();
  useEffect(() => {
    let allInputValues = [];
    Object.values(inputValues).map((item) => {
      item.map((item1) => {
        console.log("ITEM1234", item1);
        allInputValues.push(item1);
      });
    });
    setAllInputValues(allInputValues);
  }, [inputValues]);

  const [allInputValuesExVar, setAllInputValuesEx] = useState();

  useEffect(() => {
    let allInputValuesEx = [];
    Object.values(inputValuesEx).map((item) => {
      item.map((item1) => {
        allInputValuesEx.push(item1);
      });
    });

    setAllInputValuesEx(allInputValuesEx);
  }, [inputValuesEx]);

  return (
    <div className={styles.container}>
      {!showFull && (
        <>
          {!isLoading && (
            <View
              style={{
                backgroundColor: Colors.white,
                height: "100%",
                paddingBottom: 100,
              }}
            >
              <View style={{ backgroundColor: Colors.white, height: "100%" }}>
                {!isLoading && (
                  <div>
                    <View style={{ padding: 20, flexDirection: "row" }}>
                      {/* <AntDesign name="infocirlceo" size={24} color="black" /> */}
                      <span
                        style={{
                          fontSize: 18,
                          color: Colors.darkGray,
                          marginLeft: 10,
                        }}
                      >
                        This plan has {days} {Number(days) > 1 ? "tasks" : "task"}
                      </span>
                    </View>
                    {coachs.length > 0 && (
                      <>
                        {currentDay === 1 && (
                          <>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 20,
                                marginHorizontal: 20,
                              }}
                            >
                              <span style={{ fontSize: 18 }}>
                                {"\u2022"} For which of your coaches would you
                                like to see the modules?
                              </span>
                            </View>
                            <View style={{ marginBottom: 20 }}>
                              {coachs?.map(
                                (
                                  item: { fullName: string; userId: string },
                                  index
                                ) => {
                                  return (
                                    <TouchableOpacity
                                      key={index}
                                      onPress={() =>
                                        setSelectedCoach(item.userId)
                                      }
                                    >
                                      <RadioButton
                                        active={coachSelected === item.userId}
                                        label={`${item.fullName}`}
                                        width="100%"
                                        paddingVertical={15}
                                      />
                                    </TouchableOpacity>
                                  );
                                }
                              )}
                            </View>
                          </>
                        )}
                      </>
                    )}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 30,
                      }}
                    >
                      <span style={{ fontSize: 20, fontWeight: "600" }}>
                      Task Nº {currentDay}
                      </span>
                    </View>
                    {inputValues?.[currentDay]?.length > 0 && (
                      <View style={{ padding: 20, marginBottom: -20 }}>
                        <span style={{ fontSize: 20 }}>{"\u2022"} Modules</span>
                      </View>
                    )}
                    <View>
                      {allInputValuesVar
                        ?.filter((item) => {
                          if (String(item.day) === String(currentDay)) {
                            console.log("ITEMDAY", item);
                            return item;
                          }
                        })
                        .map((value, index) => {
                          return (
                            <>
                              <View
                                style={{
                                  marginTop: 20,
                                  flexDirection: "row",
                                  borderWidth: 1,
                                  borderColor: Colors.darkGray,
                                }}
                              >
                                {value.thumb !== "" &&
                                value.thumb !== undefined ? (
                                  <Image
                                    src={value.thumb}
                                    height={100}
                                    width={100}
                                    style={{
                                      height: 100,
                                      width: 100,
                                      backgroundColor: Colors.lightGray,
                                    }}
                                    alt="thumb"
                                  />
                                ) : (
                                  <View
                                    style={{
                                      backgroundColor: Colors.lightGray,
                                      height: 100,
                                      width: 100,
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    <NoPhotographyIcon
                                      style={{ fontSize: 40 }}
                                    />
                                  </View>
                                )}

                                <View style={{ marginLeft: 15, width: "95%" }}>
                                  <View
                                    style={{
                                      marginTop: 20,
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                      width: "65%",
                                    }}
                                  >
                                    <TextInput
                                      editable={false}
                                      style={{ fontSize: 20, width: "90%" }}
                                      value={value.title}
                                      numberOfLines={1}
                                    />
                                  </View>
                                  <View
                                    style={{
                                      marginTop: 10,
                                      width: "80%",
                                      flexDirection: "row",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <TextInput
                                      editable={false}
                                      style={{ fontSize: 20, width: "87%" }}
                                      value={value.short}
                                      numberOfLines={1}
                                    />
                                    <TouchableOpacity
                                      onPress={async () => {
                                        setShowFull(true);
                                        saveValueModule({ value, index });
                                      }}
                                    >
                                      <RightCircleOutlined
                                        style={{
                                          color: Colors.primary,
                                          fontSize: 28,
                                        }}
                                      />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              </View>
                            </>
                          );
                        })}
                    </View>
                    {inputValuesEx?.[currentDay]?.length > 0 && (
                      <View style={{ padding: 20, marginBottom: -20 }}>
                        <span style={{ fontSize: 20 }}>
                          {"\u2022"} Exercises
                        </span>
                      </View>
                    )}

                    <View>
                      {allInputValuesExVar
                        ?.filter((item) => {
                          if (String(item.day) === String(currentDay)) {
                            return item;
                          }
                        })
                        .map((value, index) => {
                          return (
                            <>
                              <View
                                style={{
                                  marginTop: 20,
                                  flexDirection: "row",
                                  borderWidth: 1,
                                  borderColor: Colors.darkGray,
                                }}
                              >
                                {value.thumb !== "" &&
                                value.thumb !== undefined ? (
                                  <Image
                                    src={value.thumb}
                                    width={100}
                                    height={100}
                                    alt="thumb"
                                    style={{
                                      height: 100,
                                      width: 100,
                                      backgroundColor: Colors.lightGray,
                                    }}
                                  />
                                ) : (
                                  <View
                                    style={{
                                      backgroundColor: Colors.lightGray,
                                      height: 100,
                                      width: 100,
                                      justifyContent: "center",
                                      alignItems: "center",
                                    }}
                                  >
                                    <NoPhotographyIcon
                                      style={{ fontSize: 40 }}
                                    />
                                  </View>
                                )}

                                <View style={{ marginLeft: 15, width: "95%" }}>
                                  <View
                                    style={{
                                      marginTop: 20,
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                      width: "65%",
                                    }}
                                  >
                                    <TextInput
                                      editable={false}
                                      style={{ fontSize: 20, width: "90%" }}
                                      value={value.title}
                                      numberOfLines={1}
                                    />
                                  </View>
                                  <View
                                    style={{
                                      marginTop: 10,
                                      width: "80%",
                                      flexDirection: "row",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <TextInput
                                      editable={false}
                                      style={{ fontSize: 20, width: "87%" }}
                                      value={value.short}
                                      numberOfLines={1}
                                    />
                                    <TouchableOpacity
                                      onPress={async () => {
                                        setShowFull(true);
                                        saveValueModule({ value, index });
                                      }}
                                    >
                                      <RightCircleOutlined
                                        style={{
                                          color: Colors.primary,
                                          fontSize: 28,
                                        }}
                                      />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              </View>
                            </>
                          );
                        })}
                    </View>
                  </div>
                )}
              </View>
              {!isLoading && (
                <>
                  {days !== "0" && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        paddingHorizontal: 20,
                        paddingBottom: 10,
                        borderTopColor:
                          Number(days) > 1 ? Colors.blackDefault : Colors.white,
                        borderTopWidth: 1,
                      }}
                    >
                      {currentDay - 1 > 0 ? (
                        <View
                          style={{
                            position: "relative",
                            top: 0,
                            paddingTop: 15,
                          }}
                        >
                          <Pressable
                            onPress={() => setCurrentDay(currentDay - 1)}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <ArrowLeftOutlined
                              style={{
                                color: Colors.blackCardDarkMode,
                                fontSize: 20,
                                marginRight: 15,
                              }}
                            />
                            <span style={{ fontSize: 16 }}>
                              Go to previous task
                            </span>
                          </Pressable>
                        </View>
                      ) : (
                        <View></View>
                      )}
                      {currentDay + 1 <= Number(days) && (
                        <View
                          style={{
                            position: "relative",
                            top: 0,
                            paddingTop: 15,
                          }}
                        >
                          <Pressable
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            onPress={() => setCurrentDay(currentDay + 1)}
                          >
                            <span style={{ fontSize: 16 }}>Go to next task</span>
                            <ArrowRightOutlined
                              style={{
                                color: Colors.blackCardDarkMode,
                                fontSize: 20,
                                marginLeft: 15,
                              }}
                            />
                          </Pressable>
                        </View>
                      )}
                    </View>
                  )}
                </>
              )}
            </View>
          )}
        </>
      )}
      {isLoading && (
        <>
          <div className={styles.spinnerOverlay}>
            <div className={styles.spinnerContainer}></div>
          </div>
        </>
      )}
      <>
        {showFull && (
          <div style={{ background: Colors.white }}>
            <ArrowLeftOutlined
              onClick={() => setShowFull(false)}
              style={{ fontSize: 30, padding: 15 }}
            />
            <ModulesAndExercisesFullScreen
              title={valueModuleSelected.value.title}
              short={valueModuleSelected.value.short}
              index={0}
              isExerciseShow={false}
              videoUploaded={valueModuleSelected.value.video}
              uploadedImage={valueModuleSelected.value.uploadedImage}
              fullDescripion={valueModuleSelected.value.fullDescription}
              youTubeId={valueModuleSelected.value.youTubeId}
              isModuleShow={false}
              isViewFromHomeWork={true}
              handleSaveVideo={() => console.log()}
              handleSaveVideoId={() => console.log()}
              handleInputChangeFull={() => console.log()}
              handleInputChangeShort={() => console.log()}
              handleInputChangeTitle={() => console.log()}
              handleSaveUploadedImage={() => console.log()}
            />
          </div>
        )}
      </>
    </div>
  );
};

export default Homework;
