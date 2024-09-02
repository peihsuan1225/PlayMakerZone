document.addEventListener("DOMContentLoaded", () => {

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
            card.className = "card tactic-card mb-4 shadow-lg";
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
            cardText0.className = "d-flex";

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

            const deleteDIv = document.createElement("div");
            deleteDIv.className = "text-end";
            const delete_icon = document.createElement("img");
            delete_icon.src = "/static/images/delete.png";
            delete_icon.style = "width:25px"
            deleteDIv.appendChild(delete_icon);
            deleteDIv.addEventListener("click", function(event) {
                deleteTactic(event, tactic.id);
            });

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
            cardText0.appendChild(deleteDIv);
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
        
        const aboutMeTitle = document.createElement("h6");
        aboutMeTitle.innerText = "關於我"

        const aboutMeDisplay = document.createElement("p");
        aboutMeDisplay.innerText = user.about_me || "尚未撰寫內容";
        
        profile.appendChild(avatarDisplay);
        profile.appendChild(userNameDisplay);
        profile.appendChild(hr);
        profile.appendChild(aboutMeTitle);
        profile.appendChild(aboutMeDisplay);
    }

    function deleteTactic(event, id){
        event.stopPropagation();
        const userConfirmed = confirm("刪除後不可恢復，請確認是否刪除?");
        // console.log(id);

        if (userConfirmed) {            
            fetch(`/api/tactic?tactic_id=${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    alert("戰術刪除成功！");
                    window.location.reload();
                } else {
                    return response.json().then(data => {
                        if (data.error) {
                            alert("刪除失敗：" + data.message);
                        }
                        else {
                            alert("刪除失敗：未知錯誤。");
                        }
                    });
                }
            })
            .catch(error => {
                console.error('刪除失敗:', error);
                alert("發生錯誤，請稍後再試。");
            });
        }
    }
})