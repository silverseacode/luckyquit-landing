"use client";
import { Container, Grid } from "@mui/material";
import Layout from "../../app/components/Layout";
import styles from "../../app/components/messages.module.css";
import MessagesList from "../../app/components/MessagesList";
import Chat from "../../app/components/Chat";
import RecommendationSidebar from "../../app/components/RecommendationSidebar";
import {
  getUser,
  getUsersLookingForCoachBE,
  getUsersLookingForQuittersBE,
} from "@/helpers/users";
import { useEffect, useState } from "react";
import { User } from "@/models";
import Header from "@/globals/Header";
import { useRouter } from "next/navigation";

export default function Messages() {
  const [user, setUser] = useState<User>();
  const [usersRecommendation, setUsersRecommendation] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [isCheckingUserId, setCheckingUserId] = useState(true);
  useEffect(() => {
    const itemUUID = localStorage.getItem("UUID");
    const UUID = itemUUID ? itemUUID : null;
    if (UUID === null) {
      router.replace("/login");
    }
    setCheckingUserId(false);
  }, [router]);

  useEffect(() => {
    async function getUsersLookingForCoach() {
      const data = await getUsersLookingForCoachBE();
      setUsersRecommendation(data.response.users);
    }

    async function getUsersLookingForQuitters() {
      const data = await getUsersLookingForQuittersBE();
      setUsersRecommendation(data.response.users);
    }

    async function getUserInfo() {
      const data = await getUser();
      const userDB = data.response[0];
      setUser(userDB);
      if (userDB?.type === "coach") {
        getUsersLookingForCoach();

        setIsLoading(false);
      } else {
        
        getUsersLookingForQuitters();

        setIsLoading(false);
      }
    }
    if(!isCheckingUserId) {
      getUserInfo();

    }
  }, [isCheckingUserId]);
  const [receiver, setReceiver] = useState();

  const [messageSend, setMessageSend] = useState();
  const [triggerChange, setTriggerChange] = useState(false);
  if (isCheckingUserId) return null;
  return (
    <Layout title={"Lucky Quit - Quit smoking for life"}>
      <Header />
      <div className={styles.container}>
        <Container maxWidth="lg">
          <Grid container direction={"row"} spacing={4}>
            <Grid item xs={4}>
              <MessagesList
                triggerChange={triggerChange}
                setTriggerChange={setTriggerChange}
                messageSend={messageSend}
                setReceiver={setReceiver}
                receiver={receiver}
                user={user}
              />
            </Grid>
            <Grid item xs={5}>
              <Chat
                triggerChange={triggerChange}
                setTriggerChange={setTriggerChange}
                setMessageSend={setMessageSend}
                setReceiver={setReceiver}
                receiver={receiver}
                user={user}
              />
            </Grid>
            <Grid item xs={3}>
              <RecommendationSidebar
                isLoading={isLoading}
                usersRecommendation={usersRecommendation}
                myUserId={user?.userId}
                userType={user?.type}
              />
            </Grid>
          </Grid>
        </Container>
      </div>
    </Layout>
  );
}
