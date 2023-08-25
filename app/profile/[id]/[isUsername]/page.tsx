"use client";
import Layout from "../../../components/Layout";
import { Container, Grid } from "@mui/material";
import styles from "../../../components/profile.module.css";
import RecommendationSidebar from "../../../components/RecommendationSidebar";
import {
  getUser,
  getUsersLookingForCoachBE,
  getUsersLookingForQuittersBE,
} from "@/helpers/users";
import { useEffect, useState } from "react";
import { User } from "@/models";
import ProfilePage from "../../../components/ProfilePage";
import { useRouter } from "next/navigation";
import Header from "@/globals/Header";

export default function Profile({ params }: any) {
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
  const id = params.id;
  const isUserName = params.isUsername;
  const [user, setUser] = useState<User>();
  const [usersRecommendation, setUsersRecommendation] = useState<User[]>([]);

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
      console.log(data);
      const userDB = data.response[0];
      setUser(userDB);
      if (userDB.type === "coach") {
        getUsersLookingForCoach();

      } else {
        getUsersLookingForQuitters();

      }
    }
    if (!isCheckingUserId) {
      getUserInfo();
    }
  }, [isCheckingUserId]);
  if (isCheckingUserId) return null;
  return (
    <Layout title={"Lucky Quit - Quit smoking for life"}>
      <Header />
      <div className={styles.container}>
        <Container maxWidth="lg">
          <Grid container direction={"row"} spacing={4}>
            <Grid item xs={9}>
              <ProfilePage id={id} isUsername={isUserName} />
            </Grid>
            <Grid item xs={3}>
              <RecommendationSidebar
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
