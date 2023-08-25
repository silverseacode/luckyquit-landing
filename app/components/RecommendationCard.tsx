import { Colors } from "@/app/colors";
import { User } from "@/models";
import { TouchableOpacity, View, span } from "react-native";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface IProps {
  item: User;
}

const RecommendationCard = ({ item }: IProps) => {
  const router = useRouter();
  
  return (
    
    <View
      style={{
        flexBasis: "45%",
        paddingHorizontal: 5,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.lightGray,
        borderRadius: 8,
        padding: 20,
        margin: 5,
      }}
    >
      <TouchableOpacity onPress={() => {
      router.replace(`/profile/${item.userId}/false`)
    }}>
      <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
        {item.profilePicture !== "" && item.profilePicture !== undefined ? (
          <Image
          height={80}
          width={80}
            style={{ height: 80, width: 80, borderRadius: 50, objectFit: "cover" }}
            src={item.profilePicture }
            alt="Profile picture"
          />
        ) : (
          <View
            style={{
              height: 80,
              width: 80,
              borderRadius: 50,
              backgroundColor: item.backgroundColor,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <span style={{ color: Colors.blackDefault, fontSize: 18 }}>
              {item.initials}
            </span>
          </View>
        )}
        </div>
        <span style={{ fontWeight: "600", fontSize: 16, marginTop: 5, textAlign: "center" }}>
          {`${item.firstName} ${item.lastName}`}
        </span>
      </TouchableOpacity>
    </View>
  );
};

export default RecommendationCard
