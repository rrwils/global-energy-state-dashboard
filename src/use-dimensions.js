import { useEffect, useLayoutEffect, useState, useRef } from "react";

export const useDimensions = (targetRef) => {
  const getDimensions = () => {
    return {
      width: targetRef.current ? targetRef.current.offsetWidth : 0,
      height: targetRef.current ? targetRef.current.offsetHeight : 0,
    };
  };

  const [dimensions, setDimensions] = useState(getDimensions);

  const handleResize = () => {
    const newDimensions = getDimensions();
    console.log('Resize detected - new dimensions:', newDimensions);
    setDimensions(newDimensions);
  };

  useEffect(() => {
    const currentElement = targetRef.current;
    
    // Use ResizeObserver to detect element size changes (works with flex containers)
    const resizeObserver = new ResizeObserver(() => {
      console.log('ResizeObserver fired');
      handleResize();
    });

    if (currentElement) {
      resizeObserver.observe(currentElement);
      console.log('ResizeObserver started on element:', currentElement);
    }

    // Also listen to window resize as a fallback
    const windowResizeHandler = () => {
      console.log('Window resize event fired');
      handleResize();
    };
    window.addEventListener("resize", windowResizeHandler);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", windowResizeHandler);
    };
  }, []);

  useLayoutEffect(() => {
    handleResize();
  }, []);

  return dimensions;
};