"use client";
import { Colors } from "@/app/colors";
import {
  View,
  Pressable,
  TextInput,
  Text,
  TouchableOpacity,
} from "react-native";
import RadioButton from "../components/RadioButton";
import { Module, TypeUser, User } from "@/models";
import { useEffect, useRef, useState } from "react";
import { getUser } from "@/helpers/users";
import {
  sendNotification,
  sendPushNotification,
  sendPushNotificationAndroid,
} from "@/helpers/notifications";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  InfoCircleFilled,
  MinusSquareFilled,
  SaveFilled,
  WarningFilled,
} from "@ant-design/icons";
import AddBoxIcon from "@mui/icons-material/AddBox";
import _ from "lodash";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import styles from "./modulesAndExercises.module.css";
import ModulesAndExercisesFullScreen from "./ModulesAndExercisesFullScreen";
import {
  getByQuitterNullAndCoachIdBE,
  getModulesAndExercisesByQuitterUserId,
  getModulesAndExercisesByQuitterUserIdWithS3,
} from "@/helpers/modules";
import { Alert, Modal, Snackbar } from "@mui/material";
import { API_URL } from "@/config";
import axios from "axios";
import { useSocket } from "../Context/store";
import Image from "next/image";
import mixpanel from "mixpanel-browser";
import dynamic from "next/dynamic";
import { v4 as uuidv4 } from "uuid";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface IProps {
  user: User | undefined;
  setShowModules: (value: boolean) => void;
}

const ModulesAndExercises = ({ user, setShowModules }: IProps) => {
  const socket = useSocket();
  const [days, setDays] = useState("1");
  const [currentDay, setCurrentDay] = useState(1);
  const handleDaysChange = (value: string) => {
    const regex = /^[0-9]+$/;
    const sanitizedText = value.replace(/[^0-9]/g, "").replace(regex, "$&");
    setDays(sanitizedText);
    setCurrentDay(1);
  };

  const [openModalSubmit, setOpenModalSubmit] = useState(false);
  const [inputValues, setInputValues] = useState<Module>();
  const [inputValuesEx, setInputValuesEx] = useState<Module>();
  const [openToast, setOpenToast] = useState(false);
  const [openToastSuccess, setOpenToastSuccess] = useState(false);

  const addModule = () => {
    const copyInputValues = _.cloneDeep(inputValues) ?? {};
    const newData = {
      title: "",
      short: "",
      thumb: "",
      thumbLocal: "",
      fullDescription: "",
      uploadedImage: "",
      uploadedImageLocal: "",
      video: "",
      videoLocal: "",
      youTubeId: "",
      day: currentDay,
    };
    if (!copyInputValues[currentDay]) {
      copyInputValues[currentDay] = [];
    }
    copyInputValues[currentDay].push(newData);
    setInputValues(copyInputValues);
  };
  const [pushTokenQuitter, setPushTokenQuitter] = useState("");
  const [osQuitter, setOsQuitter] = useState("");
  const [fullNameQuitter, setFullNameQuitter] = useState("");
  useEffect(() => {
    async function getQuitterPushToken() {
      const quitterBE = await getUser(user?.userId);
      setPushTokenQuitter(quitterBE[0]?.pushToken ?? "");
      setOsQuitter(quitterBE[0]?.os ?? "");
      setFullNameQuitter(
        `${quitterBE?.[0]?.firstName} ${quitterBE?.[0]?.lastName}`
      );
    }
    getQuitterPushToken();
  });

  const addExercise = () => {
    const copyInputValues = _.cloneDeep(inputValuesEx) ?? {};
    const newData = {
      title: "",
      short: "",
      thumb: "",
      thumbLocal: "",
      fullDescription: "",
      uploadedImage: "",
      uploadedImageLocal: "",
      video: "",
      videoLocal: "",
      youTubeId: "",
      day: currentDay,
    };
    if (!copyInputValues[currentDay]) {
      copyInputValues[currentDay] = [];
    }
    copyInputValues[currentDay].push(newData);
    setInputValuesEx(copyInputValues);
  };

  const handleInputChangeTitle = (
    text: string,
    index: number,
    isEx: boolean
  ) => {
    console.log("INDE", index);
    if (!isEx) {
      const newValues = _.cloneDeep(inputValues) ?? {};
      newValues[currentDay][index].title = text;
      newValues[currentDay][index].day = currentDay;
      setInputValues(newValues);
    } else {
      const newValues = _.cloneDeep(inputValuesEx) ?? {};
      newValues[currentDay][index].title = text;
      newValues[currentDay][index].day = currentDay;
      setInputValuesEx(newValues);
    }
  };

  const handleInputChangeFull = (
    text: string,
    index: number,
    isEx: boolean
  ) => {
    if (!isEx) {
      const newValues = _.cloneDeep(inputValues) ?? {};
      newValues[currentDay][index].fullDescription = text;
      newValues[currentDay][index].day = currentDay;
      setInputValues(newValues);
    } else {
      const newValues = _.cloneDeep(inputValuesEx) ?? {};
      newValues[currentDay][index].fullDescription = text;
      newValues[currentDay][index].day = currentDay;
      setInputValuesEx(newValues);
    }
  };

  const handleInputChangeShort = (
    text: string,
    index: number,
    isEx: boolean
  ) => {
    if (!isEx) {
      const newValues = _.cloneDeep(inputValues) ?? {};
      newValues[currentDay][index].short = text;
      newValues[currentDay][index].day = currentDay;
      setInputValues(newValues);
    } else {
      const newValues = _.cloneDeep(inputValuesEx) ?? {};
      newValues[currentDay][index].short = text;
      newValues[currentDay][index].day = currentDay;
      setInputValuesEx(newValues);
    }
  };

  const handleSaveVideoId = (text: string, index: number, isEx: boolean) => {
    if (!isEx) {
      const newValues = _.cloneDeep(inputValues) ?? {};
      newValues[currentDay][index].youTubeId = text;
      newValues[currentDay][index].day = currentDay;
      setInputValues(newValues);
    } else {
      const newValues = _.cloneDeep(inputValuesEx) ?? {};
      newValues[currentDay][index].youTubeId = text;
      newValues[currentDay][index].day = currentDay;
      setInputValuesEx(newValues);
    }
  };

  const handleSaveVideo = (event: any, index: number, isEx: boolean) => {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    if (!isEx) {
      const newValues = _.cloneDeep(inputValues) ?? {};
      newValues[currentDay][index].videoLocal = url;
      newValues[currentDay][index].video = file;
      newValues[currentDay][index].day = currentDay;
      setInputValues(newValues);
    } else {
      const newValues = _.cloneDeep(inputValuesEx) ?? {};
      newValues[currentDay][index].video = file;
      newValues[currentDay][index].videoLocal = url;
      newValues[currentDay][index].day = currentDay;
      setInputValuesEx(newValues);
    }
  };

  const handleSaveUploadedImage = async (
    event: any,
    index: number,
    isEx: boolean
  ) => {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    console.log("333 is ex upload", isEx);
    if (!isEx) {
      const newValues = _.cloneDeep(inputValues) ?? {};
      newValues[currentDay][index].uploadedImage = file;
      newValues[currentDay][index].uploadedImageLocal = url;
      newValues[currentDay][index].day = currentDay;
      console.log(
        "333 newValues[currentDay][index].uploadedImageLocal",
        newValues[currentDay][index].uploadedImageLocal
      );
      setInputValues(newValues);
    } else {
      const newValues = _.cloneDeep(inputValuesEx) ?? {};
      newValues[currentDay][index].uploadedImage = file;
      newValues[currentDay][index].uploadedImageLocal = url;
      newValues[currentDay][index].day = currentDay;
      setInputValuesEx(newValues);
    }
  };

  const [isLoadingIn, setIsLoadingIn] = useState({
    key: -1,
    index: -1,
    isExercise: false,
  });

  const handleSaveImage = async (event: any, index: number, isEx: boolean) => {
    setIsLoadingIn({ key: currentDay, index, isExercise: isEx });
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);

    console.log("333 is ex thumb", isEx);
    const newFileName = uuidv4();

    if (!isEx) {
      const newValues = _.cloneDeep(inputValues) ?? {};
      //checkeamos function de get modulos y en thumb hace el validation de url s3
      newValues[currentDay][index].thumb = url;
      newValues[currentDay][index].thumbLocal = newFileName;
      newValues[currentDay][index].day = currentDay;
      setInputValues(newValues);
    } else {
      const newValues = _.cloneDeep(inputValuesEx) ?? {};
      newValues[currentDay][index].thumb = url;
      newValues[currentDay][index].thumbLocal = newFileName;
      newValues[currentDay][index].day = currentDay;
      setInputValuesEx(newValues);
    }
    const formData = new FormData();
    formData.append("image", file);
    await axios.post(
      `${API_URL}/modules/uploadFileToS3/${newFileName}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    setIsLoadingIn({ key: -1, index: -1, isExercise: false });
  };

  const [quitterSelected, setSelectedQuitter] = useState("");
  const [timezone, setTimezone] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [coachFullName, setCoachFullName] = useState("");

  useEffect(() => {
    async function getModules() {
      const userDb = await getUser(user?.userId);
      const userMySelf: User = userDb.response[0];
      setTimezone(userMySelf.timezone[0]);
      setProfilePicture(userMySelf.profilePicture);
      setCoachFullName(`${userMySelf.firstName} ${userMySelf.lastName}`);
      let isPlanEndExpireLocal;
      const today = new Date();
      let quittersNoExpire: any = [];
      if (userMySelf.quitters.length > 0) {
        userMySelf?.quitters?.map((item) => {
          // if it doesn get quitter check in db plan end
          const [month, day, year] = item.planEnd.split("/").map(Number);
          const planEndDate = new Date(year, month - 1, day);
          isPlanEndExpireLocal = today > planEndDate;
          if (!isPlanEndExpireLocal) {
            quittersNoExpire.push(item);
          }
        });
        setSelectedQuitter(userMySelf?.quitters?.[0]?.userId);
      }

      setQuitters(quittersNoExpire);
      const res = await getByQuitterNullAndCoachIdBE(user?.userId);
      const modulesNoQuitterData = res.response;
      console.log("222 modulesNoQuitterData", modulesNoQuitterData);

      let modulesNoQuitter;
      let exercisesNoQuitter;
      let totalDaysNoQuitter;
      totalDaysNoQuitter = modulesNoQuitterData?.module?.[0]?.totalDays;

      modulesNoQuitter = modulesNoQuitterData?.module?.[0]?.modules;

      exercisesNoQuitter = modulesNoQuitterData?.module?.[0]?.exercises;
      //quitter

      // const modules = await getModulesAndExercisesByQuitterUserId(
      //   firstQuitterUserId
      // );
      console.log("MODULES GET WITHOUT QUITTER", modulesNoQuitter);
      if (modulesNoQuitterData !== undefined) {
        setDays(
          totalDaysNoQuitter === undefined ? "1" : String(totalDaysNoQuitter)
        );
        setInputValues(modulesNoQuitter);
        setInputValuesEx(exercisesNoQuitter);
      }
    }
    getModules();
  }, []);

  useEffect(() => {
    async function getModules() {
      if (quitterSelected !== "") {
        // let modulesNoQuitter;
        // let exercisesNoQuitter;
        // let totalDaysNoQuitter;
        // const modulesNoQuitterData = await getByQuitterNullAndCoachIdBE(userId);
        // totalDaysNoQuitter = modulesNoQuitterData.module[0]?.totalDays;

        // modulesNoQuitter = modulesNoQuitterData.module[0]?.modules;

        // exercisesNoQuitter = modulesNoQuitterData.module[0]?.exercises;

        const res = await getModulesAndExercisesByQuitterUserIdWithS3(
          quitterSelected
        );
        const modules = res.response;
        // if (modulesNoQuitterData !== undefined) {
        //   setDays(totalDaysNoQuitter);
        //   setInputValues(modulesNoQuitter);
        //   setInputValuesEx(exercisesNoQuitter);
        // } else {
        //console.log("ENTA QUITTER SELETED 12", modules.module[0].totalDays);
        console.log("MODULES GET QUITTER SELECTED", modules);
        if (modules.module.length > 0) {
          setDays(
            modules?.module?.[0]?.totalDays === undefined
              ? "1"
              : String(modules?.module?.[0]?.totalDays)
          );
          setInputValues(modules?.module?.[0]?.modules);
          setInputValuesEx(modules?.module?.[0]?.exercises);
        } else {
          setInputValues({});
          setInputValuesEx({});
          setDays("1");
        }
      }
    }
    getModules();
  }, [quitterSelected]);

  const [errorToast, setErrorToast] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const saveModuleAndExercisesProgress = async () => {
    // if (days === undefined || days === "0") {
    //   setErrorToast("You can't save if the days the plan have are empty");
    //   setOpenToast(true);
    //   return;
    // }
    // let hasErrors = false;
    // for (let i = 1; i <= Number(days); i++) {
    //   if (
    //     (inputValues?.[i] === undefined || inputValues?.[i].length === 0) &&
    //     i > 1
    //   ) {
    //     setErrorToast(`You have added the day ${i} without data`);
    //     setOpenToast(true);
    //     hasErrors = true;
    //   }
    //   inputValues?.[i]?.map((item) => {
    //     if (item.thumb === "") {
    //       setErrorToast(
    //         `You are missing a thumb empty, is in a module in the day ${i}`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //     }
    //     if (item.title.trim() === "") {
    //       setErrorToast(
    //         `You are missing a title empty, is in a module in the day ${i}`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //     }
    //     if (item.short.trim() === "") {
    //       setErrorToast(
    //         `You are missing a short description empty, is in a module in the day ${i}`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //     }

    //     if (
    //       item.uploadedImage === "" &&
    //       item.video === "" &&
    //       item.youTubeId === ""
    //     ) {
    //       setErrorToast(
    //         `You are missing in the builder details page the main video or image`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //       return;
    //     }
    //     if (item.fullDescription.trim() === "") {
    //       setErrorToast(
    //         `You are missing in the builder details page the full description of module`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //       return;
    //     }
    //   });
    //   inputValuesEx?.[i]?.map((item) => {
    //     if (
    //       inputValuesEx?.[i] === undefined ||
    //       inputValuesEx?.[i].length === 0
    //     ) {
    //       setErrorToast(
    //         `You have added the day ${i} without data, update the input of the day with the days that has data`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //     }
    //     if (item.thumb === "") {
    //       setErrorToast(
    //         `You are missing a thumb empty, is in an exercise in the day ${i}`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //     }
    //     if (item.title.trim() === "") {
    //       setErrorToast(
    //         `"You are missing a title empty, is in an exercise in the day ${i}`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //     }
    //     if (item.short.trim() === "") {
    //       setErrorToast(
    //         `You are missing a short description empty,is in an exercise in the day ${i}`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //     }
    //     if (
    //       item.uploadedImage === "" &&
    //       item.video === "" &&
    //       item.youTubeId === ""
    //     ) {
    //       setErrorToast(
    //         `You are missing in the builder details page the main video or image`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //       return;
    //     }
    //     if (item.fullDescription.trim() === "") {
    //       setErrorToast(
    //         `You are missing in the builder details page the full description of an exercise`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //       return;
    //     }
    //   });
    // }
    // if (hasErrors) {
    //   return;
    // }
    setIsSaving(true);

    const formData = new FormData();
    if (inputValues !== undefined) {
      for (const key in inputValues) {
        inputValues[key].map((value, index) => {
          formData.append(`file-module-${index}`, value?.thumb);
          formData.append(`file-up-${index}`, value?.uploadedImage);
          formData.append(`file-video-${index}`, value?.video);
        });
      }
    }

    if (inputValuesEx !== undefined) {
      for (const key in inputValuesEx) {
        inputValuesEx[key].map((value, index) => {
          formData.append(`file-ex-${index}`, value?.thumb);
          formData.append(`file-image-${index}`, value?.uploadedImage);
          formData.append(`file-stream-${index}`, value?.video);
        });
      }
    }

    const data = {
      quitterUserId: quitterSelected,
      userId: user?.userId,
      modules: inputValues ?? {},
      exercises: inputValuesEx ?? {},
      totalDays: days,
    };

    formData.append("payload", JSON.stringify(data));

    await axios.post(`${API_URL}/modules/uploadModulesEx`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    mixpanel.track("Save Modules and Exercises Web");
    setIsSaving(false);
    setOpenToastSuccess(true);
  };

  const removeModule = async (index: number, isEx: boolean) => {
    if (!isEx) {
      const indexToRemove = index;
      const filteredValues: Module = {};
      for (const key in inputValues) {
        if (key === String(currentDay)) {
          const values = inputValues[key].filter(
            (value, index) => index !== indexToRemove
          );
          filteredValues[key] = values;
        } else {
          filteredValues[key] = inputValues[key];
        }
      }

      setInputValues(filteredValues);
    } else {
      const indexToRemove = index;
      const filteredValuesEx: Module = {};
      for (const key in inputValuesEx) {
        if (key === String(currentDay)) {
          const values = inputValuesEx[key].filter(
            (value, index) => index !== indexToRemove
          );
          filteredValuesEx[key] = values;
        } else {
          filteredValuesEx[key] = inputValuesEx[key];
        }
      }

      setInputValuesEx(filteredValuesEx);
    }
  };

  const [isOpenFull, setOpenFull] = useState(false);
  const [isExerciseShow, showFullExercise] = useState(false);
  const [isModuleShow, showFullModule] = useState(false);

  const [quitters, setQuitters] = useState<TypeUser[]>([]);

  const [isOpenModalReset, setOpenModalReset] = useState(false);

  const resetConfiguration = () => {
    setInputValues({});
    setInputValuesEx({});
  };

  const handleOpenSubmitWork = () => {
    if (days === undefined || days === "0") {
      setErrorToast("You can't save if the days the plan have are empty");
      setOpenToast(true);
      return;
    }
    // let hasErrors = false;
    // for (let i = 1; i <= Number(days); i++) {
    //   if (
    //     (inputValues?.[i] === undefined || inputValues?.[i].length === 0) &&
    //     i > 1
    //   ) {
    //     setErrorToast(`You have added the day ${i} without data`);
    //     setOpenToast(true);
    //     hasErrors = true;
    //   }
    //   inputValues?.[i]?.map((item) => {
    //     if (item.thumb === "") {
    //       setErrorToast(
    //         `You are missing a thumb empty, is in a module in the day ${i}`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //     }
    //     if (item.title.trim() === "") {
    //       setErrorToast(
    //         `You are missing a title empty, is in a module in the day ${i}`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //     }
    //     if (item.short.trim() === "") {
    //       setErrorToast(
    //         `You are missing a short description empty, is in a module in the day ${i}`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //     }

    //     if (
    //       item.uploadedImage === "" &&
    //       item.video === "" &&
    //       item.youTubeId === ""
    //     ) {
    //       setErrorToast(
    //         `You are missing in the builder details page the main video or image`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //       return;
    //     }
    //     if (item.fullDescription.trim() === "") {
    //       setErrorToast(
    //         `You are missing in the builder details page the full description of module`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //       return;
    //     }
    //   });
    //   inputValuesEx?.[i]?.map((item) => {
    //     if (
    //       inputValuesEx?.[i] === undefined ||
    //       inputValuesEx?.[i].length === 0
    //     ) {
    //       setErrorToast(
    //         `You have added the day ${i} without data, update the input of the day with the days that has data`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //     }
    //     if (item.thumb === "") {
    //       setErrorToast(
    //         `You are missing a thumb empty, is in an exercise in the day ${i}`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //     }
    //     if (item.title.trim() === "") {
    //       setErrorToast(
    //         `"You are missing a title empty, is in an exercise in the day ${i}`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //     }
    //     if (item.short.trim() === "") {
    //       setErrorToast(
    //         `You are missing a short description empty,is in an exercise in the day ${i}`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //     }
    //     if (
    //       item.uploadedImage === "" &&
    //       item.video === "" &&
    //       item.youTubeId === ""
    //     ) {
    //       setErrorToast(
    //         `You are missing in the builder details page the main video or image`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //       return;
    //     }
    //     if (item.fullDescription.trim() === "") {
    //       setErrorToast(
    //         `You are missing in the builder details page the full description of an exercise`
    //       );
    //       setOpenToast(true);
    //       hasErrors = true;
    //       return;
    //     }
    //   });
    // }
    // if (hasErrors) {
    //   return;
    // }
    setOpenModalSubmit(true);
  };

  const handleSubmitModules = async () => {
    const today = new Date();
    const currentDate = today;
    const options = { timeZone: timezone };
    const dateTimezoneStart = currentDate.toLocaleString("en-US", options);
    const newNotification = {
      sender: user.userId,
      receiver: quitterSelected,
      date: dateTimezoneStart,
      profilePictureSender:
        profilePicture?.split?.("/")?.[3]?.split("?")?.[0] ?? "",
      body: `Coach ${coachFullName} has sent you new modules and exercises to start working on.`,
      type: "homework",
      isRead: false,
      senderFullName: coachFullName,
      amountPayment: 0,
      calendarEvent: {
        quitterId: "",
        coachId: "",
        meetDate: "",
        duration: "",
        shortDescription: "",
      },
      payment: {
        type: "",
        quantity: 0,
      },
      initials: user?.initials,
      backgroundColor: user?.backgroundColor,
    };
    if (pushTokenQuitter !== "") {
      if (osQuitter == "android") {
        const data = {
          token: pushTokenQuitter ?? "",
          title: `New message`,
          body: `@${fullNameQuitter} make you new homework`,
          data: { isFrom: "Message", receiver: user?.userId },
        };
        await sendPushNotification(data);
      } else {
        const pushNotification = {
          title: `New message`,
          body: `@${fullNameQuitter} make you new homework`,
          data: { isFrom: "Message", receiver: user?.userId },
          token: pushTokenQuitter ?? "",
        };
        sendPushNotificationAndroid(pushNotification);
      }
    }

    await sendNotification(newNotification);

    const dataSocket = {
      receiver: user?.userId,
    };

    socket?.emit("send_notification_request", dataSocket);

    setIsSaving(true);

    const formData = new FormData();
    if (inputValues !== undefined) {
      for (const key in inputValues) {
        inputValues[key].map((value, index) => {
          formData.append(`file-module-${index}`, value?.thumb);
          formData.append(`file-up-${index}`, value?.uploadedImage);
          formData.append(`file-video-${index}`, value?.video);
        });
      }
    }

    if (inputValuesEx !== undefined) {
      for (const key in inputValuesEx) {
        inputValuesEx[key].map((value, index) => {
          formData.append(`file-ex-${index}`, value?.thumb);
          formData.append(`file-image-${index}`, value?.uploadedImage);
          formData.append(`file-stream-${index}`, value?.video);
        });
      }
    }

    const data = {
      quitterUserId: quitterSelected,
      userId: user?.userId,
      modules: inputValues ?? {},
      exercises: inputValuesEx ?? {},
      totalDays: days,
      isReadyForQuitter: true,
    };

    formData.append("payload", JSON.stringify(data));

    await axios.post(`${API_URL}/modules/uploadModulesEx`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    mixpanel.track("Submit Modules and Exercises Web");
    setIsSaving(false);
    setOpenModalSubmit(false);
    setOpenToastSuccess(true);
  };

  const [valueModuleSelected, saveValueModule] = useState({
    value: {
      title: "",
      short: "",
      thumb: "",
      thumbLocal: "",
      day: 1,
      uploadedImage: "",
      uploadedImageLocal: "",
      video: "",
      videoLocal: "",
      youTubeId: "",
      fullDescription: "",
    },
    index: -1,
  });
  const [valueExSelected, saveValueEx] = useState({
    value: {
      title: "",
      short: "",
      thumb: "",
      thumbLocal: "",
      day: 1,
      uploadedImage: "",
      uploadedImageLocal: "",
      video: "",
      videoLocal: "",
      youTubeId: "",
      fullDescription: "",
    },
    index: -1,
  });
  console.log("inputValuesEx,", inputValuesEx);
  console.log("inputValues,", inputValues);

  const reactQuillRef = useRef();

  const checkCharacterCount = (event: any) => {
    const unprivilegedEditor = reactQuillRef.current.unprivilegedEditor;
    if (unprivilegedEditor.getLength() > 50 && event.key !== "Backspace")
      event.preventDefault();
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <View
        style={{
          backgroundColor: Colors.white,
          height: "100%",
          marginTop: -20,
        }}
      >
        <View
          style={{
            backgroundColor: Colors.white,
            height: "100%",
            padding: 0,
            paddingBottom: 100,
            marginLeft: 20,
            marginRight: 20,
          }}
        >
          <button
            style={{
              backgroundColor: "#7D5FCE",
              color: "#FFF",
              width: 150,
              border: 0,
              borderRadius: 8,
              padding: 10,
              margin: 10,
            }}
            onClick={() => {
              setShowModules(false);
            }}
          >
            Back To Posts
          </button>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {!isOpenFull && <View></View>}
            {isOpenFull && (
              <Pressable
                onPress={() => {
                  showFullExercise(false);
                  showFullModule(false);
                  setOpenFull(false);
                }}
              >
                <ArrowLeftOutlined style={{ fontSize: 30 }} />
              </Pressable>
            )}
            {currentDay === 1 && (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: Colors.blackDefault,
                    fontSize: 19,
                    justifyContent: "center",
                    alignItems: "center",
                    textDecorationLine: "underline",
                    textDecorationColor: "#000",
                    textDecorationStyle: "solid",
                    paddingBottom: 25,
                    paddingTop: 25,
                  }}
                >
                  {!isOpenFull ? "Builder Page" : "Builder Detail Page"}
                </span>
              </View>
            )}
            {(Object.keys(inputValues ?? {}).length !== 0 ||
              Object.keys(inputValuesEx ?? {}).length !== 0) &&
            quitters.length > 0 &&
            currentDay == 1 ? (
              <button
                type="button"
                className={styles.button}
                onClick={() => {
                  if (isSaving) return;
                  handleOpenSubmitWork();
                }}
              >
                {isSaving ? "Saving..." : "Submit"}
              </button>
            ) : (
              <View></View>
            )}
          </View>

          {currentDay === 1 && !isOpenFull && (
            <>
              <View
                style={{
                  padding: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <InfoCircleFilled
                    style={{ color: "orange", fontSize: 30, marginRight: 10 }}
                  />
                  <span
                    style={{ fontSize: 18, fontWeight: "600", maxWidth: 750 }}
                  >
                    Don't forget to save so that you don't lose your changes.
                  </span>
                </View>
                <Pressable
                  onPress={() => {
                    if (isSaving) return;
                    saveModuleAndExercisesProgress();
                  }}
                >
                  <View
                    style={{
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <SaveFilled
                      style={{ color: Colors.blackCardDarkMode, fontSize: 30 }}
                    />
                    <span style={{ fontSize: 12, marginTop: 3 }}>
                      {isSaving ? `Saving changes...` : "Save"}
                    </span>
                  </View>
                </Pressable>
              </View>
              <Pressable
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  width: 270,
                }}
                onPress={() => setOpenModalReset(true)}
              >
                <View
                  style={{
                    borderColor: Colors.red,
                    borderWidth: 1,
                    justifyContent: "center",
                    borderRadius: 8,
                    alignItems: "center",
                    flexDirection: "row",
                    marginBottom: 10,
                    padding: 7,
                  }}
                >
                  <WarningFilled style={{ color: Colors.red, fontSize: 30 }} />
                  <span
                    style={{
                      color: Colors.red,
                      marginLeft: 5,
                      fontWeight: "600",
                    }}
                  >
                    Reset configuration
                  </span>
                </View>
              </Pressable>
              {quitters.length > 0 && (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 20,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>
                      {"\u2022"} For which of your quitters will this plan be?
                    </span>
                  </View>
                  <View style={{ marginBottom: 20 }}>
                    {quitters?.map(
                      (item: { fullName: string; userId: string }) => {
                        return (
                          <Pressable
                            key={item.userId}
                            onPress={() => setSelectedQuitter(item.userId)}
                          >
                            <RadioButton
                              active={quitterSelected === item.userId}
                              label={`${item.fullName}`}
                              width="100%"
                              paddingVertical={15}
                            />
                          </Pressable>
                        );
                      }
                    )}
                  </View>
                </>
              )}

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>
                  {"\u2022"} How many taks will the plan have?
                </span>

                <TextInput
                  value={days}
                  onChangeText={handleDaysChange}
                  style={{
                    borderRadius: 8,
                    maxWidth: 270,
                    backgroundColor: Colors.lightGray,
                    height: 30,
                    width: 30,
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 10,
                    textAlign: "center",
                  }}
                />
              </View>
            </>
          )}

          <View style={{ marginTop: !isOpenFull ? 20 : 0 }}>
            {currentDay > 1 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                {currentDay > 1 && !isOpenFull && (
                  <Pressable onPress={() => setCurrentDay(1)}>
                    <View>
                      <span
                        style={{
                          color: Colors.blackCardDarkMode,
                          fontSize: 16,
                          fontWeight: "600",
                        }}
                      >
                        Go back to task one
                      </span>
                    </View>
                  </Pressable>
                )}
                {currentDay > 1 &&
                  !isOpenFull &&
                  currentDay + 1 <= Number(days) && (
                    <TouchableOpacity
                      onPress={() => setCurrentDay(Number(days))}
                    >
                      <View>
                        <span
                          style={{
                            color: Colors.blackCardDarkMode,
                            fontSize: 16,
                            fontWeight: "600",
                          }}
                        >
                          Go to last task
                        </span>
                      </View>
                    </TouchableOpacity>
                  )}
              </View>
            )}

            {!isOpenFull && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: Colors.lightGray,
                    padding: 10,
                    borderRadius: 8,
                  }}
                >
                  <span style={{ fontSize: 20 }}>Task Nº {currentDay}</span>
                </View>
              </View>
            )}

            {!isOpenFull && (
              <View style={{ marginTop: 20 }}>
                <span style={{ fontSize: 18 }}>
                  {"\u2022"} Create Modules for this task:
                </span>
              </View>
            )}
            {!isOpenFull && (
              <View style={{ marginTop: 30 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Pressable onPress={() => addModule()}>
                    <AddBoxIcon style={{ color: Colors.blue, fontSize: 30 }} />
                  </Pressable>
                  <span style={{ marginLeft: 7, fontSize: 18 }}>
                    Add Module
                  </span>
                </View>
              </View>
            )}

            {Object.keys(inputValues ?? {})
              .filter((key) => {
                if (key === String(currentDay)) {
                  return inputValues?.[key];
                }
              })
              .map((key) => inputValues?.[key])
              .map((values) => {
                return values?.map((value, index) => {
                  console.log("value thumb!!!!!!!!", value.thumb);
                  let valueThumb = value.thumb;
                  let isValueThumbFile = false;
                  if (value.thumb instanceof File) {
                    valueThumb = URL.createObjectURL(value.thumb);
                    isValueThumbFile = true;
                  }
                  console.log("value thumblocal!!!!!!!!", value.thumbLocal);
                  let valueThumbLocal = value.thumbLocal;
                  if (value.thumbLocal instanceof File) {
                    valueThumbLocal = URL.createObjectURL(value.thumbLocal);
                  }

                  let imageUrl = "";
                  if (isValueThumbFile) {
                    imageUrl = valueThumb;
                  } else {
                    const matches = value.thumb.match(/https/g);

                    // Verificamos si hay al menos dos ocurrencias
                    if (matches && matches.length >= 2) {
                      imageUrl = value.thumbLocal;
                    } else if (matches?.length === 1) {
                      imageUrl = value.thumb;
                    } else {
                      imageUrl = value.thumb;
                    }
                  }

                  return (
                    <>
                      {!isOpenFull && (
                        <View
                          style={{
                            marginTop: 20,
                            flexDirection: "row",
                            borderWidth: 1,
                            borderColor: Colors.darkGray,
                          }}
                        >
                          {isLoadingIn.key === currentDay &&
                          isLoadingIn.index === index &&
                          isLoadingIn.isExercise === false ? (
                            <View
                              style={{
                                height: 100,
                                width: 100,
                                backgroundColor: Colors.lightGray,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <div className={styles.spinnerOverlay}>
                                <div className={styles.spinnerContainer}></div>
                              </div>
                            </View>
                          ) : (
                            <>
                              {value.thumb === "" ? (
                                <Pressable>
                                  <View
                                    style={{
                                      height: 100,
                                      width: 100,
                                      backgroundColor: Colors.lightGray,
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <label className={styles.label}>
                                      <input
                                        onChange={(event) => {
                                          handleSaveImage(event, index, false);
                                        }}
                                        id="file"
                                        accept="image/jpeg,image/png"
                                        name="fileToUpload"
                                        type="file"
                                      />
                                      <div
                                        style={{
                                          textAlign: "center",
                                          fontSize: 15,
                                          padding: "0px 20px",
                                        }}
                                      >
                                        <span>Choose a file</span>
                                      </div>
                                    </label>
                                  </View>
                                </Pressable>
                              ) : (
                                <div className={styles.containerImage}>
                                  <Image
                                    src={imageUrl}
                                    height={100}
                                    width={100}
                                    alt="Image"
                                    style={{
                                      height: 100,
                                      width: 100,
                                      backgroundColor: Colors.lightGray,
                                      zIndex: 1,
                                    }}
                                  />
                                  <div className={styles.overlay}>
                                    <label className={styles.label}>
                                      <input
                                        onChange={(event) => {
                                          handleSaveImage(event, index, false);
                                        }}
                                        id="file"
                                        accept="image/jpeg,image/png"
                                        name="fileToUpload"
                                        type="file"
                                      />
                                      <div
                                        style={{
                                          textAlign: "center",
                                          fontSize: 15,
                                          padding: "0px 20px",
                                        }}
                                        className={styles.chooseFile}
                                      >
                                        <span>Choose a file</span>
                                      </div>
                                    </label>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          <View
                            style={{
                              marginLeft: 15,
                              width: "90%",
                            }}
                          >
                            <View
                              style={{
                                marginTop: 20,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                width: "90%",
                                height: 140,
                              }}
                            >
                              {/* <textarea
                                style={{
                                  fontSize: 20,
                                  width: "90%",
                                  border: "none",
                                  resize: "none",
                                  height: 65,
                                }}
                                value={value.title}
                                maxLength={130}
                                rows={3}
                                placeholder="Edit Title"
                                onChange={(e) =>
                                  handleInputChangeTitle(
                                    e.target.value,
                                    index,
                                    false
                                  )
                                }
                              /> */}
                              <ReactQuill
                                onKeyDown={checkCharacterCount}
                                ref={reactQuillRef}
                                theme="snow"
                                value={value.title}
                                onChange={(value) => {
                                  handleInputChangeTitle(value, index, false);
                                }}
                                style={{ width: "100%", height: 100 }}
                                modules={{
                                  toolbar: [
                                    [{ header: [1, 2, false] }],
                                    [
                                      "bold",
                                      "italic",
                                      "underline",
                                      "strike",
                                      "blockquote",
                                    ],
                                    [
                                      {
                                        color: [
                                          "#000000",
                                          "#e60000",
                                          "#ff9900",
                                          "#ffff00",
                                          "#008a00",
                                          "#0066cc",
                                          "#9933ff",
                                          "#ffffff",
                                          "#facccc",
                                          "#ffebcc",
                                          "#ffffcc",
                                          "#cce8cc",
                                          "#cce0f5",
                                          "#ebd6ff",
                                          "#bbbbbb",
                                          "#f06666",
                                          "#ffc266",
                                          "#ffff66",
                                          "#66b966",
                                          "#66a3e0",
                                          "#c285ff",
                                          "#888888",
                                          "#a10000",
                                          "#b26b00",
                                          "#b2b200",
                                          "#006100",
                                          "#0047b2",
                                          "#6b24b2",
                                          "#444444",
                                          "#5c0000",
                                          "#663d00",
                                          "#666600",
                                          "#003700",
                                          "#002966",
                                          "#3d1466",
                                          "custom-color",
                                        ],
                                      },
                                    ],
                                    [{ list: "ordered" }, { list: "bullet" }],
                                    ["clean"],
                                  ],
                                }}
                                formats={[
                                  "header",
                                  "bold",
                                  "italic",
                                  "underline",
                                  "strike",
                                  "blockquote",
                                  "list",
                                  "bullet",
                                  "image",
                                  "color",
                                ]}
                              />
                              <View style={{ marginLeft: 40 }}>
                                <Pressable
                                  style={{ marginBottom: 10 }}
                                  onPress={() => removeModule(index, false)}
                                >
                                  <View>
                                    <MinusSquareFilled
                                      style={{
                                        color: Colors.red,
                                        fontSize: 30,
                                      }}
                                    />
                                  </View>
                                </Pressable>
                                <Pressable
                                  onPress={() => {
                                    setOpenFull(true);
                                    showFullModule(true);
                                    saveValueModule({ value, index });
                                  }}
                                >
                                  <OpenInNewIcon
                                    style={{
                                      color: Colors.primary,
                                      fontSize: 30,
                                    }}
                                  />
                                </Pressable>
                              </View>
                            </View>
                          </View>
                        </View>
                      )}
                    </>
                  );
                });
              })}
            {isOpenFull && isModuleShow && !isExerciseShow && (
              <ModulesAndExercisesFullScreen
                handleSaveUploadedImage={(text, index, ex) => {
                  handleSaveUploadedImage(text, index, ex);
                }}
                title={valueModuleSelected?.value.title}
                short={valueModuleSelected?.value.short}
                index={valueModuleSelected?.index}
                isExerciseShow={false}
                videoUploaded={
                  valueModuleSelected?.value.videoLocal === undefined ||
                  !valueModuleSelected?.value.videoLocal.includes("https")
                    ? valueModuleSelected?.value.video
                    : valueModuleSelected?.value.videoLocal
                }
                uploadedImage={
                  valueModuleSelected?.value.uploadedImageLocal === undefined ||
                  !valueModuleSelected?.value.uploadedImageLocal.includes(
                    "https"
                  )
                    ? valueModuleSelected?.value.uploadedImage
                    : valueModuleSelected?.value.uploadedImageLocal
                }
                fullDescripion={valueModuleSelected?.value.fullDescription}
                youTubeId={valueModuleSelected?.value.youTubeId}
                handleSaveVideo={handleSaveVideo}
                handleSaveVideoId={handleSaveVideoId}
                handleInputChangeFull={handleInputChangeFull}
                handleInputChangeShort={handleInputChangeShort}
                handleInputChangeTitle={handleInputChangeTitle}
                isModuleShow={isModuleShow}
                isViewFromHomeWork={false}
              />
            )}
          </View>

          {!isOpenFull && (
            <View style={{ marginTop: 20 }}>
              <span style={{ fontSize: 18 }}>
                {"\u2022"} Create Exercises for this task:
              </span>
            </View>
          )}

          {!isOpenFull && (
            <View style={{ marginTop: 30 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Pressable onPress={() => addExercise()}>
                  <AddBoxIcon style={{ color: Colors.blue, fontSize: 30 }} />
                </Pressable>
                <span style={{ marginLeft: 7, fontSize: 18 }}>
                  Add Exercise
                </span>
              </View>
            </View>
          )}

          {Object.keys(inputValuesEx ?? {})
            .filter((key) => {
              if (key === String(currentDay)) {
                return inputValuesEx?.[key];
              }
            })
            .map((key) => inputValuesEx?.[key])
            .map((values) => {
              return values?.map((value, index) => {
                let valueThumb = value.thumb;
                let isValueThumbFile = false;
                if (value.thumb instanceof File) {
                  valueThumb = URL.createObjectURL(value.thumb);
                  isValueThumbFile = true;
                }
                let valueThumbLocal = value.thumbLocal;
                if (value.thumbLocal instanceof File) {
                  valueThumbLocal = URL.createObjectURL(value.thumbLocal);
                }

                let imageUrl = "";
                if (isValueThumbFile) {
                  imageUrl = valueThumb;
                } else {
                  const matches = value.thumb.match(/https/g);

                  if (matches && matches.length >= 2) {
                    imageUrl = value.thumbLocal;
                  } else if (matches?.length === 1) {
                    imageUrl = value.thumb;
                  } else {
                    imageUrl = value.thumb;
                  }
                }

                return (
                  <>
                    {!isOpenFull && (
                      <View
                        style={{
                          marginTop: 20,
                          flexDirection: "row",
                          borderWidth: 1,
                          borderColor: Colors.darkGray,
                        }}
                      >
                        {isLoadingIn.key === currentDay &&
                        isLoadingIn.index === index &&
                        isLoadingIn.isExercise === true ? (
                          <View
                            style={{
                              height: 100,
                              width: 100,
                              backgroundColor: Colors.lightGray,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <div className={styles.spinnerOverlay}>
                              <div className={styles.spinnerContainer}></div>
                            </div>
                          </View>
                        ) : (
                          <>
                            {(value?.thumbLocal === "" ||
                              value.thumbLocal === undefined) &&
                            value.thumb === "" ? (
                              <Pressable>
                                <View
                                  style={{
                                    height: 100,
                                    width: 100,
                                    backgroundColor: Colors.lightGray,
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <label className={styles.label}>
                                    <input
                                      onChange={(event) => {
                                        handleSaveImage(event, index, true);
                                      }}
                                      id="file"
                                      accept="image/jpeg,image/png"
                                      name="fileToUpload"
                                      type="file"
                                    />
                                    <div
                                      style={{
                                        textAlign: "center",
                                        fontSize: 15,
                                        padding: "0px 20px",
                                      }}
                                    >
                                      <span>Choose a file</span>
                                    </div>
                                  </label>
                                </View>
                              </Pressable>
                            ) : (
                              <div className={styles.containerImage}>
                                <Image
                                  src={isValueThumbFile ? valueThumb : imageUrl}
                                  height={100}
                                  width={100}
                                  alt="Image"
                                  style={{
                                    height: 100,
                                    width: 100,
                                    backgroundColor: Colors.lightGray,
                                    zIndex: 1,
                                  }}
                                />
                                <div className={styles.overlay}>
                                  <label className={styles.label}>
                                    <input
                                      onChange={(event) => {
                                        handleSaveImage(event, index, true);
                                      }}
                                      id="file"
                                      accept="image/jpeg,image/png"
                                      name="fileToUpload"
                                      type="file"
                                    />
                                    <div className={styles.chooseFile}>
                                      <span>Choose a file</span>
                                    </div>
                                  </label>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        <View style={{ marginLeft: 15, width: "95%" }}>
                          <View
                            style={{
                              marginTop: 20,
                              flexDirection: "row",
                              justifyContent: "space-between",
                              width: "90%",
                              height: 140,
                            }}
                          >
                            {/* <textarea
                              style={{
                                fontSize: 20,
                                width: "90%",
                                border: "none",
                                resize: "none",
                                height: 65,
                              }}
                              value={value.title}
                              maxLength={130}
                              rows={3}
                              placeholder="Edit Title"
                              onChange={(e) =>
                                handleInputChangeTitle(
                                  e.target.value,
                                  index,
                                  true
                                )
                              }
                            /> */}
                            <ReactQuill
                              onKeyDown={checkCharacterCount}
                              ref={reactQuillRef}
                              theme="snow"
                              value={value.title}
                              onChange={(value) => {
                                handleInputChangeTitle(value, index, true);
                              }}
                              style={{ width: "100%", height: 100 }}
                              modules={{
                                toolbar: [
                                  [{ header: [1, 2, false] }],
                                  [
                                    "bold",
                                    "italic",
                                    "underline",
                                    "strike",
                                    "blockquote",
                                  ],
                                  [
                                    {
                                      color: [
                                        "#000000",
                                        "#e60000",
                                        "#ff9900",
                                        "#ffff00",
                                        "#008a00",
                                        "#0066cc",
                                        "#9933ff",
                                        "#ffffff",
                                        "#facccc",
                                        "#ffebcc",
                                        "#ffffcc",
                                        "#cce8cc",
                                        "#cce0f5",
                                        "#ebd6ff",
                                        "#bbbbbb",
                                        "#f06666",
                                        "#ffc266",
                                        "#ffff66",
                                        "#66b966",
                                        "#66a3e0",
                                        "#c285ff",
                                        "#888888",
                                        "#a10000",
                                        "#b26b00",
                                        "#b2b200",
                                        "#006100",
                                        "#0047b2",
                                        "#6b24b2",
                                        "#444444",
                                        "#5c0000",
                                        "#663d00",
                                        "#666600",
                                        "#003700",
                                        "#002966",
                                        "#3d1466",
                                        "custom-color",
                                      ],
                                    },
                                  ],
                                  [{ list: "ordered" }, { list: "bullet" }],
                                  ["clean"],
                                ],
                              }}
                              formats={[
                                "header",
                                "bold",
                                "italic",
                                "underline",
                                "strike",
                                "blockquote",
                                "list",
                                "bullet",
                                "image",
                                "color",
                              ]}
                            />
                            <View style={{ marginLeft: 40 }}>
                              <Pressable
                                style={{ marginBottom: 10 }}
                                onPress={() => removeModule(index, true)}
                              >
                                <View>
                                  <MinusSquareFilled
                                    style={{ color: Colors.red, fontSize: 30 }}
                                  />
                                </View>
                              </Pressable>
                              <Pressable
                                onPress={() => {
                                  setOpenFull(true);
                                  showFullExercise(true);
                                  saveValueEx({ value, index });
                                }}
                              >
                                <OpenInNewIcon
                                  style={{
                                    color: Colors.primary,
                                    fontSize: 30,
                                  }}
                                />
                              </Pressable>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}
                  </>
                );
              });
            })}
          {isOpenFull && isExerciseShow && !isModuleShow && (
            <ModulesAndExercisesFullScreen
              handleSaveVideo={handleSaveVideo}
              handleSaveUploadedImage={handleSaveUploadedImage}
              handleSaveVideoId={handleSaveVideoId}
              title={valueExSelected.value.title}
              short={valueExSelected.value.short}
              index={valueExSelected.index}
              videoUploaded={
                valueExSelected?.value.videoLocal === undefined ||
                !valueExSelected?.value.videoLocal.includes("https")
                  ? valueExSelected?.value.video
                  : valueExSelected?.value.videoLocal
              }
              uploadedImage={
                valueExSelected?.value.uploadedImageLocal === undefined ||
                !valueExSelected?.value.uploadedImageLocal.includes("https")
                  ? valueExSelected?.value.uploadedImage
                  : valueExSelected?.value.uploadedImageLocal
              }
              fullDescripion={valueExSelected.value.fullDescription}
              youTubeId={valueExSelected.value.youTubeId}
              isModuleShow={false}
              isExerciseShow={isExerciseShow}
              handleInputChangeFull={handleInputChangeFull}
              handleInputChangeShort={handleInputChangeShort}
              handleInputChangeTitle={handleInputChangeTitle}
              isViewFromHomeWork={false}
            />
          )}

          {days !== "0" && !isOpenFull && (
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
                <View style={{ position: "relative", top: 0, paddingTop: 15 }}>
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
                    <span style={{ fontSize: 16 }}>Go to previous task</span>
                  </Pressable>
                </View>
              ) : (
                <View></View>
              )}
              {currentDay + 1 <= Number(days) && (
                <View style={{ position: "relative", top: 0, paddingTop: 15 }}>
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
          <Snackbar
            open={openToast}
            autoHideDuration={6000}
            onClose={() => setOpenToast(false)}
          >
            <Alert
              onClose={() => setOpenToast(false)}
              severity="error"
              sx={{ width: "100%" }}
            >
              {errorToast}
            </Alert>
          </Snackbar>
          <Snackbar
            open={openToastSuccess}
            autoHideDuration={6000}
            onClose={() => setOpenToast(false)}
          >
            <Alert
              onClose={() => setOpenToastSuccess(false)}
              severity="success"
              sx={{ width: "100%" }}
            >
              Your changes were saved successfully
            </Alert>
          </Snackbar>

          {/* modal reset */}
          <Modal
            className={styles.modalReset}
            open={isOpenModalReset}
            onClose={() => setOpenModalReset(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <div className={styles.containerModalReset}>
              <View style={{ backgroundColor: Colors.white }}>
                <View
                  style={{
                    marginTop: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    marginHorizontal: 20,
                  }}
                >
                  <span style={{ fontSize: 18, marginBottom: 20 }}>
                    Reset Modules and Exercises
                  </span>
                  <span style={{ fontWeight: "600" }}>
                    Are you sure you want to reset and empty all the modules and
                    exercises where you filled in information?
                  </span>
                  <View style={{ flexDirection: "row", marginTop: 30 }}>
                    <Pressable onPress={() => setOpenModalReset(false)}>
                      <View
                        style={{
                          borderRadius: 50,
                          borderColor: Colors.blackDefault,
                          borderWidth: 1,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                          marginBottom: 20,
                          marginRight: 15,
                        }}
                      >
                        <span
                          style={{
                            color: Colors.blackDefault,
                            fontSize: 16,
                            textAlign: "center",
                          }}
                        >
                          Cancel
                        </span>
                      </View>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        resetConfiguration();
                        setOpenModalReset(false);
                      }}
                    >
                      <View
                        style={{
                          borderRadius: 50,
                          backgroundColor: Colors.red,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                        }}
                      >
                        <span
                          style={{
                            color: Colors.white,
                            fontSize: 16,
                            textAlign: "center",
                          }}
                        >
                          Confirm
                        </span>
                      </View>
                    </Pressable>
                  </View>
                </View>
              </View>
            </div>
          </Modal>

          <Modal
            className={styles.modal}
            open={openModalSubmit}
            onClose={() => setOpenModalSubmit(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <div className={styles.containerModal}>
              <View style={{ backgroundColor: Colors.white }}>
                <View
                  style={{
                    marginTop: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    marginHorizontal: 20,
                  }}
                >
                  <View>
                    <span
                      style={{
                        fontSize: 18,
                        textAlign: "center",
                        marginBottom: 10,
                      }}
                    >
                      Submit Modules and exercises
                    </span>
                  </View>
                  <View>
                    <span>
                      This action will inform the quitter that the modules and
                      exercises are ready to be started.
                    </span>
                    <View
                      style={{
                        flexDirection: "row",
                        marginHorizontal: 0,
                        marginTop: 10,
                      }}
                    >
                      <span>
                        You can continue updating after submitting, and we will
                        let the quitter know if there is an update available.
                      </span>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", marginTop: 20 }}>
                    <Pressable onPress={() => setOpenModalSubmit(false)}>
                      <View
                        style={{
                          backgroundColor: Colors.darkGray,
                          borderRadius: 8,
                          paddingVertical: 10,
                          paddingHorizontal: 40,
                          marginRight: 10,
                        }}
                      >
                        <span style={{ color: Colors.white }}>Cancel</span>
                      </View>
                    </Pressable>

                    <Pressable onPress={() => handleSubmitModules()}>
                      <View
                        style={{
                          backgroundColor: Colors.primary,
                          borderRadius: 8,
                          paddingVertical: 10,
                          paddingHorizontal: 40,
                        }}
                      >
                        <span style={{ color: Colors.white }}>Submit</span>
                      </View>
                    </Pressable>
                  </View>
                </View>
              </View>
            </div>
          </Modal>
        </View>
      </View>
    </>
  );
};

export default ModulesAndExercises;
