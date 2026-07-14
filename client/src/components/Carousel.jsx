import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

function Carousel({ children, itemsPerPage = { mobile: 1, tablet: 2, desktop: 3 } }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const items = React.Children.toArray(children);
  
  let visibleItems = itemsPerPage.desktop;
  if (width < 640) visibleItems = itemsPerPage.mobile;
  else if (width < 1024) visibleItems = itemsPerPage.tablet;

  const maxIndex = Math.max(0, items.length - visibleItems);

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [visibleItems, maxIndex, currentIndex]);

  if (items.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-4 px-1">
      {/* Track */}
      <motion.div
        className="flex gap-6 w-full"
        animate={{ 
          x: `calc(-${currentIndex * (100 / visibleItems)}% - ${currentIndex * (24 * (visibleItems - 1) / visibleItems)}px)` 
        }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex-shrink-0"
            style={{ 
              width: `calc((100% - ${(visibleItems - 1) * 24}px) / ${visibleItems})` 
            }}
          >
            {item}
          </div>
        ))}
      </motion.div>

      {/* Buttons */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          type="button"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center hover:bg-cyan-500 hover:border-cyan-400 hover:shadow-md hover:shadow-cyan-500/20 transition-all shadow-lg z-20 cursor-pointer"
        >
          <BsChevronLeft size={20} />
        </button>
      )}

      {currentIndex < maxIndex && (
        <button
          onClick={handleNext}
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center hover:bg-cyan-500 hover:border-cyan-400 hover:shadow-md hover:shadow-cyan-500/20 transition-all shadow-lg z-20 cursor-pointer"
        >
          <BsChevronRight size={20} />
        </button>
      )}

      {/* Dots Indicator */}
      {maxIndex > 0 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx ? "w-6 bg-cyan-500" : "w-2 bg-slate-800 hover:bg-slate-700"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Carousel;
