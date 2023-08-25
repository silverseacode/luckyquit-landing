"use client"
import PostDetail from "../../../app/components/PostDetail";
import Layout from "../../../app/components/Layout";
import { Container, Grid } from "@mui/material";
import styles from "../../components/comments.module.css";
import ProfileSidebar  from "../../../app/components/ProfileSidebar";
import { getUser, getUsersLookingForCoachBE, getUsersLookingForQuittersBE } from "@/helpers/users";
import { useEffect, useState } from "react";
import { User } from "@/models";
import RecommendationSidebar  from "../../../app/components/RecommendationSidebar";
import Header from "@/globals/Header";
export default function Comments({params}: any) {
  const postId = params.postId
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
    getUserInfo();
  }, []);
  return (
    <Layout title={"Lucky Quit - Quit smoking for life"}>
      <Header />
      <div className={styles.container}>
        <Container maxWidth="lg">
          <Grid container direction={"row"} spacing={4}>
            <Grid item xs={3}>
              <ProfileSidebar user={user} showButtons={false} />
            </Grid>
            <Grid item xs={6}>
              <PostDetail postId={postId} />
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


