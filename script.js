// 🌐 Element Selectors
const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
const resultCard = document.getElementById("result");
const feedbackList = document.getElementById("feedbackList");
const scoreSpan = document.getElementById("score");
const scoreBar = document.getElementById("scoreBar");
const pdfViewer = document.getElementById("pdfViewer");

let resumeText = ""; // global for JD matching

// === Drag & Drop ===
dropArea.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", handleFile);

// === Handle PDF Upload ===
async function handleFile(e) {
  const file = e.target.files[0];
  if (!file || file.type !== "application/pdf") return alert("Please upload a valid PDF!");

  const reader = new FileReader();
  reader.onload = async function () {
    const typedarray = new Uint8Array(this.result);

    const pdfBlob = new Blob([typedarray], { type: "application/pdf" });
    const pdfURL = URL.createObjectURL(pdfBlob);
    pdfViewer.src = pdfURL;

    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map(item => item.str).join(" ");
    }

    resumeText = fullText;
    analyzeResume(fullText);
  };
  reader.readAsArrayBuffer(file);
}

// === Analyze Resume Text ===
function analyzeResume(text) {
  let score = 100;
  const feedback = [];

  if (text.toLowerCase().includes("hardworking") || text.toLowerCase().includes("responsible for")) {
    feedback.push("🤖 Tip: Avoid vague words like 'hardworking'. Use action verbs like 'led', 'built'.");
  }

  if (!text.toLowerCase().includes("achievements")) {
    feedback.push("🤖 Tip: Include a section on achievements or projects.");
  }

  if (!text.match(/\bemail\b|@/i)) {
    feedback.push("❌ Missing email address.");
    score -= 20;
  }

  if (!text.toLowerCase().includes("summary")) {
    feedback.push("❌ Missing summary section.");
    score -= 15;
  }

  const bulletPoints = (text.match(/•|-|\*/g) || []).length;
  if (bulletPoints < 3) {
    feedback.push("⚠️ Not enough bullet points to highlight skills.");
    score -= 10;
  }

  const keywords = ["JavaScript", "Python", "React", "HTML", "CSS", "Node", "API", "SQL", "MongoDB"];
  const foundKeywords = keywords.filter(k => text.toLowerCase().includes(k.toLowerCase()));
  if (foundKeywords.length < 3) {
    feedback.push("⚠️ Not enough technical keywords found.");
    score -= 15;
  } else {
    feedback.push(`✅ Found keywords: ${foundKeywords.join(", ")}`);
  }

  if (!text.match(/\b(LinkedIn|Portfolio)\b/i)) {
    feedback.push("🤖 Tip: Add your LinkedIn or portfolio link.");
  }

  if (score < 0) score = 0;

  scoreSpan.textContent = score;
  updateProgressBar(score);
  feedbackList.innerHTML = feedback.map(f => `<li>${f}</li>`).join("");
  resultCard.classList.remove("hidden");
}

// === Score Bar ===
function updateProgressBar(score) {
  scoreBar.style.width = `${score}%`;
  scoreBar.style.backgroundColor = score >= 75 ? "limegreen" : score >= 50 ? "orange" : "crimson";
}

// === JD Matching ===
function matchWithJob() {
  const jobText = document.getElementById("jobDescription").value.toLowerCase();
  if (!jobText || !resumeText) return alert("❗ Upload a resume and paste job description first!");

  const jdWords = jobText.match(/\b\w+\b/g) || [];
  const resumeWords = resumeText.toLowerCase().match(/\b\w+\b/g) || [];

  const jdSet = new Set(jdWords);
  let matchCount = 0;

  jdSet.forEach(word => {
    if (resumeWords.includes(word)) matchCount++;
  });

  const matchPercent = Math.round((matchCount / jdSet.size) * 100);
  alert(`✅ Resume matches ${matchPercent}% of the job description.`);
}

// === Download Feedback TXT ===
function downloadFeedback() {
  let text = "📄 PDF Resume Analysis Result\n\n";
  text += "Score: " + scoreSpan.textContent + "/100\n\n";
  const items = feedbackList.querySelectorAll("li");
  items.forEach((li, i) => {
    text += `${i + 1}. ${li.textContent}\n`;
  });

  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Resume_Feedback.txt";
  link.click();
}

// === Download PDF Feedback ===
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("PDF Resume Analysis Result", 10, 10);
  doc.text("Score: " + scoreSpan.textContent + "/100", 10, 20);

  const items = feedbackList.querySelectorAll("li");
  let y = 30;
  items.forEach((li, i) => {
    doc.text(`${i + 1}. ${li.textContent}`, 10, y);
    y += 10;
  });

  doc.save("Resume_Feedback.pdf");
}

// === AI Resume Generator ===
function generateAutoResume() {
  const job = document.getElementById("jobTitle").value.trim();
  const name = document.getElementById("userName").value.trim();
  const output = document.getElementById("generatedResume");

  if (!job || !name) return alert("Please enter your name and job title.");

  const resume = `Name: ${name}

Summary:
A highly motivated and detail-oriented ${job} passionate about delivering scalable and user-friendly solutions.

Skills:
- HTML, CSS, JavaScript
- React, Node.js, MongoDB
- API Integration, Git

Experience:
- Created multiple ${job.toLowerCase()} projects.
- Collaborated with developers and designers.
- Improved performance and responsiveness.

Education:
- Bachelor in Computer Science

Achievements:
- Built portfolio website
- Published technical blogs`;

  output.value = resume;
}

// === Fix My Resume ===
function fixMyResume() {
  const input = document.getElementById("resumeToFix").value;
  const output = document.getElementById("fixedResume");
  if (!input.trim()) return alert("Please paste your resume first.");

  let improved = input
    .replace(/hardworking/gi, "results-driven")
    .replace(/responsible for/gi, "successfully led")
    .replace(/good/gi, "highly effective")
    .replace(/team player/gi, "collaborative contributor");

  improved += "\n\n✅ Resume improved with stronger action verbs and clarity.";
  output.value = improved;
}

// === Ask AI Suggestions (Mock) ===
function askAI() {
  const input = document.getElementById("chatInput").value;
  const output = document.getElementById("aiResponse");

  if (!input.trim()) return alert("Please write something first.");

  output.textContent = "🤖 This looks great! Try using more action verbs and quantify your results for better impact.";
}


