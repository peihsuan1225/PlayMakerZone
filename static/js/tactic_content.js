document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = "/";
        return;
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
        const background = document.getElementById('background');
        const players = document.querySelectorAll('.player, #ball');
        const description = document.getElementById('description');
        const tacticBoard = document.getElementById('tactic-board');
        
        // Set background image based on tags[0]
        const backgroundImage = tactic.tags[0] === '全場' ? 'fullcourt.png' : 'halfcourt.png';
        background.style.backgroundImage = `url(/static/images/${backgroundImage})`;

        players.forEach(player => {
            player.addEventListener('dragstart', dragStart);
        });

        tacticBoard.addEventListener('dragover', dragOver);
        tacticBoard.addEventListener('drop', drop);

        // Set description
        description.value = tactic.description;

        // Setup drag and drop
        setupDragAndDrop();
    }

    function setupDragAndDrop() {
        const tacticBoard = document.getElementById('tactic-board');
        const players = document.querySelectorAll('.player, #ball');

        players.forEach(player => {
            player.addEventListener('dragstart', dragStart);
        });

        tacticBoard.addEventListener('dragover', dragOver);
        tacticBoard.addEventListener('drop', drop);
    }

    function dragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.id);
        setTimeout(() => {
            event.target.style.visibility = 'hidden';
        }, 0);
    }

    function dragOver(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        const id = event.dataTransfer.getData('text');
        const draggableElement = document.getElementById(id);
        draggableElement.style.left = `${event.clientX - draggableElement.offsetWidth / 2}px`;
        draggableElement.style.top = `${event.clientY - draggableElement.offsetHeight / 2}px`;
        draggableElement.style.visibility = 'visible';
    }

    document.getElementById('save').addEventListener('click', () => {
        const playerPositionsA = {};
        const playerPositionsB = {};
        const playersA = document.querySelectorAll('.player.A');
        const playersB = document.querySelectorAll('.player.B');

        playersA.forEach((player, index) => {
            playerPositionsA[`A.${index + 1}`] = {
                x: player.style.left,
                y: player.style.top
            };
        });

        playersB.forEach((player, index) => {
            playerPositionsB[`B.${index + 1}`] = {
                x: player.style.left,
                y: player.style.top
            };
        });

        // Similarly handle ball position and send data to backend for saving
    });

    document.getElementById('prev-step').addEventListener('click', () => {
        // Handle switching to the previous step
    });

    document.getElementById('next-step').addEventListener('click', () => {
        // Handle switching to the next step
    });
});
