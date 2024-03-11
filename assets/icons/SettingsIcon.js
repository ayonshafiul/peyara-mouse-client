import * as React from "react";
import Svg, { Path } from "react-native-svg";

function SettingsIcon(props) {
  return (
    <Svg
      width={25}
      height={24}
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M3.01562 13.08V14.88C3.01562 17 3.01562 17 5.01562 18.35L10.5156 21.53C11.3456 22.01 12.6956 22.01 13.5156 21.53L19.0156 18.35C21.0156 17 21.0156 17 21.0156 14.89V9.10998C21.0156 6.99998 21.0156 6.99999 19.0156 5.64999L13.5156 2.46999C12.6956 1.98999 11.3456 1.98999 10.5156 2.46999L5.01562 5.64999C3.01562 6.99999 3.01562 6.99998 3.01562 9.10998"
        stroke={props.color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.0156 12C15.0156 10.34 13.6756 9 12.0156 9C10.3556 9 9.01562 10.34 9.01562 12C9.01562 13.66 10.3556 15 12.0156 15C12.4256 15 12.8256 14.92 13.1856 14.76"
        stroke={props.color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SettingsIcon;
