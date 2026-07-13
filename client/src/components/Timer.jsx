import React from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function Timer({ timeLeft, totalTime }) {
  const percentage = (timeLeft / totalTime) * 100;
  const isTimeLow = timeLeft <= 10;

  return (
    <div className="w-20 h-20 font-bold">
      <CircularProgressbar
        value={percentage}
        text={`${timeLeft}s`}
        styles={buildStyles({
          textSize: "24px",
          pathColor: isTimeLow ? "#ef4444" : "#0ea5e9",
          textColor: isTimeLow ? "#ef4444" : "#0ea5e9",
          trailColor: "#1e293b",
          strokeLinecap: "round",
          pathTransitionDuration: 0.5,
        })}
      />
    </div>
  );
}

export default Timer;
