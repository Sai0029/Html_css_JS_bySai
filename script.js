// Elements
const htmlEditor = document.getElementById("html-editor");
const cssEditor = document.getElementById("css-editor");
const jsEditor = document.getElementById("js-editor");
const outputFrame = document.getElementById("output-frame");
const themeSelector = document.getElementById("theme-selector");
const validateButton = document.getElementById("validate-html");
const formatButton = document.getElementById("format-code");
const downloadButton = document.getElementById("download");
const toggleThemeButton = document.getElementById("toggle-theme");

let isDarkMode = false;

// Initialize CodeMirror
const htmlCM = CodeMirror.fromTextArea(htmlEditor, { mode: "xml", lineNumbers: true, theme: "default" });
const cssCM = CodeMirror.fromTextArea(cssEditor, { mode: "css", lineNumbers: true, theme: "default" });
const jsCM = CodeMirror.fromTextArea(jsEditor, { mode: "javascript", lineNumbers: true, theme: "default" });


// File Upload Handler
const fileUploadInput = document.getElementById("file-upload");

fileUploadInput.addEventListener("change", (event) => {
  const files = event.target.files;

  Array.from(files).forEach((file) => {
    const reader = new FileReader();

    // Load file content and update the appropriate editor
    reader.onload = (e) => {
      const content = e.target.result;

      if (file.name.endsWith(".html")) {
        htmlCM.setValue(content);
      } else if (file.name.endsWith(".css")) {
        cssCM.setValue(content);
      } else if (file.name.endsWith(".js")) {
        jsCM.setValue(content);
      } else {
        alert(`Unsupported file type: ${file.name}`);
      }
    };

    reader.readAsText(file);
  });

  // Clear the input value to allow re-upload of the same file if needed
  fileUploadInput.value = "";
});

// Live Preview
function updatePreview() {
  const html = htmlCM.getValue();
  const css = `<style>${cssCM.getValue()}</style>`;
  const js = `<script>${jsCM.getValue()}<\/script>`;
  const content = `${html}\n${css}\n${js}`;
  const frameDoc = outputFrame.contentDocument || outputFrame.contentWindow.document;
  frameDoc.open();
  frameDoc.write(content);
  frameDoc.close();
}

// Validate HTML
function validateHTML() {
  const htmlCode = htmlCM.getValue();
  const errors = [];

  try {
    const parser = new DOMParser();
    parser.parseFromString(htmlCode, "text/html");
  } catch (e) {
    errors.push("HTML is not well-formed.");
  }

  const openTags = [];
  const lines = htmlCode.split("\n");
  lines.forEach((line, lineNumber) => {
    const regex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
    let tagMatch;

    while ((tagMatch = regex.exec(line)) !== null) {
      const tagName = tagMatch[1];
      const match = tagMatch[0];

      if (match.startsWith("</")) {
        const lastOpened = openTags.pop();
        if (lastOpened !== tagName) {
          errors.push(`Mismatched tag: Expected </${lastOpened || "none"}>, found </${tagName}> at line ${lineNumber + 1}`);
        }
      } else if (!match.endsWith("/>")) {
        openTags.push(tagName);
      }
    }
  });

  if (openTags.length > 0) {
    errors.push(`Unclosed tag(s): ${openTags.join(", ")}`);
  }

  const validationErrorsDiv = document.getElementById("html-validation-errors");
  validationErrorsDiv.innerHTML = errors.length
    ? errors.map((err) => `<p style="color: red;">${err}</p>`).join("")
    : "<p style='color: green;'>No errors!</p>";
}

// Format Code
function formatCode() {
  htmlCM.setValue(html_beautify(htmlCM.getValue()));
  cssCM.setValue(css_beautify(cssCM.getValue()));
  jsCM.setValue(js_beautify(jsCM.getValue()));
}

// Download Files
function downloadAll() {
  const zip = new JSZip();
  zip.file("index.html", htmlCM.getValue());
  zip.file("styles.css", cssCM.getValue());
  zip.file("script.js", jsCM.getValue());
  zip.generateAsync({ type: "blob" }).then(content => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "code.zip";
    link.click();
  });
}

// Event Listeners
htmlCM.on("change", updatePreview);
cssCM.on("change", updatePreview);
jsCM.on("change", updatePreview);

validateButton.addEventListener("click", validateHTML);
formatButton.addEventListener("click", formatCode);
downloadButton.addEventListener("click", downloadAll);

// Toggle Dark Mode
toggleThemeButton.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle("dark-mode", isDarkMode);
  
    const theme = isDarkMode ? "dracula" : "default";
    htmlCM.setOption("theme", theme);
    cssCM.setOption("theme", theme);
    jsCM.setOption("theme", theme);
  
    toggleThemeButton.textContent = isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode";
  });
  

// Theme Selector
themeSelector.addEventListener("change", () => {
  const theme = themeSelector.value;
  htmlCM.setOption("theme", theme);
  cssCM.setOption("theme", theme);
  jsCM.setOption("theme", theme);
});

// Initial Preview
updatePreview();
// script.js
// This will trigger the visibility change for the landscape warning.
window.addEventListener('resize', function() {
    if (window.innerWidth > window.innerHeight) {
      // In landscape mode, hide the warning
      document.getElementById('landscape-warning').style.display = 'none';
    } else {
      // In portrait mode, show the warning
      document.getElementById('landscape-warning').style.display = 'block';
    }
  });
  
  // Trigger resize event on page load to check for orientation
  window.dispatchEvent(new Event('resize'));
  