import * as React from "react";
import Svg, { Path } from "react-native-svg";

function ControlsIcon(props) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M2 7.26001C2 3.70001 2.75 2.40003 5.52 2.09003C6.04 2.02003 6.61 2 7.27 2H16.74C17.39 2 17.97 2.02003 18.49 2.09003C21.26 2.40003 22.01 3.70001 22.01 7.26001V13.58C22.01 17.14 21.26 18.44 18.49 18.75C17.97 18.82 17.4 18.84 16.74 18.84H7.27C6.62 18.84 6.04 18.82 5.52 18.75C2.75 18.44 2 17.14 2 13.58V11.1"
        stroke={props.color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.5801 8.32001H17.2601"
        stroke={props.color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.73999 14.11H6.75998H17.27"
        stroke={props.color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 22H17"
        stroke={props.color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.1947 8.29999H7.20368"
        stroke={props.color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.4945 8.29999H10.5035"
        stroke={props.color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default ControlsIcon;
