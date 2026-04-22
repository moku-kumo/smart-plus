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

    // 정답과 오답 옵션 생성
    options = new Set([correctAnswer]);
    while (options.size < 5) {
        let wrong = Math.floor(Math.random() * 30);
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
    const patternType = Math.floor(Math.random() * 4);
    let array, blank;
    
    switch(patternType) {
        case 0: // 등차수열 (공차 1-3)
            const diff = Math.floor(Math.random() * 3) + 1;
            const start = Math.floor(Math.random() * 10);
            array = [start, start + diff, start + 2*diff, start + 3*diff, start + 4*diff];
            break;
        case 1: // 배수
            const base = Math.floor(Math.random() * 5) + 2; // 2-6
            const multiplier = Math.floor(Math.random() * 5) + 1; // 1-5
            array = [base*multiplier, base*(multiplier+1), base*(multiplier+2), base*(multiplier+3), base*(multiplier+4)];
            break;
        case 2: // 제곱수 패턴
            const offset = Math.floor(Math.random() * 5);
            array = [1+offset, 4+offset, 9+offset, 16+offset, 25+offset];
            break;
        default: // 홀수/짝수
            const isOdd = Math.random() > 0.5;
            const startNum = isOdd ? Math.floor(Math.random() * 5) * 2 + 1 : Math.floor(Math.random() * 5) * 2;
            array = [startNum, startNum + 2, startNum + 4, startNum + 6, startNum + 8];
    }
    
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