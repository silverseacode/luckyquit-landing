"use client";
import Layout from "../../app/components/Layout";
import { Container, Grid } from "@mui/material";
import styles from "../components/network.module.css";
import ProfileSidebar from "../../app/components/ProfileSidebar";
import { getUser } from "@/helpers/users";
import { useEffect, useState } from "react";
import NetworkPage from "../../app/components/NetworkPage";
import Header from "@/globals/Header";
import { useRouter } from "next/navigation";

export default function Network() {
  const [user, setUser] = useState();
  const [isCheckingUserId, setCheckingUserId] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const itemUUID = localStorage.getItem("UUID");
    const UUID = itemUUID ? itemUUID : null;
    if (UUID === null) {
      router.replace("/login");
    }
    setCheckingUserId(false);
  }, [router]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getUserInfo() {
      const data = await getUser();
      console.log(data);
      const userDB = data.response[0];
      setUser(userDB);
      setIsLoading(false);
    }
    if(isCheckingUserId) {
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
            <Grid item xs={3}>
              <ProfileSidebar
                isLoading={isLoading}
                user={user}
                showButtons={false}
              />
            </Grid>
            <Grid item xs={9}>
              <NetworkPage />
            </Grid>
          </Grid>
        </Container>
      </div>
    </Layout>
  );
}
