document.addEventListener("DOMContentLoaded", () => {
    // for (let i = localStorage.length - 1; i >= 0; i--) {
    //     const key = localStorage.key(i);
    //     if (key.startsWith('positions_step_')) {
    //         localStorage.removeItem(key);
    //     }
    // }
    const token = localStorage.getItem('token');
    if (token){
         fetch("/api/user/auth", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(response => {
            if(!response.ok){
                const container = document.querySelector(".container");
                container.innerHTML = "";
                container.innerHTML = "獲取個人資料出錯";
                return;
            }
            return response.json();
        })
        .then(data => {
            if(data && data.data){
                const user = data.data
                get_personal_tactics(user);
                displayMyProfile(user);
            }
            else{
                const container = document.querySelector(".container");
                container.innerHTML = "";
                container.innerHTML = "身分驗證失敗";
            }
        })
    }else{
        window.location.href = "/";
        return;
    }

    function get_personal_tactics (user) {
        const queryParams = new URLSearchParams();
        if (user.id) {
            queryParams.append('userID', user.id); 
        } else if (user.username) {
            queryParams.append('userName', user.username); 
        }

        fetch(`/api/personal/tactics?${queryParams.toString()}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (!response.ok){
                throw new Error("連線回應不成功" + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                const searchResult = document.querySelector(".tactics-section");
                searchResult.innerHTML = "";
                searchResult.innerHTML = "查詢戰術失敗";
                return;
            }
            else if(data.nodata){
                const searchResult = document.querySelector(".tactics-section");
                searchResult.innerHTML = "";
                searchResult.innerHTML = "尚無戰術";
                return;
            }
            else {
                displayMyTactics(data.data);
            }
        });
    }

    function displayMyTactics(tactics){
        const searchResult = document.querySelector(".tactics-section");
        searchResult.innerHTML = "";
        
        const row = document.createElement("div");
        row.className = "row";

        tactics.forEach(tactic =>{
            const col = document.createElement("div");
            col.className = "col-md-6";
    
            const card = document.createElement("div");
            card.className = "card tactic-card mb-4";
            card.addEventListener("click", function() {
                window.location.href = `/tactic/${tactic.id}`;
            });
            card.style.cursor = "pointer"; 
    
            const tumbnail = document.createElement("img");
            tumbnail.className = "card-img-top";
            tumbnail.src ="/static/images/tumbnail.png";
            tumbnail.alt = "戰術縮圖";
    
            const cardBody = document.createElement("div");
            cardBody.className = "card-body";
    
            const cardText0 = document.createElement("div");

            const tacticName = document.createElement("h5");
            tacticName.className = "card-title d-inline";
            tacticName.innerText = tactic.name;

            const statusEye = document.createElement("img");
            statusEye.className = "status-img";
            if (tactic.status === "公開"){
                statusEye.src = "/static/images/publiceye.png";
            }
            else if (tactic.status === "私人"){
                statusEye.src = "/static/images/privateeye.jpg";
            }
    
            const cardText1 = document.createElement("p");
            cardText1.className = "card-text";
    
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
            cardText3.appendChild(updateDateDisplay);

            if(tactic.finished === 0){
                const unfinishedDisplay = document.createElement("span");
                unfinishedDisplay.className = "tag tag-製作中";
                unfinishedDisplay.innerText = "內容待製作...";
                cardText3.appendChild(unfinishedDisplay);
            }

            row.appendChild(col);
            col.appendChild(card);
            card.appendChild(tumbnail);
            card.appendChild(cardBody);
            cardBody.appendChild(cardText0);
            cardText0.appendChild(tacticName);
            cardText0.appendChild(statusEye);
            cardBody.appendChild(cardText1);
            cardBody.appendChild(cardText2);
            cardBody.appendChild(cardText3);
            cardText2.appendChild(title);
            cardText2.appendChild(star);
        })
        searchResult.appendChild(row);
    }

    function displayMyProfile(user){
        const profile = document.querySelector(".profile-section");
        profile.innerHTML = "";
        
        const avatarDisplay = document.createElement("img");
        avatarDisplay.src = user.avatar || "/static/images/default_avatar.jpg";
        avatarDisplay.alt = "使用者頭像";

        const userNameDisplay = document.createElement("h3");
        userNameDisplay.id = "userName";
        userNameDisplay.innerText = user.username;

        const hr = document.createElement("hr");
        hr.className = "my-4";

        // // 1. 創建 li 元素並設置類別
        // const li = document.createElement('li');
        // li.className = 'd-flex justify-content-between align-items-center flex-wrap';

        // // 2. 創建 h6 元素並設置類別
        // const h6 = document.createElement('h6');
        // h6.className = 'mb-0';

        // // 3. 創建 SVG 元素
        // const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        // svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        // svg.setAttribute('width', '24');
        // svg.setAttribute('height', '24');
        // svg.setAttribute('fill', 'none');
        // svg.setAttribute('stroke', 'currentColor');
        // svg.setAttribute('stroke-width', '2');
        // svg.setAttribute('stroke-linecap', 'round');
        // svg.setAttribute('stroke-linejoin', 'round');
        // svg.classList.add('feather', 'feather-mail', 'me-2', 'icon-inline');

        // // 創建 path 元素並將其添加到 SVG 中
        // const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        // path.setAttribute('d', 'M4 4h16c1.11 0 2 .89 2 2v12c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2V6c0-1.11.89-2 2-2z');
        // svg.appendChild(path);

        // // 創建 polyline 元素並將其添加到 SVG 中
        // const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        // polyline.setAttribute('points', '22,6 12,13 2,6');
        // svg.appendChild(polyline);

        // // 4. 創建 span 元素並設置類別和文本
        // const span = document.createElement('span');
        // span.className = 'text-secondary';
        // span.textContent = user.email;

        // // 5. 組裝元素
        // h6.appendChild(svg); // 將 SVG 添加到 h6 中
        // h6.appendChild(document.createTextNode('Email')); // 添加文本節點
        // li.appendChild(h6); // 將 h6 添加到 li 中
        // li.appendChild(span); // 將 span 添加到 li 中
     
        
        const aboutMeTitle = document.createElement("h6");
        aboutMeTitle.innerText = "關於我"

        const aboutMeDisplay = document.createElement("p");
        aboutMeDisplay.innerText = user.about_me || "尚未撰寫內容";
        
        profile.appendChild(avatarDisplay);
        profile.appendChild(userNameDisplay);
        profile.appendChild(hr);
        profile.appendChild(aboutMeTitle);
        profile.appendChild(aboutMeDisplay);
        // profile.appendChild(li);
    }
})