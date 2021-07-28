// Create links to DOM elements
const reportScreenElem = document.getElementById("result-screen");
const expScreenElem = document.getElementById("expression-screen");
const numKeysElems = document.getElementsByClassName("num-key");
const periodKeyElem = document.getElementById("period-key");
const bckKeyElem = document.getElementById("back-key");
const opKeysElems = document.getElementsByClassName("op-key");
const clearKeyElem = document.getElementById("clear-key");
const enterKeyElem = document.getElementById("enter-key");
const powBtnElem = document.getElementById("power-button");

let expMax = 24;

// Pre-load all sounds, make them ready to play
let startBeep = new Audio("assets/sounds/startup.wav");
startBeep.load();
startBeep.volume = 0.5;

let shutBeep = new Audio("assets/sounds/shutdown.wav");
shutBeep.load();
shutBeep.volume = 0.5;

let btnBeep = new Audio("assets/sounds/menu_beep.wav");
btnBeep.load();
btnBeep.volume = 0.25;

let colBeep = new Audio("assets/sounds/collision.wav");
colBeep.load();
colBeep.volume = 0.5;

let backBeep = new Audio("assets/sounds/backspace.wav");
backBeep.load();
backBeep.volume = 0.5;

let clearBeep = new Audio("assets/sounds/clear.wav");
clearBeep.load();
clearBeep.volume = 0.5;

let sucBeep = new Audio("assets/sounds/success.wav");
sucBeep.load();
sucBeep.volume = 0.5;

let errorBeep = new Audio("assets/sounds/error.wav");
errorBeep.load();
errorBeep.volume = 0.5;

// Power up function - toggleable
let power = false;
disableButtons();

powBtnElem.addEventListener("click", function () {
  if (power === false) {
    enableButtons();
    document.getElementById("power-button").classList.remove("power-blink");
    document.getElementById("red-led-top").className = "red-led red-led-blink";
    document.getElementById("yellow-led-top").className = "yellow-led yellow-led-blink";
    document.getElementById("green-led-top").className = "green-led green-led-blink";
    document.getElementById("pokemap").style.visibility = "visible";
    document.getElementById("power-led-1").className = "power-led-on";
    document.getElementById("power-led-2").className = "power-led-on";
    document.getElementById("power-led-3").className = "power-led-on";
    document.getElementById("lens-element").className = "lens-element-on";
    document.getElementById("lens-background").className = "lens-background-on";
    power = true;
    startBeep.play();
  } else {
    disableButtons();
    updateExpression();
    updateReport();
    document.getElementById("power-button").classList.add("power-blink");
    document.getElementById("red-led-top").className = "red-led red-led-off";
    document.getElementById("yellow-led-top").className = "yellow-led yellow-led-off";
    document.getElementById("green-led-top").className = "green-led green-led-off";
    document.getElementById("pokemap").style.visibility = "hidden";
    document.getElementById("power-led-1").className = "power-led-off";
    document.getElementById("power-led-2").className = "power-led-off";
    document.getElementById("power-led-3").className = "power-led-off";
    document.getElementById("lens-element").className = "lens-element-off";
    document.getElementById("lens-background").className = "lens-background-off";
    shutBeep.play();
    power = false;
  }
});

// Disable buttons (as if power is off)
function disableButtons() {
  let buttons = document.getElementsByTagName("button");
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].id !== "power-button") buttons[i].disabled = true;
  }
}

// Enable buttons (as if power is on)
function enableButtons() {
  let buttons = document.getElementsByTagName("button");
  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].id !== "power-button") buttons[i].disabled = false;
  }
}

// // Check local storage on first load
let expression = "";
// if (localStorage.getItem("expression") === null) {
//   updateExpression();
// } else {
//   updateExpression(localStorage.getItem("expression"));
// }

let report = "";
// if (localStorage.getItem("report") === null) {
//   updateReport();
// } else {
//   updateReport(localStorage.getItem("report"));
// }

// Number keys event listeners
for (let i = 0; i < numKeysElems.length; i++) {
  numKeysElems[i].addEventListener("click", function (e) {
    if (expression.length < 24) {
      beep();
      updateExpression((expression += e.target.name));
    } else {
      colBeep.currentTime = 0;
      colBeep.play();
    }
  });
}

// Period key event listener
periodKeyElem.addEventListener("click", function (e) {
  updateExpression(expression += e.target.name);
  beep();
});

// Backspace key event listener
bckKeyElem.addEventListener("click", function(e) {
  updateExpression(expression.substring(0,expression.length-1));
  backBeep.currentTime = 0;
  backBeep.play();
})

// Operation keys event listeners
for (let i = 0; i < opKeysElems.length; i++) {
  opKeysElems[i].addEventListener("click", function (e) {
    updateExpression((expression += e.target.name));
    beep();
  });
}

// Clear key event listener
clearKeyElem.addEventListener("click", function (e) {
  updateExpression();
  updateReport();
  clearBeep.currentTime = 0;
  clearBeep.play();
});

// Enter key event listener
enterKeyElem.addEventListener("click", function (e) {
  if (expression === "") return "Error";
  let answer = solve(expression);
  updateReport(answer + "<br />" + report);
  updateExpression();
});

// Beep sound
function beep() {
  btnBeep.currentTime = 0;
  btnBeep.play();
}

// Update expression, then local storage, then the expression screen
function updateExpression(string = "") {
  expression = string;
  localStorage.setItem("expression", expression);
  updateExpScreen(formatString(string)); // Could absorb function into here
}

// Update expression screen
function updateExpScreen() {
  expScreenElem.innerHTML = formatString(expression);
}

// Update result, then local storage, then report screen
function updateReport(string = "") {
  report = string;
  localStorage.setItem("report", report);
  updateReportScreen();
}

// Update report screen
function updateReportScreen() {
  reportScreenElem.innerHTML = formatString(report);
}

// Format string for displays
function formatString(string) {
  string = string.replaceAll("*", "&#xd7;");
  string = string.replaceAll("/", "&#xf7;");
  return string;
}

// Add in keyboard functionality

// Main solve function
function solve(exp) {
  
  // If there's no operators, just return the number
  let regSimp = /^\-?[0-9\.?]+$/;
  if (regSimp.test(exp)) return exp.toString();

  // If there's subtraction, replace it with addition of negatives 
  let regSub = /(?<=[0-9\.?])\-/g;
  exp = exp.replaceAll(regSub,"\+\-");

  // Regular expressions
  let regMultDiv = /\-?[0-9\.?]+[\*\/]\-?[0-9\.?]+/;
  let regAddSub = /\-?[0-9\.?]+[\+\-]\-?[0-9\.?]+/;

  // If the expression isn't made of number-operator pairs, return error
  if (!regMultDiv.test(exp) && !regAddSub.test(exp)) {
    errorBeep.currentTime = 0;
    errorBeep.play();
    return "ERROR";
  }
  console.log(exp);
  
  // Solve all multiplication and division left-to-right
  while (regMultDiv.test(exp)) {
    exp = exp.replace(regMultDiv, operate(exp.match(regMultDiv).toString()));
    console.log(exp);
  }

  // Solve all addition and subtraction left-to-right
  while (regAddSub.test(exp)) {
    exp = exp.replace(regAddSub, operate(exp.match(regAddSub).toString()));
    console.log(exp);
  }

  // Return answer
  let solution = exp;
  sucBeep.currentTime = 0;
  sucBeep.play();
  return solution;
}

// Operation function called by solve
function operate(eq) {

  // Ensure input is in format [number, operator, number]
  let op = eq.match(/[^0-9\.\-]/).toString();
  let a = Number(eq.match(/^\-?[0-9\.?]+/));
  let b = Number(eq.match(/\-?[0-9\.?]+$/));

  // Route operation
  switch (op) {
    case "+":
      return add(a, b);
    case "-":
      return subtract(a, b);
    case "*":
      return multiply(a, b);
    case "/":
      return divide(a, b);
    default:
      return "ERROR";
  }
}

// Primitive functions
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}