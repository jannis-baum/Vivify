let clipboard = new ClipboardJS('.copy-button');

// Setup copy button icons
const Icons = {
    Copy: {
        Class: 'icon-copy',
        ForegroundColor: '',
        BackgroundColor: '',
    },
    Success: {
        Class: 'icon-check',
        ForegroundColor: '',
        BackgroundColor: '',
    },
    Fail: {
        Class: 'icon-x',
        ForegroundColor: '',
        BackgroundColor: '',
    },
};
resetButtons();
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', resetButtons);

function resetButtons() {
    getIconColors();
    document.querySelectorAll('.copy-button').forEach((btn) => {
        setIcon(btn, Icons.Copy);
    });
}

// Get icon color values from css
function getIconColors() {
    console.log('getting colors');
    let element = window.getComputedStyle(document.documentElement);
    Object.entries(Icons).forEach(([, icon]) => {
        icon.ForegroundColor = element.getPropertyValue(`--${icon.Class}-fg`);
        icon.BackgroundColor = element.getPropertyValue(`--${icon.Class}-bg`);
    });
}

function setIcon(btn, icon) {
    for (let child of btn.children) {
        console.log(child.classList.contains(icon.Class));
        if (child.classList.contains(icon.Class)) {
            child.style.display = 'inline-block';
            btn.style.setProperty('--copy-button-fg', icon.ForegroundColor);
            btn.style.setProperty('--copy-button-bg', icon.BackgroundColor);
        } else {
            child.style.display = 'none';
        }
    }
}

//TODO: Implement success callback
clipboard.on('success', function (e) {
    console.info('Trigger:', e.trigger);
    const btn = e.trigger;

    console.info(Icons);

    setIcon(btn, Icons.Success);

    setTimeout(() => {
        setIcon(btn, Icons.Copy);
    }, 2000);
});

//TODO: Implement failure callback
clipboard.on('error', function (e) {
    console.log('Copy failed!');
    console.error('Trigger:', e.trigger);
});
