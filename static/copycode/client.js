let clipboard = new ClipboardJS('.copy-button');

// Setup copy button icons
const Icons = {
    Copy: {
        Class: 'icon-copy',
        ForgroundColor: '',
        BackgroundColor: '',
    },
    Success: {
        Class: 'icon-check',
        ForgroundColor: '',
        BackgroundColor: '',
    },
    Fail: {
        Class: 'icon-x',
        ForgroundColor: '',
        BackgroundColor: '',
    },
};

// Get icon color values from css
function getIconColors() {
    let element = window.getComputedStyle(document.documentElement);
    Object.entries(Icons).forEach(([, icon]) => {
        icon.ForgroundColor = element.getPropertyValue(`--${icon.Class}-primary`);
        icon.BackgroundColor = element.getPropertyValue(`--${icon.Class}-secondary`);
    });
}
getIconColors();

// TODO: add event handle for color scheme change

// TODO: Replace this with a loop of the setIcon function
document.querySelectorAll('.icon-check').forEach(function (icon) {
    icon.style.display = 'none';
});
document.querySelectorAll('.icon-x').forEach(function (icon) {
    icon.style.display = 'none';
});

function setIcon(btn, icon) {
    for (let child of btn.children) {
        console.log(child.classList.contains(icon.Class));
        if (child.classList.contains(icon.Class)) {
            child.style.display = 'inline-block';
            btn.style.fill = icon.ForgroundColor;
            btn.style.background = icon.BackgroundColor;
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
