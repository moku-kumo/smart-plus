let num1, num2, correctAnswer, options;
let audioContext;
let correctCount = 0;
let wrongCount = 0;
let currentMode = 'addition'; // 'addition' 또는 'pattern'
let patternArray, blankIndex;

// AudioContext 초기화
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }
}

// 게임 모드 전환
function switchMode(mode) {
    currentMode = mode;
    correctCount = 0;
    wrongCount = 0;
    document.getElementById('correct-count').textContent = '0';
    document.getElementById('wrong-count').textContent = '0';
    
    // 버튼 활성화 상태 업데이트
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 새 게임 시작
    if (mode === 'addition') {
        generateAdditionQuestion();
    } else {
        generatePatternQuestion();
    }
}

function playBeep(type) {
    initAudioContext();
    const now = audioContext.currentTime;
    
    if (type === 'correct') {
        // 정답: 높은 음 2개 (성공 감)
        playTone(800, 0.15, now);
        playTone(1000, 0.15, now + 0.15);
    } else {
        // 오답: 낮은 음 2개 (실패 감)
        playTone(400, 0.2, now);
        playTone(300, 0.2, now + 0.2);
    }
}

function playTone(frequency, duration, startTime) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.setValueAtTime(0, startTime + duration);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
}

function generateAdditionQuestion() {
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

    // Play start sound
    initAudioContext();
    const now = audioContext.currentTime;
    playTone(600, 0.1, now);
}

function generatePatternQuestion() {
    const patterns = generateRandomPattern();
    patternArray = patterns.array;
    correctAnswer = patterns.blank;
    blankIndex = patterns.blankIndex;
    
    // 패턴을 시각적으로 표시 (빈칸은 네모로 표시)
    const questionDiv = document.getElementById('question');
    questionDiv.innerHTML = '';
    questionDiv.style.display = 'flex';
    questionDiv.style.justifyContent = 'center';
    questionDiv.style.alignItems = 'center';
    questionDiv.style.gap = '15px';
    questionDiv.style.fontSize = '28px';
    questionDiv.style.fontWeight = 'bold';
    
    patternArray.forEach((num, idx) => {
        const span = document.createElement('span');
        if (idx === blankIndex) {
            span.textContent = '□';
            span.style.color = '#ff6347';
            span.style.fontSize = '32px';
        } else {
            span.textContent = num;
            span.style.color = '#333';
        }
        questionDiv.appendChild(span);
    });
    
    document.getElementById('feedback').textContent = '';

    // 정답과 오답 옵션 생성 (3개 옵션)
    options = new Set([correctAnswer]);
    while (options.size < 3) {
        let wrong = Math.floor(Math.random() * 10) + Math.max(0, correctAnswer - 5);
        if (wrong !== correctAnswer) options.add(wrong);
    }
    options = Array.from(options).sort(() => Math.random() - 0.5);

    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.textContent = option;
        btn.className = 'option-btn';
        btn.addEventListener('click', () => checkAnswer(option, btn));
        optionsDiv.appendChild(btn);
    });

    // Play start sound
    initAudioContext();
    const now = audioContext.currentTime;
    playTone(600, 0.1, now);
}

function generateRandomPattern() {
    // 간단한 수열 생성 (5개 이상, 6살짜리를 위한 기본 수열)
    const startNum = Math.floor(Math.random() * 50) + 1; // 1-50
    const array = [startNum, startNum + 1, startNum + 2, startNum + 3, startNum + 4];
    const blankIndex = Math.floor(Math.random() * 5);
    
    return {
        array: array,
        blank: array[blankIndex],
        blankIndex: blankIndex
    };
}

function checkAnswer(selected, btn) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);
    if (selected === correctAnswer) {
        correctCount++;
        document.getElementById('correct-count').textContent = correctCount;
        document.getElementById('feedback').textContent = '정답! 잘했어요! 🎉';
        document.getElementById('feedback').style.color = 'green';
        btn.style.background = 'linear-gradient(45deg, #4caf50, #66bb6a)';
        playBeep('correct');
    } else {
        wrongCount++;
        document.getElementById('wrong-count').textContent = wrongCount;
        document.getElementById('feedback').textContent = `틀렸어요. 정답은 ${correctAnswer}입니다. 😊`;
        document.getElementById('feedback').style.color = 'red';
        btn.style.background = 'linear-gradient(45deg, #f44336, #e57373)';
        playBeep('wrong');
    }
    // Automatically go to next question after 2 seconds
    setTimeout(() => {
        if (currentMode === 'addition') {
            generateAdditionQuestion();
        } else {
            generatePatternQuestion();
        }
    }, 2000);
}

// Initialize first question
generateAdditionQuestion();