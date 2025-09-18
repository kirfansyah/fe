/* eslint-disable react/jsx-no-target-blank */
import { useRef } from "react";
import React from "react"; 
import WebLayout from "layouts/WebLayout";

const Homepage = () => {
  const contentRef = useRef(null);
  return (
      <WebLayout contentRef={contentRef}>
      </WebLayout> 
  );
}
export default Homepage;
