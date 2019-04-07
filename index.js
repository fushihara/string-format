/**
 * https://github.com/nathancahill/split/tree/master/packages/splitjs
 * https://codemirror.net/doc/manual.html#modloader
 */
let source, input, output, editor, log;
let buttonPaste, buttonCopy, buttonRun, checkboxAutoRun, checkboxAutoScroll;
let wrapSourceCheckbox, wrapInputCheckbox, wrapOutputCheckbox;
window.addEventListener("DOMContentLoaded", (e) => {
  source = document.querySelector("#source");
  input = document.querySelector("#input");
  output = document.querySelector("#output");
  log = document.querySelector("#log");
  buttonCopy = document.querySelector("#copy");
  buttonRun = document.querySelector("#run");
  checkboxAutoRun = document.querySelector("#auto-run");
  checkboxAutoScroll = document.querySelector("#auto-scroll");
  wrapSourceCheckbox = document.querySelector("#wrap-source");
  wrapInputCheckbox = document.querySelector("#wrap-input");
  wrapOutputCheckbox = document.querySelector("#wrap-output");
  const splitのサイズ = 5;
  Split(['#one', '#two'], {
    sizes: JSON.parse(localStorage[`${localStorageのkey}-drag-size-1`] || "[70,30]"),
    gutterSize: splitのサイズ,
    onDragEnd: (sizes) => {
      localStorage[`${localStorageのkey}-drag-size-1`] = JSON.stringify(sizes);
    },
  })
  Split(['#a1', '#a2', '#a3'], {
    sizes: JSON.parse(localStorage[`${localStorageのkey}-drag-size-2`] || "[20,100,10]"),
    gutterSize: splitのサイズ,
    direction: "vertical",
    onDragEnd: (sizes) => {
      localStorage[`${localStorageのkey}-drag-size-2`] = JSON.stringify(sizes);
    },
  });
  editor = CodeMirror.fromTextArea(source, {
    lineNumbers: true,
    lineWrapping: true,
    autofocus: true
  });
  loadState();
  checkboxAutoRun.checked = false;
  editor.on('change', editor => {
    if (checkboxAutoRun.checked) {
      doRun();
    }
    saveState();
  });
  editor.save();
  input.addEventListener("keydown", () => { saveState(); });
  buttonCopy.addEventListener("click", () => {
    navigator.clipboard.writeText(output.value);
  });
  buttonRun.addEventListener("click", () => {
    doRun();
    saveState();
  });
  wrapSourceCheckbox.addEventListener("change", () => {
    editor.setOption("lineWrapping", wrapSourceCheckbox.checked);
    saveState();
  });
  wrapInputCheckbox.addEventListener("change", () => {
    input.setAttribute("wrap", wrapOutputCheckbox.checked ? "" : "off");
    saveState();
  });
  wrapOutputCheckbox.addEventListener("change", () => {
    output.setAttribute("wrap", wrapOutputCheckbox.checked ? "" : "off");
    saveState();
  });
  checkboxAutoRun.addEventListener("change", () => {
    if (checkboxAutoRun.checked) {
      doRun();
    }
  });
  addLog("起動完了");
}, false);
const localStorageのkey = "string-function";
function loadState() {
  if (source) {
    editor.setValue(localStorage[`${localStorageのkey}-source`] || "");
  }
  if (input) {
    input.value = localStorage[`${localStorageのkey}-input`] || "";
  }
  if (output) {
    output.value = localStorage[`${localStorageのkey}-output`] || "";
  }
  if (wrapSourceCheckbox) {
    const v = localStorage[`${localStorageのkey}-wrap-source`] || "";
    wrapSourceCheckbox.checked = !!v;
    editor.setOption("lineWrapping", !!v);
  }
  if (wrapInputCheckbox) {
    const v = localStorage[`${localStorageのkey}-wrap-input`] || "";
    wrapInputCheckbox.checked = !!v;
    input.setAttribute("wrap", (!!v) ? "" : "off");
  }
  if (wrapOutputCheckbox) {
    const v = localStorage[`${localStorageのkey}-wrap-output`] || "";
    wrapOutputCheckbox.checked = !!v;
    output.setAttribute("wrap", (!!v) ? "" : "off");
  }
}
function saveState() {
  if (source) {
    localStorage[`${localStorageのkey}-source`] = editor.getValue();
  }
  if (input) {
    localStorage[`${localStorageのkey}-input`] = input.value;
  }
  if (output) {
    localStorage[`${localStorageのkey}-output`] = output.value;
  }
  if (wrapSourceCheckbox) {
    localStorage[`${localStorageのkey}-wrap-source`] = wrapSourceCheckbox.checked ? "1" : "";
  }
  if (wrapInputCheckbox) {
    localStorage[`${localStorageのkey}-wrap-input`] = wrapInputCheckbox.checked ? "1" : "";
  }
  if (wrapOutputCheckbox) {
    localStorage[`${localStorageのkey}-wrap-output`] = wrapOutputCheckbox.checked ? "1" : "";
  }
}
function addLog(message) {
  let timeStamp = "";
  {
    let d = new Date();
    let r = "";
    r += String(d.getFullYear());
    r += "-";
    r += String(d.getMonth() + 1).padStart(2, "0");
    r += "-";
    r += String(d.getDate()).padStart(2, "0");
    r += "(";
    r += ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    r += ")";
    r += String(d.getHours()).padStart(2, "0");
    r += "-";
    r += String(d.getMinutes()).padStart(2, "0");
    r += "-";
    r += String(d.getSeconds()).padStart(2, "0");
    r += ".";
    r += String(d.getMilliseconds()).padStart(3, "0");
    timeStamp = r;
  }

  const dom = document.createElement("div");
  dom.innerHTML = `<div class="time"></div><div class="message"></div>`;
  dom.style.display = "flex";
  const time = dom.querySelector(".time");
  time.innerText = timeStamp;
  time.style.flex = "0 0 auto";
  time.style.paddingRight = "10px";
  const msg = dom.querySelector(".message");
  msg.innerText = message;
  msg.style.flex = "1 1 0";
  log.appendChild(dom);
  if (checkboxAutoScroll.checked) {
    log.scrollTop = log.scrollHeight;
  }
}
function doRun() {
  const editorRawValue = editor.getValue();
  const inputValueLines = String(input.value || "").split("\n");
  const totalLineNumber = inputValueLines.length;
  let func;
  try {
    func = new Function("lineText", "lineNumber", "totalLineNumber", editorRawValue);
  } catch (e) {
    addLog(`関数の文法エラー。${e}`);
    return;
  }
  const results = [];
  let lineNumber = 0;

  for (let i of inputValueLines) {
    lineNumber += 1;
    try {
      const result = func(i, lineNumber, totalLineNumber);
      if (result !== undefined) {
        results.push(result);
      }
    } catch (e) {
      addLog(e);
      return;
    }
  }
  addLog(`データ更新。inputは ${inputValueLines.length} 行。outputは ${results.length} 行`);
  output.value = results.join("\n");
}