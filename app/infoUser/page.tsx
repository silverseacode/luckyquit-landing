"use client"
import { Colors } from "@/app/colors";
import  RadioButton  from "../../app/components/RadioButton";
import { CheckOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Pressable, span, View, TextInput } from "react-native";
import Container from "@mui/material/Container";
import { v4 as uuidv4 } from 'uuid';
import { getTimezoneBE, getUniqueUserName, updateUserInfoBE } from "@/helpers/users";
import { useRouter } from 'next/navigation'

import Layout from "../../app/components/Layout";

export default function InfoUser() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [active, setActive] = useState("Coachs");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [emailPaypal, setEmailPaypal] = useState("");

  useEffect(() => {
    getTimezone()
  },[])

  const [isUnique, setIsUnique] = useState(false);

  const verifyUsername = async () => {
    if (userName.trim() === "") return;
    const response = await getUniqueUserName(userName);
    console.log("IS",response)
    setIsUnique(response.response.user);
  };

  const [errorForm, setErrorForm] = useState("");

  function getRandomLightColor() {
    var r = Math.floor(Math.random() * 128) + 128;
    var g = Math.floor(Math.random() * 128) + 128;
    var b = Math.floor(Math.random() * 128) + 128;
    return "#" + r.toString(16) + g.toString(16) + b.toString(16);
  }

  const updateUserInfo = async () => {
    if (emailPaypal.trim() === "") {
      setErrorForm("You must complete the PayPal email field");
      return;
    }

    if(isErrorEmail) {
      setErrorForm("You must put a valid email");
      return
    }

    if (firstName.trim() === "") {
      setErrorForm("You must complete the first name field");
      return;
    }

    if (lastName.trim() === "") {
      setErrorForm("You must complete the last name field");
      return;
    }

    if (userName.trim() === "") {
      setErrorForm("You must complete the username field");
      return;
    }
    if (costCigarettes.trim() === "") {
      setErrorForm("You must complete the cost of cigarettes field");
      return;
    }
    if (containPack.trim() === "") {
      setErrorForm("You must complete the contain pack field");
      return;
    }
    if (isUnique !== null) {
      setErrorForm("You must choose a username not already taken");
      return;
    }
    setIsLoading(true);

    const email = localStorage.getItem("email")

    const newUUID = uuidv4();
    console.log(1,newUUID)
    localStorage.setItem("UUID", newUUID);
    const newUser = {
      firstName,
      lastName,
      type: active === "Coachs" ? "coach" : "quitter",
      lookingQuitter: true,
      lookingCoach: true,
      userName,
      city: "",
      country: "",
      userId: newUUID,
      descriptionAboutMe: active === "Coachs" ? "Coach" : "Quitter",
      backgroundColor: getRandomLightColor(),
      initials: `${firstName.trim()[0].toUpperCase()} ${lastName
        .trim()[0]
        .toUpperCase()}`,
      emailPaypal,
      costCigarettes,
      containPack,
      timezone: timezone === "Not provided" ? undefined  : [timezone],
      isFromWeb: true,
      email
    };

    await updateUserInfoBE(newUser);
    setIsLoading(false);
    router.push("/home");
  };
  const [costCigarettes, setCostCigarettes] = useState("");

  const handleCostCig = (text: string) => {
    const regex = /^[0-9]+(\.[0-9]*)?$/;
    const sanitizedText = text
      .replace(/[^0-9.]/g, "") // Remove non-numeric and non-dot characters
      .replace(/\.(?=.*\.)/g, "") // Remove dots after the first one
      .replace(regex, "$&");

    setCostCigarettes(sanitizedText);
  };
  const [containPack, setContainPack] = useState("");
  const handleContainPack = (value: string) => {
    const regex = /^[0-9]+$/;
    const sanitizedText = value.replace(/[^0-9]/g, "").replace(regex, "$&");
    setContainPack(sanitizedText);
  };
  const [isLoadingTimezone, setIsLoadingTimezone] = useState(false)
  const [timezone, setTimezoneState] = useState<string | undefined>("");
  const getTimezone = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = position.coords
          const timeZone = await getTimezoneBE(location.latitude, location.longitude);
          setTimezoneState(timeZone.timezone);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setTimezoneState("Not provided");
          }
          console.error(error.message);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };
const [isErrorEmail, setIsErrorEmail] = useState(false)
  const handleValidationEmail = (value: string) => {
    setEmailPaypal(value);
    const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]+$/;
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

console.log("timezone", timezone)
  return (
    <div style={{backgroundColor: "rgba(125,95,206,0.06)"}}>

    <Layout title={"Lucky Quit - Quit smoking for life"} hideHeader={true}>
    <Container maxWidth="sm">
      <View style={{ paddingTop: 150, paddingBottom: 50 }}>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <View style={{ marginBottom: 10 }}>
            <span style={{ fontWeight: "600", fontSize: 18 }}>
              What is your role in this app?
            </span>
          </View>
          <View
            style={{
              flexDirection: "row",
              marginLeft: 100,
              marginBottom: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Pressable onPress={() => setActive("Coachs")}>
              <RadioButton
                hasBorder={false}
                active={active === "Coachs"}
                label={"Coach"}
              />
            </Pressable>
            <Pressable onPress={() => setActive("Quitters")}>
              <RadioButton
                hasBorder={false}
                active={active === "Quitters"}
                label={"Quitter"}
              />
            </Pressable>
          </View>
        </View>
        {active === "Coachs" && (
          <>
            <View style={{ marginBottom: 25, marginTop: 25 }}>
              <TextInput
                editable={true}
                value={emailPaypal}
                autoCorrect={false}
                autoCapitalize="none"
                autoCompleteType="off"
                onChangeText={handleValidationEmail}
                placeholder="Your PayPal email"
                style={{
                  borderRadius: 8,
                  borderColor: Colors.primary,
                  borderWidth: 1,
                  width: "100%",
                  padding: 8,
                  height: 45,
                  backgroundColor: "#fff"
                }}
              />
            </View>
            {isErrorEmail && <span style={{color: Colors.red, marginTop: "-10px", marginBottom: "10px"}}>Invalid email format.</span>}
            <View style={{ flexDirection: "row", marginBottom: 25 }}>
              <InfoCircleOutlined style={{ fontSize: 24, color: "orange" }} />
              <span style={{ marginLeft: 10, fontWeight: "600" }}>
                IMPORTANT: This is the email through which you will be paid for
                your services.
              </span>
            </View>
          </>
        )}
        <View style={{ marginBottom: 25 }}>
          <TextInput
            editable={true}
            value={firstName}
            autoCorrect={false}
            maxLength={15}
            onChangeText={setFirstName}
            placeholder="Your first name"
            autoCompleteType="off"
            style={{
              borderRadius: 8,
              borderColor: Colors.primary,
              borderWidth: 1,
              width: "100%",
              padding: 8,
              height: 45,
              backgroundColor: "#fff"
            }}
          />
        </View>

        <View style={{ marginBottom: 25 }}>
          <TextInput
            editable={true}
            value={lastName}
            autoCorrect={false}
            maxLength={15}
            onChangeText={setLastName}
            placeholder="Your last name"
            autoCompleteType="off"
            style={{
              borderRadius: 8,
              borderColor: Colors.primary,
              borderWidth: 1,
              width: "100%",
              padding: 8,
              height: 45,
              backgroundColor: "#fff"
            }}
          />
        </View>
        <View style={{ flexDirection: "row", marginBottom: 15 }}>
          <TextInput
            editable={true}
            value={userName}
            onChangeText={setUserName}
            placeholder="Your username"
            autoCapitalize="none"
            autoCompleteType="off"
            autoCorrect={false}
            maxLength={15}
            style={{
              borderRadius: 8,
              borderColor: Colors.primary,
              borderWidth: 1,
              width: "77%",
              padding: 8,
              height: 45,
              backgroundColor: "#fff"
            }}
          />
          <Pressable onPress={() => verifyUsername()}>
            <View
              style={{
                backgroundColor: Colors.primary,
                padding: 8,
                borderRadius: 8,
                marginLeft: 15,
                marginTop: 8,
              }}
            >
              <span style={{ color: Colors.white }}>Verify</span>
            </View>
          </Pressable>
        </View>
        <View style={{ marginBottom: 15 }}>
          <span style={{ color: Colors.red }}>
            {isUnique !== null &&
              isUnique !== false &&
              "Username is already taken"}
          </span>
          {isUnique === null && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <span style={{ color: Colors.darkGray, marginRight: 5 }}>
                Username is available
              </span>
              <CheckOutlined style={{ fontSize: 24, color: Colors.success }} />
            </View>
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            marginBottom: 0,
            alignItems: "center",
          }}
        >
          <InfoCircleOutlined style={{ fontSize: 24, color: "black" }} />
          <span style={{ marginLeft: 10 }}>Username should be unique</span>
        </View>
        <View
          style={{
            flexDirection: "row",
            marginTop: 20,
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>How many cigarettes contain each pack?</span>
          <TextInput
            value={containPack}
            onChangeText={handleContainPack}
            placeholder="0"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={"grey"}
            style={{
              width: 50,
              borderRadius: 8,
              borderColor: Colors.primary,
              borderWidth: 1,
              padding: 8,
              fontSize: 20,
              backgroundColor: "#fff"
            }}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            marginTop: 20,
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>What's the cost of the cigarettes you smoke per pack?</span>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 28,
                color: Colors.success,
                textAlign: "center",
                fontWeight: "600",
                marginRight: 10,
              }}
            >
              $
            </span>
            <TextInput
              value={costCigarettes}
              onChangeText={handleCostCig}
              placeholder="0.00"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={"grey"}
              style={{
                width: 60,
                borderRadius: 8,
                borderColor: Colors.primary,
                borderWidth: 1,
                padding: 8,
                fontSize: 20,
                backgroundColor: "#fff"
              }}
            />
          </View>
        </View>
        {errorForm.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <span style={{ color: Colors.red }}>{errorForm}</span>
          </View>
        )}
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 30,
            zIndex: 99,
          }}
        >
          <Pressable style={{ width: 200 }} onPress={() => updateUserInfo()}>
            <View
              style={{
                backgroundColor: Colors.primary,
                width: 200,
                padding: 10,
                borderRadius: 8,
                zIndex: 99,
              }}
            >
              <span
                style={{
                  color: Colors.white,
                  textAlign: "center",
                  fontSize: 18,
                }}
              >
                {isLoading ? "Loading..." : "Start"}
              </span>
            </View>
          </Pressable>
        </View>
      </View>
    </Container>
    </Layout>
    </div>

  );
}
