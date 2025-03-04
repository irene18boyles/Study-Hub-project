document.addEventListener("DOMContentLoaded", function () {
    // Check if login status function exists
    if (typeof checkLoginStatus === "function") {
        checkLoginStatus();
    }

    // Cache DOM elements
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const goalForm = document.getElementById("goalForm");
    const completedSessionsElement = document.getElementById("completedSessions");

    // Add event listeners for forms if they exist
    loginForm?.addEventListener("submit", function (event) {
        event.preventDefault();
        loginUser();
    });

    signupForm?.addEventListener("submit", function (event) {
        event.preventDefault();
        signupUser(event);
    });

    goalForm?.addEventListener("submit", addGoal);

    // Update completed sessions if stored in localStorage
    if (localStorage.getItem("completedSessions") && completedSessionsElement) {
        completedSessionsElement.textContent = localStorage.getItem("completedSessions");
    }

    // Call other initialization functions
    loadGoals();
    updateTimerDisplay();
    loadQuestion();
    showSection("home-content");
});

// Open and Close Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "flex";
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "none";
}

// Close modal when clicking outside
window.addEventListener('click', function (event) {
    const modals = ['loginModal', 'signupModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && event.target === modal) {
            closeModal(modalId);
        }
    });
});


// Helper function to check if fields are filled
function areFieldsFilled(fields) {
    return fields.every(field => field.trim() !== "");
}

// Sign Up Function
function signupUser(event) {
    if (event) event.preventDefault();

    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    if (!areFieldsFilled([name, email, password])) {
        alert("Please fill in all fields.");
        return;
    }

    localStorage.setItem("user", JSON.stringify({ name, email, password }));
    closeModal("signupModal");
    displayDashboard();
}

// Log In Function
function loginUser() {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!areFieldsFilled([email, password])) {
        return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || storedUser.email !== email || storedUser.password !== password) {
        alert("Invalid email or password.");
        return;
    }

    localStorage.setItem("isLoggedIn", "true");
    closeModal("loginModal");
    displayDashboard();
}

// Logout Function
function logout() {
    localStorage.removeItem("isLoggedIn");
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("landingPage").style.display = "block";
}

// Check Login Status
function checkLoginStatus() {
    if (localStorage.getItem("isLoggedIn") === "true") {
        displayDashboard();
    }
}

// Display Dashboard
function displayDashboard() {
    const landingPage = document.getElementById("landingPage");
    const dashboard = document.getElementById("dashboard");
    const userName = document.getElementById("user-name");

    landingPage.style.display = "none";
    dashboard.style.display = "block";

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && userName) {
        userName.textContent = storedUser.name;
    }
}

// Switch Sections
function showSection(sectionId) {
    const sections = ["home-content", "study-goals", "study-timer", "quizzes", "progress-tracker", "personalize-study", "profile"];
    
    // Hide all sections
    sections.forEach(section => {
        const sectionElement = document.getElementById(section);
        if (sectionElement) sectionElement.style.display = "none";
    });

    // Show the target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.style.display = "block";
}

// Study Goals
function loadGoals() {
    const goalList = document.getElementById("goal-list");
    if (!goalList) return;

    goalList.innerHTML = "";

    const goals = JSON.parse(localStorage.getItem("studyGoals")) || [];
    const fragment = document.createDocumentFragment();

    goals.forEach((goal, index) => {
        const goalItem = createGoalElement(goal, index);
        fragment.appendChild(goalItem);
    });

    goalList.appendChild(fragment);
}

// Add New Goal
function addGoal(event) {
    event.preventDefault();

    const goalInput = document.getElementById("goal-input");
    const goalText = goalInput.value.trim();

    if (goalText === "") return;

    const goals = JSON.parse(localStorage.getItem("studyGoals")) || [];
    goals.push(goalText);
    localStorage.setItem("studyGoals", JSON.stringify(goals));

    const goalList = document.getElementById("goal-list");
    const goalItem = createGoalElement(goalText, goals.length - 1);
    goalList.appendChild(goalItem);

    goalInput.value = "";
}

// Create Goal Element
function createGoalElement(goalText, index) {
    const goalItem = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.onchange = () => updateGoalCompletion(index, checkbox.checked);

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.classList.add("goalList-btn");
    removeButton.onclick = () => removeGoal(index);

    goalItem.append(checkbox, document.createTextNode(goalText), removeButton);
    return goalItem;
}

// Update Goal Completion (optimized)
function updateGoalCompletion(index, isCompleted) {
    const goals = JSON.parse(localStorage.getItem("studyGoals")) || [];
    const completedGoals = JSON.parse(localStorage.getItem("completedGoals")) || [];

    if (isCompleted) {
        completedGoals.push(goals[index]);
    } else {
        const goalIndex = completedGoals.indexOf(goals[index]);
        if (goalIndex !== -1) completedGoals.splice(goalIndex, 1);
    }

    localStorage.setItem("completedGoals", JSON.stringify(completedGoals));
    updateProgressTracker();
}

// Remove Goal
function removeGoal(index) {
    const goals = JSON.parse(localStorage.getItem("studyGoals")) || [];
    goals.splice(index, 1);
    localStorage.setItem("studyGoals", JSON.stringify(goals));

    loadGoals();
}

// Study Timer Logic
let timer;
let timeLeft = 1500;
let isRunning = false;

// Update the timer display
function updateTimerDisplay() {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');
    document.getElementById("timer-display").textContent = `${minutes}:${seconds}`;
}

// Start the timer
function startTimer() {
    if (isRunning) return;
    isRunning = true;

    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            clearInterval(timer);
            isRunning = false;
            alert("Time's up!");

            // Update completed sessions and progress
            const completedSessions = parseInt(localStorage.getItem("completedSessions") || "0", 10) + 1;
            localStorage.setItem("completedSessions", completedSessions);
            updateProgressTracker();
        }
    }, 1000);
}

// Stop the timer
function stopTimer() {
    clearInterval(timer);
    isRunning = false;
}

// Reset the timer
function resetTimer() {
    stopTimer();
    timeLeft = 1500;
    updateTimerDisplay();
}

// Start a break (5 minutes)
function useBreak() {
    stopTimer();
    timeLeft = 300;
    updateTimerDisplay();
}

// Utility function to get elements by selector
function getElement(selector) {
    return document.querySelector(selector);
}

// Quiz Logic
async function loadQuestion() {
    const questionEl = getElement(".question");
    const optionsEl = getElement(".options");
    const resultEl = getElement("#result");
    const nextBtn = getElement("#quiz-btn");

    if (!questionEl || !optionsEl || !resultEl || !nextBtn) {
        console.error("Error: One or more elements not found in the DOM.");
        return;
    }

    setLoadingState(questionEl, optionsEl, resultEl, nextBtn);

    const prompt = generateQuizPrompt();

    try {
        const response = await fetchAIResponse(prompt);
        const output = parseAIResponse(response);
        if (output) {
            displayQuestion(output);
        }
    } catch (error) {
        console.error("Error fetching AI question:", error);
        questionEl.textContent = "Error fetching question!";
    }
}

function setLoadingState(questionEl, optionsEl, resultEl, nextBtn) {
    questionEl.textContent = "Generating question...";
    optionsEl.innerHTML = "";
    resultEl.textContent = "";
    nextBtn.style.display = "none";
}

function generateQuizPrompt() {
    return {
        contents: [{
            parts: [{
                text: `Generate a multiple-choice quiz question with four answer options.
                Format the response as JSON: 
                { "question": "Your question here", "options": ["A", "B", "C", "D"], "correct": "Correct Answer" }`
            }]
        }]
    };
}

async function fetchAIResponse(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    console.log(API_KEY);
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(prompt)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching AI response:", error);
        throw error;
    }
}

function parseAIResponse(data) {
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error("Invalid response from AI API.");
    }

    let rawResponse = data.candidates[0]?.content?.parts[0]?.text;
    if (!rawResponse) {
        throw new Error("AI Response is empty.");
    }

    // Clean response from any possible markdown formatting
    const cleanedResponse = rawResponse.replace(/```json|```/g, '').trim();

    try {
        return JSON.parse(cleanedResponse);
    } catch (error) {
        console.error("JSON Parsing Error:", error, "Response:", cleanedResponse);
        throw new Error("Failed to parse AI JSON response.");
    }
}

function displayQuestion(questionData) {
    const questionEl = getElement(".question");
    const optionsEl = getElement(".options");

    questionEl.textContent = questionData.question;
    optionsEl.innerHTML = "";

    questionData.options.forEach(option => {
        const button = document.createElement("button");
        button.textContent = option;
        button.onclick = () => checkAnswer(option, questionData.correct);
        optionsEl.appendChild(button);
    });
}

async function checkAnswer(selected, correct) {
    const resultEl = getElement("#result");
    const nextBtn = getElement("#quiz-btn");

    let correctAnswers = parseInt(localStorage.getItem("correctAnswers") || "0", 10);
    let totalQuizzes = parseInt(localStorage.getItem("totalQuizzes") || "0", 10);

    resultEl.textContent = selected === correct ? "Correct!" : `Wrong! The correct answer is ${correct}.`;
    resultEl.style.color = selected === correct ? "green" : "red";

    correctAnswers += selected === correct ? 1 : 0;
    totalQuizzes++;

    localStorage.setItem("correctAnswers", correctAnswers);
    localStorage.setItem("totalQuizzes", totalQuizzes);
    updateProgressTracker();

    nextBtn.style.display = "block";
    getAIExplanation(selected, correct);
}

async function getAIExplanation(answer, correct) {
    const resultEl = getElement("#result");

    const prompt = {
        contents: [{
            parts: [{
                text: `Explain why "${answer}" is right or wrong compared to "${correct}". Keep it brief and engaging.`
            }]
        }]
    };

    try {
        const response = await fetchAIResponse(prompt);
        const explanation = parseAIResponse(response);
        resultEl.textContent += ` ${explanation}`;
    } catch (error) {
        console.error("Error fetching AI explanation:", error);
    }
}

// Progress Tracker
function updateProgressTracker() {
    const completedSessions = localStorage.getItem("completedSessions") || "0";
    const correctAnswers = localStorage.getItem("correctAnswers") || 0;
    const totalQuizzes = localStorage.getItem("totalQuizzes") || 0;
    const goalList = document.querySelectorAll("#goal-list input:checked");
    const goalProgress = goalList.length > 0 
        ? [...goalList].map(el => el.nextSibling.textContent.trim()).join(", ") 
        : "No goals achieved";

    document.getElementById("completedSessions").textContent = completedSessions;
    document.getElementById("quizProgress").textContent = `${correctAnswers}/${totalQuizzes} correct`;
    document.getElementById("goalProgress").textContent = goalProgress;
};
