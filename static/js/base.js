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

        // // 獲取預定行程
        // const bookingbtn = document.querySelector("#booking");
        // bookingbtn.addEventListener("click", async() =>{
        //     if (token){
        //         await fetch("/api/user/auth", {
        //             method: "GET",
        //             headers: {
        //                 "Authorization": `Bearer ${token}`
        //             }
        //         })
        //         .then(response => {
        //             if(!response.ok){
        //                 signinSignup.click();
        //             }
        //             return response.json();
        //         })
        //         .then(data => {
        //             if(data && data.data){
        //                 window.location.href = "/booking"
        //             }
        //             else{
        //                 signinSignup.click();
        //             }
        //         })
        //     }else{
        //         signinSignup.click();
        //     }
        // });

        // 登入狀態驗證，確認是否有登入token
        const token = localStorage.getItem("token");
        const signinSignup = document.querySelector("#signin_signup");
        const userAvatar = document.querySelector("#avatar")

        if (token){
            fetch("/api/user/auth", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(response => {
                if(!response.ok){
                    throw new Error("Token 已到期或無效");
                }
                return response.json();
            })
            .then(data => {
                if(data && data.data){
                    signinSignup.style.display = "none";
                    userAvatar.style.backgroundImage = `url(${data.data.avatar})`;
                    let userInfo = JSON.stringify(data.data);
                    localStorage.setItem("userInfo", userInfo);
                }
                else{
                    signinSignup.style.display = "block";
                }
            })
            .catch(error =>{
                console.error("Error:", error);
                signinSignup.style.display = "block";
            });
        }

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
                const imageInput = document.querySelector(".dialog__file-input");

                const request = {
                    username: nameInput,
                    email: emailInput,
                    password: passwordInput,
                    avatar: imageInput.files[0],
                };
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


// // 點擊登入註冊>跳出視窗;點擊登出系統>清除token並重整
// signinSignup.addEventListener("click", () =>{
//     const token = localStorage.getItem("token");
//     const signinSignup = document.querySelector("#signin_signup");

//     if (signinSignup) {
//         if (token) {
//             localStorage.removeItem("token");
//             localStorage.removeItem("userInfo");
//             signinSignup.textContent = "登入/註冊";
//             window.location.reload();
//         }
//         else{
//             clearSigninFrom();
//             popUpFun();
//         }
//     }            
// });