import { View, span, Image, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { Coach } from "@/models";
import { getFollowersBE } from "@/helpers/followers";
import { Colors } from "@/app/colors";
import FollowCard  from "./FollowCard";
import { Grid } from "@mui/material";

interface IProps {
  data: Coach[];
  createInvitation: (person: Coach) => void;
}

const RecommendedForYou = ({ data, createInvitation }: IProps) => {
  const [indexHasMany, setIndexHowMany] = useState(3);
  const showThreeMoreCoachs = () => {
    setIndexHowMany((prev) => prev + 3);
  };

  const maxToShow = 50;
  const condition = indexHasMany <= data.length || indexHasMany > maxToShow;

  return (
    <View style={{ marginTop: 10, backgroundColor: Colors.white }}>
      <View
        style={{ backgroundColor: Colors.white, padding: 10, paddingLeft: 20 }}
      >
        <span style={{ fontWeight: "600", fontSize: 17 }}>
          Coaches recommend for you
        </span>
      </View>
      <Grid container direction={"row"}>
        {data
          .filter((item, index) => index < indexHasMany)
          .map((coach, index) => {
            return <FollowCard key={index} coach={coach} />;
          })}
      </Grid>
      {condition && (
        <TouchableOpacity onPress={() => showThreeMoreCoachs()}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              padding: 15,
              paddingBottom: 35,
              width: "100%",
            }}
          >
            <span
              style={{ color: Colors.blue, fontSize: 18, fontWeight: "600" }}
            >
              Show 3 more
            </span>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default RecommendedForYou