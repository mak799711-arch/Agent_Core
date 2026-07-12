import React from "react";

interface VerificationBadgeProps {
  size?: number;
  style?: React.CSSProperties;
}

export default function VerificationBadge({
  size = 16,
  style = {},
}: VerificationBadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        verticalAlign: "middle",
        marginLeft: "6px",
        filter: "drop-shadow(0 0 4px rgba(82, 196, 26, 0.75))",
        ...style,
      }}
      title="Verified Partner"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5L6 12.5L7.41 11.09L10 13.67L16.59 7.09L18 8.5L10 16.5Z"
          fill="#52c41a"
        />
      </svg>
    </span>
  );
}
