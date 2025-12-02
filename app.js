// app.js
//run app python -m http.server 8000
// app.js - Simplified version

class QnAApp {
    constructor() {
        this.questions = [];
        this.currentPage = 1;
        this.showingTally = false;
        this.init();
    }

    init() {
        this.loadState();
        if (this.questions.length > 0) {
            const navigation = document.querySelector('.navigation');
            if (navigation) navigation.style.display = 'flex';
            this.renderPage();
        } else {
            this.renderEmptyState();
        }
    }

    saveState() {
        try {
            const state = {
                questions: this.questions,
                currentPage: this.currentPage,
                showingTally: this.showingTally
            };
            localStorage.setItem('qnaAppState', JSON.stringify(state));
        } catch (e) {
            console.error('Error saving state:', e);
        }
    }

    loadState() {
        try {
            const savedState = localStorage.getItem('qnaAppState');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.questions = state.questions || [];
                this.currentPage = state.currentPage || 1;
                this.showingTally = state.showingTally || false;
            }
        } catch (e) {
            console.error('Error loading state:', e);
        }
    }

    renderEmptyState() {
        const container = document.getElementById('questions-container');
        const progressInfo = document.getElementById('progress-info');
        const navigation = document.querySelector('.navigation');
        const sidebar = document.getElementById('progress-sidebar');
        
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <h2>Welcome to Q&A Study App</h2>
                    <p>Please upload a quiz file (.html) to start studying.</p>
                    <p>Click the "Upload Quiz" button above or "Help" for file format instructions.</p>
                </div>
            `;
        }
        
        if (progressInfo) progressInfo.textContent = '';
        if (navigation) navigation.style.display = 'none';
        if (sidebar) sidebar.innerHTML = '';
    }

    handleFileUpload(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            // Use the global parseHTMLContent function from parser.js
            this.questions = parseHTMLContent(content);
            
            if (this.questions.length > 0) {
                this.resetAllAnswers();
                this.currentPage = 1;
                this.showingTally = false;
                this.saveState();
                
                // Show navigation
                const navigation = document.querySelector('.navigation');
                if (navigation) navigation.style.display = 'flex';
                
                this.renderPage();
                alert(`Loaded ${this.questions.length} questions successfully!`);
            } else {
                alert('Could not parse questions from this file. Please check the format.');
            }
        };
        reader.readAsText(file);
    }

    resetAllAnswers() {
        this.questions.forEach(q => {
            q.userAnswer = null;
            q.answered = false;
            q.isCorrect = null;
        });
    }

    renderPage() {
        const container = document.getElementById('questions-container');
        const tallyContainer = document.getElementById('tally-container');
        
        if (this.showingTally) {
            this.showTallyPage();
            return;
        }

        const question = this.questions[this.currentPage - 1];
        if (!question) {
            this.renderEmptyState();
            return;
        }

        container.innerHTML = this.renderQuestion(question);
        
        if (tallyContainer) tallyContainer.classList.add('hidden');
        container.classList.remove('hidden');
        
        this.updateNavigation();
        this.updateProgressInfo();
        this.renderProgressSidebar();
    }

    renderProgressSidebar() {
        const sidebar = document.getElementById('progress-sidebar');
        if (!sidebar) return;

        sidebar.innerHTML = `
            <div class="progress-grid">
                ${this.questions.map((q, index) => {
                    const questionNumber = index + 1;
                    const isCurrent = questionNumber === this.currentPage && !this.showingTally;
                    
                    let statusClass = 'unanswered';
                    if (q.isCorrect === true) {
                        statusClass = 'correct';
                    } else if (q.isCorrect === false) {
                        statusClass = 'incorrect';
                    } else if (q.answered) {
                        statusClass = 'answered';
                    }
                    
                    const currentClass = isCurrent ? 'current' : '';
                    
                    return `
                        <div class="progress-item ${statusClass} ${currentClass}" 
                             onclick="app.goToQuestion(${questionNumber})">
                            ${questionNumber}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    goToQuestion(questionNumber) {
        if (this.showingTally) {
            this.showingTally = false;
        }
        this.currentPage = questionNumber;
        this.saveState();
        this.renderPage();
    }

    renderQuestion(question) {
        const optionLetters = ['A', 'B', 'C', 'D'];
        
        return `
            <div class="question">
                <div class="question-text">
                    <strong>Q${question.number}:</strong> ${question.question}
                </div>
                <div class="options">
                    ${question.options.map((option, index) => {
                        const letter = optionLetters[index];
                        const isSelected = question.userAnswer === letter;
                        return `
                            <label class="option">
                                <input type="radio" 
                                       name="question-${question.number}" 
                                       value="${letter}"
                                       ${isSelected ? 'checked' : ''}
                                       onchange="app.selectAnswer(${question.number}, '${letter}')">
                                <div class="option-content">
                                    <span class="option-letter">${letter}.</span>
                                    <span class="option-text">${option}</span>
                                </div>
                            </label>
                        `;
                    }).join('')}
                </div>
                <div class="answer-section">
                    <button class="show-answer" onclick="app.showAnswer(${question.number})">
                        Show Answer
                    </button>
                    <div class="answer-display" id="answer-${question.number}"></div>
                </div>
            </div>
        `;
    }

    selectAnswer(questionNumber, selectedLetter) {
        const question = this.questions.find(q => q.number === questionNumber);
        if (question) {
            question.userAnswer = selectedLetter;
            question.answered = true;
            // Do not reveal correctness yet
            // question.isCorrect = question.userAnswer === question.answer;
            this.saveState();
            this.renderProgressSidebar();
        }
    }

    showAnswer(questionNumber) {
        const question = this.questions.find(q => q.number === questionNumber);
        if (!question) return;

        // Calculate correctness now that we are showing the answer
        console.log("question " + question);
        console.log("Showing answer for question " + questionNumber);
        console.log("userAnswer: " + question.userAnswer + "; correctAnswer: " + question.answer);
        if (question.userAnswer) {
            question.isCorrect = question.userAnswer === question.answer;
        }

        // Highlight the options
        const options = document.querySelectorAll('.option');
        options.forEach(opt => {
            const input = opt.querySelector('input');
            if (input) {
                const val = input.value;
                opt.classList.remove('correct-answer', 'incorrect-answer');
                
                if (val === question.answer) {
                    opt.classList.add('correct-answer');
                } else if (val === question.userAnswer && !question.isCorrect) {
                    opt.classList.add('incorrect-answer');
                }
            }
        });

        const answerEl = document.getElementById(`answer-${questionNumber}`);
        const optionLetters = ['A', 'B', 'C', 'D'];
        
        const userOptionIndex = optionLetters.indexOf(question.userAnswer);
        const correctOptionIndex = optionLetters.indexOf(question.answer);
        
        const userOption = question.options[userOptionIndex] || 'Not answered';
        const correctOption = question.options[correctOptionIndex] || '';
        
        let html = '';
        let answerClass = '';
        
        if (question.userAnswer) {
            if (question.isCorrect) {
                html = `
                    <strong>&#10003; Correct!</strong>
                    <div class="answer-text">
                        Your answer (${question.userAnswer}) is correct.
                    </div>
                `;
                answerClass = 'correct';
            } else {
                html = `
                    <strong>&#10007; Incorrect</strong>
                    <div class="answer-text">
                        Your answer: ${question.userAnswer}. ${userOption}<br>
                        Correct answer: ${question.answer}. ${correctOption}
                    </div>
                `;
                answerClass = 'incorrect';
            }
        } else {
            html = `
                <strong>Correct Answer: ${question.answer}</strong>
                <div class="answer-text">
                    ${correctOption}<br><br>
                    Please select an answer first.
                </div>
            `;
        }

        // Add explanation if available
        if (question.answerExplanation) {
            html += `<div class="answer-text">${question.answerExplanation}</div>`;
        }

        answerEl.innerHTML = html;
        answerEl.className = `answer-display ${answerClass}`;
        answerEl.style.display = 'block';
        
        // Update sidebar to show red/green status
        this.saveState();
        this.renderProgressSidebar();
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const finishBtn = document.getElementById('finish-btn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === this.questions.length;
        }
        if (finishBtn) {
            finishBtn.style.display = 'block';
        }
    }

    updateProgressInfo() {
        const progressInfo = document.getElementById('progress-info');
        if (progressInfo) {
            if (this.showingTally) {
                const correctAnswers = this.questions.filter(q => q.isCorrect === true).length;
                progressInfo.textContent = `Quiz Completed - ${correctAnswers}/${this.questions.length} Correct`;
            } else {
                const answeredCount = this.questions.filter(q => q.answered).length;
                progressInfo.textContent = `Question ${this.currentPage} of ${this.questions.length} | ${answeredCount}/${this.questions.length} answered`;
            }
        }
    }

    nextQuestion() {
        if (this.currentPage < this.questions.length) {
            this.currentPage++;
            this.saveState();
            this.renderPage();
        }
    }

    prevQuestion() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.saveState();
            this.renderPage();
        }
    }

    finishAttempt() {
        // Calculate correctness for all answered questions
        this.questions.forEach(q => {
            if (q.userAnswer && q.isCorrect === null) {
                q.isCorrect = q.userAnswer === q.answer;
            }
        });
        
        this.showingTally = true;
        this.saveState();
        this.renderPage();
        
        // Hide navigation buttons on tally page
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const finishBtn = document.getElementById('finish-btn');
        
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        if (finishBtn) finishBtn.style.display = 'none';
    }

    showTallyPage() {
        const container = document.getElementById('questions-container');
        const tallyContainer = document.getElementById('tally-container');
        
        // Calculate scores
        const totalQuestions = this.questions.length;
        const correctAnswers = this.questions.filter(q => q.isCorrect === true).length;
        const incorrectAnswers = this.questions.filter(q => q.isCorrect === false).length;
        const unanswered = totalQuestions - correctAnswers - incorrectAnswers;
        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        
        if (tallyContainer) {
            tallyContainer.innerHTML = `
                <div class="tally-container">
                    <div class="tally-score">${correctAnswers}/${totalQuestions}</div>
                    <div class="tally-percentage">${percentage}%</div>
                    
                    <div class="tally-stats">
                        <div class="tally-stat">
                            <span class="tally-number correct">${correctAnswers}</span>
                            <span class="tally-label">Correct</span>
                        </div>
                        <div class="tally-stat">
                            <span class="tally-number incorrect">${incorrectAnswers}</span>
                            <span class="tally-label">Incorrect</span>
                        </div>
                        <div class="tally-stat">
                            <span class="tally-number unanswered">${unanswered}</span>
                            <span class="tally-label">Unanswered</span>
                        </div>
                    </div>
                    
                    <button class="restart-btn" onclick="app.restartQuiz()">Restart Quiz</button>
                </div>
            `;
            tallyContainer.classList.remove('hidden');
        }
        
        if (container) container.classList.add('hidden');
        
        this.updateProgressInfo();
        this.renderProgressSidebar();
    }

    restartQuiz() {
        this.resetAllAnswers();
        this.currentPage = 1;
        this.showingTally = false;
        this.saveState();
        
        // Show navigation buttons again
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const finishBtn = document.getElementById('finish-btn');
        
        if (prevBtn) prevBtn.style.display = 'block';
        if (nextBtn) nextBtn.style.display = 'block';
        if (finishBtn) finishBtn.style.display = 'block';
        
        this.renderPage();
    }
}

// Initialize the app and make it global
window.app = new QnAApp();
