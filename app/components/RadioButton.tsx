import { Colors } from "@/app/colors";
import { View } from "react-native";

interface IProps {
  label?: string;
  active: boolean;
  hasBorder?: boolean;
  width?: string | number;
  paddingVertical?: number;
  colorInactive?: string
}

const RadioButton = ({
  label,
  active,
  hasBorder = true,
  width,
  paddingVertical,
  colorInactive
}: IProps) => {
  return (
    <View style={{ flexDirection: "row" }}>
      <View
        style={{
          flexDirection: "row",
          borderWidth: hasBorder ? 2 : 0,
          borderColor: hasBorder
            ? active
              ? Colors.primary
              : Colors.lightGray
            : "unset",
          borderRadius: 6,
          width: width ? width : 150,
          paddingHorizontal: 10,
          paddingVertical: paddingVertical ? paddingVertical : 5,
          alignItems: "center",
        }}
      >
        <View
          style={{
            height: 20,
            width: 20,
            borderRadius: 50,
            borderWidth: 2,
            borderColor: active ? Colors.primary : colorInactive ? colorInactive : Colors.lightGray,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              height: 13,
              width: 13,
              borderRadius: 50,
              backgroundColor: active ? Colors.primary : Colors.white,
            }}
          ></View>
        </View>
        <View style={{ marginLeft: 10 }}>
          <span style={{ fontWeight: "600" }}>{label}</span>
        </View>
      </View>
    </View>
  );
};

export default RadioButton