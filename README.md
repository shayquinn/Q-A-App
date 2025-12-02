# Q&A Study App

A lightweight, browser-based study application designed to parse and interactively display quiz questions from HTML files (specifically formatted like KeepNote exports).

## Features

*   **Interactive Quiz Interface**: Clean, easy-to-use interface for taking quizzes.
*   **HTML Parsing**: Automatically parses questions, options, and answers from uploaded HTML files.
*   **Progress Tracking**: Visual sidebar showing answered, correct, and incorrect questions.
*   **Immediate Feedback**: "Show Answer" functionality with visual cues (Green for correct, Red for incorrect).
*   **State Persistence**: Automatically saves your progress so you can refresh the page without losing your place.
*   **Score Summary**: Detailed tally of correct, incorrect, and unanswered questions at the end of the quiz.

## Prerequisites

*   A modern web browser (Chrome, Edge, Firefox, etc.).
*   **Python 3.x** (Optional, but recommended for running the local server script).

## How to Run

### Windows (Recommended)
1.  Double-click the `startapp.bat` file.
2.  This will start a local server and automatically open the app in your default browser.

### Manual Method
1.  Open a terminal in the project folder.
2.  Run a static file server. For example, using Python:
    ```bash
    python -m http.server 8000
    ```
3.  Open your browser and navigate to `http://localhost:8000`.

## Usage

1.  Click the **Upload Quiz** button.
2.  Select a compatible HTML file (e.g., `Example.html`).
3.  Select answers for each question.
4.  Click **Show Answer** to check your work.
5.  Use the sidebar or Next/Prev buttons to navigate.
6.  Click **Finish** to see your final score.

## File Format

The app expects HTML files where:
*   Questions are numbered (e.g., `1.`, `2.`).
*   Options are in lists.
*   Answers are listed in a separate "Answers" section at the bottom, formatted like `1. B. Answer Text`.

See `Example.html` for a reference template.
