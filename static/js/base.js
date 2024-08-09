document.addEventListener("DOMContentLoaded", () => {
    // 插入navbar,dialog,footer的html
    fetch("/static/html/base.html")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
    })
    .then(data => {
        // 創建一個臨時的 div 元素來容納 base.html 的內容
        let tempDiv = document.createElement("div");
        tempDiv.innerHTML = data;

        // 尋找並插入 navbar
        let navbarInsert = tempDiv.querySelector(".navbar");
        if (navbarInsert) {
            document.querySelector(".navbar_insert").appendChild(navbarInsert);
            document.querySelector(".navbar-brand").addEventListener("click", function() {
                window.location.href = '/';
            });            
        } else {
            console.error('Error: Element with class "navbar" not found in base.html.');
        }

        const createTactic = document.querySelector("#create_tactic");
        const signinSignup = document.querySelector("#signin_signup");
        const userAvatarContainer = document.querySelector("#avatar_container");
        const userAvatar = document.querySelector("#avatar_img");
        const avatar = document.querySelector("#avatar");
        const popupMenu = document.querySelector("#popup-menu");


         // Function to update navbar based on login status
         const updateNavbar = (token) => {
            if (token) {
                fetch("/api/user/auth", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Token expired or invalid");
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && data.data) {
                        signinSignup.style.display = "none";
                        userAvatarContainer.style.display = "block";
                        userAvatar.src = data.data.avatar || '/static/images/default_avatar.jpg';
                        createTactic.href = "/createTactic";
                    } else {
                        signinSignup.style.display = "block";
                        userAvatarContainer.style.display = "none";
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    signinSignup.style.display = "block";
                    userAvatarContainer.style.display = "none";
                });
            } else {
                signinSignup.style.display = "block";
                userAvatarContainer.style.display = "none";
            }
        };
        
        const token = localStorage.getItem("token");
        updateNavbar(token);


        // 點擊建立戰術引導登入或是到建立戰術頁面
        createTactic.addEventListener("click", async() =>{
            if (token){
                await fetch("/api/user/auth", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                .then(response => {
                    if(!response.ok){
                        signinSignup.click();
                    }
                    return response.json();
                })
                .then(data => {
                    if(data && data.data){
                        window.location.href = "/createTactic"
                    }
                    else{
                        signinSignup.click();
                    }
                })
            }else{
                signinSignup.click();
            }
        });


        // 尋找並插入 dialog
        let dialogInsert = tempDiv.querySelector(".dialog")
        if (dialogInsert) {
            document.querySelector(".dialog_insert").appendChild(dialogInsert);
        
            const signinSignup = document.querySelector("#signin_signup");
            const signinBlock = document.querySelector("#sign_in");
            const signupBlock = document.querySelector("#sign_up"); 
            const switchTexts = document.querySelectorAll(".dialog__text--switch");
            const content = document.querySelector(".content");
            const closes = document.querySelectorAll(".dialog__icon--close");
            const signinBtn = document.querySelector("#sign_in_btn")
            const signinErrorMessage = document.querySelector("#signin_error_message");
            const signupErrorMessage = document.querySelector("#signup_error_message")

            // functions
            const  popUpFun = () => {
                signinBlock.classList.add("display");
                content.classList.add("faded");        
            };

            const closeFun = () =>{
                signinBlock.classList.remove("display");
                signupBlock.classList.remove("display");
                content.classList.remove("faded");   
            };

            const switchFun = () =>{
                if (signinBlock.classList.contains("display")){
                    signinBlock.classList.remove("display");
                    signupBlock.classList.add("display");
                }
                else{
                    signinBlock.classList.add("display");
                    signupBlock.classList.remove("display");
                }
            };

            const emptyCheck = (form, event) =>{
                const nameInput = form.querySelector("#signup_name_input") ? document.querySelector("#signup_name_input").value.trim() : null;
                const emailInput = form.querySelector(form.id === "sign_in" ? "#signin_email_input" : "#signup_email_input").value.trim();
                const passwordInput = form.querySelector(form.id === "sign_in" ? "#signin_password_input" : "#signup_password_input").value.trim();

                let emptyErrorMessage = "";
                if (nameInput !== null && nameInput === ""){
                    emptyErrorMessage += emptyErrorMessage === "" ? "使用者名稱" : "使用者名稱";
                }
                if (emailInput === ""){
                    emptyErrorMessage += emptyErrorMessage === "" ? "電子信箱" : "、電子信箱";
                }
                if (passwordInput === ""){
                    emptyErrorMessage += emptyErrorMessage === "" ? "密碼" : "、密碼";
                }
                if (emptyErrorMessage !==""){
                    alert("請輸入"+emptyErrorMessage);
                    event.preventDefault();
                    return false;
                }
                return true;
            };

            const authenticateUser = async function (form) {
                const emailInput = form.querySelector("#signin_email_input").value.trim();
                const passwordInput = form.querySelector("#signin_password_input").value.trim();

                const request = {
                    email: emailInput,
                    password: passwordInput
                };
                try {
                    const response = await fetch("/api/user/auth",{
                        method: "PUT",
                        headers:{
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(request)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        signinErrorMessage.textContent = errorData.message || "無法登入，請稍後再試";
                    }
                    else{
                        const responseData = await response.json();
                        localStorage.setItem("token", responseData.token);
                        window.location.reload();
                    }
                } catch (error) {
                    console.error("Error", error);
                    signinErrorMessage.textContent = "system error";
                }
            };

            const registerUser = async function (form) {
                const nameInput = form.querySelector("#signup_name_input").value.trim();
                const emailInput = form.querySelector("#signup_email_input").value.trim();
                const passwordInput = form.querySelector("#signup_password_input").value.trim(); 
                // const imageInput = document.querySelector(".dialog__file-input");

                const request = {
                    username: nameInput,
                    email: emailInput,
                    password: passwordInput
                };
                // formData.append('avatar', imageInput.files[0]);
                
                console.log(request);
                try {
                    const response = await fetch("/api/user",{
                        method: "POST",
                        headers:{
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(request)
                    });

                    if (!response.ok){
                        const errorData = await response.json();
                        signupErrorMessage.textContent = errorData.message || "無法註冊，請稍後再試";                    
                    }
                    else{
                        signupErrorMessage.textContent = "註冊成功"
                    }
                } catch (error){
                    console.error("Error", error);
                    signupErrorMessage.textContent = "system error"
                }
            };

            function clearSigninFrom(){
                document.querySelector("#signin_email_input").value = "";
                document.querySelector("#signin_password_input").value = "";
                document.querySelector("#signin_error_message").textContent = "";
            }

            function clearSignupFrom(){
                document.querySelector("#signup_name_input").value = "";
                document.querySelector("#signup_email_input").value = "";
                document.querySelector("#signup_password_input").value = "";
                document.querySelector("#signup_error_message").textContent = "";
            }
            
            // 點擊登入註冊>跳出視窗
            signinSignup.addEventListener("click", () =>{
                const signinSignup = document.querySelector("#signin_signup");

                if (signinSignup) {
                        clearSigninFrom();
                        popUpFun();
                    }
            });
            
            // 點擊X關閉視窗
            closes.forEach(close =>{
                close.addEventListener("click", () =>{
                    closeFun();
                })          
            });
            
            // 點擊switch文字，切換視窗
            switchTexts.forEach(switchText =>{
                switchText.addEventListener("click", () =>{
                    switchFun();
                    clearSigninFrom();
                    clearSignupFrom();
                })            
            });

            // 點擊 avatar 顯示/隱藏彈出菜單
            avatar.addEventListener("click", () => {
                const isVisible = popupMenu.style.display === "block";
                popupMenu.style.display = isVisible ? "none" : "block";
            });

            // 點擊其他地方隱藏彈出菜單
            document.addEventListener("click", (event) => {
                if (!avatar.contains(event.target) && !popupMenu.contains(event.target)) {
                    popupMenu.style.display = "none";
                }
            });

            // 登出按鈕點擊事件
            const logoutButton = document.querySelector("#logout");
            logoutButton.addEventListener("click", () => {
                localStorage.removeItem("token");
                localStorage.removeItem("userInfo");
                window.location.href = '/';
            });

            // 登入會員
            signinBtn.addEventListener("click", (event) => {
            const signinform = document.querySelector("#sign_in");
                if(emptyCheck(signinform, event)){
                    authenticateUser(signinform);
                }
            });

            // 註冊會員
            const signupBtn = document.querySelector("#sign_up_btn");
            signupBtn.addEventListener("click", (event) =>{
                const signupform = document.querySelector("#sign_up");
                if(emptyCheck(signupform, event)){
                    registerUser(signupform);
                }
            });

        } else {
            console.error('Error: Element with class "dialog" not found in base.html.');
        }
        
    });
});

