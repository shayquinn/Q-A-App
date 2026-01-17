// parser.js
// Shared parsing logic for both Browser and Node.js environments

(function(global) {
    function parseHTMLContent(htmlContent) {
        // Environment detection: Browser vs Node.js
        let doc;
        if (typeof DOMParser !== 'undefined') {
            const parser = new DOMParser();
            doc = parser.parseFromString(htmlContent, 'text/html');
        } else if (typeof global.DOMParser !== 'undefined') {
            const parser = new global.DOMParser();
            doc = parser.parseFromString(htmlContent, 'text/html');
        } else {
            throw new Error('DOMParser is not available');
        }

        const questions = [];
        
        console.log("=== Starting Parser ===");
        
        // Helper function to clean text
        const cleanText = (text) => {
            return text
                .replace(/&nbsp;/g, ' ')
                .replace(/\u00A0/g, ' ')
                .replace(/\u00C2/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();    
        };

     
        
        // Get the entire HTML as text to work around DOM issues
        let InText = doc.body.innerHTML;
        const htmlText = cleanText(InText);
        //console.log(htmlText);
        // Find all question numbers using regex on the raw HTML
        
        //const questionRegex = /<b>\b([1-9]|[1-9][0-9]|100)\b\.[\s\xA0]<\/b>/g;
        const questionRegex = /<b>\b([1-9]|[1-9][0-9]|100)\b\.\s<\/b>/g;
        let match;
        while ((match = questionRegex.exec(htmlText)) !== null) {
            //console.log(`Processing question`);
            const number = parseInt(match[1]);
            let questionText = match[2];
            
            console.log(`Found question ${number}`);
            
            // Extract question text: it's the text immediately following the match
            const afterMatch = htmlText.substring(match.index + match[0].length);
            
            // Find the next question to limit our search area
            const nextQuestionMatch = afterMatch.match(/<b>\b([1-9]|[1-9][0-9]|100)\b\.\s<\/b>/);
            const searchLimit = nextQuestionMatch ? nextQuestionMatch.index : Math.min(afterMatch.length, 2000);
            const questionSection = afterMatch.substring(0, searchLimit);
            
            // Extract any images in this question section (both standalone and in UL tags)
            const imgMatches = questionSection.match(/<img[^>]*>/g) || [];
            const imageHtml = imgMatches.join('<br/>');
            //console.log(`Question ${number}: Found ${imgMatches.length} image(s)`);
            
            // Simple heuristic: take text until the first <ul> for the question text
            let qTextEnd = questionSection.indexOf('<ul>');
            if (qTextEnd === -1) qTextEnd = 200; // Fallback
            
            let rawQuestionText = questionSection.substring(0, qTextEnd);
            
            // Clean the question text - remove HTML tags BUT preserve img tags
            questionText = rawQuestionText.replace(/<(?!img\s)(?!\/img>)[^>]*>/g, ' ');
            
            // Add images after the question text if there are any
            if (imageHtml) {
                questionText += '<br/>' + imageHtml;
            }
            
            // Now find options that follow this question
            // Options are in UL tags after the question
            // Skip UL tags that only contain images (these are part of the question)
            // Options typically have nested UL structure: <ul><li><ul><li>text</li></ul></li></ul>
            const options = [];
            
            const ulRegex = /<ul>(.*?)<\/ul>/gs;
            
            let ulMatch;
            let optionCount = 0;
            
            // Use the questionSection we already defined above for searching options
            while ((ulMatch = ulRegex.exec(questionSection)) !== null && optionCount < 4) {
                const ulContent = ulMatch[1];
                
                // Skip if this UL only contains an image and no nested UL
                // Image ULs: <ul><li style="list-style-type: none"><img src="..." /></li></ul>
                // Option ULs: <ul><li style="list-style-type: none"><ul><li>text</li></ul></li></ul>
                const hasImage = /<img[^>]*>/i.test(ulContent);
                const hasNestedUL = /<ul>/i.test(ulContent);
                const textContent = ulContent.replace(/<[^>]*>/g, ' ').trim();
                
                // Skip if it has an image but no nested UL and minimal text
                if (hasImage && !hasNestedUL && textContent.length < 10) {
                    continue;
                }
                
                // Skip if it's just a nested structure with no actual text content
                if (!hasImage && textContent.length < 2) {
                    continue;
                }
                
                // Extract text from the UL, removing all HTML tags
                let optionText = ulContent.replace(/<[^>]*>/g, ' ');
                
                // Skip if it's empty or looks like a question number
                if (optionText && !optionText.match(/^\d+\./) && optionText.length < 200) {
                    options.push(optionText);
                    optionCount++;
                }
            }
            
            if (options.length > 0) {
                questions.push({
                    number: number,
                    question: questionText,
                    options: options,
                    answer: '',
                    answerExplanation: '',
                    userAnswer: null,
                    answered: false,
                    isCorrect: null
                });
                console.log(`✓ Question ${number} with ${options.length} options: "${questionText.substring(0, 50)}..."`);
            }
        }
        
        // Parse answers section
        const answersMatch = htmlText.match(/<b>Answers<\/b>(.*?)$/s);
        if (answersMatch) {
            let answersText = answersMatch[1];
            // Remove HTML tags to make parsing easier
            answersText = answersText.replace(/<[^>]*>/g, ' ');
            answersText = cleanText(answersText);
            
            const answerRegex = /(\d+)\.\s+([A-Z])\.\s+(.*?)(?=\d+\.\s+[A-Z]\.|$)/gs;
            
            let answerMatch;
            while ((answerMatch = answerRegex.exec(answersText)) !== null) {
                const num = parseInt(answerMatch[1]);
                const letter = answerMatch[2];
                let explanation = answerMatch[3];
                
                const q = questions.find(q => q.number === num);
                if (q) {
                    q.answer = letter;
                    q.answerExplanation = explanation.trim();
                    console.log(`✓ Answer for ${num}: ${letter}`);
                }
            }
        }
        
        // Sort questions by number
        questions.sort((a, b) => a.number - b.number);
        
        return questions;
    }

    // Export for Node.js or attach to window for Browser
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = parseHTMLContent;
    } else {
        global.parseHTMLContent = parseHTMLContent;
    }

})(typeof window !== 'undefined' ? window : this);
