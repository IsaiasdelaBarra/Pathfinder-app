import React, { Component } from "react";
import arrowIcon from "../../Iconos/right-arrow.png";
import targetIcon from "../../Iconos/target.png";
import "./Node.css";

export default class Node extends Component {
  render() {
    const {
      col,
      isFinish,
      isStart,
      isWall,
      onMouseDown,
      onMouseEnter,
      onMouseUp,
      row,
    } = this.props;
    const extraClassName = isFinish
      ? "node-finish"
      : isStart
      ? "node-start"
      : isWall
      ? "node-wall"
      : "";

    return (
      <div
        id={`node-${row}-${col}`}
        className={`node ${extraClassName}`}
        style={{ position: "relative" }}
        onMouseDown={() => onMouseDown(row, col)}
        onMouseEnter={() => onMouseEnter(row, col)}
        onMouseUp={() => onMouseUp()}
      >
        {isStart && (
          <img
            src={arrowIcon}
            alt="Start Node"
            style={{
              width: "30px",
              height: "30px",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        )}
        {isFinish && (
          <img
            src={targetIcon}
            alt="Target Node"
            style={{
              width: "40px",
              height: "40px",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    );
  }
}
