document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/";
        return;
    }

    const mainBody = document.querySelector("main-body");
    const avatar = document.querySelector("#user-avatar");
    const username_avatar = document.querySelector("#user-name");
    const fullname = document.querySelector("#name-text");
    const email = document.querySelector("#email-text");
    
    const username_profile = document.querySelector("#username-text");

    const aboutMe = document.querySelector("#about-text");
    
    const uploadAvatarInput = document.querySelector("#upload-avatar");
    // 選取所有的 selectable-circle 元素
    const circles = document.querySelectorAll('.selectable-circle');
    let userUpdateData = new FormData();
    
    const updateProfile = (token) => {
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
                    return;
                }
                return response.json();
            })
            .then(data => {
                if (data && data.data) {
                    avatar.src = data.data.avatar || '/static/images/default_avatar.jpg';
                    username_avatar.textContent = data.data.username;
                    username_profile.textContent = data.data.username;
                    fullname.textContent = data.data.fullname;
                    email.textContent = data.data.email;
                    aboutMe.textContent = data.data.about_me;
                } else {
                    mainBody.innerHTML = "";
                    mainBody.textContent = "獲取個人資料出錯"; 
                }
            })
            .catch(error => {
                console.error("Error:", error);
                mainBody.innerHTML = "";
                mainBody.textContent = "獲取個人資料出錯"; 
            });
        }
        else{
            window.location.href="/"
        }
    };
    
    updateProfile(token);



    const updateAvatarBtn = document.querySelector('#update-avatar-btn');
    const avatarOptions = document.querySelector('#avatar-options');
    const saveAvatarBtn = document.querySelector('#save-avatar-btn');
    const cancelAvatarBtn = document.querySelector('#cancel-avatar-btn');

    if (updateAvatarBtn && avatarOptions && saveAvatarBtn) {
        updateAvatarBtn.addEventListener('click', function() {
            this.classList.add('d-none');  
            avatarOptions.classList.remove('d-none');  
            
            cancelAvatarBtn.classList.remove('d-none');
            circles.forEach(function(c) {
                c.classList.remove('selected');
            });

        });
    }
  

    // 為每個 circle 元素添加點擊事件監聽器
    circles.forEach(function(circle) {
        circle.addEventListener('click', function() {

            circles.forEach(function(c) {
                c.classList.remove('selected');
            });


            circle.classList.add('selected');

            saveAvatarBtn.classList.remove('d-none');  

            const avatarUrl = getComputedStyle(circle).backgroundImage;
            const avatarUrl_clear = avatarUrl.replace(/^url\(["']?/, '').replace(/["']?\)$/, '')
            avatar.src = avatarUrl_clear;
            uploadAvatarInput.value="";

            const url = new URL(avatarUrl_clear);
            const pathname = url.pathname;

            userUpdateData.delete("avatar_url");
            userUpdateData.delete("default_avatar");

            userUpdateData.append("default_avatar", pathname);
            });
    });

    uploadAvatarInput.addEventListener('change', function(event) {
        saveAvatarBtn.classList.remove('d-none');  
        circles.forEach(function(c) {
            c.classList.remove('selected');
        });
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
    
            reader.onload = function(e) {
                avatar.src = e.target.result;
            }
    
            reader.readAsDataURL(file);

            userUpdateData.delete("avatar_url");
            userUpdateData.delete("default_avatar");

            userUpdateData.append("avatar_url", file);  
        }
    });

    async function updateUserProfile(userUpdateData) {
        try {
            const response = await fetch("/api/user/profile", {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: userUpdateData
            });
    
            if (response.ok) {
                const data = await response.json();

                const tokenValue = data.token[0].token;
                localStorage.removeItem("token");
                localStorage.setItem("token", tokenValue);
                return {data};
            } else {
                const error = await response.json();
                return {error, status: response.status};
            }
        } catch (error) {
            console.error('Error:', error);
            return {error: 'Network error', status: 500};
        }
    }
    

    
    if (saveAvatarBtn) {
        saveAvatarBtn.addEventListener('click', function() {
            avatarOptions.classList.add('d-none');
            updateAvatarBtn.classList.remove('d-none');
            this.classList.add('d-none');

            updateUserProfile(userUpdateData)
                .then(response => {
                    if (response.error) {
                        console.error('Error:', response.error);
                    } else {
                        window.location.reload();
                    }
                });
        });
    }
    
    if (cancelAvatarBtn) {
        cancelAvatarBtn.addEventListener('click', function() {
            avatarOptions.classList.add('d-none');
            updateAvatarBtn.classList.remove('d-none');
            this.classList.add('d-none');
            updateProfile(token);
            uploadAvatarInput.value="";
        });
    }

    // 點擊編輯icon邏輯
    document.querySelectorAll('.edit-icon').forEach(icon => {
        icon.addEventListener('click', function() {

            const target = document.querySelector(this.getAttribute('data-target'));
            const input = this.previousElementSibling;
            const span = input.previousElementSibling;
  
            if (target) {
                input.classList.add('d-none');
                target.classList.remove('d-none');
            }
       
            span.classList.add('d-none');
     
            this.classList.add('d-none');

            input.value = span.textContent
  
            // 移除 Save 和 Cancel 按鈕
            document.querySelectorAll('.save-icon, .cancel-icon').forEach(icon => {
                icon.remove();
            });

            const saveIcon = document.createElement('i');
            saveIcon.className = 'fa fa-save save-icon';

            saveIcon.addEventListener('click', function() {
                input.classList.remove('d-none');
                target.classList.add('d-none');
                saveIcon.remove();
                cancelIcon.remove();
                icon.classList.remove('d-none');

                let fullname_input = document.querySelector("#name-input");
                let email_input = document.querySelector("#email-input");
                let username_input = document.querySelector("#username-input");
                let about_input = document.querySelector("#about-input");

                if (username_input.value.trim()) {
                    userUpdateData.append("username", username_input.value.trim());
                  }
                  
                  if (email_input.value.trim()) {
                    userUpdateData.append("email", email_input.value.trim());
                  }
                  
                  if (about_input.value.trim()) {
                    userUpdateData.append("about_me", about_input.value.trim());
                  }
                  
                  if (fullname_input.value.trim()) {
                    userUpdateData.append("fullname", fullname_input.value.trim());
                  }
                

                updateUserProfile(userUpdateData)
                .then(response => {
                    if (response.error) {
                        
                        userUpdateData = new FormData();

                        alert(response.error.message);
                        console.error('Error:', response.error.message);
                        span.classList.remove('d-none');

                        const inputs = document.querySelectorAll('input');

                        inputs.forEach(input => {
                            input.value = '';
                        });

                    } else {
                        window.location.reload();
                    }
                });
            });
  
            const cancelIcon = document.createElement('i');
            cancelIcon.className = 'fa fa-times cancel-icon';
  
            cancelIcon.addEventListener('click', function() {
                target.classList.add('d-none');
                span.classList.remove('d-none');
                target.classList.add('d-none');
                saveIcon.remove();
                cancelIcon.remove();
                icon.classList.remove('d-none');

                 const inputs = document.querySelectorAll('input');

                 inputs.forEach(input => {
                     input.value = '';
                 });
            });
  
            this.parentElement.append(saveIcon, cancelIcon);
        });
    });
  
    // 密碼編輯邏輯
    const passwordSection = document.querySelector('#password-section');
    if (passwordSection) {
        passwordSection.classList.add('d-none');

        document.querySelector('.edit-icon[data-target="#password-section"]').addEventListener('click', function() {
            const target = document.querySelector(this.getAttribute('data-target'));
            target.classList.remove('d-none');

            this.classList.add('d-none');

            const span = document.querySelector("#password-text")

            // 移除之前的 Save 和 Cancel 按鈕
            document.querySelectorAll('.save-icon, .cancel-icon').forEach(icon => {
                icon.remove();
            });

            const saveIcon = document.createElement('i');
            saveIcon.className = 'fa fa-save save-icon';

            saveIcon.addEventListener('click', function() {
                const currentPassword = document.querySelector('#current-password-input').value;
                const newPassword = document.querySelector('#new-password-input').value;
                const confirmPassword = document.querySelector('#confirm-password-input').value;

                if (newPassword === confirmPassword) {
                    target.classList.add('d-none');
                    document.querySelector('.edit-icon[data-target="#password-section"]').classList.remove('d-none');
                    saveIcon.remove();
                    cancelIcon.remove();
                    userUpdateData.append("current_password", currentPassword.trim());
                    userUpdateData.append("new_password", newPassword.trim());
                    updateUserProfile(userUpdateData)
                    .then(response => {
                        if (response.error) {

                            userUpdateData = new FormData();

                            alert(response.error.message);
                            console.error('Error:', response.error.message);
                            span.classList.remove('d-none');
    
                            currentPassword = "";
                            newPassword = "";
                            confirmPassword = "";
    
                        } else {
                            window.location.reload();
                        }
                    });
                } else {
                    document.querySelector('#password-mismatch-error').classList.remove('d-none');
                }
            });

            const cancelIcon = document.createElement('i');
            cancelIcon.className = 'fa fa-times cancel-icon';

            cancelIcon.addEventListener('click', function() {
                target.classList.add('d-none');
                saveIcon.remove();
                cancelIcon.remove();
                document.querySelector('.edit-icon[data-target="#password-section"]').classList.remove('d-none');
                span.classList.remove('d-none');
            });

            this.parentElement.append(saveIcon, cancelIcon);
        });
    }
});
