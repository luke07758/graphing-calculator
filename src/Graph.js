import {useRef, useEffect, useState} from "react";
import GraphSettings from "./GraphSettings";
import FunctionList from "./FunctionList";
import styles from "./Graph.module.css";
import workerStr from "./worker.js";

const FONT = "25px Latin Modern Math";
const zoomFactor = Math.pow(1.5, 0.1);

function Graph() {
  const containerRef = useRef(null);
  const [viewport, setViewport] = useState({
    xMin: -12,
    xMax: 12,
    yMin: -12,
    yMax: 12
  });
  const mouseDown = useRef(false);
  const canvasRef = useRef(null);
  const mouseX = useRef(-1);
  const mouseY = useRef(-1);
  const majorWidth = useRef(null);
  const minorWidth = useRef(null);
  const animationFrameCall = useRef(null);
  const [darkMode, setDarkMode] = useState(false);
  const colors = useRef({
    primary: "#000",
    secondary: "#c0c0c0",
    background: "#fff"
  });
  const functions = useRef([]);

  const drawGraph = () => {
    // Formats number to string for graph labels
    const formattedString = (i) => {
      let exp = i.toExponential();
      let str = exp.split("e")[0] + String.fromCharCode(215) + "10";
      exp = exp.split("e")[1].split("+").at(-1);
      if (parseInt(exp) < 4 && parseInt(exp) > -3) {
        return "" + i;
      }
      // Add superscript for scientific notation
      while (exp.length > 0) {
        let firstNum = parseInt(exp.substring(0,1));
        switch (isNaN(firstNum) || firstNum) {
          case true: // negative
            str += String.fromCharCode(8315);
            break;
          case 1:
            str += String.fromCharCode(185);
            break;
          case 2:
          case 3:
            str += String.fromCharCode(176 + firstNum);
            break;
          default:
            str += String.fromCharCode(8304 + firstNum);
        }
        exp = exp.substring(1);
      }
      return str;
    }

    const ctx = canvasRef.current.getContext("2d");
    ctx.font = FONT;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = colors.current.background;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = colors.current.primary;

    // Save lines to draw in order minor -> major -> axes
    var minorLines = [];
    var majorLines = [];
    var axes = [];
    // Save labels to draw after lines
    var labelRects = [];
    var labels = [];

    // Draw vertical lines
    const startX = Math.ceil(viewport.xMin / minorWidth.current);
    const endX = Math.floor(viewport.xMax / minorWidth.current);
    for (let i = startX; i <= endX; i++) {
      const x = (i == 0) ? 0 : parseFloat((i * minorWidth.current).toPrecision(Math.floor(Math.log10(Math.abs(i) * minorWidth.current)) - Math.floor(Math.log10(minorWidth.current)) + 1));

      // Don't draw on axes
      if (x == 0) continue;

      // Convert x value to pixel coordinates and draw line
      const pos = (x - viewport.xMin) * ctx.canvas.width / (viewport.xMax - viewport.xMin);

      const line = [
        pos,
        0,
        pos,
        ctx.canvas.height
      ];

      // Draw major lines in primary color, minor lines in secondary
      if (Math.abs(x % majorWidth.current) < minorWidth.current / 2 ||
          Math.abs(x % majorWidth.current) > majorWidth.current - minorWidth.current / 2) {
        
        majorLines.push(line);

        // Add number labels
        var label = formattedString(x);
        
        const padding = 4;
        const textWidth = ctx.measureText(label).width;
        const textHeight = parseInt(ctx.font);
        // Draw labels below axis if on screen
        const topY = padding;
        const axisY = viewport.yMax * ctx.canvas.height / (viewport.yMax - viewport.yMin) + padding;
        const bottomY = ctx.canvas.height - (padding * 3) - textHeight;
        
        if (axisY > bottomY) {
          labelRects.push([
            pos - (textWidth / 2) - padding,
            bottomY,
            textWidth + (padding * 2),
            textHeight + (padding * 2)
          ]);
          labels.push([
            label, 
            pos - (textWidth / 2), 
            ctx.canvas.height - (padding * 2)
          ]);
        } else if (axisY < topY) {
          labelRects.push([
            pos - (textWidth / 2) - padding,
            topY,
            textWidth + (padding * 2),
            textHeight + (padding * 2)
          ]);
          labels.push([
            label, 
            pos - (textWidth / 2), 
            padding + textHeight
          ]);
        } else {
          labelRects.push([
            pos - (textWidth / 2) - padding,
            axisY,
            textWidth + (padding * 2),
            textHeight + (padding * 2)
          ]);
          labels.push([
            label, 
            pos - (textWidth / 2), 
            axisY + textHeight
          ]);
        }
      } else {
        minorLines.push(line);
      }
    }

    // Draw horizontal lines
    const startY = Math.ceil(viewport.yMin / minorWidth.current);
    const endY = Math.floor(viewport.yMax / minorWidth.current);
    for (let i = startY; i <= endY; i++) {
      const y = (i == 0) ? 0 : parseFloat((i * minorWidth.current).toPrecision(Math.floor(Math.log10(Math.abs(i) * minorWidth.current)) - Math.floor(Math.log10(minorWidth.current)) + 1));

      // Don't draw on axes
      if (y == 0) continue;

      // Convert y value to pixel coordinates and draw line
      const pos = (viewport.yMax - y) * ctx.canvas.height / (viewport.yMax - viewport.yMin);

      const line = [
        0,
        pos,
        ctx.canvas.width,
        pos
      ];

      // Draw major lines in black, minor lines in silver
      if (Math.abs(y % majorWidth.current) < minorWidth.current / 2 ||
          Math.abs(y % majorWidth.current) > majorWidth.current - minorWidth.current / 2) {
        majorLines.push(line);

        // Add number labels
        const label = formattedString(y);
        const padding = 4;
        const textWidth = ctx.measureText(label).width;
        const textHeight = parseInt(ctx.font);
        // Draw labels below axis if on screen
        const leftX = padding;
        const axisX = (0 - viewport.xMin) * ctx.canvas.width / (viewport.xMax - viewport.xMin) - (padding * 3) - textWidth;
        const rightX = ctx.canvas.width - (padding * 3) - textWidth;
        if (axisX > rightX) {
          labelRects.push([
            rightX,
            pos - (textHeight / 2) - padding,
            textWidth + (padding * 2),
            textHeight + (padding * 2)
          ]);
          labels.push([
            label,
            ctx.canvas.width - (padding * 2) - textWidth,
            pos + padding
          ]);
        } else if (axisX < leftX) {
          labelRects.push([
            leftX,
            pos - (textHeight / 2) - padding,
            textWidth + (padding * 2),
            textHeight + (padding * 2)
          ]);
          labels.push([
            label,
            padding * 2,
            pos + padding
          ]);
        } else {
          labelRects.push([
            axisX,
            pos - (textHeight / 2) - padding,
            textWidth + (padding * 2),
            textHeight + (padding * 2)
          ]);
          ctx.fillStyle = colors.current.primary;
          labels.push([
            label,
            axisX + padding,
            pos + padding
          ]);
        }
      } else {
        minorLines.push(line);
      }
    }

    // Draw x-axis
    ctx.strokeStyle = colors.current.primary;
    if (viewport.yMin <= 0 && viewport.yMax >= 0) {
      axes.push([
        0,
        (viewport.yMax * ctx.canvas.height) / (viewport.yMax - viewport.yMin),
        ctx.canvas.width,
        (viewport.yMax * ctx.canvas.height) / (viewport.yMax - viewport.yMin)
      ]);
    }
    // Draw y-axis
    if (viewport.xMin <= 0 && viewport.xMax >= 0) {
      axes.push([
        (Math.abs(viewport.xMin) * ctx.canvas.width) / (viewport.xMax - viewport.xMin),
        0,
        (Math.abs(viewport.xMin) * ctx.canvas.width) / (viewport.xMax - viewport.xMin),
        ctx.canvas.height
      ]);
    }
    
    // Draw lines
    ctx.beginPath();
    ctx.strokeStyle = colors.current.secondary;
    ctx.lineWidth = 1;
    minorLines.forEach((e) => {
      ctx.moveTo(e[0], e[1]);
      ctx.lineTo(e[2], e[3]);
    });
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = colors.current.primary;
    ctx.lineWidth = 1;
    majorLines.forEach((e) => {
      ctx.moveTo(e[0], e[1]);
      ctx.lineTo(e[2], e[3]);
    });
    ctx.stroke();
    ctx.beginPath();
    ctx.lineWidth = 3;
    axes.forEach((e) => {
      ctx.moveTo(e[0], e[1]);
      ctx.lineTo(e[2], e[3]);
    });
    ctx.stroke();

    // Draw labels
    labelRects.forEach((e) => {
      ctx.fillStyle = colors.current.background;
      ctx.fillRect(e[0], e[1], e[2], e[3]);
    });
    labels.forEach((e) => {
      ctx.fillStyle = colors.current.primary;
      ctx.fillText(e[0], e[1], e[2]);
    });

    // Draw functions
    var drawLine = (a, b) => { ctx.moveTo(a, b); }
    for (let i = 0; i < functions.current.length; i++) {
      let e = functions.current[i];
      if (e === null) continue;
      // clone memo first to prevent worker from changing data while drawing
      let memoCopy = [...e.memo];
      if (memoCopy.length !== 0) {
        ctx.beginPath();
        ctx.strokeStyle = e.color;
        if (memoCopy[0].x < viewport.xMax && memoCopy[memoCopy.length-1].x > viewport.xMin) {
          let lastY = viewport.yMin, isMoveTo = true;
          for (let index = 0; index < memoCopy.length; index++) {
            // check for vertical asymptote
            if ((memoCopy[index].y < viewport.yMin && lastY > viewport.yMax) || (memoCopy[index].y > viewport.yMax && lastY < viewport.yMin)) {
              ctx.stroke();
              ctx.beginPath();
              drawLine = (a, b) => { ctx.moveTo(a, b); }
              isMoveTo = true;
            }
            lastY = memoCopy[index].y;
            drawLine(
              (memoCopy[index].x - viewport.xMin) * ctx.canvas.width / (viewport.xMax - viewport.xMin),
              (viewport.yMax - memoCopy[index].y) * ctx.canvas.height / (viewport.yMax - viewport.yMin)
            );
            if (memoCopy[index].x > viewport.xMax) break;
            if (isMoveTo) {
              drawLine = (a, b) => { ctx.lineTo(a, b); }
              isMoveTo = false;
            }
          }
        }
        ctx.stroke();
      }
    }
  }

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();

    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const moveGraph = (e) => {
    if (!mouseDown.current) {
      return;
    }
    if (mouseX.current === null || mouseY.current === null) {
      console.error("Mouse position not set.");
    } else {
      // cancel last animation frame if not run yet
      if (animationFrameCall.current) {
        cancelAnimationFrame(animationFrameCall.current);
      }
      animationFrameCall.current = requestAnimationFrame(() => {
        // Get new mouse position
        const mousePos = getMousePos(e);
        
        // Translate graph
        const xRange = viewport.xMax - viewport.xMin;
        const yRange = viewport.yMax - viewport.yMin;
        const x = mouseX.current - mousePos.x * xRange / canvasRef.current.width;
        const y = mouseY.current + mousePos.y * yRange / canvasRef.current.height;
        setViewport({
          xMin: x,
          xMax: x + xRange,
          yMin: y - yRange,
          yMax: y
        });

        animationFrameCall.current = null;
      });
    }
  }

  const setLineWidth = () => {
    if (canvasRef.current) {
      const n = 20 * (viewport.xMax - viewport.xMin) / canvasRef.current.width;
      const power = Math.pow(10, Math.floor(Math.log10(n)));
      const mantissa = n / power;

      if (mantissa === 1.0) {
        minorWidth.current = power;
        majorWidth.current = power * 5;
      } else if (mantissa <= 2.0) {
        minorWidth.current = power * 2;
        majorWidth.current = power * 10;
      } else if (mantissa <= 5.0) {
        minorWidth.current = power * 5;
        majorWidth.current = power * 20;
      } else {
        minorWidth.current = power * 10;
        majorWidth.current = power * 50;
      }
    }
  }

  const handleMouseDown = (e) => {
    // e.preventDefault();
    mouseDown.current = true;

    // Store current mouse position
    const mousePos = getMousePos(e);
    mouseX.current = mousePos.x * (viewport.xMax - viewport.xMin) 
                      / canvasRef.current.width + viewport.xMin;
    mouseY.current = viewport.yMax - mousePos.y * (viewport.yMax - viewport.yMin) 
                      / canvasRef.current.height;
  }

  const handleMouseUp = () => {
    if (animationFrameCall.current) {
      cancelAnimationFrame(animationFrameCall.current);
    }
    mouseDown.current = false;
    mouseX.current = mouseY.current = null;
  }

  // TODO: Edit this to scale zoom factor based on deltaY
  const handleMouseWheel = (e) => {
    e.preventDefault();
    if (e.deltaY == 0) return;
    const x = e.clientX * (viewport.xMax - viewport.xMin) / canvasRef.current.width + viewport.xMin;
    const y = viewport.yMax - e.clientY * (viewport.yMax - viewport.yMin) / canvasRef.current.height;
    if (e.deltaY > 0) {
      // Zoom out centered at mouse position
      setViewport({
        xMin: (viewport.xMin - x) * zoomFactor + x,
        xMax: (viewport.xMax - x) * zoomFactor + x,
        yMin: (viewport.yMin - y) * zoomFactor + y,
        yMax: (viewport.yMax - y) * zoomFactor + y
      });
    } else if (e.deltaY < 0) {
      // Zoom in centered at mouse position
      setViewport({
        xMin: (viewport.xMin - x) / zoomFactor + x,
        xMax: (viewport.xMax - x) / zoomFactor + x,
        yMin: (viewport.yMin - y) / zoomFactor + y,
        yMax: (viewport.yMax - y) / zoomFactor + y
      });
    }
  }

  const resize = () => {
    setViewport((currentViewport) => {
      if (canvasRef.current && containerRef.current) {
        // Get all dimensions first
        const prevWidth = canvasRef.current.width;
        const prevHeight = canvasRef.current.height;
        const newWidth = Math.ceil(containerRef.current.getBoundingClientRect().width);
        const newHeight = Math.ceil(containerRef.current.getBoundingClientRect().height);
        
        console.log(`Dimensions: ${prevWidth}x${prevHeight} -> ${newWidth}x${newHeight}`);
        console.log(`Current viewport before calc: x=(${viewport.xMin}, ${viewport.xMax}) y=(${viewport.yMin}, ${viewport.yMax})`);

        // Do viewport calculations with the actual previous values
        const xAvg = (currentViewport.xMin + currentViewport.xMax) / 2;
        const yAvg = (currentViewport.yMin + currentViewport.yMax) / 2;
        
        const newViewport = {
          xMin: (currentViewport.xMin - xAvg) * newWidth / prevWidth + xAvg,
          xMax: (currentViewport.xMax - xAvg) * newWidth / prevWidth + xAvg,
          yMin: (currentViewport.yMin - yAvg) * newHeight / prevHeight + yAvg,
          yMax: (currentViewport.yMax - yAvg) * newHeight / prevHeight + yAvg
        };
    
        console.log(`Calculated new viewport: x=(${newViewport.xMin}, ${newViewport.xMax}) y=(${newViewport.yMin}, ${newViewport.yMax})`);

        // Update canvas size after calculations
        canvasRef.current.width = newWidth;
        canvasRef.current.height = newHeight;
    
        // Finally set the new viewport
        return newViewport;
      }
    });
  }

  // Updates the memo for a function using the function's memoWorker
  // bool redraw used to prevent multiple draws when updating multiple function memos
  const updateMemo = async (functionObj, redraw) => {
    if (functionObj === null) return;
    await new Promise((resolve) => {
      functionObj.memoWorker.onmessage = (e) => {
        functionObj.memo = e.data;
        resolve();
      };
      console.log(`updating memo with xMin=${viewport.xMin}, xMax=${viewport.xMax}`);
      functionObj.memoWorker.postMessage({
        canvasWidth: canvasRef.current.width,
        viewPort: viewport
      });
    }).then(() => {
      if (redraw) drawGraph();
    });
  }

  useEffect(() => {
    console.log(`viewport useEffect with x=(${viewport.xMin}, ${viewport.xMax}) y=(${viewport.yMin}, ${viewport.yMax})`);
    setLineWidth();
    drawGraph();
    for (let i = 0; i < functions.current.length; i++) {
      updateMemo(functions.current[i], (i == functions.current.length - 1));
    }
    console.log(`viewport useEffect ended with x=(${viewport.xMin}, ${viewport.xMax}) y=(${viewport.yMin}, ${viewport.yMax})`);
  }, [viewport]);

  useEffect(() => {
    console.log("graph mounted");
    const preventZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    document.fonts.load(FONT).then(() => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.getBoundingClientRect().width;
        canvasRef.current.height = containerRef.current.getBoundingClientRect().height;
        const aspectRatio = containerRef.current.getBoundingClientRect().height / containerRef.current.getBoundingClientRect().width;
        console.log(`initial aspect ratio: ${aspectRatio}`);
        setViewport({
          xMin: -12,
          xMax: 12,
          yMin: -12 * aspectRatio,
          yMax: 12 * aspectRatio
        });
      }
    });
    window.addEventListener("resize", resize);
    window.addEventListener("wheel", preventZoom, { passive: false });
    return () => {
      console.log("graph unmounted");
      window.removeEventListener("resize", resize);
      window.removeEventListener("wheel", preventZoom);
      if (functions.current.length !== 0) {
        functions.current.forEach((e) => {
          if (e !== null) e.memoWorker.terminate();
        })
      } 
    }
  }, []);

  return (
    <div className={styles.container} style={{backgroundColor: darkMode ? "#000" : "#fff"}} ref={containerRef}>
      <canvas 
        ref={canvasRef}
        onMouseDown={(event) => handleMouseDown(event)}
        onMouseUp={() => handleMouseUp()}
        onMouseMove={(event) => moveGraph(event)}
        onMouseLeave={() => handleMouseUp()}
        onWheel={(event) => handleMouseWheel(event)}
      />
      <div className={styles.settings}>
        <GraphSettings 
          textFont={FONT} 
          viewPort={viewport} 
          toggleDarkMode={() => {
            if (darkMode) {
              colors.current = {
                primary: "#000",
                secondary: "#c0c0c0",
                background: "#fff"
              };
            } else {
              colors.current = {
                primary: "#e6e6e6",
                secondary: "#1f1f1f",
                background: "#000"
              };
            }
            setDarkMode(!darkMode);
            drawGraph();
          }}
          setViewport={(vp) => setViewport(vp)}
        />
      </div>
      <div className={styles["function-list"]}>
        <FunctionList
          darkMode={darkMode} 
          addFunction={async (index, functionStr, color) => {
            let del = 0;
            if (index < functions.current.length) {
              del = 1;
              if (functions.current[index] !== null) functions.current[index].memoWorker.terminate();
            }
            functions.current.splice(index, del, {
              color: color,
              memo: [],
              memoWorker: new Worker(URL.createObjectURL(new Blob([workerStr], { type: "application/javascript" })))
            });
            await new Promise((resolve) => {
              functions.current[index].memoWorker.onmessage = (e) => {
                resolve();
              };
              functions.current[index].memoWorker.postMessage(functionStr);
            }).then(() => {
              updateMemo(functions.current[index], true);
            });
          }}
          changeColor={(index, color) => {
            functions.current[index].color = color;
            drawGraph();
          }}
          deleteFunction={(index)=>{
            if (index < functions.current.length) {
              functions.current[index].memoWorker.terminate();
              functions.current[index] = null;
              drawGraph();
            }
          }}
        />
      </div>
    </div>
  );
}

export default Graph;