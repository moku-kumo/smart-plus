let num1, num2, correctAnswer, options;
let audioContext;
let correctCount = 0;
let wrongCount = 0;
let currentMode = 'addition'; // 'addition' 또는 'pattern'
let patternArray, blankIndices;
let userAnswers = [];
let timeLeft = 25;
let timerInterval;

// 난이도 설정
let difficultySettings = {
    addition: 'easy', // easy, normal, hard
    pattern: {
        minNum: 1,
        maxNum: 50,
        blankCount: 1
    },
    stepPattern: { // stepPattern도 객체로 변경
        difficulty: 'easy', // easy, hard
        minNum: 1,
        maxNum: 50
    }
};

// 각 난이도별 범위
const difficultyRanges = {
    easy: { min: 1, max: 5 },
    normal: { min: 0, max: 10 },
    hard: { min: 0, max: 20 }
};

// 설정 저장 및 불러오기 함수 정의
function saveSettings() {
    localStorage.setItem('smartPlusSettings', JSON.stringify(difficultySettings));
}

function loadSettings() {
    const saved = localStorage.getItem('smartPlusSettings');
    if (saved) {
        const parsed = JSON.parse(saved);
        difficultySettings = parsed;
    }
}

// AudioContext 초기화
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }
}

// 타이머 시작 함수
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 25;
    
    const timerBar = document.getElementById('timer-bar');
    // 즉시 100%로 초기화하기 위해 트랜지션 잠시 제거
    timerBar.style.transition = 'none';
    updateTimerDisplay();
    void timerBar.offsetWidth; // 브라우저가 변경사항을 즉시 적용하도록 강제 리플로우
    // 다시 부드럽게 줄어들도록 트랜지션 복구
    timerBar.style.transition = 'width 1s linear';
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeOut();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const percentage = (timeLeft / 25) * 100;
    document.getElementById('timer-bar').style.width = `${percentage}%`;
}

// 게임 모드 전환
function switchMode(mode) {
    currentMode = mode;
    correctCount = 0;
    wrongCount = 0;
    document.getElementById('correct-count').textContent = '0';
    document.getElementById('wrong-count').textContent = '0';
    
    // 타이틀 텍스트 변경
    let title = '더하기';
    if (mode === 'pattern') title = '빈칸채우기';
    if (mode === 'stepPattern') title = '패턴채우기';
    document.getElementById('game-title').textContent = title;
    
    // Update active button state
    document.querySelectorAll('.mode-btn').forEach(btn => {
        const btnMode = btn.getAttribute('onclick')?.includes(mode);
        btn.classList.toggle('active', !!btnMode);
    });
    
    // 새 게임 시작
    if (mode === 'addition') {
        generateAdditionQuestion();
    } else if (mode === 'pattern') {
        generatePatternQuestion();
    } else {
        generateStepPatternQuestion();
    }
}
// 설정 모달 열기
function openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.style.display = 'flex';
    modal.classList.add('active');
    // 현재 설정값 업데이트
    if (currentMode === 'addition') {
        document.querySelector(`input[name="difficulty"][value="${difficultySettings.addition}"]`).checked = true;
    } else if (currentMode === 'pattern') {
        document.getElementById('minNum').value = difficultySettings.pattern.minNum;
        document.getElementById('maxNum').value = difficultySettings.pattern.maxNum;
        document.getElementById('blankCount').value = difficultySettings.pattern.blankCount;
    } else if (currentMode === 'stepPattern') { // stepPattern 설정값 로드
        document.getElementById('stepMaxNum').value = difficultySettings.stepPattern.maxNum;
        document.querySelector(`input[name="stepDifficulty"][value="${difficultySettings.stepPattern.difficulty}"]`).checked = true;
    }
    updateSettingsSection();
}

// 설정 모달 닫기
function closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.style.display = 'none';
    modal.classList.remove('active');
}

// 모달 섹션 업데이트
function updateSettingsSection() {
    const additionSection = document.getElementById('additionSettings');
    const patternSection = document.getElementById('patternSettings');
    const stepSection = document.getElementById('stepPatternSettings');
    
    if (currentMode === 'addition') {
        additionSection.style.display = 'block';
        patternSection.style.display = 'none';
        stepSection.style.display = 'none';
    } else if (currentMode === 'pattern') {
        additionSection.style.display = 'none';
        patternSection.style.display = 'block';
        stepSection.style.display = 'none';
    } else {
        additionSection.style.display = 'none';
        patternSection.style.display = 'none';
        stepSection.style.display = 'block';
    }
}

// 난이도 업데이트
function updateDifficulty(mode, difficulty) {
    if (mode === 'addition') difficultySettings.addition = difficulty;
    if (mode === 'stepPattern') difficultySettings.stepPattern.difficulty = difficulty; // difficulty 속성만 업데이트
    saveSettings();
}

// 입력값 검증
function validateInput() {
    let minNum = parseInt(document.getElementById('minNum').value);
    let maxNum = parseInt(document.getElementById('maxNum').value);
    let blankCount = parseInt(document.getElementById('blankCount').value);
    
    // 최소값이 최대값보다 크면 수정
    if (minNum > maxNum) {
        minNum = maxNum - 1;
        document.getElementById('minNum').value = minNum;
    }
    
    // 범위 내에 맞춤
    if (minNum < 1) document.getElementById('minNum').value = 1;
    if (maxNum > 99) document.getElementById('maxNum').value = 99;
    if (blankCount < 1) document.getElementById('blankCount').value = 1;
    if (blankCount > 3) document.getElementById('blankCount').value = 3;
    
    // 설정 저장
    difficultySettings.pattern.minNum = parseInt(document.getElementById('minNum').value);
    difficultySettings.pattern.maxNum = parseInt(document.getElementById('maxNum').value);
    difficultySettings.pattern.blankCount = parseInt(document.getElementById('blankCount').value);
    saveSettings();
}

// 패턴채우기 모드의 입력값 검증 및 저장
function validateStepPatternRange() {
    let maxNum = parseInt(document.getElementById('stepMaxNum').value);

    // 범위 내에 맞춤
    // 패턴 수열(5개)을 만들기 위해 최소 20 이상 권장
    if (maxNum < 20) {
        maxNum = 20;
        document.getElementById('stepMaxNum').value = 20;
    }
    if (maxNum > 99) document.getElementById('stepMaxNum').value = 99;
    if (maxNum < 1) document.getElementById('stepMaxNum').value = 1; // 최소 1보다는 커야 함

    // minNum은 항상 1로 고정
    difficultySettings.stepPattern.minNum = 1;

    // 설정 저장
    difficultySettings.stepPattern.maxNum = parseInt(document.getElementById('stepMaxNum').value);
    saveSettings();
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
    const range = difficultyRanges[difficultySettings.addition];
    num1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    num2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    correctAnswer = num1 + num2;
    document.getElementById('question').textContent = `${num1} + ${num2} = ?`;
    document.getElementById('feedback').textContent = '';

    // Generate 6 unique options including correct answer
    options = new Set([correctAnswer]);
    while (options.size < 6) {
        let wrong = Math.floor(Math.random() * (range.max * 3)); // 범위에 맞춰 조정
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
    startTimer();
}

function generatePatternQuestion() {
    const patterns = generateRandomPattern();
    patternArray = patterns.array;
    blankIndices = patterns.blankIndices;
    userAnswers = []; // 사용자 답변 초기화
    correctAnswer = null; // 패턴 모드에서는 전체 배열로 체크
    
    // 패턴을 시각적으로 표시 (빈칸은 네모로 표시)
    const questionDiv = document.getElementById('question');
    questionDiv.innerHTML = '';
    
    patternArray.forEach((num, idx) => {
        const span = document.createElement('span');
        if (blankIndices.includes(idx)) {
            span.textContent = '□';
            span.style.color = '#ff6347';
            span.id = `blank-${idx}`;
        } else {
            span.textContent = num;
            span.style.color = '#333';
        }
        questionDiv.appendChild(span);
    });
    
    document.getElementById('feedback').textContent = '';

    // 모든 빈칸의 정답을 포함한 옵션 생성
    options = new Set();
    blankIndices.forEach(idx => options.add(patternArray[idx]));
    while (options.size < Math.max(3, blankIndices.length + 2)) {
        let wrong = Math.floor(Math.random() * (difficultySettings.pattern.maxNum + 5)) + 1;
        if (!patternArray.includes(wrong)) options.add(wrong);
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
    startTimer();
}

function generateStepPatternQuestion() {
    const patterns = generateRandomStepPattern();
    patternArray = patterns.array;
    blankIndices = patterns.blankIndices;
    userAnswers = [];
    correctAnswer = null;
    
    const questionDiv = document.getElementById('question');
    questionDiv.innerHTML = '';
    
    patternArray.forEach((num, idx) => {
        const span = document.createElement('span');
        if (blankIndices.includes(idx)) {
            span.textContent = '□';
            span.style.color = '#ff6347';
            span.id = `blank-${idx}`;
        } else {
            span.textContent = num;
            span.style.color = '#333';
        }
        questionDiv.appendChild(span);
    });
    
    document.getElementById('feedback').textContent = '';

    // 논리적인 오답지 생성
    const step = patternArray[1] - patternArray[0];
    options = new Set();
    blankIndices.forEach(idx => options.add(patternArray[idx]));
    
    // 정답 근처의 숫자나 간격을 활용한 매력적인 오답 추가
    const firstCorrect = patternArray[blankIndices[0]];
    const distractors = [
        firstCorrect + step,
        firstCorrect - step,
        firstCorrect + 1,
        firstCorrect - 1,
        firstCorrect + 2,
        firstCorrect - 2
    ];

    distractors.forEach(val => {
        if (options.size < Math.max(3, blankIndices.length + 2) && val > 0 && val <= difficultySettings.stepPattern.maxNum && !patternArray.includes(val)) {
            options.add(val);
        }
    });

    while (options.size < Math.max(3, blankIndices.length + 2)) {
        let wrong = Math.floor(Math.random() * difficultySettings.stepPattern.maxNum) + 1;
        if (!patternArray.includes(wrong)) options.add(wrong);
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

    initAudioContext();
    playTone(600, 0.1, audioContext.currentTime);
    startTimer();
}

function generateRandomStepPattern() {
    let { difficulty, minNum, maxNum } = difficultySettings.stepPattern;
    const isEasy = difficulty === 'easy';
    const sequenceLength = 5;
    let step;
    let startNum;

    if (isEasy) {
        step = 5;
        // 설정된 maxNum을 존중하되 5단위 패턴이 넘지 않게 계산
        const effectiveMaxStart = maxNum - (step * (sequenceLength - 1)); 
        startNum = (Math.floor(Math.random() * (Math.max(0, effectiveMaxStart) / 5)) + 1) * 5;
    } else {
        // 어려움: 간격 1~9 랜덤, 설정된 maxNum에 맞춤
        // 간격이 너무 크면 maxNum을 넘어버리므로 maxNum에 맞춰 간격 제한 (Pairing)
        const maxPossibleStep = Math.floor((maxNum - minNum) / (sequenceLength - 1));
        step = Math.floor(Math.random() * Math.min(9, maxPossibleStep)) + 1;
        
        const effectiveMaxStart = maxNum - (step * (sequenceLength - 1));
        startNum = Math.floor(Math.random() * (effectiveMaxStart - minNum + 1)) + minNum;
    }

    const array = [];
    for (let i = 0; i < sequenceLength; i++) {
        array.push(startNum + (i * step));
    }
    
    const blankIndices = [];
    const blankCount = difficultySettings.pattern.blankCount; // 빈칸 개수는 설정 공유
    while (blankIndices.length < blankCount) {
        const idx = Math.floor(Math.random() * sequenceLength);
        if (!blankIndices.includes(idx) && idx > 0 && idx < sequenceLength - 1) {
            blankIndices.push(idx);
        }
    }
    
    return {
        array: array,
        blankIndices: blankIndices.sort()
    };
}

function generateRandomPattern() {
    // 사용자 설정에 따른 수열 생성
    const { minNum, maxNum, blankCount } = difficultySettings.pattern;
    const sequenceLength = 5; // 나열되는 숫자를 5개로 고정
    const startNum = Math.floor(Math.random() * (maxNum - minNum - sequenceLength + 1)) + minNum;
    const array = [];
    
    for (let i = 0; i < sequenceLength; i++) {
        array.push(startNum + i);
    }
    
    // 랜덤으로 빈칸 위치 결정 (처음과 끝 제외)
    const blankIndices = [];
    while (blankIndices.length < blankCount) {
        const idx = Math.floor(Math.random() * sequenceLength);
        if (!blankIndices.includes(idx) && idx > 0 && idx < sequenceLength - 1) {
            blankIndices.push(idx);
        }
    }
    
    return {
        array: array,
        blankIndices: blankIndices.sort()
    };
}

function handleTimeOut() {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);
    
    wrongCount++;
    document.getElementById('wrong-count').textContent = wrongCount;
    document.getElementById('feedback').textContent = '시간이 다 됐어요! 다음 문제로~ 😊';
    document.getElementById('feedback').style.color = 'orange';
    playBeep('wrong');
    
    setTimeout(() => {
        if (currentMode === 'addition') generateAdditionQuestion();
        else if (currentMode === 'stepPattern') generateStepPatternQuestion();
        else generatePatternQuestion();
    }, 1000);
}

function checkAnswer(selected, btn) {
    // 정답 확인 시 타이머 멈춤
    clearInterval(timerInterval);

    if (selected === correctAnswer) {
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach(b => b.disabled = true);
        correctCount++;
        document.getElementById('correct-count').textContent = correctCount;
        document.getElementById('feedback').textContent = '정답! 잘했어요! 🎉';
        document.getElementById('feedback').style.color = 'green';
        btn.style.background = 'linear-gradient(45deg, #4caf50, #66bb6a)';
        playBeep('correct');
        
        setTimeout(() => {
            if (currentMode === 'addition') generateAdditionQuestion();
            else if (currentMode === 'stepPattern') generateStepPatternQuestion();
            else generatePatternQuestion();
        }, 1000);
    } else if (currentMode === 'addition') {
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach(b => b.disabled = true);
        wrongCount++;
        document.getElementById('wrong-count').textContent = wrongCount;
        document.getElementById('feedback').textContent = `틀렸어요. 정답은 ${correctAnswer}입니다. 😊`;
        document.getElementById('feedback').style.color = 'red';
        btn.style.background = 'linear-gradient(45deg, #f44336, #e57373)';
        playBeep('wrong');
        
        setTimeout(() => {
            if (currentMode === 'addition') generateAdditionQuestion();
            else if (currentMode === 'stepPattern') generateStepPatternQuestion();
            else generatePatternQuestion();
        }, 1000);
    } else if (currentMode === 'pattern' || currentMode === 'stepPattern') {
        // 빈칸/패턴 모드: 순차적으로 빈칸 채우기
        const currentBlankIdx = blankIndices[userAnswers.length];
        const blankSpan = document.getElementById(`blank-${currentBlankIdx}`);
        
        if (blankSpan) {
            blankSpan.textContent = selected;
            blankSpan.style.color = '#333';
            userAnswers.push(selected);
            
            // 모든 빈칸이 채워졌는지 확인
            if (userAnswers.length === blankIndices.length) {
                const allButtons = document.querySelectorAll('.option-btn');
                allButtons.forEach(b => b.disabled = true);
                
                // 정답 검증
                const isAllCorrect = blankIndices.every((idx, i) => patternArray[idx] === userAnswers[i]);
                
                if (isAllCorrect) {
                    correctCount++;
                    document.getElementById('correct-count').textContent = correctCount;
                    document.getElementById('feedback').textContent = '정답! 수열을 완성했어요! 🌟';
                    document.getElementById('feedback').style.color = 'green';
                    playBeep('correct');
                } else {
                    wrongCount++;
                    document.getElementById('wrong-count').textContent = wrongCount;
                    document.getElementById('feedback').textContent = '아쉬워요! 숫자를 다시 확인해봐요. 😊';
                    document.getElementById('feedback').style.color = 'red';
                    playBeep('wrong');
                }
                
                setTimeout(() => {
                    if (currentMode === 'pattern') generatePatternQuestion();
                    else generateStepPatternQuestion();
                }, 1000);
            } else {
                // 아직 채울 빈칸이 남음
                initAudioContext();
                playTone(900, 0.05, audioContext.currentTime); // 톡 소리 피드백
            }
        }
    }
}
// Initialize first question
loadSettings(); // 저장된 설정 불러오기
switchMode('addition');