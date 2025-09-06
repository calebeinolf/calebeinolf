import { useState, useEffect } from "react";

const useHasFinePointer = () => {
  const [hasFinePointer, setHasFinePointer] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(pointer: fine)");
      setHasFinePointer(mediaQuery.matches);

      const handleChange = (e) => {
        setHasFinePointer(e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }
  }, []);

  return hasFinePointer;
};

export default useHasFinePointer;
