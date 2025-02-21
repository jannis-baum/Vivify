document.querySelectorAll('.copy-success, .copy-fail').forEach((element) => {
    element.style.display = 'none';
});

const Notify = {
    Success: '.copy-success',
    Fail: '.copy-fail',
};

let clipboard = new ClipboardJS('.copy-button');

clipboard.on('success', function (e) {
    showNotification(e.trigger, Notify.Success);
});

clipboard.on('error', function (e) {
    showNotification(e.trigger, Notify.Fail);
});

function showNotification(btn, notify) {
    const notificationElement = btn.parentElement.querySelector(notify);
    notificationElement.style.display = 'flex';
    setTimeout(() => {
        notificationElement.style.display = 'none';
    }, 2000);
}
