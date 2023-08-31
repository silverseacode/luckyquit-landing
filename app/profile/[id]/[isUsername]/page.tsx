import Layout from "../../../components/Layout";
import { Container, Grid } from "@mui/material";
import styles from "../../../../app/components/profile.module.css";
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
import { API_URL } from "@/config";
async function fetchUser(id: string) {
  console.log("PARAMS123", id);
  const userResponse = await fetch(`${API_URL}/user/only/${id}`, {
    cache: "no-store",
  });

  //falla la llamada a la pagina
  const res = await userResponse.json();
  return res;
}

export default async function Profile(params: any) {
  console.log("PARAMS12345", params.params.id);
  const userContext = await fetchUser(params.params.id);
  console.log("USER", userContext);
console.log("PUSH")
  //const [isCheckingUserId, setCheckingUserId] = useState(true);
  // useEffect(() => {
  //   const itemUUID = localStorage.getItem("UUID");
  //   const UUID = itemUUID ? itemUUID : null;
  //   if (UUID === null) {
  //     router.replace("/login");
  //   }
  //   setCheckingUserId(false);
  // }, [router]);
  // const [user, setUser] = useState<User>();
  // const [usersRecommendation, setUsersRecommendation] = useState<User[]>([]);

  // useEffect(() => {
  //   async function getUsersLookingForCoach() {
  //     const data = await getUsersLookingForCoachBE();
  //     setUsersRecommendation(data.response.users);
  //   }

  //   async function getUsersLookingForQuitters() {
  //     const data = await getUsersLookingForQuittersBE();
  //     setUsersRecommendation(data.response.users);
  //   }

  //   async function getUserInfo() {
  //     const data = await getUser();
  //     console.log(data);
  //     const userDB = data.response[0];
  //     setUser(userDB);
  //     if (userDB.type === "coach") {
  //       getUsersLookingForCoach();

  //     } else {
  //       getUsersLookingForQuitters();

  //     }
  //   }

  //     getUserInfo();

  // }, []);
  //if (isCheckingUserId) return null;
  return (
    <Layout title={"Lucky Quit - Quit smoking for life"}>
      <Header />
      <div className={styles.container}>
        <Container maxWidth="lg">
          <Grid container direction={"row"} spacing={4}>
            <Grid item xs={9}>
              <div>
                <ProfilePage
                  userContext={userContext[0]}
                  id={params.params.id}
                  isUsername={params.params.isUserName}
                />
              </div>
            </Grid>
            <Grid item xs={3}>
              {/* <RecommendationSidebar
    //             usersRecommendation={usersRecommendation}
    //             myUserId={user?.userId}
    //             userType={user?.type}
    //           /> */}
            </Grid>
          </Grid>
        </Container>
      </div>
    </Layout>
  );
}

// export const getStaticPaths = async () => {
//   const res = await fetch(`${API_URL}/user/getAllUserIds/now`);
//   const data = await res.json()
//   const userIds = data.userIds
//   const paths = userIds.map((id: string) => {
//       return { params: { id: id, isUsername: "false" } };
//   });

//   return {
//       paths: paths,
//       fallback: false,
//   };
// };

// export const getServerSideProps = async (
//   context: any
// ) => {

//   console.log("CONTEXT", context)
// //  const params = context.params!;

//   //try {
//       //const data = await getCustomer(params.id);
//       //console.log('!!!', data);

//       // if (!data) {
//       //     return {
//       //         notFound: true,
//       //         revalidate: 60,
//       //     };
//       // }

//       return {
//           props: {
//               id: context.params.id,
//               isUserName:context.params.isUsername
//           },
//           //revalidate: 60,
//       };
//   // } catch (err) {
//   //     console.log(err);
//   //     if (err instanceof BSONTypeError) {
//   //         return {
//   //             notFound: true,
//   //         };
//   //     }
//   //     throw err;
//   // }
// };
