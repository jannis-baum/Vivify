let clipboard = new ClipboardJS('.copy-button');

const Icons = {
    Copy: 'icon-copy',
    Success: 'icon-check',
    Fail: 'icon-x',
};

document.querySelectorAll('.icon-check').forEach(function (icon) {
    icon.style.display = 'none';
});
document.querySelectorAll('.icon-x').forEach(function (icon) {
    icon.style.display = 'none';
});

function setIcon(btn, icon) {
    for (let child of btn.children) {
        console.log(child.classList.contains(icon));
        if (child.classList.contains(icon)) {
            child.style.display = 'inline-block';
        } else {
            child.style.display = 'none';
        }
    }
}

//TODO: Implement success callback
clipboard.on('success', function (e) {
    console.info('Trigger:', e.trigger);
    const btn = e.trigger;
    btn.style.fill = '#00ff00';
    btn.children[0].style.display = 'none';
    btn.children[1].style.display = 'inline-block';

    console.log(window.getComputedStyle(document.documentElement).getPropertyValue('--text-primary'));
    console.info(Icons);

    setIcon(btn, Icons.Success);

    setTimeout(() => {
        btn.style.fill = '#0000ff';
        setIcon(btn, Icons.Copy);
    }, 2000);
});

//TODO: Implement failure callback
clipboard.on('error', function (e) {
    console.log('Copy failed!');
    console.error('Trigger:', e.trigger);
});
