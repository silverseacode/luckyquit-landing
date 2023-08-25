"use client";
import { useEffect, useState } from "react";
import { Pressable, View, TextInput, TouchableOpacity } from "react-native";
import { Colors } from "@/app/colors";
import {
  InfoCircleOutlined,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import {
  changePasswordBE,
  getUser,
  getUserByEmail,
  login,
  loginGoogle,
  signUp,
} from "@/helpers/users";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";
import { User } from "@/models";
import mixpanel from "mixpanel-browser";
import Image from "next/image";
import { auth } from "../../config/firebase";
import { signInWithPopup, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import AppleIcon from '@mui/icons-material/Apple';
export default function Login() {
  mixpanel.init("95299735e5b3e40287e56f4c0373b053", {
    debug: true,
    track_pageview: true,
    persistence: "localStorage",
  });

  const googleAuth = new GoogleAuthProvider();
  const [user, setUser] = useAuthState(auth);

  useEffect(() => {
    async function loginGoogleFunc() {
      const dataToSend = {
        email: user?.email,
      };
      const response = await loginGoogle(dataToSend);

      localStorage.setItem("jwtToken", response.response.token);
      localStorage.setItem("email", user?.email);

      const data = await getUserByEmail(user?.email);

      const userDB: User = data.response.user;

      if (userDB !== null) {
        localStorage.setItem("UUID", userDB?.userId);
        if (
          userDB.userId !== "" &&
          userDB.userId !== null &&
          userDB.userId !== undefined &&
          userDB.firstName !== undefined &&
          userDB.firstName !== "" &&
          userDB.firstName !== null
        ) {
          router.push(`/home`);
          return;
        }
      }

      router.push("/infoUser");
    }

    if (user !== undefined && user !== null) {
      loginGoogleFunc();
    }
  }, [user]);

  const router = useRouter();
  const [showErrorForm, setErrorForm] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [changeToLoginView, setChangeToLoginView] = useState(false);
  const [isChangingPassword, setChangePassword] = useState(false);

  useEffect(() => {
    async function redirectFromLoginToHome() {
      const data = await getUser();
      const user: User = data.response[0];
      console.log("user", user);
      if (
        user?.userId !== "" &&
        user?.userId !== null &&
        user?.userId !== undefined &&
        user?.firstName !== undefined &&
        user?.firstName !== "" &&
        user?.firstName !== null
      ) {
        console.log("ENRA")
        localStorage.setItem("UUID", user.userId);

        router.push(`/home`);
      }
    }
    redirectFromLoginToHome();
  }, []);

  // const loginUser = async (email: string, password: string) => {
  //   if (email.trim() === "") {
  //     setErrorForm("Email cannot be empty");
  //   }
  //   if (password.trim() === "") {
  //     setErrorForm("Password cannot be empty");
  //     return;
  //   }
  //   const data = {
  //     email,
  //     password,
  //     hasChangedPassword: isChangingPassword,
  //   };
  //   const response = await login(
  //     data.email,
  //     data.password,
  //     data.hasChangedPassword
  //   );
  //   const token = response.token;
  //   console.log("RESPONSE", response);
  //   if (response.response.token !== undefined) {
  //     localStorage.setItem("jwtToken", response.response.token);
  //     localStorage.setItem("email", email);
  //     const data = await getUserByEmail(email);
  //     const user: User = data.response.user;
  //     if (user.userId !== undefined) {
  //       localStorage.setItem("UUID", user.userId);
  //     }

  //     if (
  //       user.userId !== "" &&
  //       user.userId !== null &&
  //       user.userId !== undefined &&
  //       user.firstName !== undefined &&
  //       user.firstName !== "" &&
  //       user.firstName !== null
  //     ) {
  //       router.push(`/home`);
  //     } else {
  //       router.push("/infoUser");
  //     }
  //   } else {
  //     setErrorForm(response.response.message);
  //   }
  // };

  const [showMessageNewPass, setShowMessageNewPass] = useState(false);
  // const changePassword = async () => {
  //   if (email.trim() === "") {
  //     setErrorForm("Email cannot be empty");
  //   }
  //   if (password.trim() === "") {
  //     setErrorForm("Password cannot be empty");
  //     return;
  //   }
  //   if (password.length < 6) {
  //     setErrorForm(`Passwords cannot be less than six characters`);
  //     return;
  //   }
  //   const data = {
  //     email,
  //     password,
  //   };
  //   setChangeToLoginView(false);
  //   await changePasswordBE(data);
  //   setShowMessageNewPass(true);
  // };

  const [isEmailRegisterSent, setEmailSentRegister] = useState(false);

  // mixpanel.track("User register Web");
  // const registerUser = async (email: string, password: string) => {
  //   if (email.trim() === "") {
  //     setErrorForm("Email cannot be empty");
  //   }
  //   if (password.trim() === "" || passwordConfirm.trim() === "") {
  //     setErrorForm("Password cannot be empty");
  //     return;
  //   }
  //   if (password !== passwordConfirm) {
  //     setErrorForm(`Passwords doesn't match`);
  //     return;
  //   }
  //   if (password.length < 6 || passwordConfirm.length < 6) {
  //     setErrorForm(`Passwords cannot be less than six characters`);
  //     return;
  //   }
  //   const data = {
  //     email,
  //     password,
  //   };
  //   const res = await signUp(data);

  //   console.log("res", res);
  //   if (res.response.ok === 0) {
  //     setErrorForm(res.message);
  //     return;
  //   } else {
  //     setEmailSentRegister(true);
  //     setIsRegister(false);
  //     setErrorForm("");
  //   }
  // };

  const [isRegister, setIsRegister] = useState(false);

  const signInGoogle = async () => {
    const result = await signInWithPopup(auth, googleAuth);
  };

  const signInApple = async() => {
    const provider = new OAuthProvider("apple.com")
    const result = await signInWithPopup(auth,provider);
    console.log("APPLE DATA",result.user.email)

    const email = result.user.email


    const dataToSend = {
      email: email,
    };
    const response = await loginGoogle(dataToSend);

    localStorage.setItem("jwtToken", response.response.token);
    localStorage.setItem("email", email);

    const data = await getUserByEmail(email);

    const userDB: User = data.response.user;

    if (userDB !== null) {
      localStorage.setItem("UUID", userDB?.userId);
      if (
        userDB.userId !== "" &&
        userDB.userId !== null &&
        userDB.userId !== undefined &&
        userDB.firstName !== undefined &&
        userDB.firstName !== "" &&
        userDB.firstName !== null
      ) {
        router.push(`/home`);
        return;
      }
    }

    router.push("/infoUser");


  }

  return (
    <div style={{ backgroundColor: "rgba(125,95,206,0.06)", height: "100vh" }}>
      <Layout title={"Lucky Quit - Quit smoking for life"} hideHeader={true}>
        <>
          {/* {!isRegister && (
            <>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: 160,
                }}
              >
                <span style={{ fontSize: 25, marginBottom: 30 }}>
                  Lucky Quit
                </span>
                <span>
                  {!changeToLoginView
                    ? "Please enter your details"
                    : "Please enter your details for your new password"}
                </span>
                <View style={{ marginTop: 20 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: "#FFF",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 8,
                    }}
                  >
                    <View
                      style={{
                        height: 30,
                        marginLeft: 4,
                        width: 30,
                        borderRadius: 8,
                        backgroundColor: Colors.white,
                        zIndex: 2,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <MailOutlined
                        style={{ fontSize: "18px", color: Colors.primary }}
                      />
                    </View>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="you@example.com"
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholderTextColor={"grey"}
                      style={{
                        width: 325,
                        height: 32,
                        position: "relative",
                        outline: "none",
                        paddingTop: 20,
                        paddingBottom: 20,
                        paddingLeft: 9,
                        paddingRight: 9,
                        backgroundColor: "#E7F0FE",
                        borderBottomRightRadius: 8,
                        borderTopRightRadius: 8,
                      }}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 15,
                      backgroundColor: "#FFF",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 8,
                    }}
                  >
                    <View
                      style={{
                        height: 30,
                        marginLeft: 4,
                        width: 30,
                        borderRadius: 8,
                        backgroundColor: Colors.white,
                        zIndex: 2,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <LockOutlined
                        style={{ fontSize: "18px", color: Colors.primary }}
                      />
                    </View>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder={
                        !changeToLoginView
                          ? "Your new password"
                          : "Your password"
                      }
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry={true}
                      placeholderTextColor={"grey"}
                      style={{
                        width: 325,
                        height: 32,
                        position: "relative",
                        outline: "none",
                        paddingTop: 20,
                        paddingBottom: 20,
                        paddingLeft: 9,
                        paddingRight: 9,
                        backgroundColor: "#E7F0FE",
                        borderBottomRightRadius: 8,
                        borderTopRightRadius: 8,
                      }}
                    />
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 230,
                  marginVertical: 20,
                }}
              >
                <Pressable
                  style={{}}
                  onPress={() => setChangeToLoginView((prev) => !prev)}
                >
                  <span style={{ fontWeight: "600", color: Colors.primary }}>
                    Forgot password?
                  </span>
                </Pressable>
              </View>
              {showErrorForm?.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 20,
                  }}
                >
                  <span style={{ color: Colors.red }}>{showErrorForm}</span>
                </View>
              )}
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Pressable
                    style={{
                      backgroundColor: Colors.primary,
                      padding: 10,
                      borderRadius: 6,
                      width: "23%",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() => {
                      if (changeToLoginView) {
                        setChangePassword(true);
                        changePassword();
                      } else {
                        loginUser(email, password);
                      }
                    }}
                  >
                    <span style={{ color: Colors.white, textAlign: "center" }}>
                      {changeToLoginView ? "Get new password" : "Login "}
                    </span>
                  </Pressable>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <span>
                  Don't you have an account?{" "}
                  <Pressable
                    onPress={() => {
                      setEmailSentRegister(false);
                      setEmail("");
                      setPassword("");
                      setPasswordConfirm("");
                      setIsRegister(true);
                      setErrorForm("");
                      setChangePassword(false);
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "600",
                        color: Colors.primary,
                      }}
                    >
                      Sign Up
                    </span>
                  </Pressable>
                </span>
              </View>
              {changeToLoginView && (
                <Pressable
                  onPress={() => {
                    setChangePassword(false);
                    setChangeToLoginView(false);
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      marginTop: 15,
                    }}
                  >
                    <span style={{ color: Colors.primary, fontWeight: "600" }}>
                      Login
                    </span>
                  </View>
                </Pressable>
              )}
              {isEmailRegisterSent && (
                <View
                  style={{
                    justifyContent: "center",
                    marginTop: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    marginHorizontal: 40,
                  }}
                >
                  <InfoCircleOutlined
                    style={{ fontSize: 24, color: Colors.success }}
                  />
                  <span style={{ color: Colors.darkGray, marginLeft: 10 }}>
                    We send you an email that you must accept to be able to
                    login with the credentials you provide.
                  </span>
                </View>
              )}
              {showMessageNewPass && (
                <View
                  style={{
                    justifyContent: "center",
                    marginTop: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    marginHorizontal: 40,
                  }}
                >
                  <InfoCircleOutlined
                    style={{ fontSize: 24, color: Colors.success }}
                  />
                  <span style={{ color: Colors.darkGray, marginLeft: 10 }}>
                    We send you an email that you must accept to be able to
                    login with the new password.
                  </span>
                </View>
              )}
            </>
          )} */}
          {/* {!isRegister && ( */}
            <>
              {/* <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 40,
                }}
              >
                <span>OR</span>
              </View> */}
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: 160,
                }}
              >
                <span style={{ fontSize: 25, marginBottom: 30 }}>
                  Lucky Quit
                </span>
                <span>
                  {!changeToLoginView
                    ? "Please enter your details"
                    : "Please enter your details for your new password"}
                </span>
              </View>
              <View
                style={{
                  marginTop: 40,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity onPress={signInGoogle}>
                  <View
                    style={{
                      backgroundColor: Colors.white,
                      width: 315,
                      height: 60,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 50,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Image
                        src={"/googleIcon.png"}
                        width={30}
                        height={30}
                        style={{ marginRight: 15 }}
                        alt="google icon"
                      />
                      <span style={{ fontSize: 17 }}>
                        Sign up with Google
                      </span>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  marginTop: 40,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity onPress={signInApple}>
                  <View
                    style={{
                      backgroundColor: Colors.white,
                      width: 315,
                      height: 60,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 50,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                     <AppleIcon style={{fontSize: 43, marginRight: 15}} />
                      <span style={{  fontSize: 17 }}>
                        Sign up with Apple
                      </span>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          {/* )} */}
        </>
        <>
          {/* {isRegister && (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 160,
              }}
            >
              <span style={{ fontSize: 25, marginBottom: 30 }}>Lucky Quit</span>
              <span>Please enter your details.</span>
              <View
                style={{
                  marginTop: 20,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: "#FFF",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 8,
                  }}
                >
                  <View
                    style={{
                      height: 30,
                      marginLeft: 4,
                      width: 30,
                      borderRadius: 8,
                      backgroundColor: Colors.white,
                      zIndex: 2,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MailOutlined
                      style={{ fontSize: "18px", color: Colors.primary }}
                    />
                  </View>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Your email"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor={"grey"}
                    style={{
                      width: 325,
                      height: 32,
                      position: "relative",
                      outline: "none",
                      paddingTop: 20,
                      paddingBottom: 20,
                      paddingLeft: 9,
                      paddingRight: 9,
                      backgroundColor: "#E7F0FE",
                      borderBottomRightRadius: 8,
                      borderTopRightRadius: 8,
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 15,
                    backgroundColor: "#FFF",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 8,
                  }}
                >
                  <View
                    style={{
                      height: 30,
                      marginLeft: 4,
                      width: 30,
                      borderRadius: 8,
                      backgroundColor: Colors.white,
                      zIndex: 2,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <LockOutlined
                      style={{ fontSize: "18px", color: Colors.primary }}
                    />
                  </View>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Your new password"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor={"grey"}
                    style={{
                      width: 325,
                      height: 32,
                      position: "relative",
                      outline: "none",
                      paddingTop: 20,
                      paddingBottom: 20,
                      paddingLeft: 9,
                      paddingRight: 9,
                      backgroundColor: "#E7F0FE",
                      borderBottomRightRadius: 8,
                      borderTopRightRadius: 8,
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 15,
                    backgroundColor: "#FFF",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 8,
                  }}
                >
                  <View
                    style={{
                      height: 30,
                      marginLeft: 4,
                      width: 30,
                      borderRadius: 8,
                      backgroundColor: Colors.white,
                      zIndex: 2,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <LockOutlined
                      style={{ fontSize: "18px", color: Colors.primary }}
                    />
                  </View>
                  <TextInput
                    value={passwordConfirm}
                    onChangeText={setPasswordConfirm}
                    placeholder="Confirm your password"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor={"grey"}
                    style={{
                      width: 325,
                      height: 32,
                      position: "relative",
                      outline: "none",
                      paddingTop: 20,
                      paddingBottom: 20,
                      paddingLeft: 9,
                      paddingRight: 9,
                      backgroundColor: "#E7F0FE",
                      borderBottomRightRadius: 8,
                      borderTopRightRadius: 8,
                    }}
                  />
                </View>
                <span
                  style={{
                    marginTop: 25,
                    color: Colors.darkGray,
                    marginLeft: 40,
                  }}
                >
                  Password cannot be less than six characters
                </span>
                {showErrorForm?.length > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: 20,
                    }}
                  >
                    <span style={{ color: Colors.red }}>{showErrorForm}</span>
                  </View>
                )}

                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 20,
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Pressable
                      style={{
                        backgroundColor: Colors.primary,
                        padding: 10,
                        borderRadius: 6,
                        width: 187,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={() => registerUser(email, password)}
                    >
                      <span
                        style={{ color: Colors.white, textAlign: "center" }}
                      >
                        Register
                      </span>
                    </Pressable>
                  </View>
                </View>

                <View>
                  <span style={{ textAlign: "center" }}>
                    Go back to{" "}
                    <Pressable
                      onPress={() => {
                        setEmail("");
                        setPassword("");
                        setPasswordConfirm("");
                        setIsRegister(false);
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "600",
                          color: Colors.primary,
                        }}
                      >
                        Login
                      </span>
                    </Pressable>
                  </span>
                </View>
              </View>
            </View>
          )} */}
        </>
      </Layout>
    </div>
  );
}
