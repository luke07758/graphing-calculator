// Generates an AST from a given expression, and uses the AST to evaluate the expression at given x-values
class ParseTreeNode {
  constructor(token) {
    this.token = token;
    this.leftChild = null;
    this.rightChild = null;
  }
}

class ExpressionParser {
  constructor(functionStr) {
    functionStr = functionStr.replace(" ", "");
    // split string into tokens
    this.tokens = [];
    let numParens = 0, openAbs = false;
    for (let i = 0; i < functionStr.length; i++) {
      let currentChar = functionStr.charAt(i);
      if (/[0-9.]/.test(currentChar)) {
        console.log("regex case");
        if (this.tokens.length != 0 
          && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
          && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC") 
          && this.tokens[this.tokens.length-1].name != "L_PAREN"
        )
          this.tokens.push({name: "MULT_OP", value: NaN});
        this.tokens.push({name: "CONST", value: Number.parseFloat(functionStr.substring(i))});

        let nextI = i + 1;
        // Get next non digit

        while (/^[0-9.]/.test(functionStr.substring(nextI))) nextI++;

        console.log("end of regex case");
        i = nextI - 1;

        continue;
      }
      switch (currentChar) {
        case "+":
        case "-":
          if (i + 1 == functionStr.length) {
            // String cannot end in + or -
            throw new SyntaxError;
          } else if (this.tokens.length == 0 || this.tokens[this.tokens.length-1].name.endsWith("_OP")) {
            if (functionStr.substring(i+1).test(/^[0-9.]/)) {
              // Unary operator - included in number
              this.tokens.push({name: "CONST", value: Number.parseFloat(functionStr.substring(i))});
              let nextI = i + 1;
              // Get next non digit
              while (functionStr.substring(nextI).test(/^[0-9.]/)) nextI++;
              i = nextI - 1;
            } else throw new SyntaxError;
          } else if (currentChar == "+") {
            // Addition operator
            this.tokens.push({name: "ADD_OP", value: NaN});
          } else {
            // Subtraction operator
            this.tokens.push({name: "SUB_OP", value: NaN});
          }
          break;
        case "*":
        case "/":
        case "^":
          if (this.tokens.length == 0 || this.tokens[this.tokens.length-1].name.endsWith("_OP")) {
            throw new SyntaxError;
          }
          if (currentChar == "*") {
            this.tokens.push({name: "MULT_OP", value: NaN});
          } else if (currentChar == "/") {
            this.tokens.push({name: "DIV_OP", value: NaN});
          } else {
            this.tokens.push({name: "EXP_OP", value: NaN});
          }
          break;
        case "(":
          if (this.tokens.length != 0 
            && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
            && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC") 
            && this.tokens[this.tokens.length-1].name != "L_PAREN"
          )
            this.tokens.push({name: "MULT_OP", value: NaN});
          numParens++;
          this.tokens.push({name: "L_PAREN", value: NaN});
          break;
        case ")":
          if (numParens == 0) throw new SyntaxError;
          numParens--;
          this.tokens.push({name: "R_PAREN", value: NaN});
          break;
        case "|":
          if (!openAbs) {
            if (this.tokens.length != 0 
              && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
              && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC") 
              && this.tokens[this.tokens.length-1].name != "L_PAREN"
            )
              this.tokens.push({name: "MULT_OP", value: NaN});
            openAbs = true;
            this.tokens.push({name: "ABS_FUNC", value: NaN});
            this.tokens.push({name: "L_PAREN", value: NaN});
          } else {
            if (this.tokens[this.tokens.length-1].name.endsWith("_OP"))
              throw new SyntaxError;
            openAbs = false;
            this.tokens.push({name: "R_PAREN", value: NaN});
          }
          break;
        case "e":
          if (this.tokens.length != 0 
            && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
            && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC") 
            && this.tokens[this.tokens.length-1].name != "L_PAREN"
          )
            this.tokens.push({name: "MULT_OP", value: NaN});
          this.tokens.push({name: "CONST", value: Math.E});
          break;
        case "p":
          if (functionStr.charAt(i+1) != "i")
            throw new SyntaxError;
          if (this.tokens.length != 0 
            && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
            && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC") 
            && this.tokens[this.tokens.length-1].name != "L_PAREN"
          )
            this.tokens.push({name: "MULT_OP", value: NaN});
          this.tokens.push({name: "CONST", value: Math.PI});
          i++;
          break;
        case "x":
          // add multiplication operator if not present
          if (this.tokens.length != 0 
            && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
            && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC")
            && this.tokens[this.tokens.length-1].name != "L_PAREN"
          )
            this.tokens.push({name: "MULT_OP", value: NaN});
          this.tokens.push({name: "VAR", value: NaN});
          break;
        // functions
        case "t":
          if (functionStr.substring(i, i+3) == "tan") {
            if (this.tokens.length != 0 
              && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
              && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC") 
              && this.tokens[this.tokens.length-1].name != "L_PAREN"
            )
              this.tokens.push({name: "MULT_OP", value: NaN});
            this.tokens.push({name: "TAN_FUNC", value: NaN});
            i += 2;
          } else throw new SyntaxError;
          break;
        case "l":
          if (functionStr.substring(i, i+2) == "ln") {
            if (this.tokens.length != 0 
              && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
              && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC") 
              && this.tokens[this.tokens.length-1].name != "L_PAREN"
            )
              this.tokens.push({name: "MULT_OP", value: NaN});
            this.tokens.push({name: "LN_FUNC", value: NaN});
            i++;
          } else if (functionStr.substring(i, i+3) == "log") {
            if (this.tokens.length != 0 
              && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
              && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC") 
              && this.tokens[this.tokens.length-1].name != "L_PAREN"
            )
              this.tokens.push({name: "MULT_OP", value: NaN});
            this.tokens.push({name: "LOG_FUNC", value: NaN});
            i += 2;
          } else throw new SyntaxError;
          break;
        case "s":
          if (functionStr.substring(i,i+3) == "sin") {
            if (this.tokens.length != 0 
              && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
              && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC") 
              && this.tokens[this.tokens.length-1].name != "L_PAREN"
            )
              this.tokens.push({name: "MULT_OP", value: NaN});
            this.tokens.push({name: "SIN_FUNC", value: NaN});
            i += 2;
          } else if (functionStr.substring(i,i+3) == "sec") {
            if (this.tokens.length != 0 
              && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
              && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC") 
              && this.tokens[this.tokens.length-1].name != "L_PAREN"
            )
              this.tokens.push({name: "MULT_OP", value: NaN});
            this.tokens.push({name: "SEC_FUNC", value: NaN});
            i += 2;
          } else if (functionStr.substring(i,i+4) == "sqrt") {
            if (this.tokens.length != 0 
              && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
              && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC") 
              && this.tokens[this.tokens.length-1].name != "L_PAREN"
            )
              this.tokens.push({name: "MULT_OP", value: NaN});
            this.tokens.push({name: "SQRT_FUNC", value: NaN});
            i += 3;
          } else throw new SyntaxError;
          break;
        case "c":
          switch (functionStr.substring(i,i+3)) {
            case "cos":
              if (this.tokens.length != 0 
                && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
                && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC") 
                && this.tokens[this.tokens.length-1].name != "L_PAREN"
              )
                this.tokens.push({name: "MULT_OP", value: NaN});
              this.tokens.push({name: "COS_FUNC", value: NaN});
              i += 2;
              break;
            case "csc":
              if (this.tokens.length != 0 
                && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
                && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC") 
                && this.tokens[this.tokens.length-1].name != "L_PAREN"
              )
                this.tokens.push({name: "MULT_OP", value: NaN});
              this.tokens.push({name: "CSC_FUNC", value: NaN});
              i += 2;
              break;
            case "cot":
              if (this.tokens.length != 0 
                && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
                && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC") 
                && this.tokens[this.tokens.length-1].name != "L_PAREN"
              )
                this.tokens.push({name: "MULT_OP", value: NaN});
              this.tokens.push({name: "COT_FUNC", value: NaN});
              i += 2;
              break;
            default:
              throw new SyntaxError;
          }
          break;
        case "a":
          switch (functionStr.substring(i,i+4)) {
            case "asin":
              if (this.tokens.length != 0 
                && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
                && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC") 
                && this.tokens[this.tokens.length-1].name != "L_PAREN"
              )
                this.tokens.push({name: "MULT_OP", value: NaN});
              this.tokens.push({name: "ASIN_FUNC", value: NaN});
              i += 3;
              break;
            case "acos":
              if (this.tokens.length != 0 
                && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
                && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC") 
                && this.tokens[this.tokens.length-1].name != "L_PAREN"
              )
                this.tokens.push({name: "MULT_OP", value: NaN});
              this.tokens.push({name: "ACOS_FUNC", value: NaN});
              i += 3;
              break;
            case "atan":
              if (this.tokens.length != 0 
                && !this.tokens[this.tokens.length-1].name.endsWith("_OP") 
                && !this.tokens[this.tokens.length-1].name.endsWith("_FUNC") 
                && this.tokens[this.tokens.length-1].name != "L_PAREN"
              )
                this.tokens.push({name: "MULT_OP", value: NaN});
              this.tokens.push({name: "ATAN_FUNC", value: NaN});
              i += 3;
              break;
            default:
              throw new SyntaxError;
          }
          break;
        default:
          throw new SyntaxError;
      }
    }
    console.log(this.tokens);
    this.parseTreeRoot = this.parseExpression(this.tokens);
    // fold tree
    this.evaluate(NaN);
  }

  parseExpression(tokenArr) {
    console.log(`parseExpression ${tokenArr[0].name}`);
    let numParens = 0;
    let rootIndex = null;
    for (let i = tokenArr.length - 1; i > -1; i--) {
      if (tokenArr[i].name == "R_PAREN") {
        numParens++;
      } else if (tokenArr[i].name == "L_PAREN") {
        numParens--;
      } else if (numParens == 0 && (tokenArr[i].name == "ADD_OP" || tokenArr[i].name == "SUB_OP")) {
        rootIndex = i;
        break;
      }
    }
    if (rootIndex == null)
      return this.parseTerm(tokenArr);
    let token = new ParseTreeNode(tokenArr[rootIndex]);
    token.leftChild = this.parseExpression(tokenArr.slice(0, rootIndex));
    token.rightChild = this.parseExpression(tokenArr.slice(rootIndex + 1, tokenArr.length));
    return token;
  }
  parseTerm(tokenArr) {
    console.log(`parseTerm ${tokenArr[0].name}`);
    let numParens = 0;
    let rootIndex = null;
    for (let i = tokenArr.length - 1; i > -1; i--) {
      if (tokenArr[i].name == "R_PAREN") {
        numParens++;
      } else if (tokenArr[i].name == "L_PAREN") {
        numParens--;
      } else if (numParens == 0 && (tokenArr[i].name == "MULT_OP" || tokenArr[i].name == "DIV_OP" || tokenArr[i].name == "MOD_OP")) {
        rootIndex = i;
        break;
      }
    }
    if (rootIndex == null)
      return this.parseFactor(tokenArr);
    let token = new ParseTreeNode(tokenArr[rootIndex]);
    token.leftChild = this.parseExpression(tokenArr.slice(0, rootIndex));
    token.rightChild = this.parseExpression(tokenArr.slice(rootIndex + 1, tokenArr.length));
    return token;
  }
  parseFactor(tokenArr) {
    console.log(`parseFactor ${tokenArr[0].name}`);
    let numParens = 0;
    let rootIndex = null;
    for (let i = 0; i < tokenArr.length; i++) {
      if (tokenArr[i].name == "R_PAREN") {
        numParens++;
      } else if (tokenArr[i].name == "L_PAREN") {
        numParens--;
      } else if (numParens == 0 && tokenArr[i].name == "EXP_OP") {
        rootIndex = i;
        break;
      }
    }
    if (rootIndex == null)
      return this.parseFunction(tokenArr);
    let token = new ParseTreeNode(tokenArr[rootIndex]);
    token.leftChild = this.parseExpression(tokenArr.slice(0, rootIndex));
    token.rightChild = this.parseExpression(tokenArr.slice(rootIndex + 1, tokenArr.length));
    return token;
  }
  parseFunction(tokenArr) {
    console.log(`parseFunction ${tokenArr[0].name}`);
    if (tokenArr[0].name == "L_PAREN") {
      if (tokenArr[tokenArr.length-1].name != "R_PAREN") throw new SyntaxError;
      return this.parseExpression(tokenArr.slice(1, tokenArr.length-1));
    }
    if (tokenArr[0].name.endsWith("_FUNC")) {
      let node = new ParseTreeNode(tokenArr[0]);
      node.leftChild = this.parseExpression(tokenArr.slice(1,tokenArr.length));
      return node;
    }
    return this.parsePrimary(tokenArr);
  }
  parsePrimary(tokenArr) {
    console.log(`parsePrimary ${tokenArr[0].name}`);
    if (tokenArr.length != 1 || (tokenArr[0].name != "VAR" && tokenArr[0].name != "CONST")) throw new SyntaxError;
    let node = new ParseTreeNode(tokenArr[0]);
    return node;
  }

  // evaluate function recursively
  // x-value NaN used for tree folding, node.token.value stores value of subtrees not containing VAR
  evaluate(x, node = this.parseTreeRoot) {
    if (!isNaN(node.token.value)) return node.token.value;
    switch (node.token.name) {
      case "VAR":
        return x;
      case "ADD_OP":
        if (isNaN(x)) {
          node.token.value = this.evaluate(x, node.leftChild) + this.evaluate(x, node.rightChild);
          return node.token.value;
        }
        return this.evaluate(x, node.leftChild) + this.evaluate(x, node.rightChild);
      case "SUB_OP":
        if (isNaN(x)) {
          node.token.value = this.evaluate(x, node.leftChild) - this.evaluate(x, node.rightChild);
          return node.token.value;
        }
        return this.evaluate(x, node.leftChild) - this.evaluate(x, node.rightChild);
      case "MULT_OP":
        if (isNaN(x)) {
          node.token.value = this.evaluate(x, node.leftChild) * this.evaluate(x, node.rightChild);
          return node.token.value;
        }
        return this.evaluate(x, node.leftChild) * this.evaluate(x, node.rightChild);
      case "DIV_OP":
        if (isNaN(x)) {
          node.token.value = this.evaluate(x, node.leftChild) / this.evaluate(x, node.rightChild);
          return node.token.value;
        }
        return this.evaluate(x, node.leftChild) / this.evaluate(x, node.rightChild);
      case "EXP_OP":
        if (isNaN(x)) {
          node.token.value = Math.pow(this.evaluate(x, node.leftChild), this.evaluate(x, node.rightChild));
          return node.token.value;
        }
        return Math.pow(this.evaluate(x, node.leftChild), this.evaluate(x, node.rightChild));
      case "ABS_FUNC":
        if (isNaN(x)) {
          node.token.value = Math.abs(this.evaluate(x, node.leftChild));
          return node.token.value;
        }
        return Math.abs(this.evaluate(x, node.leftChild));
      case "LN_FUNC":
        if (isNaN(x)) {
          node.token.value = Math.log(this.evaluate(x, node.leftChild));
          return node.token.value;
        }
        return Math.log(this.evaluate(x, node.leftChild));
      case "LOG_FUNC":
        if (isNaN(x)) {
          node.token.value = Math.log10(this.evaluate(x, node.leftChild));
          return node.token.value;
        }
        return Math.log10(this.evaluate(x, node.leftChild));
      case "SIN_FUNC":
        if (isNaN(x)) {
          node.token.value = Math.sin(this.evaluate(x, node.leftChild));
          return node.token.value;
        }
        return Math.sin(this.evaluate(x, node.leftChild));
      case "SEC_FUNC":
        if (isNaN(x)) {
          node.token.value = 1 / Math.cos(this.evaluate(x, node.leftChild));
          return node.token.value;
        }
        return 1 / Math.cos(this.evaluate(x, node.leftChild));
      case "SQRT_FUNC":
        if (isNaN(x)) {
          node.token.value = Math.sqrt(this.evaluate(x, node.leftChild));
          return node.token.value;
        }
        return Math.sqrt(this.evaluate(x, node.leftChild));
      case "COS_FUNC":
        if (isNaN(x)) {
          node.token.value = Math.cos(this.evaluate(x, node.leftChild));
          return node.token.value;
        }
        return Math.cos(this.evaluate(x, node.leftChild));
      case "TAN_FUNC":
        if (isNaN(x)) {
          node.token.value = Math.tan(this.evaluate(x, node.leftChild));
          return node.token.value;
        }
        return Math.tan(this.evaluate(x, node.leftChild));
      case "CSC_FUNC":
        if (isNaN(x)) {
          node.token.value = 1 / Math.sin(this.evaluate(x, node.leftChild));
          return node.token.value;
        }
        return 1 / Math.sin(this.evaluate(x, node.leftChild));
      case "COT_FUNC":
        if (isNaN(x)) {
          node.token.value = 1 / Math.tan(this.evaluate(x, node.leftChild));
          return node.token.value;
        }
        return 1 / Math.tan(this.evaluate(x, node.leftChild));
      case "ASIN_FUNC":
        if (isNaN(x)) {
          node.token.value = Math.asin(this.evaluate(x, node.leftChild));
          return node.token.value;
        }
        return Math.asin(this.evaluate(x, node.leftChild));
      case "ACOS_FUNC":
        if (isNaN(x)) {
          node.token.value = Math.acos(this.evaluate(x, node.leftChild));
          return node.token.value;
        }
        return Math.acos(this.evaluate(x, node.leftChild));
      case "ATAN_FUNC":
        if (isNaN(x)) {
          node.token.value = Math.atan(this.evaluate(x, node.leftChild));
          return node.token.value;
        }
        return Math.atan(this.evaluate(x, node.leftChild));
      default:
        throw new SyntaxError;
    }
  }
}

var parser;
var isValidFunction = false;

onmessage = (event) => {
  const data = event.data;

  if (typeof(data) === "string") {
    try {
      parser = new ExpressionParser(data);
      isValidFunction = true;
    } catch (e) {
      console.log(e.stack);
    }
    postMessage("success");
  }
  else {
    if (!isValidFunction) {
      postMessage([]);
      return;
    }
    
    // calculate y-values to put in memo
    var memo = [];
    const firstX = 2 * data.viewPort.xMin - data.viewPort.xMax;
    const dx = 3 * (data.viewPort.xMax - data.viewPort.xMin) / (4.5 * data.canvasWidth);
    for (let i = 0; i <= (4.5*data.canvasWidth); i++) {
      let x = i * dx + firstX;
      memo.push({x: x, y: parser.evaluate(x)});
    }

    postMessage(memo);
  }
}