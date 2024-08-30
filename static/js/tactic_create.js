document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = "/";
        return;
    }
    
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', () => {
            const optionContainer = option.parentElement;
            if (optionContainer.classList.contains('multi-select')) {
                option.classList.toggle('selected');
            } else {
                optionContainer.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            }
        });
    });

    document.querySelector(".btn").addEventListener('click', (event) => {
        // 檢查所有輸入及選項是否都有值
        const tacticName = document.getElementById('tacticName').value.trim();
        const playerCount = document.getElementById('playerCount').value;
        const selectedOptions = document.querySelectorAll('.option.selected');

        if (!tacticName) {
            alert('請輸入戰術名稱');
            return;
        }

        if (!playerCount) {
            alert('請選擇人數');
            return;
        }

        const tags = [];
        let level = '';
        let status = '';
        let hasFieldSetup = false;
        let hasModeTag = false;

        selectedOptions.forEach(option => {
            const parentClass = option.parentElement.classList;
            if (parentClass.contains('multi-select')) {
                hasModeTag = true;
                tags.push(option.dataset.value);
            } else if (parentClass.contains('option-blocks')) {
                const containerLabel = option.parentElement.previousElementSibling.innerText.trim();
                if (containerLabel === '場地設置') {
                    hasFieldSetup = true;
                    tags.unshift(option.dataset.value); 
                } else if (containerLabel === '難度') {
                    level = option.dataset.value;
                } else if (containerLabel === '狀態') {
                    status = option.dataset.value;
                }
            }
        });

        if (!hasFieldSetup) {
            alert('請選擇場地設置');
            return;
        }

        if (!hasModeTag) {
            alert('請選擇至少一個模式標籤');
            return;
        }

        if (!level) {
            alert('請選擇難度');
            return;
        }

        if (!status) {
            alert('請選擇狀態');
            return;
        }

        // 整理使用者輸入的資料
        const requestData = {
            name: tacticName,
            player: parseInt(playerCount),
            member_id: parseInt(JSON.parse(atob(token.split('.')[1])).id), // 從 token 中提取 member_id
            tags: tags,
            level: level,
            status: status
        };

        // 發送 POST 請求到 "/api/tactic"
        fetch('/api/tactic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('伺服器錯誤');
            }
            return response.json();
        })
        .then(data => {
            localStorage.removeItem('tactic_id_p');
            // 成功處理，導向下一頁或其他操作
            alert('戰術已成功建立');
            window.location.href = '/createTactic/content'; 
        })
        .catch(error => {
            console.error('錯誤:', error);
            alert('建立戰術失敗，請稍後再試');
        });
    });

    
});