document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', () => {
        if (option.parentElement.classList.contains('multi-select')) {
            option.classList.toggle('selected');
        } else {
            document.querySelectorAll('.option-blocks .option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        }
    });
});
