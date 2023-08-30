"use client";
import Layout from "../../../../app/components/Layout";
import { Container, Grid } from "@mui/material";
import styles from "../../../../app/components/profile.module.css";
import RecommendationSidebar from "../../../../app/components/RecommendationSidebar";
import {
  getUser,
  getUsersLookingForCoachBE,
  getUsersLookingForQuittersBE,
} from "@/helpers/users";
import { useEffect, useState } from "react";
import { User } from "@/models";
import ProfilePage from "../../../../app/components/ProfilePage";
import { useRouter } from "next/navigation";
import Header from "@/globals/Header";
import axios from "axios";
import { API_URL } from "@/config";

export default function Profile(props: any) {
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
  const id = props.id;
  const isUserName = props.isUserName;
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

export const getStaticPaths = async () => {
  const res = await fetch(`${API_URL}/user/getAllUserIds/now`);
  const data = await res.json()
  const userIds = data.userIds
  const paths = userIds.map((id: string) => {
      return { params: { id: id, isUsername: false } };
  });

  return { 
      paths: paths,
      fallback: false,
  };
};

export const getStaticProps = async (
  context: any
) => {

  console.log("CONTEXT", context)
//  const params = context.params!;

  //try {
      //const data = await getCustomer(params.id);
      //console.log('!!!', data);

      // if (!data) {
      //     return {
      //         notFound: true,
      //         revalidate: 60,
      //     };
      // }

      return {
          props: {
              id: context.params.id,
              isUserName:context.params.isUsername
          },
          //revalidate: 60,
      };
  // } catch (err) {
  //     console.log(err);
  //     if (err instanceof BSONTypeError) {
  //         return {
  //             notFound: true,
  //         };
  //     }
  //     throw err;
  // }
};
