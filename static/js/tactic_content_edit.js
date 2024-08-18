document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = "/";
        return;
    }

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('positions_step_')) {
            localStorage.removeItem(key);
        }
    }
    fetch("/api/tactic/latest", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error fetching tactic data:', data.message);
            window.location.href = "/createTactic";
            return;
        }
        else{
            setupBoard(data.data);
            // console.log(data.data);
            localStorage.setItem("tactic_id", data.data.id);
        }
    })
    .catch(error => console.error('Error fetching tactic data:', error));

    function setupBoard(tactic) {
        const description = document.querySelector('#description');
        const tacticBoard = document.querySelector('#tactic-board');
        const court = document.querySelector("#court");
        const tagsArray = JSON.parse(tactic.tags);
        const player_number = tactic.player
    
        // console.log(tagsArray);
        // console.dir(tagsArray[0]);

        court.innerHTML = '';

        const backgroundImage = tagsArray[0] === '全場' ? 'fullcourt.png' : 'halfcourt.png';
        court.style.backgroundImage = `url(/static/images/${backgroundImage})`;

        for (let i = 1; i <= player_number; i++) {
            const playerA = document.createElement('div');
            playerA.id = `A${i}`;
            playerA.className = 'player draggable';
            playerA.textContent = i;
            court.appendChild(playerA); 
        }
        for (let i = 1; i <= player_number; i++) {
            const playerB = document.createElement('div');
            playerB.id = `B${i}`;
            playerB.className = 'player draggable';
            playerB.textContent = i;
            court.appendChild(playerB);
        }
        
        const ball = document.createElement('div');
        ball.id = `ball`;
        ball.className = 'draggable';
        court.appendChild(ball);
    }

    // 處理拖曳效果
    const positions = {};

    // target elements with the "draggable" class
    interact('.draggable')
    .draggable({
        // enable inertial throwing
        inertia: true,
        // keep the element within the area of its parent
        modifiers: [
        interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: true
        })
        ],
        // enable autoScroll
        autoScroll: true,

        listeners: {
        // call this function on every dragmove event
        move: dragMoveListener,

        // call this function on every dragend event
        end (event) {
            // 仅在拖动结束时更新位置记录
            updatePosition(event.target);
        }
        }
    });

    function dragMoveListener (event) {
        var target = event.target;
        // keep the dragged position in the data-x/data-y attributes
        var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // translate the element
        target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

        // update the position attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }

    function updatePosition(element) {
        // 记录元素的 ID 和位置
        const id = element.id;
        const x = parseFloat(element.getAttribute('data-x')) || 0;
        const y = parseFloat(element.getAttribute('data-y')) || 0;

        // 更新位置对象
        if (!positions[currentStep_number]) {
            positions[currentStep_number] = {};
        }
        positions[currentStep_number][id] = { x, y };
    }

    function recordPositions() {
        // 记录所有球员和球的位置
        document.querySelectorAll('.draggable').forEach(element => {
            updatePosition(element);
        });

        const positionsKey = `positions_step_${currentStep_number}`;
        localStorage.removeItem(positionsKey); // 清除旧的记录
        localStorage.setItem(positionsKey, JSON.stringify(positions[currentStep_number]));

        console.log('Recorded positions for step', currentStep_number, ':', positions);
    }


    function loadPositions() {
        const positionsKey = `positions_step_${currentStep_number}`;
        const savedPositions = JSON.parse(localStorage.getItem(positionsKey)) || {};

        Object.keys(savedPositions).forEach(id => {
            const { x, y } = savedPositions[id];
            const element = document.getElementById(id);
            if (element) {
                element.style.transform = `translate(${x}px, ${y}px)`;
                element.setAttribute('data-x', x);
                element.setAttribute('data-y', y);
            }
        });
    }
    
    let currentStep_number = parseInt(document.querySelector('#current-step').innerText);
    let totalSteps_number = parseInt(document.querySelector('#total-steps').innerText);
    const addStep = document.querySelector('#add-step');
    const nextStep = document.querySelector('#next-step');
    const prevStep = document.querySelector('#prev-step');
    const saveButton = document.querySelector('#save');

    addStep.addEventListener("click", () => {
        recordPositions();
        totalSteps_number++;
        document.querySelector('#total-steps').innerText = totalSteps_number;
        currentStep_number++;
        document.querySelector('#current-step').innerText = currentStep_number;
        loadPositions();
    });

    prevStep.addEventListener('click', () => {
        if (currentStep_number > 1) {
            recordPositions();
            currentStep_number--;
            document.querySelector('#current-step').innerText = currentStep_number;
            loadPositions();
        }
    });

    nextStep.addEventListener('click', () => {
        if (currentStep_number < totalSteps_number) {
            recordPositions();
            currentStep_number++;
            document.querySelector('#current-step').innerText = currentStep_number;
            loadPositions();
        }
    });

    saveButton.addEventListener('click', () => {
        recordPositions(); // 记录位置

        const tacticId = localStorage.getItem('tactic_id');
        const totalSteps = parseInt(document.querySelector('#total-steps').innerText);
        const promises = []; // 用于存储所有的保存请求的 Promise
    
        // Loop through each step and save its data
        for (let step = 1; step <= totalSteps; step++) {
            const positionsKey = `positions_step_${step}`;
            const stepPositions = JSON.parse(localStorage.getItem(positionsKey)) || {};
    
            // Extract positions for players and ball
            const playerA = [];
            const playerB = [];
            let ball = [];
    
            for (const [key, { x, y }] of Object.entries(stepPositions)) {
                if (key.startsWith('A')) {
                    playerA.push({ id: key, x, y });
                } else if (key.startsWith('B')) {
                    playerB.push({ id: key, x, y });
                } else if (key === 'ball') {
                    ball = [{ id: key, x, y }];
                }
            }
    
            // Create the payload for each step
            const payload = {
                tactic_id: parseInt(tacticId),
                step: parseInt(step),
                player_A: playerA,
                player_B: playerB,
                ball: ball,
                description: null, // Save description as null
            };
    
            // console.log(payload);
    
            // Send POST request for each step and add the promise to the array
            const promise = fetch('/api/tactic/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error saving tactic content:', data.message);
                    throw new Error(data.message); // 抛出错误以便 Promise.all 处理
                } else {
                    // console.log(data);
                    console.log(`Successfully saved content for step ${step}`);
                }
            })
            .catch(error => {
                console.error('Error saving tactic content:', error);
                throw error; // 确保在出现错误时捕获异常
            });
    
            promises.push(promise); // 将每个请求的 promise 加入数组
        }
    
        // 等待所有请求完成
        Promise.all(promises)
            .then(() => {
                alert('戰術內容已成功儲存');
                window.location.href = "/myTactics"
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith('positions_step_')) {
                        localStorage.removeItem(key);
                    }
                }
                localStorage.removeItem("tactic_id");
            })
            .catch(error => {
                console.error('One or more steps failed to save:', error);
                alert('某些步驟未能成功保存，請檢查錯誤。');
            });
    });

    let isPlaying = false; // 初始化播放狀態為停止
    let playInterval;

    const playStopButton = document.querySelector('#play_stop');
    playStopButton.style.backgroundImage = 'url(/static/images/play.png)'; // 初始化按鈕為播放圖標

    playStopButton.addEventListener('click', () => {
        if (isPlaying) {
            stopPlay();
            enableDrag();
        } else {
            recordPositions();
            startPlay();
            disableDrag();
        }
    });

    function startPlay() {
        isPlaying = true;
        playStopButton.style.backgroundImage = 'url(/static/images/stop.png)'; // 切換按鈕為停止圖標
        playInterval = setInterval(() => {
            nextStepFunction();
        }, 500); // 每0.5秒更新一步，你可以調整這個速度
    }

    function stopPlay() {
        isPlaying = false;
        playStopButton.style.backgroundImage = 'url(/static/images/play.png)'; // 切換按鈕為播放圖標
        clearInterval(playInterval); // 清除定時器，停止播放
    }

    function disableDrag() {
        interact('.draggable').draggable(false);
    }

    function enableDrag() {
        interact('.draggable').draggable(true);
    }


    function nextStepFunction() {
        if (currentStep_number < totalSteps_number) {
            currentStep_number++;
        } else {
            currentStep_number = 1; // 如果到達最後一步，重新從第一步開始
        }
        document.querySelector('#current-step').innerText = currentStep_number;
        loadPositions(); // 載入該步驟的記錄位置
    }


});
