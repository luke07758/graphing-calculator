import {useRef, useState, useEffect} from "react";
import styles from "./GraphSettings.module.css";

const GraphSettings = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [viewport, setViewport] = useState(props.viewPort);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [errorMessageVisible, setErrorMessageVisible] = useState(false);

  const inputMinX = useRef(null);
  const inputMaxX = useRef(null);
  const inputMinY = useRef(null);
  const inputMaxY = useRef(null);
  const errorMessage = useRef(null);

  const isValidNumber = (str) => {
    return /^-?(?:\d+|\d+\.\d*|\d*\.\d+)$/.test(str);
  };

  const handleSetViewport = () => {
    let hasInvalidNumber = false;
    let invalidInputs = "";
    let errorStr = "";
    if (inputMinX.current && inputMaxX.current && inputMinY.current && inputMaxY.current && errorMessage.current) {
      if (!isValidNumber(inputMinX.current.value)) {
        hasInvalidNumber = true;
        invalidInputs = ", X min"
      }
      if (!isValidNumber(inputMaxX.current.value)) {
        hasInvalidNumber = true;
        invalidInputs += ", X max"
      }
      if (!isValidNumber(inputMinY.current.value)) {
        hasInvalidNumber = true;
        invalidInputs += ", Y min"
      }
      if (!isValidNumber(inputMaxY.current.value)) {
        hasInvalidNumber = true;
        invalidInputs += ", Y max"
      }
      if (hasInvalidNumber) {
        errorStr = `Invalid number${invalidInputs.length > 7 ? "s" : ""}: ${invalidInputs.substring(2)}`;
      }

      const newViewport = {
        xMin: parseFloat(inputMinX.current.value),
        xMax: parseFloat(inputMaxX.current.value),
        yMin: parseFloat(inputMinY.current.value),
        yMax: parseFloat(inputMaxY.current.value)
      };
      if (maintainAspectRatio) {
        const aspectRatio = (viewport.xMax - viewport.xMin) / (viewport.yMax - viewport.yMin);
        const midY = (viewport.yMax + viewport.yMin) / 2;
        const newHeight = (newViewport.xMax - newViewport.xMin) / aspectRatio;
        newViewport.yMin = midY - (newHeight / 2);
        newViewport.yMax = midY + (newHeight / 2);
      }

      if (newViewport.xMin >= newViewport.xMax) {
        if (errorStr.length !== 0) {
          errorStr += "\n";
        }
        errorStr += "X max must be greater than X min";
      }
      if (newViewport.yMin >= newViewport.yMax) {
        if (errorStr.length !== 0) {
          errorStr += "\n";
        }
        errorStr += "Y max must be greater than Y min";
      }
      if (errorStr.length !== 0) {
        errorMessage.current.innerText = errorStr;
        setErrorMessageVisible(true);
        return;
      }
      errorMessage.current.innerText = "";
      setErrorMessageVisible(false);
      setViewport(newViewport);
      // set viewport in parent component
      props.setViewport(newViewport);
    }
  };

  useEffect(() => {
    if (inputMinX.current && inputMaxX.current && inputMinY.current && inputMaxY.current) {
      inputMinX.current.value = props.viewPort.xMin.toFixed(2);
      inputMaxX.current.value = props.viewPort.xMax.toFixed(2);
      inputMinY.current.value = props.viewPort.yMin.toFixed(2);
      inputMaxY.current.value = props.viewPort.yMax.toFixed(2);
    }
    setViewport(props.viewPort);
  }, [props.viewPort]);

  return (
    <div
      className={styles["settings-container"]}
      style={{
        ... isOpen ? {width: 200 + "px", height: 270 + "px"} : {width: 40 + "px", height: 40 + "px"},
        ... darkMode ? {backgroundColor: "rgba(26,26,26,0.75)", color: "#fff"} : {backgroundColor: "rgba(230,230,230,0.75)", color: "#000"}
      }}
    >
      <div className={styles["title-wrapper"]}>
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 231 231"
            className={`${styles["settings-icon"]} ${isOpen ? styles.rotated : ""}`}
            style={darkMode ? {filter: "invert(100%)", WebkitFilter: "invert(100%)"} : {}}
            alt="Settings icon"
            onClick={() => setIsOpen(!isOpen)}
          >
            <g id="Layer_3">
              <g>
                <path d="M40.65,34.96l15.49-6.42c4.54,4.11,10.35,6.37,16.39,6.37,3.05,0,6.04-.58,8.87-1.74,8.58-3.49,14.27-11.76,14.56-21.12l7.85-3.25,13.45,32.46-63.15,26.16-13.45-32.46Z"/>
                <path d="M103.54,9.46l13.06,31.54-62.23,25.78-13.06-31.54,14.74-6.11c4.6,4.06,10.43,6.29,16.49,6.29,3.12,0,6.17-.6,9.06-1.77,8.67-3.53,14.44-11.82,14.85-21.25l7.09-2.94M104.08,8.15l-8.61,3.57c-.15,9.02-5.46,17.42-14.25,21-2.84,1.15-5.78,1.7-8.69,1.7-6,0-11.84-2.33-16.28-6.45l-16.25,6.73,13.83,33.39,64.08-26.54-13.83-33.39h0Z"/>
              </g>
              <g>
                <path d="M113.73,41.27l13.45-32.46,7.85,3.25c.29,9.36,5.97,17.63,14.56,21.12,2.83,1.15,5.82,1.74,8.87,1.74,6.04,0,11.85-2.26,16.39-6.37l15.49,6.42-13.45,32.46-63.15-26.16Z"/>
                <path d="M127.44,9.46l7.09,2.94c.41,9.43,6.19,17.72,14.85,21.25,2.89,1.18,5.94,1.77,9.06,1.77,6.06,0,11.89-2.23,16.49-6.29l14.74,6.11-13.06,31.54-62.23-25.78,13.06-31.54M126.9,8.15l-13.83,33.39,64.08,26.54,13.83-33.39-16.25-6.73c-4.44,4.12-10.28,6.45-16.28,6.45-2.91,0-5.85-.55-8.68-1.7-8.79-3.58-14.1-11.98-14.25-21l-8.61-3.57h0Z"/>
              </g>
              <g>
                <path d="M166.43,61.87l32.46-13.45,3.25,7.85c-6.42,6.82-8.24,16.69-4.64,25.23,3.55,8.42,11.83,14.12,21.14,14.59l6.42,15.49-32.46,13.45-26.16-63.15Z"/>
                <path d="M198.62,49.07l2.94,7.09c-6.37,6.96-8.16,16.9-4.52,25.53,3.59,8.5,11.88,14.29,21.26,14.87l6.11,14.74-31.54,13.06-25.78-62.23,31.54-13.06M199.16,47.77l-33.39,13.83,26.54,64.08,33.39-13.83-6.73-16.25c-8.99-.33-17.37-5.65-21.02-14.3-3.69-8.74-1.5-18.44,4.77-24.92l-3.57-8.61h0Z"/>
              </g>
              <g>
                <path d="M6.19,111.74l6.42-15.49c9.31-.47,17.58-6.16,21.14-14.59,3.6-8.54,1.77-18.41-4.64-25.23l3.25-7.85,32.46,13.45-26.16,63.15-32.46-13.45Z"/>
                <path d="M32.62,49.24l31.54,13.06-25.78,62.23-31.54-13.06,6.11-14.74c9.37-.59,17.67-6.37,21.26-14.87,3.64-8.62,1.86-18.57-4.52-25.53l2.94-7.09M32.08,47.93l-3.57,8.61c6.27,6.49,8.45,16.18,4.77,24.92-3.65,8.65-12.03,13.96-21.02,14.3l-6.73,16.25,33.39,13.83,26.54-64.08-33.39-13.83h0Z"/>
              </g>
              <g>
                <path d="M95.96,218.96c-.29-9.36-5.97-17.63-14.56-21.12-2.83-1.15-5.82-1.74-8.87-1.74-6.04,0-11.85,2.26-16.39,6.37l-15.49-6.42,13.45-32.46,63.15,26.16-13.45,32.46-7.85-3.25Z"/>
                <path d="M54.37,164.24l62.23,25.78-13.06,31.54-7.09-2.94c-.41-9.43-6.19-17.72-14.85-21.25-2.89-1.18-5.94-1.77-9.06-1.77-6.06,0-11.89,2.23-16.49,6.29l-14.74-6.11,13.06-31.54M53.83,162.93l-13.83,33.39,16.25,6.73c4.44-4.12,10.28-6.45,16.28-6.45,2.91,0,5.85.55,8.69,1.7,8.79,3.58,14.1,11.98,14.25,21l8.61,3.57,13.83-33.39-64.08-26.54h0Z"/>
              </g>
              <g>
                <path d="M113.73,189.74l63.15-26.16,13.45,32.46-15.49,6.42c-4.54-4.11-10.35-6.37-16.39-6.37-3.05,0-6.04.58-8.87,1.74-8.58,3.49-14.27,11.76-14.56,21.12l-7.85,3.25-13.45-32.46Z"/>
                <path d="M176.61,164.24l13.06,31.54-14.74,6.11c-4.6-4.06-10.43-6.29-16.49-6.29-3.12,0-6.17.6-9.06,1.77-8.67,3.53-14.44,11.82-14.85,21.25l-7.09,2.94-13.06-31.54,62.23-25.78M177.15,162.93l-64.08,26.54,13.83,33.39,8.61-3.57c.15-9.02,5.46-17.42,14.25-21,2.84-1.15,5.78-1.7,8.68-1.7,6,0,11.84,2.33,16.28,6.45l16.25-6.73-13.83-33.39h0Z"/>
              </g>
              <g>
                <path d="M166.68,169.22l26.16-63.15,32.46,13.45-6.42,15.49c-9.31.47-17.58,6.17-21.14,14.59-3.6,8.54-1.77,18.41,4.64,25.23l-3.25,7.85-32.46-13.45Z"/>
                <path d="M193.11,106.72l31.54,13.06-6.11,14.74c-9.37.59-17.67,6.37-21.26,14.87-3.64,8.62-1.86,18.57,4.52,25.53l-2.94,7.09-31.54-13.06,25.78-62.23M192.57,105.42l-26.54,64.08,33.39,13.83,3.57-8.61c-6.27-6.49-8.45-16.18-4.77-24.92,3.65-8.65,12.03-13.96,21.02-14.3l6.73-16.25-33.39-13.83h0Z"/>
              </g>
              <g>
                <path d="M28.61,174.82c6.42-6.82,8.24-16.69,4.64-25.23-3.55-8.42-11.82-14.12-21.14-14.59l-6.42-15.49,32.46-13.45,26.16,63.15-32.46,13.45-3.25-7.85Z"/>
                <path d="M37.89,106.72l25.78,62.23-31.54,13.06-2.94-7.09c6.37-6.96,8.16-16.9,4.52-25.53-3.59-8.5-11.88-14.29-21.26-14.87l-6.11-14.74,31.54-13.06M38.43,105.42l-33.39,13.83,6.73,16.25c8.99.33,17.37,5.65,21.02,14.3,3.69,8.74,1.5,18.44-4.77,24.92l3.57,8.61,33.39-13.83-26.54-64.08h0Z"/>
              </g>
            </g>
            <g id="Layer_1">
              <g id="Layer_2">
                <g>
                  <path d="M116,202.5c-47.97,0-87-39.03-87-87S68.03,28.5,116,28.5s87,39.03,87,87-39.03,87-87,87ZM116,62.5c-29.22,0-53,23.78-53,53s23.78,53,53,53,53-23.78,53-53-23.78-53-53-53Z"/>
                  <path d="M116,29c47.7,0,86.5,38.8,86.5,86.5s-38.8,86.5-86.5,86.5S29.5,163.2,29.5,115.5,68.3,29,116,29M116,169c29.5,0,53.5-24,53.5-53.5s-24-53.5-53.5-53.5-53.5,24-53.5,53.5,24,53.5,53.5,53.5M116,28c-48.32,0-87.5,39.18-87.5,87.5s39.18,87.5,87.5,87.5,87.5-39.18,87.5-87.5S164.32,28,116,28h0ZM116,168c-28.99,0-52.5-23.51-52.5-52.5s23.51-52.5,52.5-52.5,52.5,23.5,52.5,52.5-23.51,52.5-52.5,52.5h0Z"/>
                </g>
              </g>
              <g>
                <rect x="96" y=".5" width="39" height="39" rx="7.38" ry="7.38"/>
                <path d="M127.62,1c3.79,0,6.88,3.09,6.88,6.88v24.24c0,3.79-3.09,6.88-6.88,6.88h-24.24c-3.79,0-6.88-3.09-6.88-6.88V7.88c0-3.79,3.09-6.88,6.88-6.88h24.24M127.62,0h-24.24c-4.33,0-7.88,3.55-7.88,7.88v24.24c0,4.33,3.55,7.88,7.88,7.88h24.24c4.33,0,7.88-3.55,7.88-7.88V7.88c0-4.33-3.55-7.88-7.88-7.88h0Z"/>
              </g>
              <g>
                <rect x="96" y="191.5" width="39" height="39" rx="7.38" ry="7.38"/>
                <path d="M127.62,192c3.79,0,6.88,3.09,6.88,6.88v24.24c0,3.79-3.09,6.88-6.88,6.88h-24.24c-3.79,0-6.88-3.09-6.88-6.88v-24.24c0-3.79,3.09-6.88,6.88-6.88h24.24M127.62,191h-24.24c-4.33,0-7.88,3.55-7.88,7.88v24.24c0,4.33,3.55,7.88,7.88,7.88h24.24c4.33,0,7.88-3.55,7.88-7.88v-24.24c0-4.33-3.55-7.88-7.88-7.88h0Z"/>
              </g>
              <g>
                <path d="M47.97,72.48c-1.98,0-3.83-.76-5.22-2.15l-17.14-17.14c-1.39-1.39-2.15-3.24-2.15-5.22s.76-3.83,2.15-5.22l17.14-17.14c1.39-1.39,3.24-2.15,5.22-2.15s3.83.76,5.22,2.15l17.14,17.14c2.88,2.88,2.88,7.56,0,10.44l-17.14,17.14c-1.39,1.39-3.24,2.15-5.22,2.15Z"/>
                <path d="M47.97,23.96c1.84,0,3.57.71,4.87,2.01l17.14,17.14c1.29,1.29,2.01,3.02,2.01,4.87s-.71,3.57-2.01,4.87l-17.14,17.14c-1.29,1.29-3.02,2.01-4.87,2.01s-3.57-.71-4.87-2.01l-17.14-17.14c-1.29-1.29-2.01-3.02-2.01-4.87s.71-3.57,2.01-4.87l17.14-17.14c1.29-1.29,3.02-2.01,4.87-2.01M47.97,22.96c-2.02,0-4.04.77-5.57,2.3l-17.14,17.14c-3.06,3.06-3.06,8.08,0,11.15l17.14,17.14c1.53,1.53,3.55,2.3,5.57,2.3s4.04-.77,5.57-2.3l17.14-17.14c3.06-3.06,3.06-8.08,0-11.15l-17.14-17.14c-1.53-1.53-3.55-2.3-5.57-2.3h0Z"/>
              </g>
              <g>
                <path d="M183.03,207.54c-1.98,0-3.83-.76-5.22-2.15l-17.14-17.14c-2.88-2.88-2.88-7.56,0-10.44l17.14-17.14c1.39-1.39,3.24-2.15,5.22-2.15s3.83.76,5.22,2.15l17.14,17.14c2.88,2.88,2.88,7.56,0,10.44l-17.14,17.14c-1.39,1.39-3.24,2.15-5.22,2.15Z"/>
                <path d="M183.03,159.02c1.84,0,3.57.71,4.87,2.01l17.14,17.14c2.68,2.68,2.68,7.05,0,9.73l-17.14,17.14c-1.29,1.29-3.02,2.01-4.87,2.01s-3.57-.71-4.87-2.01l-17.14-17.14c-2.68-2.68-2.68-7.05,0-9.73l17.14-17.14c1.29-1.29,3.02-2.01,4.87-2.01M183.03,158.02c-2.02,0-4.04.77-5.57,2.3l-17.14,17.14c-3.06,3.06-3.06,8.08,0,11.15l17.14,17.14c1.53,1.53,3.55,2.3,5.57,2.3s4.04-.77,5.57-2.3l17.14-17.14c3.06-3.06,3.06-8.08,0-11.15l-17.14-17.14c-1.53-1.53-3.55-2.3-5.57-2.3h0Z"/>
              </g>
              <g>
                <rect x=".5" y="96" width="39" height="39" rx="7.38" ry="7.38"/>
                <path d="M32.12,96.5c3.79,0,6.88,3.09,6.88,6.88v24.24c0,3.79-3.09,6.88-6.88,6.88H7.88c-3.79,0-6.88-3.09-6.88-6.88v-24.24c0-3.79,3.09-6.88,6.88-6.88h24.24M32.12,95.5H7.88c-4.33,0-7.88,3.55-7.88,7.88v24.24c0,4.33,3.55,7.88,7.88,7.88h24.24c4.33,0,7.88-3.55,7.88-7.88v-24.24c0-4.33-3.55-7.88-7.88-7.88h0Z"/>
              </g>
              <g>
                <rect x="191.5" y="96" width="39" height="39" rx="7.38" ry="7.38"/>
                <path d="M223.12,96.5c3.79,0,6.88,3.09,6.88,6.88v24.24c0,3.79-3.09,6.88-6.88,6.88h-24.24c-3.79,0-6.88-3.09-6.88-6.88v-24.24c0-3.79,3.09-6.88,6.88-6.88h24.24M223.12,95.5h-24.24c-4.33,0-7.88,3.55-7.88,7.88v24.24c0,4.33,3.55,7.88,7.88,7.88h24.24c4.33,0,7.88-3.55,7.88-7.88v-24.24c0-4.33-3.55-7.88-7.88-7.88h0Z"/>
              </g>
              <g>
                <path d="M47.97,207.54c-1.98,0-3.83-.76-5.22-2.15l-17.14-17.14c-2.88-2.88-2.88-7.56,0-10.44l17.14-17.14c1.39-1.39,3.24-2.15,5.22-2.15s3.83.76,5.22,2.15l17.14,17.14c2.88,2.88,2.88,7.56,0,10.44l-17.14,17.14c-1.39,1.39-3.24,2.15-5.22,2.15Z"/>
                <path d="M47.97,159.02c1.84,0,3.57.71,4.87,2.01l17.14,17.14c2.68,2.68,2.68,7.05,0,9.73l-17.14,17.14c-1.29,1.29-3.02,2.01-4.87,2.01s-3.57-.71-4.87-2.01l-17.14-17.14c-1.29-1.29-2.01-3.02-2.01-4.87s.71-3.57,2.01-4.87l17.14-17.14c1.29-1.29,3.02-2.01,4.87-2.01M47.97,158.02c-2.02,0-4.04.77-5.57,2.3l-17.14,17.14c-3.06,3.06-3.06,8.08,0,11.15l17.14,17.14c1.53,1.53,3.55,2.3,5.57,2.3s4.04-.77,5.57-2.3l17.14-17.14c3.06-3.06,3.06-8.08,0-11.15l-17.14-17.14c-1.53-1.53-3.55-2.3-5.57-2.3h0Z"/>
              </g>
              <g>
                <path d="M183.03,72.48c-1.98,0-3.83-.76-5.22-2.15l-17.14-17.14c-1.39-1.39-2.15-3.24-2.15-5.22s.76-3.83,2.15-5.22l17.14-17.14c1.39-1.39,3.24-2.15,5.22-2.15s3.83.76,5.22,2.15l17.14,17.14c1.39,1.39,2.15,3.24,2.15,5.22s-.76,3.83-2.15,5.22l-17.14,17.14c-1.39,1.39-3.24,2.15-5.22,2.15Z"/>
                <path d="M183.03,23.96c1.84,0,3.57.71,4.87,2.01l17.14,17.14c2.68,2.68,2.68,7.05,0,9.73l-17.14,17.14c-1.29,1.29-3.02,2.01-4.87,2.01s-3.57-.71-4.87-2.01l-17.14-17.14c-2.68-2.68-2.68-7.05,0-9.73l17.14-17.14c1.29-1.29,3.02-2.01,4.87-2.01M183.03,22.96c-2.02,0-4.04.77-5.57,2.3l-17.14,17.14c-3.06,3.06-3.06,8.08,0,11.15l17.14,17.14c1.53,1.53,3.55,2.3,5.57,2.3s4.04-.77,5.57-2.3l17.14-17.14c3.06-3.06,3.06-8.08,0-11.15l-17.14-17.14c-1.53-1.53-3.55-2.3-5.57-2.3h0Z"/>
              </g>
            </g>
          </svg>
        </div>
        <div className={styles["settings-title"]}>Settings</div>
      </div>
      <hr/>
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px"}}>
        <div style={{fontSize: "20px", whiteSpace: "nowrap", overflow: "hidden", marginRight: "10px"}}>Dark Mode</div>
        <label className={styles.switch}>
          <input type="checkbox" onClick={(event) => {
            props.toggleDarkMode();
            setDarkMode(event.target.checked);
          }}/>
          <span className={`${styles.slider} ${styles.round}`}/>
        </label>
      </div>
      <div style={{fontSize: "20px", margin: "15px 0 10px 0"}}>Viewport</div>
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <input
          className={styles["range-input"]}
          type="text"
          style={{
            width: "60px", 
            filter: `invert(${darkMode ? "100" : "0"}%`,
            msFilter: `invert(${darkMode ? "100" : "0"}%`,
            WebkitFilter: `invert(${darkMode ? "100" : "0"}%`,
            "--focus-color": darkMode ? "#de690c" : "#2196f3"
          }}
          defaultValue={viewport.xMin.toFixed(2)}
          ref={inputMinX}
        />
        <div style={{whiteSpace: "nowrap", overflow: "hidden"}}>&#60; &#x1D465; &#60;</div>
        <input
          className={styles["range-input"]}
          type="text"
          style={{
            width: "60px", 
            filter: `invert(${darkMode ? "100" : "0"}%`,
            msFilter: `invert(${darkMode ? "100" : "0"}%`,
            WebkitFilter: `invert(${darkMode ? "100" : "0"}%`,
            "--focus-color": darkMode ? "#de690c" : "#2196f3"
          }}
          defaultValue={viewport.xMax.toFixed(2)}
          ref={inputMaxX}
        />
      </div>
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <input
          className={styles["range-input"]}
          type="text"
          style={{
            width: "60px", 
            filter: `invert(${darkMode ? "100" : "0"}%`,
            msFilter: `invert(${darkMode ? "100" : "0"}%`,
            WebkitFilter: `invert(${darkMode ? "100" : "0"}%`,
            "--focus-color": darkMode ? "#de690c" : "#2196f3"
          }}
          defaultValue={viewport.yMin.toFixed(2)}
          disabled={maintainAspectRatio}
          ref={inputMinY}
        />
        <div style={{whiteSpace: "nowrap", overflow: "hidden"}}>&#60; &#x1D466; &#60;</div>
        <input
          className={styles["range-input"]}
          type="text"
          style={{
            width: "60px", 
            filter: `invert(${darkMode ? "100" : "0"}%`,
            msFilter: `invert(${darkMode ? "100" : "0"}%`,
            WebkitFilter: `invert(${darkMode ? "100" : "0"}%`,
            "--focus-color": darkMode ? "#de690c" : "#2196f3"
          }}
          defaultValue={viewport.yMax.toFixed(2)}
          disabled={maintainAspectRatio}
          ref={inputMaxY}
        />
      </div>
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "5px"}}>
        <div style={{whiteSpace: "nowrap", overflow: "hidden"}}>Maintain Aspect Ratio</div>
        <input
          type="checkbox"
          id="ratio"
          style={{cursor: "pointer"}}
          checked={maintainAspectRatio}
          onChange={(e) => setMaintainAspectRatio(e.target.checked)}
        />
      </div>
      <div
        style={{color: "red"}}
        visibility={errorMessageVisible ? "visible" : "hidden"}
        ref={errorMessage}
      />
      <div style={{display: "flex", alignItems: "center", justifyContent: "end", marginTop: "10px"}}>
          <div 
            className={darkMode ? styles["viewport-button-dark"] : styles["viewport-button-light"]}
            onClick={() => handleSetViewport()}>Save Viewport</div>
      </div>
    </div>
  );
}

export default GraphSettings;