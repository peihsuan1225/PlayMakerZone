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
            this.classList.add('d-none');  // 隱藏 Update Avatar 按鈕
            avatarOptions.classList.remove('d-none');  // 顯示 Avatar 選項
            saveAvatarBtn.classList.remove('d-none');  // 顯示 Save 按鈕
            cancelAvatarBtn.classList.remove('d-none');
        });
    }
  
    // 選取所有的 selectable-circle 元素
    const circles = document.querySelectorAll('.selectable-circle');

    // 為每個 circle 元素添加點擊事件監聽器
    circles.forEach(function(circle) {
        circle.addEventListener('click', function() {
            // 移除所有圓形的 selected class
            circles.forEach(function(c) {
                c.classList.remove('selected');
            });

            // 為當前被點擊的圓形添加 selected class
            circle.classList.add('selected');
        });
    });

  
    if (saveAvatarBtn) {
        saveAvatarBtn.addEventListener('click', function() {
            avatarOptions.classList.add('d-none');
            updateAvatarBtn.classList.remove('d-none');
            this.classList.add('d-none');
        });
    }
    
    if (cancelAvatarBtn) {
        cancelAvatarBtn.addEventListener('click', function() {
            avatarOptions.classList.add('d-none');
            updateAvatarBtn.classList.remove('d-none');
            this.classList.add('d-none');
        });
    }

    // 點擊編輯圖標邏輯
    document.querySelectorAll('.edit-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const target = document.querySelector(this.getAttribute('data-target'));
            const span = this.previousElementSibling;
  
            if (target) {
                span.classList.add('d-none');
                target.classList.remove('d-none');
            }
  
            this.classList.add('d-none');
  
            // 移除之前的 Save 和 Cancel 按鈕
            document.querySelectorAll('.save-icon, .cancel-icon').forEach(icon => {
                icon.remove();
            });

            const saveIcon = document.createElement('i');
            saveIcon.className = 'fa fa-save save-icon';
            saveIcon.style.marginRight = '10px'; // 增加儲存和取消之間的間距
  
            saveIcon.addEventListener('click', function() {
                span.textContent = target.value;
                span.classList.remove('d-none');
                target.classList.add('d-none');
                saveIcon.remove();
                cancelIcon.remove();
                icon.classList.remove('d-none');
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

            // 移除之前的 Save 和 Cancel 按鈕
            document.querySelectorAll('.save-icon, .cancel-icon').forEach(icon => {
                icon.remove();
            });

            const saveIcon = document.createElement('i');
            saveIcon.className = 'fa fa-save save-icon';
            saveIcon.style.marginRight = '10px';

            saveIcon.addEventListener('click', function() {
                const currentPassword = document.querySelector('#current-password-input').value;
                const newPassword = document.querySelector('#new-password-input').value;
                const confirmPassword = document.querySelector('#confirm-password-input').value;

                if (newPassword === confirmPassword) {
                    document.querySelector('#password-text').textContent = '********';
                    target.classList.add('d-none');
                    document.querySelector('.edit-icon[data-target="#password-section"]').classList.remove('d-none');
                    saveIcon.remove();
                    cancelIcon.remove();
                } else {
                    document.querySelector('#password-mismatch-error').classList.remove('d-none');
                }
            });

            const cancelIcon = document.createElement('i');
            cancelIcon.className = 'fa fa-times cancel-icon';

            cancelIcon.addEventListener('click', function() {
                target.classList.add('d-none');
                document.querySelector('#password-text').textContent = '********';
                saveIcon.remove();
                cancelIcon.remove();
                document.querySelector('.edit-icon[data-target="#password-section"]').classList.remove('d-none');
            });

            this.parentElement.append(saveIcon, cancelIcon);
        });
    }
});
