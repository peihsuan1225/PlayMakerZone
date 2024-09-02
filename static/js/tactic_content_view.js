document.addEventListener('DOMContentLoaded', () => {
    const pathname = window.location.pathname;
    const parts = pathname.split("/");
    const id = parts[parts.length-1];

    console.log(id);
    fetch("/api/tactic/content?tactic_id="+id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            console.error('Error fetching tactic data:', result.message);
            const tactic_name_dispaly = document.querySelector("#tactic_name"); 
            tactic_name_dispaly.innerHTML = ''; 
            const no_tacticContent = document.querySelector("#no_tacticContent"); 
            no_tacticContent.style.display = "block";
            
            const edit_tacticContent = document.querySelector("#edit_tacticContent"); 
            edit_tacticContent.style.display = "block";

            edit_tacticContent.addEventListener("click", () => {
                if (localStorage.tactic_id_p) {
                    localStorage.removeItem("tactic_id_p");
                }
                localStorage.setItem("tactic_id_p", id);

                window.location.href = "/createTactic/content";
            })
        }
        else{
            data_to_localstorage(result);
            setupBoard(result);
            // console.log(data.data);
        }
    })
    .catch(error => console.error('Error fetching tactic data:', error));

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

    function setupBoard(tactic) {
        const tactic_steps = document.querySelector("#tactic-steps");
        tactic_steps.style.display = "flex";

        const description = document.querySelector('#description');
        const tacticBoard = document.querySelector('#tactic-board');
        const tactic_name_dispaly = document.querySelector("#tactic_name") 
        const player_number = tactic.player
    
        // console.log(tagsArray);
        // console.dir(tagsArray[0]);

        tactic_name_dispaly.innerText = tactic.tacticName;

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

        interact('.draggable').draggable(false);
        loadPositions();

        document.querySelector('#total-steps').innerText = tactic.data.length;
        totalSteps_number = tactic.data.length;
        currentStep_number = 1;
        document.querySelector('#current-step').innerText = currentStep_number;
    }


    function loadPositions() {
        const positionsKey = `positions_step_${currentStep_number}`;
        const savedPositions = JSON.parse(localStorage.getItem(positionsKey)) || {};

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
;
    const nextStep = document.querySelector('#next-step');
    const prevStep = document.querySelector('#prev-step');


    prevStep.addEventListener('click', () => {
        if (currentStep_number > 1) {
            currentStep_number--;
            document.querySelector('#current-step').innerText = currentStep_number;
            loadPositions();
        }
    });

    nextStep.addEventListener('click', () => {
        if (currentStep_number < totalSteps_number) {
            currentStep_number++;
            document.querySelector('#current-step').innerText = currentStep_number;
            loadPositions();
        }
    });


    let isPlaying = false; 
    let playInterval;

    const playStopButton = document.querySelector('#play_stop');
    playStopButton.style.backgroundImage = 'url(/static/images/play.png)'; 

    playStopButton.addEventListener('click', () => {
        if (isPlaying) {
            stopPlay();
        } else {
            startPlay();
        }
    });

    function startPlay() {
        isPlaying = true;
        playStopButton.style.backgroundImage = 'url(/static/images/stop.png)'; 
        playInterval = setInterval(() => {
            nextStepFunction();
        }, 500); // 每0.5秒更新一步
    }

    function stopPlay() {
        isPlaying = false;
        playStopButton.style.backgroundImage = 'url(/static/images/play.png)'; 
        clearInterval(playInterval); 
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
