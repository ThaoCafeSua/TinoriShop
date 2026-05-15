"use client";

import { useState } from "react";

export default function LogoImage() {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        style={{
          fontFamily: "sans-serif",
          fontSize: "4rem",
          fontWeight: 900,
          color: "#9a7182",
          letterSpacing: "-2px",
          lineHeight: 1,
        }}
      >
        Tinori
      </div>
    );
  }

  return (
    <img
      src="/brand/logo.jpg"
      alt="Tinori"
      className="mx-auto h-48 md:h-80 object-contain"
      onError={() => setError(true)}
    />
  );
}
