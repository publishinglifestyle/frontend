import { Spinner } from "@heroui/react";
import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="text-center align-center items-center justify-center flex h-full ">
      <Spinner color="secondary" />
    </div>
  );
};

export default LoadingSpinner;
