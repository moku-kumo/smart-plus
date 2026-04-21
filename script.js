let num1, num2, correctAnswer, options;

function generateQuestion() {
    num1 = Math.floor(Math.random() * 10);
    num2 = Math.floor(Math.random() * 10);
    correctAnswer = num1 + num2;
    document.getElementById('question').textContent = `${num1} + ${num2} = ?`;
    document.getElementById('feedback').textContent = '';

    // Generate 6 unique options including correct answer
    options = new Set([correctAnswer]);
    while (options.size < 6) {
        let wrong = Math.floor(Math.random() * 19); // 0-18
        if (wrong !== correctAnswer) options.add(wrong);
    }
    options = Array.from(options).sort(() => Math.random() - 0.5); // Shuffle

    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.textContent = option;
        btn.className = 'option-btn';
        btn.addEventListener('click', () => checkAnswer(option, btn));
        optionsDiv.appendChild(btn);
    });
}

function checkAnswer(selected, btn) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);
    if (selected === correctAnswer) {
        document.getElementById('feedback').textContent = '정답! 잘했어요! 🎉';
        document.getElementById('feedback').style.color = 'green';
        btn.style.background = 'linear-gradient(45deg, #4caf50, #66bb6a)';
    } else {
        document.getElementById('feedback').textContent = `틀렸어요. 정답은 ${correctAnswer}입니다. 😊`;
        document.getElementById('feedback').style.color = 'red';
        btn.style.background = 'linear-gradient(45deg, #f44336, #e57373)';
    }
    // Automatically go to next question after 2 seconds
    setTimeout(generateQuestion, 2000);
}

// Initialize first question
generateQuestion();