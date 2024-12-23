import {useState, useRef, useEffect} from "react";
import styles from "./FunctionList.module.css";

const defaultColors = ["#2196F3", "#E81E62", "#009688", "#673AB7", "#CDDC39"];
function FunctionList(props) {
  const [functions, setFunctions] = useState([{name: "f", color: "#2196F3", value: ""}]);
  const [isOpen, setIsOpen] = useState(true);
  const inputRefs = useRef({});
  const numFunctions = useRef(1);
  const wrapperRef = useRef(null);
  const cursorPos = useRef({});

  const changeChars = (e, index) => {
    let inputStr = e.target.value;
    let changedInput = "";

    for (let i = 0; i < inputStr.length; i++) {
      let currentChar = inputStr.charAt(i);
      if (currentChar >= "a" && currentChar <= "g") {
        changedInput += String.fromCodePoint(currentChar.codePointAt() + 0x1D3ED);
      } else if (currentChar == "h") {
        changedInput += String.fromCharCode(0x210E);
      } else if (currentChar >= "i" && currentChar <= "z") {
        changedInput += String.fromCodePoint(currentChar.codePointAt() + 0x1D3ED);
      } else if (currentChar >= "A" && currentChar <= "Z") {
        changedInput += String.fromCodePoint(currentChar.codePointAt() + 0x1D3F3);
      } else {
        changedInput += currentChar;
      }
    }
    // replace pi with pi symbol
    while (changedInput.includes(String.fromCodePoint(0x1D45D, 0x1D456))) {
      changedInput.replace(String.fromCodePoint(0x1D45D, 0x1D456), String.fromCodePoint(0x1D70B));
      //if (selectionIndex) selectionIndex--;
    }

    const functionsCopy = [...functions];
    functionsCopy[index].value = changedInput;
    setFunctions(functionsCopy);
    parseFunction(changedInput, index);
  };

  const parseFunction = (inputStr, index) => {
    let functionStr = "";
    for (let currentChar of inputStr) {
      if (currentChar.codePointAt() >= 0x1D44E && currentChar.codePointAt() <= 0x1D454) {
        functionStr += String.fromCodePoint(currentChar.codePointAt() - 0x1D3ED);
      } else if (currentChar.codePointAt() === 0x210E) {
        functionStr += "h";
      } else if (currentChar.codePointAt() >= 0x1D456 && currentChar.codePointAt() <= 0x1D467) {
        functionStr += String.fromCodePoint(currentChar.codePointAt() - 0x1D3ED);
      } else if (currentChar.codePointAt() >= 0x1D434 && currentChar <= 0x1D44D) {
        functionStr += String.fromCodePoint(currentChar.codePointAt() - 0x1D3F3);
      } else if (currentChar.codePointAt() === 0x1D70B) {
        functionStr += "pi";
      } else {
        functionStr += currentChar;
      }
    }
    props.addFunction(index, functionStr, functions[index].color);
  };

  useEffect(() => {
    if (cursorPos.current.index) {
      inputRefs.current[cursorPos.current.index].selectionStart = cursorPos.current.pos - 2;
      inputRefs.current[cursorPos.current.index].selectionEnd = cursorPos.current.pos - 2;
      inputRefs.current[cursorPos.current.index].focus();
    }
  }, [cursorPos]);

  return (
    <div className={`${styles["functions"]} ${isOpen ? styles["active"] : ""}`}>
      <div className={styles["functions-wrapper"]}
        ref={wrapperRef}
        style={{
          height: `${numFunctions.current * 42 + 30}px`,
          backgroundColor: props.darkMode ? "rgba(26,26,26,0.75)" : "rgba(230,230,230,0.75"
        }}>
        {functions.map((func, index) => (func !== null && (
          <div className={styles["function-container"]} key={index}>
            <div className={`${styles["function-name"]} ${props.darkMode ? styles.dark : styles.light}`}>
              {String.fromCodePoint((0x1D453 + index === 0x1D455 ? 0x210E : 0x1D453 + index) + (index > 17 ? 1 : 0))}(&#x1D465;)=
            </div>
            <input className={`${styles["function-input"]} ${props.darkMode ? styles.dark : styles.light}`} 
              onInput={(e) => changeChars(e, index)} 
              value={functions[index].value}
              ref={(el) => (inputRefs.current[index] = el)}
            />
            <input className={styles["color-input"]} type="color" value={func.color} onChange={(e) => { 
              const functionsCopy = [...functions];
              functionsCopy[index].color = e.target.value;
              setFunctions(functionsCopy);
              props.changeColor(index, e.target.value);
            }}/>
            <button 
              className={styles["delete-function"]}
              style={{
                cursor: "pointer",
                filter: props.darkMode ? "invert(100%)" : "",
                msFilter: props.darkMode ? "invert(100%)" : "",
                WebkitFilter: props.darkMode ? "invert(100%)" : "",
              }}
              onClick={() => {
                const functionsCopy = [...functions];
                if (numFunctions.current === 1) {
                  functionsCopy[index].value = "";
                } else {
                  numFunctions.current--;
                  functionsCopy[index] = null;
                }
                setFunctions(functionsCopy);
                props.deleteFunction(index);
              }}  
            >X</button>
          </div>
        )))}
        <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
          <button 
            style={{
              cursor: "pointer",
              filter: props.darkMode ? "invert(100%)" : "",
              msFilter: props.darkMode ? "invert(100%)" : "",
              WebkitFilter: props.darkMode ? "invert(100%)" : ""
            }}
            onClick={() => {
              numFunctions.current++;
              let functionsCopy = [...functions];
              for (let i = 0; i < functionsCopy.length; i++) {
                if (functionsCopy[i] === null) {
                  functionsCopy[i] = {name: String.fromCharCode(66 + i), color: defaultColors[i % defaultColors.length]};
                  setFunctions(functionsCopy);
                  return;
                }
              }
              let index = functions.length;
              setFunctions([...functions, {name: String.fromCharCode(66 + index), color: defaultColors[index % defaultColors.length]}]);
            }}
          >+</button>
        </div>
      </div>
      <div
          className={styles["list-icon"]}
          style={{
            backgroundColor: props.darkMode ? "rgba(26,26,26,0.75)" : "rgba(230,230,230,0.75"
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            style={{
              height: "40px",
              transform: `rotate(${isOpen ? -90 : 90}deg)`,
              transition: "transform 0.5s ease"
            }}
          >
            <path 
              d="M9 12.75L12 9.75L15 12.75M21.75 12C21.75 17.3848 17.3848 21.75 12 21.75C6.61522 21.75 2.25 17.3848 2.25 12C2.25 6.61522 6.61522 2.25 12 2.25C17.3848 2.25 21.75 6.61522 21.75 12Z"
              stroke={props.darkMode ? "white" : "black"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
    </div>
  );
}
export default FunctionList;