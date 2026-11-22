
// PDF.js configuration
if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

// Skills required for different job roles
const jobSkills = {
    web: ["HTML", "CSS", "JavaScript", "React", "Git", "Responsive Design"],
    frontend: ["HTML", "CSS", "JavaScript", "React", "Bootstrap", "Git"],
    backend: ["Node.js", "Python", "Java", "SQL", "API", "Database"],
    python: ["Python", "Django", "Flask", "SQL", "Git", "OOP"],
    java: ["Java", "OOP", "Spring Boot", "SQL", "JDBC", "Git"],
    data: ["Python", "SQL", "Excel", "Power BI", "Statistics", "Pandas"],
    cyber: ["Networking", "Linux", "Python", "Ethical Hacking", "Cryptography", "Firewalls"]
};

// Read uploaded resume
async function extractResumeText(file) {

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        return await file.text();
    }

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {

        if (!window.pdfjsLib) {
            throw new Error("PDF library could not load. Check your internet connection.");
        }

        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({
            data: new Uint8Array(buffer)
        }).promise;

        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();

            fullText += content.items
                .map(item => item.str)
                .join(" ") + " ";
        }

        return fullText;
    }

    throw new Error("Please upload a PDF or TXT file.");
}

// Analyze button
document.getElementById("analyzeBtn").addEventListener("click", async function () {

    const file = document.getElementById("resume").files[0];
    const role = document.getElementById("role").value;

    const status = document.getElementById("status");
    const results = document.getElementById("results");

    status.textContent = "";
    results.classList.add("hidden");

    if (!file) {
        status.textContent = "Please upload your resume first!";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        status.textContent = "Please upload a file smaller than 5 MB.";
        return;
    }

    const button = this;
    button.disabled = true;
    button.textContent = "Analyzing...";
    status.textContent = "Reading your resume...";

    try {

        const resumeText = await extractResumeText(file);

        if (!resumeText.trim()) {
            throw new Error("No readable text found. Try a text-based PDF or TXT file.");
        }

        analyzeResume(resumeText, role);

        status.textContent = "Analysis completed successfully!";

    } catch (error) {

        status.textContent = error.message;

    } finally {

        button.disabled = false;
        button.textContent = "Analyze Resume";

    }

});

// Main resume analysis function
function analyzeResume(text, role) {

    const resume = text.toLowerCase();

    const requiredSkills = jobSkills[role];

    const found = [];
    const missing = [];

    requiredSkills.forEach(skill => {

        const pattern = new RegExp(
            "\\b" + skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b",
            "i"
        );

        if (pattern.test(resume)) {
            found.push(skill);
        } else {
            missing.push(skill);
        }

    });

    // Calculate score
    const score = Math.round(
        (found.length / requiredSkills.length) * 100
    );

    document.getElementById("score").textContent = score + "%";

    // Feedback
    let feedback = "";

    if (score >= 80) {
        feedback = "Excellent! Your resume covers most of the target skills.";
    } else if (score >= 50) {
        feedback = "Good start! Add more relevant skills to strengthen your resume.";
    } else {
        feedback = "Your resume needs improvement for this job role.";
    }

    document.getElementById("feedback").textContent = feedback;

    // Display found skills
    const foundContainer = document.getElementById("foundSkills");
    foundContainer.innerHTML = "";

    found.forEach(skill => {
        const span = document.createElement("span");
        span.className = "skill";
        span.textContent = skill;
        foundContainer.appendChild(span);
    });

    // Display missing skills
    const missingContainer = document.getElementById("missingSkills");
    missingContainer.innerHTML = "";

    missing.forEach(skill => {
        const span = document.createElement("span");
        span.className = "skill missing";
        span.textContent = skill;
        missingContainer.appendChild(span);
    });

    // Suggestions
    const suggestionList = document.getElementById("suggestions");
    suggestionList.innerHTML = "";

    const suggestions = [];

    if (missing.length > 0) {
        suggestions.push(
            "Consider learning and including relevant missing skills: " +
            missing.join(", ") + "."
        );
    }

    if (!/\b(project|projects)\b/i.test(text)) {
        suggestions.push("Add a Projects section describing your practical work.");
    }

    if (!/\b(internship|experience|work experience)\b/i.test(text)) {
        suggestions.push("Include internship, volunteering or practical experience if available.");
    }

    if (!/\b(certification|certifications|certificate)\b/i.test(text)) {
        suggestions.push("Include relevant certifications and courses.");
    }

    if (!/\b(education|degree|university|college)\b/i.test(text)) {
        suggestions.push("Add a clear Education section.");
    }

    if (suggestions.length === 0) {
        suggestions.push("Keep your resume updated with relevant projects and achievements.");
    }

    suggestions.forEach(suggestion => {
        const li = document.createElement("li");
        li.textContent = suggestion;
        suggestionList.appendChild(li);
    });

    document.getElementById("results").classList.remove("hidden");
}
