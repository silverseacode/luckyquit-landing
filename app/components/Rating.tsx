import { IRating } from "@/models";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, span } from "react-native";

interface IProps {
  rating: number;
  setRating: (value: number) => void;
  ratings: IRating[];
  addOne: boolean;
  setAddOne: (value: boolean) => void;
}

const Rating = ({
  rating,
  setRating,
  ratings,
  addOne,
  setAddOne,
}: IProps) => {
  const [avg, setAvg] = useState(0);

  const getAvg = () => {
    let starsCount = 0;
    ratings.map((item) => {
      starsCount += item.stars;
    });
    const avg = Math.floor((starsCount / ratings.length) * 100) / 100;
    setAvg(ratings.length === 0 ? 0 : avg);
    setAddOne(false);
  };

  useEffect(() => {
    if (addOne) {
      getAvg();
    }
  }, [addOne]);

  useEffect(() => {
    getAvg();
  }, [ratings]);
  return (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginRight: 20 }}>
        <View style={styles.container}>
          {[1, 2, 3, 4, 5].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setRating(item)}
              activeOpacity={0.7}
            >
              {item >= rating + 1 ?
              <StarOutlined style={{ marginLeft: 30, color: "#FFD700", fontSize: 35}}/>:
              <StarFilled style={{ marginLeft: 30, color: "#FFD700", fontSize: 35 }} />
              }
            </TouchableOpacity>
          ))}
        </View>
        <span style={{ fontSize: 17, fontWeight: "600", marginLeft: 15 }}>
          {avg.toFixed(1)}/5 ({ratings?.length})
        </span>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    height: 40,
    width: "85%",
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fixedView: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingBottom: 35,
    paddingTop: 25,
    borderTopWidth: 1,
    borderTopColor: "gray",
  },
});

export default Rating