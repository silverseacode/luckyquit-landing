"use client";
import Container from "@mui/material/Container";
import styles from "../home.module.css";
import { Grid } from "@mui/material";
import ProfileSidebar from "../components/ProfileSidebar";
import RecommendationSidebar from "../components/RecommendationSidebar";
import PostsHome from "../components/PostsHome";
import CreatePost from "../components/CreatePost";
import { useEffect, useState } from "react";
import {
  getUser,
  getUsersLookingForCoachBE,
  getUsersLookingForQuittersBE,
} from "@/helpers/users";
import { Post, User } from "@/models";
import Layout from "../components/Layout";
import Header from "@/globals/Header";
import { useRouter } from "next/navigation";
import mixpanel from "mixpanel-browser";
import { useSocket } from "../Context/store";
interface IProps {
  posts: { totalPages: number; response: { posts: Post[] } };
}

const Home = ({ posts }: IProps) => {
  const router = useRouter();
  const socket = useSocket();
  useEffect(() => {
    const itemUUID = localStorage.getItem("UUID");
      const UUID = itemUUID ? itemUUID : null;
      if(UUID === null) {
        router.push(`/login`);
      }
  },[])
  const [isCheckingUserId, setCheckingUserId] = useState(true);
  useEffect(() => {
    const itemUUID = localStorage.getItem("UUID");
    const UUID = itemUUID ? itemUUID : null;

    mixpanel.init("95299735e5b3e40287e56f4c0373b053", {
      debug: true,
      track_pageview: true,
      persistence: "localStorage",
    });
    mixpanel.identify(UUID);

    if (UUID === null) {
      router.replace("/login");
    }
    setCheckingUserId(false);
  }, [router]);

  const [user, setUser] = useState<User>();
  const [usersRecommendation, setUsersRecommendation] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function getUsersLookingForCoach() {
      const data = await getUsersLookingForCoachBE();
      console.log("trae quitters", data);
      if (data !== undefined) {
        setUsersRecommendation(data.response.users);
      }
    }

    async function getUsersLookingForQuitters() {
      const data = await getUsersLookingForQuittersBE();
      console.log("trae coachs", data);

      if (data !== undefined) {
        setUsersRecommendation(data.response.users);
      }
    }

    async function getUserInfo() {
      const data = await getUser();
      console.log(data);
      const userDB = data.response[0];
      setUser(userDB);
      if (userDB?.type === "coach") {
        //trae quitters
        getUsersLookingForCoach();
        setIsLoading(false);
      } else {
        //trae coaches
        getUsersLookingForQuitters();

        setIsLoading(false);
      }
    }
    if (!isCheckingUserId) {
      getUserInfo();
    }
  }, [isCheckingUserId]);

  const [showCalendar, setShowCalendar] = useState(false);
  const [showModules, setShowModules] = useState(false);
  const [showHomework, setShowHomework] = useState(false);

  const [newPostAdded, setNewPostAdded] = useState<Post>();
  const [isChangesWithoutSave, setChangesWithoutSave] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (isCheckingUserId) return null;

  return (
    <Layout title={"Lucky Quit - Quit smoking for life"}>
      <Header
        isChangesWithoutSave={isChangesWithoutSave}
        setShowModal={setShowModal}
      />
      <div className={styles.container}>
        <Container maxWidth="lg">
          <Grid container direction={"row"} spacing={4}>
            <Grid item xs={3}>
              <ProfileSidebar
                user={user}
                setShowCalendar={setShowCalendar}
                setShowModules={setShowModules}
                setShowHomework={setShowHomework}
                showButtons={true}
                isLoading={isLoading}
                isChangesWithoutSave={isChangesWithoutSave}
                setShowModal={setShowModal}
              />
            </Grid>
            <Grid item xs={showCalendar || showModules ? 9 : 6}>
              {!showModules && !showCalendar && (
                <CreatePost user={user} setNewPostAdded={setNewPostAdded} />
              )}
              <PostsHome
                showCalendar={showCalendar}
                setShowCalendar={setShowCalendar}
                showModules={showModules}
                setShowModules={setShowModules}
                newPostAdded={newPostAdded}
                showHomework={showHomework}
                setShowHomework={setShowHomework}
                user={user}
                posts={posts}
                setChangesWithoutSave={setChangesWithoutSave}
                isChangesWithoutSave={isChangesWithoutSave}
                showModal={showModal}
                setShowModal={setShowModal}
              />
            </Grid>
            {!showCalendar && !showModules && (
              <Grid item xs={3}>
                <RecommendationSidebar
                  isLoading={isLoading}
                  usersRecommendation={usersRecommendation}
                  myUserId={user?.userId}
                  userType={user?.type}
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </div>
    </Layout>
  );
};

export default Home;
