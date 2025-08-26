import React from "react";

const Loader = ({ text = "جاري التحميل..." }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
    <span className="text-muted-foreground text-lg">{text}</span>
  </div>
);

export default Loader;
