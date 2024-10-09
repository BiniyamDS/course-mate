import React, { useState } from "react";

const Tooltip = ({ text, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute top-full left-full ml-2 mt-2 w-max bg-gray-700 text-white text-sm px-2 py-1 rounded transform -translate-x-full">
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
