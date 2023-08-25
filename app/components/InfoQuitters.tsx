import {
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { IPlan, User } from "@/models";
import { Colors } from "@/app/colors";
import styles from "../components/info-quitters.module.css";
interface IProps {
  user: User | undefined;
}

const InfoQuitters = ({ user }: IProps) => {
  const [plans, setPlans] = useState<IPlan[]>();
  useEffect(() => {
    async function getMyUserId() {
      const itemUUID = localStorage.getItem("UUID");
      const myUserId = itemUUID ? itemUUID : "";
      const plansArray: IPlan[] = [];
      if (user?.type === "quitter") {
        user?.coaches.map((quitter: IPlan) => {
          plansArray.push(quitter);
        });
      } else {
        user?.quitters.map((coach: IPlan) => {
          plansArray.push(coach);
        });
      }
      setPlans(plansArray);
    }
    getMyUserId();
  },[user]);

  return (
    <div className={styles.container}>
      <View>
        <View>
          <>
            <View style={{ paddingBottom: 50 }}>
              <View
                style={{
                  marginTop: 20,
                  backgroundColor: Colors.white,
                  marginHorizontal: 20,
                  borderRadius: 6,
                }}
              >
                <View style={{ padding: 10 }}>
                  <span
                    style={{
                      textAlign: "center",
                      fontSize: 18,
                      fontWeight: "600",
                    }}
                  >
                    Your Quitters
                  </span>
                </View>
                <View style={{ paddingHorizontal: 20 }}>
                  {plans?.map((item, index) => {
                    return (
                      <View
                        key={index}
                        style={{
                          paddingHorizontal: 20,
                          backgroundColor: Colors.lightGray,
                          borderRadius: 8,
                          marginBottom: 20,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingVertical: 10,
                          }}
                        >
                          <span>Quitter</span>
                          <span>{`${item?.fullName}`}</span>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingVertical: 10,
                          }}
                        >
                          <span>Start date</span>
                          <span>{item?.planStart}</span>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingVertical: 10,
                          }}
                        >
                          <span>End date</span>
                          <span>{item?.planEnd}</span>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingVertical: 10,
                          }}
                        >
                          <span>Price</span>
                          <span>${item?.amount?.toFixed(2)}</span>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </>
        </View>
      </View>
    </div>
  );
};

// const styles = StyleSheet.create({
//   description: {
//     paddingRight: 20,
//     paddingTop: 10,
//     paddingBottom: 20,
//   },
//   textHeading: {
//     fontWeight: "600",
//     fontSize: 18,
//   },
//   heading: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   containerCard: {
//     marginTop: 10,

//     width: Dimensions.get("window").width - 50,
//     borderRadius: 6,
//     marginBottom: 20,
//     padding: 20,
//   },
//   header: {
//     //width: Dimensions.get("window").width,
//     height: 50,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });
export default InfoQuitters