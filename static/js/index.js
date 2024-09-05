document.addEventListener('DOMContentLoaded', () => {

    $(':radio').mousedown(function(e) {
        let $self = $(this);
        if ($self.is(':checked')) {
            let uncheck = function() {
                setTimeout(function() {
                    $self.prop('checked', false); 
                }, 0);
            };
            let unbind = function() {
                $self.unbind('mouseup', up);
            };
            let up = function() {
                uncheck();
                unbind();
            };
            $self.bind('mouseup', up);
            $self.one('mouseout', unbind);
        }
    });    
  

    function fetchAndDisplayTactics(){
        const searchInput = document.querySelector('input[type="text"]').value;
        const playerCounts = Array.from(document.querySelectorAll('input[name="playerCount"]:checked')).map(el => el.value);
        const dateStart = document.querySelector('input[name="dateStart"]').value;
        const dateEnd = document.querySelector('input[name="dateEnd"]').value;
        const modes = Array.from(document.querySelectorAll('input[name="mode"]:checked')).map(el => el.value);
        const difficulties = Array.from(document.querySelectorAll('input[name="difficulty"]:checked')).map(el => el.value);

        const queryParams = new URLSearchParams();
        if (searchInput) queryParams.append('search', searchInput);
        if (playerCounts.length) queryParams.append('playerCounts', playerCounts.join(','));
        if (dateStart) queryParams.append('dateStart', dateStart);
        if (dateEnd) queryParams.append('dateEnd', dateEnd);
        if (modes.length) queryParams.append('modes', modes.join(','));
        if (difficulties.length) queryParams.append('difficulties', difficulties.join(','));

        fetch(`/api/tactics?${queryParams.toString()}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("連線回應不成功" + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                const searchResult = document.querySelector(".col-md-9");
                searchResult.innerHTML = "";
                searchResult.innerHTML = "查詢戰術失敗";
                return;
            }
            else if(data.nodata){
                const searchResult = document.querySelector(".col-md-9");
                searchResult.innerHTML = "";
                searchResult.innerHTML = "無符合戰術";
                return;
            }
            else {
                displayTactics(data.data);
            }
        });
    }

    function displayTactics(tactics){
        const searchResult = document.querySelector(".col-md-9");
        searchResult.innerHTML = "";
        
        const row = document.createElement("div");
        row.className = "row";

        tactics.forEach(tactic =>{
            const col = document.createElement("div");
            col.className = "col-md-4";
    
            const card = document.createElement("div");
            card.className = "card mb-4 shadow";
            card.addEventListener("click", function() {
                window.location.href = `/tactic/${tactic.id}`;
            });      
            card.style.cursor = "pointer";                 
    
            const tumbnail = document.createElement("img");
            tumbnail.className = "card-img-top thumbnail";
            tumbnail.src = tactic.thumbnail_url || "/static/images/tumbnail.png";
            tumbnail.alt = "戰術縮圖";
    
            const cardBody = document.createElement("div");
            cardBody.className = "card-body";
    
            const tacticName = document.createElement("h5");
            tacticName.className = "card-title d-inline";
            tacticName.innerText = tactic.name;
    
            const userName = document.createElement("a");
            userName.className = "creator-id d-inline ml-2";
            userName.innerText = tactic.username;
    
            const cardText1 = document.createElement("p");
            cardText1.className = "card-text mt-2";
    
            const tags = JSON.parse(tactic.tags);
            tags.forEach(tag => {
                const tagDisplay = document.createElement("span");
                tagDisplay.className = `tag tag-${tag}`;
                tagDisplay.innerText = tag;  
                cardText1.appendChild(tagDisplay);
            });
    
            const cardText2 = document.createElement("p");
            cardText2.className = "card-text";
    
            const player = document.createElement("span");
            player.className = "player-count";
            player.innerText = `人數: ${tactic.player}`;
            cardText2.appendChild(player);

            const title = document.createElement("span");
            title.innerText = "難度: ";
            
            const star = document.createElement("span");
            star.className = "difficulty"
    
            const level = tactic.level;
            for (let i = 0; i < level; i++) {
                const starElement = document.createElement('i');
                starElement.className = "fas fa-star";
                star.appendChild(starElement);
            }
         
            const cardText3 = document.createElement("p");
            cardText3.className = "card-text";
    
            const updateDateDisplay = document.createElement("small");
            const updateDate = tactic.update_time.split("T")[0];
            updateDateDisplay.className = "text-muted";
            updateDateDisplay.innerText = `更新日期: ${updateDate}`;

            row.appendChild(col);
            col.appendChild(card);
            card.appendChild(tumbnail);
            card.appendChild(cardBody);
            cardBody.appendChild(tacticName);
            cardBody.appendChild(userName);
            cardBody.appendChild(cardText1);
            cardBody.appendChild(cardText2);
            cardBody.appendChild(cardText3);
            cardText2.appendChild(title);
            cardText2.appendChild(star);
            cardText3.appendChild(updateDateDisplay);
        })
        searchResult.appendChild(row);
    }

    document.querySelector('#searchBtn1').addEventListener('click', (e) => {
        e.preventDefault();
        fetchAndDisplayTactics();
    });

    document.querySelector('#searchBtn2').addEventListener('click', (e) => {
        e.preventDefault();
        fetchAndDisplayTactics();
    });

    fetchAndDisplayTactics();
});