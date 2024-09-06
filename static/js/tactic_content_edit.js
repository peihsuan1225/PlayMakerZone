document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = "/";
        return;
    }
    
    async function fetchTactic() {
        let fetchedInfo = false;
        const tacticId = localStorage.getItem("tactic_id_p");
    
        try {
            if (tacticId) {
                const response = await fetch("/api/tactic/info?tactic_id=" + tacticId, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                  
                const data = await response.json();
    
                if (data.error) {
                    console.error('Error fetching tactic data:', data.message);
                } else {
                    fetchedInfo = true;
                    let status = await content_check(tacticId);
                    if (status === "noContent") {
                        setupBoard(data.data);
                    } else if (status === "contentLoaded") {
                        console.log("Tactic content loaded successfully.");
                    } else if (status === "error") {
                        console.error("Error occurred while fetching tactic content.");
                    }
                }
            }
    
            if (!fetchedInfo) {
                const response = await fetch("/api/tactic/latest", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
    
                const data = await response.json();
    
                if (data.error) {
                    console.error('Error fetching tactic data:', data.message);
                } else {
                    setupBoard(data.data);
                    localStorage.setItem("tactic_id", data.data.id);
                }
            }

        }catch (error) {
            console.error('Error fetching tactic data:', error);
        }
    
    }

    fetchTactic();

    async function content_check(id) {
        try {
            const response = await fetch("/api/tactic/content?tactic_id=" + id, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const result = await response.json();
            
            if (result.error) {
                return "noContent";  // Return this value to the caller
            } else {
                data_to_localstorage(result);
                setupBoard_content(result);
                return "contentLoaded";  // Return a status indicating success
            }
        } catch (error) {
            console.error('Error fetching tactic content:', error);
            return "error";  // Return an error status if fetching fails
        }
    }

    function data_to_localstorage(result) {
        // 遍歷 result.data 中的每個步驟
        result.data.forEach(stepData => {
            const step = stepData.step;
            const playerA = JSON.parse(stepData.player_A);
            const playerB = JSON.parse(stepData.player_B);
            const ball = JSON.parse(stepData.ball);
    
            const positions = {};
    
            playerA.forEach(player => {
                positions[player.id] = { x: player.x, y: player.y };
            });
    
            playerB.forEach(player => {
                positions[player.id] = { x: player.x, y: player.y };
            });
    
            ball.forEach(ballItem => {
                positions[ballItem.id] = { x: ballItem.x, y: ballItem.y };
            });
    
            localStorage.setItem(`positions_step_${step}`, JSON.stringify(positions));
        });
    }

    function setupBoard_content(tactic) {
        const tactic_steps = document.querySelector("#tactic-steps");
        tactic_steps.style.display = "flex";

        const description = document.querySelector('#description');
        const tacticBoard = document.querySelector('#tactic-board');
        const tactic_name_dispaly = document.querySelector("#tactic_name") 
        const player_number = tactic.player
    
        // console.log(tagsArray);
        // console.dir(tagsArray[0]);

        tacticBoard.innerHTML = '';

        const court = document.createElement("img")
        const backgroundImage = tactic.court === '全場' ? 'fullcourt.png' : 'halfcourt.png';
        court.src = `/static/images/${backgroundImage}`;
        court.id = "court";
        tacticBoard.appendChild(court);

        for (let i = 1; i <= player_number; i++) {
            const playerA = document.createElement('div');
            playerA.id = `A${i}`;
            playerA.className = 'player draggable';
            playerA.textContent = i;
            tacticBoard.appendChild(playerA); 
        }
        for (let i = 1; i <= player_number; i++) {
            const playerB = document.createElement('div');
            playerB.id = `B${i}`;
            playerB.className = 'player draggable';
            playerB.textContent = i;
            tacticBoard.appendChild(playerB);
        }
        
        const ball = document.createElement('div');
        ball.id = `ball`;
        ball.className = 'draggable';
        tacticBoard.appendChild(ball);

        loadPositions();

        document.querySelector('#total-steps').innerText = tactic.data.length;
        totalSteps_number = tactic.data.length;
        currentStep_number = 1;
        document.querySelector('#current-step').innerText = currentStep_number;
    }



    function setupBoard(tactic) {
        const edit_element = document.querySelector("#tactic-steps");
        edit_element.style.display = "flex";
        const description = document.querySelector('#description');
        const tacticBoard = document.querySelector('#tactic-board');
        const tagsArray = JSON.parse(tactic.tags);
        const player_number = tactic.player
    
        // console.log(tagsArray);
        // console.dir(tagsArray[0]);

        tacticBoard.innerHTML = '';
        
        const court = document.createElement("img")
        const backgroundImage = tagsArray[0] === '全場' ? 'fullcourt.png' : 'halfcourt.png';
        court.src = `/static/images/${backgroundImage}`;
        court.id = "court";
        tacticBoard.appendChild(court);

        const positions = {
            A1: { top: '10%', left: '1%' },
            A2: { top: '20%', left: '1%' },
            A3: { top: '30%', left: '1%' },
            A4: { top: '40%', left: '1%' },
            A5: { top: '50%', left: '1%' },
            B1: { top: '10%', left: '95%' },
            B2: { top: '20%', left: '95%' },
            B3: { top: '30%', left: '95%' },
            B4: { top: '40%', left: '95%' },
            B5: { top: '50%', left: '95%' }
        };

        for (let i = 1; i <= player_number; i++) {
            const playerA = document.createElement('div');
            playerA.id = `A${i}`;
            playerA.className = 'player draggable';
            playerA.textContent = i;

            playerA.style.top = positions[`A${i}`].top;
            playerA.style.left = positions[`A${i}`].left;

            tacticBoard.appendChild(playerA); 
        }
        for (let i = 1; i <= player_number; i++) {
            const playerB = document.createElement('div');
            playerB.id = `B${i}`;
            playerB.className = 'player draggable';
            playerB.textContent = i;

            playerB.style.top = positions[`B${i}`].top;
            playerB.style.left = positions[`B${i}`].left;
            
            tacticBoard.appendChild(playerB);
        }
        
        const ball = document.createElement('div');
        ball.id = `ball`;
        ball.className = 'draggable';
        ball.style = "top: 50%; left: 50%;";
        tacticBoard.appendChild(ball);
        
    }

    // 處理拖曳效果
    const positions = {};
    let changed = false;
    const changedElements = new Set();

    // target elements with the "draggable" class
    interact('.draggable')
    .draggable({
        // enable inertial throwing
        inertia: false,
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
        start: dragStartListener, 
        move: dragMoveListener,    

        // call this function on every dragend event
        end (event) {
            updatePosition(event.target);
            // changedElements.add(event.target.id);
        }
        }
    });

    let offsetX = 0; 
    let offsetY = 0; 

    function dragStartListener(event) {
        const target = event.target;

        const targetRect = target.getBoundingClientRect();
        offsetX = event.clientX - targetRect.left;
        offsetY = event.clientY - targetRect.top;
    }

    function dragMoveListener(event) {
        const target = event.target;

        const parentRect = target.parentElement.getBoundingClientRect();

        const x = ((event.clientX - parentRect.left - offsetX) / parentRect.width) * 100;
        const y = ((event.clientY - parentRect.top - offsetY) / parentRect.height) * 100;

        target.style.left = `${x}%`;
        target.style.top = `${y}%`;

        changed = true;
        changedElements.add(target.id); 
    }

    function updatePosition(element) {
        const id = element.id;
        const x = parseFloat(element.style.left) || 0;
        const y = parseFloat(element.style.top) || 0;

        if (!positions[currentStep_number]) {
            positions[currentStep_number] = {};
        }
        positions[currentStep_number][id] = { x: x, y: y };

        // console.log(positions);
    }
    
    

    function recordPositions() {
        document.querySelectorAll('.draggable').forEach(element => {
            updatePosition(element);
        });

        const positionsKey = `positions_step_${currentStep_number}`;
        localStorage.removeItem(positionsKey); 
        localStorage.setItem(positionsKey, JSON.stringify(positions[currentStep_number]));

        changed = false;
        changedElements.clear();
        console.log('Recorded positions for step', currentStep_number, ':', positions);
    }


    function loadPositions() {
        const positionsKey = `positions_step_${currentStep_number}`;
        const savedPositions = JSON.parse(localStorage.getItem(positionsKey)) || {};
        
        // console.log(positionsKey);
        // console.log(savedPositions);

        Object.keys(savedPositions).forEach(id => {
            const { x, y } = savedPositions[id];
            const element = document.getElementById(id);
            if (element) {
                element.style.left = `${x}%`;
                element.style.top = `${y}%`;

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
        let totalSteps_number = parseInt(document.querySelector('#total-steps').innerText);
        if (currentStep_number == totalSteps_number && totalSteps_number == 1) {
            saveThumbnailToSessionStorage(currentStep_number);
        }
        recordPositions();
        totalSteps_number++;
        document.querySelector('#total-steps').innerText = totalSteps_number;
        currentStep_number++;
        document.querySelector('#current-step').innerText = currentStep_number;
        loadPositions();
        updateStarIcon(currentStep_number);
    });

    prevStep.addEventListener('click', () => {
        let totalSteps_number = parseInt(document.querySelector('#total-steps').innerText);
        if (currentStep_number > 1) {
            if (totalSteps_number > currentStep_number && changed) {
                // console.log('已更動的元素:', Array.from(changedElements));
                for (let step = currentStep_number+1; step <= totalSteps_number; step++) {
                    const positionsKey = `positions_step_${step}`;
                    const stepPositions = JSON.parse(localStorage.getItem(positionsKey)) || {};
    
                    changedElements.forEach(id => {
                        const element = document.getElementById(id);
                        if (element) {
                            const x = parseFloat(element.style.left) || 0;
                            const y = parseFloat(element.style.top) || 0;
                            stepPositions[id] = { x, y };
                        }
                    });
                    localStorage.setItem(positionsKey, JSON.stringify(stepPositions));
                }
            }
            recordPositions();
            currentStep_number--;
            document.querySelector('#current-step').innerText = currentStep_number;
            loadPositions();
            updateStarIcon(currentStep_number);
        }
    
    });

    nextStep.addEventListener('click', () => {
        let totalSteps_number = parseInt(document.querySelector('#total-steps').innerText);
        if (currentStep_number < totalSteps_number) {
            if (changed){
                console.log('已更動的元素:', Array.from(changedElements));
                for (let step = currentStep_number+1; step <= totalSteps_number; step++) {
                    const positionsKey = `positions_step_${step}`;
                    const stepPositions = JSON.parse(localStorage.getItem(positionsKey)) || {};
    
                    changedElements.forEach(id => {
                        const element = document.getElementById(id);
                        if (element) {
                            const x = parseFloat(element.style.left) || 0;
                            const y = parseFloat(element.style.top) || 0;
                            stepPositions[id] = { x, y };
                        }
                    });
                    localStorage.setItem(positionsKey, JSON.stringify(stepPositions));
                }
            }
            recordPositions();
            currentStep_number++;
            document.querySelector('#current-step').innerText = currentStep_number;
            loadPositions();
            updateStarIcon(currentStep_number);
        }
    });

    saveButton.addEventListener('click', async () => {
        try{
            recordPositions(); 

            const tacticId = localStorage.getItem('tactic_id')||localStorage.getItem('tactic_id_p');
            const totalSteps = parseInt(document.querySelector('#total-steps').innerText);
            const promises = []; 
            
            const keyPrefix = 'thumbnail_';
            const thumbnailKey = Object.keys(sessionStorage).find(k => k.startsWith(keyPrefix));
            if (thumbnailKey) {
                const uploadThumbnailPromise = uploadThumbnailToBackend();
                promises.push(uploadThumbnailPromise);
            }
            
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
                    description: null, 
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
                            throw new Error(data.message); 
                        } else {
                            // console.log(data);
                            console.log(`Successfully saved content for step ${step}`);
                        }
                    })
                    .catch(error => {
                        console.error('Error saving tactic content:', error);
                        throw error; 
                    });
        
                promises.push(promise); 
            }
            
            // 使用 Promise.allSettled 來確保所有的 Promise 都被處理，即使有錯誤發生
            const results = await Promise.allSettled(promises);

            // 檢查是否有任何 Promise 被拒絕
            const hasError = results.some(result => result.status === 'rejected');

            if (hasError) {
                throw new Error('Some steps failed to save. Please check the error messages.');
            }

            alert("戰術內容已成功儲存");
            window.location.href = "/myTactics"

            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key.startsWith('positions_step_')) {
                    localStorage.removeItem(key);
                }
            }
            if (localStorage.tactic_id) {
                localStorage.removeItem("tactic_id");
            }
            if (localStorage.tactic_id_p) {
                localStorage.removeItem("tactic_id_p");
            }

            
            const existingKey = Object.keys(sessionStorage).find(k => k.startsWith(keyPrefix));
            if (existingKey) {
                sessionStorage.removeItem(existingKey);
            }
            
        }catch(error) {
            console.error('One or more steps failed to save:', error);
            alert("某些步驟未能成功保存，請檢查錯誤。");
        }
    });

    let isPlaying = false; 
    let playInterval;

    const playStopButton = document.querySelector('#play_stop');
    playStopButton.style.backgroundImage = 'url(/static/images/play.png)'; 

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
        }, 500); // 每0.5秒更新一步
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
        let totalSteps_number = parseInt(document.querySelector('#total-steps').innerText);
        if (currentStep_number < totalSteps_number) {
            currentStep_number++;
        } else {
            currentStep_number = 1; // 如果到達最後一步，重新從第一步開始
        }
        document.querySelector('#current-step').innerText = currentStep_number;
        loadPositions(); // 載入該步驟的記錄位置
    }

    const resetBtn = document.querySelector("#reset");
    resetBtn.addEventListener("click", async function() {
        const confirmed = confirm("重置後不可復原，請確認是否重置所有戰術內容?");
        if(confirmed){
            const tacticId = localStorage.getItem("tactic_id_p");
            if (tacticId) {
                const response = await fetch("/api/tactic/info?tactic_id=" + tacticId, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                  
                const data = await response.json();
    
                if (data.error) {
                    console.error('Error fetching tactic data:', data.message);
                } else {
                    setupBoard(data.data);
                    const keysToRemove = [];

                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key.startsWith('positions_step_')) {
                            keysToRemove.push(key);
                        }
                    }
                    
                    keysToRemove.forEach((key) => {
                        localStorage.removeItem(key);
                    });
                    
                    if (localStorage.tactic_id) {
                        localStorage.removeItem("tactic_id");
                    }

                    const total_steps = document.querySelector("#total-steps");
                    total_steps.innerText = "1";

                    const keyPrefix = 'thumbnail_';        

                    const existingKey = Object.keys(sessionStorage).find(k => k.startsWith(keyPrefix));
                    if (existingKey) {
                        sessionStorage.removeItem(existingKey);
                    }

                    const star = document.querySelector("#star");
                    star.style.backgroundImage = "url(/static/images/star_empty.png)";

                    fetch(`/api/tactic/content?tactic_id=${tacticId}`,{
                        method: "DELETE",
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            alert("Reset成功！");
                            window.location.reload();
                        } else {
                            return response.json().then(data => {
                                if (data.error) {
                                    alert("Reset失敗：" + data.message);
                                }
                                else {
                                    alert("Reset失敗：未知錯誤。");
                                }
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Reset失敗:', error);
                        alert("發生錯誤，請稍後再試。");
                    });
                }
            }
        }
    });


    function saveThumbnailToSessionStorage(currentStepNumber) {
        // 設定背景圖
        const star = document.querySelector("#star");
        star.style.backgroundImage = "url(/static/images/star_fill.png)";
    
        // 生成截圖並轉換為 Blob
        html2canvas(document.querySelector("#tactic-board")).then(canvas => {
            
            // 將 canvas 轉換為 JPEG 格式的 Blob
            canvas.toBlob(function(blob) {
                
                const keyPrefix = 'thumbnail_';
                const key = keyPrefix + currentStepNumber;
    
                // 刪除已存在的鍵（如果存在）
                const existingKey = Object.keys(sessionStorage).find(k => k.startsWith(keyPrefix));
                if (existingKey) {
                    sessionStorage.removeItem(existingKey);
                }
    
                // 將 Blob 存儲到 sessionStorage 中
                sessionStorage.setItem(key, URL.createObjectURL(blob));
    
                // 釋放 URL 對象
                URL.revokeObjectURL(URL.createObjectURL(blob));
            
            }, "image/jpeg", 0.7); 
        
        });
    }

    function updateStarIcon(currentStep_number) {
        const keyPrefix = 'thumbnail_';
        const existingKey = Object.keys(sessionStorage).find(k => k.startsWith(keyPrefix));
        const thumbnail_numberPart = existingKey ? existingKey.substring(keyPrefix.length) : null;
    
        const star = document.querySelector("#star");

        if (thumbnail_numberPart && currentStep_number == thumbnail_numberPart) {
            star.style.backgroundImage = "url(/static/images/star_fill.png)";
        } else {
            star.style.backgroundImage = "url(/static/images/star_empty.png)";
        }
    }

    const star = document.querySelector("#star");
    star.addEventListener("click", function(){

        let currentStep_number = parseInt(document.querySelector('#current-step').innerText);

        saveThumbnailToSessionStorage(currentStep_number);
    });

    async function uploadThumbnailToBackend() {
        const tacticId = localStorage.getItem('tactic_id')||localStorage.getItem('tactic_id_p');
        const keyPrefix = 'thumbnail_';
        const thumbnailKey = Object.keys(sessionStorage).find(k => k.startsWith(keyPrefix));
        if (thumbnailKey) {
            // 從鍵名中提取步驟數字
            const step = thumbnailKey.substring(keyPrefix.length);
            const blobUrl = sessionStorage.getItem(thumbnailKey);
            const blob = await fetch(blobUrl).then(r => r.blob());

            const formData = new FormData();
            formData.append('tactic_id', tacticId);
            formData.append('step', step);
            formData.append('file', blob, 'thumbnail.png');

            try {
                const response = await fetch('/api/tactic/thumbnail', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (response.ok) {
                    console.log('Thumbnail uploaded successfully:', result);
                } else {
                    console.error('Error uploading thumbnail:', result);
                }
            } catch (error) {
                console.error('Error:', error);
                throw error; // 確保錯誤被拋出，傳遞給 Promise.all
            }
        } else {
            console.error('No thumbnail information found in sessionStorage.');
            throw new Error('No thumbnail information found.');
        }
    }
    


});
