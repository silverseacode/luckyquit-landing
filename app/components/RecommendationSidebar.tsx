import { User } from "@/models";
import styles from "./recommendation-sidebar.module.css";
import { View, span } from "react-native";
import RecommendationCard  from "./RecommendationCard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
interface IProps {
  usersRecommendation: User[];
  myUserId: string | undefined;
  isLoading: boolean;
  userType: string | undefined
}

const RecommendationSidebar = ({
  usersRecommendation,
  myUserId,
  isLoading,
  userType
}: IProps) => {
  const start = 0;
  const end = 6;
  console.log(222,usersRecommendation)

  usersRecommendation = usersRecommendation?.filter(
    (item) => item.userId !== myUserId
  );
  return (
    <div className={styles.container}>
      {!isLoading ? (
        <>
          <h3 style={{ marginTop: 0, paddingLeft: "20px", marginBottom: 10 }}>
            {userType === "coach" ? "Quitters" : "Coaches"}
          </h3>
          <View
            style={{ flexDirection: "row", marginLeft: 11, flexWrap: "wrap" }}
          >
            {usersRecommendation?.slice(start, end).map((item) => {
              return <RecommendationCard key={item._id} item={item} />;
            })}
          </View>
        </>
      ) : (
        <div className={styles.spinnerOverlay}>
          <div className={styles.spinnerContainer}></div>
        </div>
      )}
      {(usersRecommendation?.length === 0 || usersRecommendation === undefined) && !isLoading && (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 40,
            marginRight: 20,
            marginLeft: 20
          }}
        >
          <PeopleAltIcon style={{ fontSize: 40 }} />
          <span
            style={{ fontSize: 15, marginTop: 20, textAlign: "center" }}
          >{`There are no users available to recommend for you to connect with.`}</span>
        </View>
      )}
    </div>
  );
};

export default RecommendationSidebar