import * as React from "react";
import Svg, { Path } from "react-native-svg";

function HomeIcon(props) {
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
        d="M12 18V15"
        stroke={props.color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.6398 19.2401C20.3998 20.6501 19.0298 21.8101 17.5998 21.8101H6.39978C4.95978 21.8101 3.59978 20.6601 3.35978 19.2401L2.02978 11.2801C1.85978 10.3001 2.35978 8.99009 3.13978 8.37009L10.0698 2.82009C11.1298 1.97009 12.8598 1.97009 13.9298 2.83009L20.8598 8.37009C21.6298 8.99009 22.1298 10.3001 21.9698 11.2801L21.3498 15.0001"
        stroke={props.color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default HomeIcon;
