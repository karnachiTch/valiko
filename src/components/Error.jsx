import React from "react";
import Icon from "./AppIcon";

const Error = ({ message = "حدث خطأ ما!" }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Icon name="AlertTriangle" size={40} className="text-error mb-2" />
    <span className="text-error text-lg font-semibold">{message}</span>
  </div>
);

export default Error;
