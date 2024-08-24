document.addEventListener('DOMContentLoaded', () => {
    
    const updateAvatarBtn = document.querySelector('#update-avatar-btn');
    const avatarOptions = document.querySelector('#avatar-options');
    const saveAvatarBtn = document.querySelector('#save-avatar-btn');
  
    if (updateAvatarBtn && avatarOptions && saveAvatarBtn) {
        updateAvatarBtn.addEventListener('click', function() {
            this.classList.add('d-none');  // 隱藏 Update Avatar 按鈕
            avatarOptions.classList.remove('d-none');  // 顯示 Avatar 選項
            saveAvatarBtn.classList.remove('d-none');  // 顯示 Save 按鈕
        });
    }
  
    // 點擊預設的 Avatar 選擇
    document.querySelectorAll('.avatar-option').forEach(avatar => {
        avatar.addEventListener('click', function() {
            console.log('Avatar clicked');  // 調試用

            // 移除其他選擇指示
            document.querySelectorAll('.avatar-select-indicator').forEach(indicator => {
                indicator.classList.add('d-none');
            });

            // 標記選擇的 Avatar
            const wrapper = this.closest('.avatar-option-wrapper');
            if (wrapper) {
                wrapper.querySelector('.avatar-select-indicator').classList.remove('d-none');
            }
        });
    });
  
    if (saveAvatarBtn) {
        saveAvatarBtn.addEventListener('click', function() {
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
