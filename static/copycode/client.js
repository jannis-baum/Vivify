var clipboard = new ClipboardJS('.copy-button');

//TODO: Implement success callback
clipboard.on('success', function (e) {
    console.log('Copy success!');
    console.info('Trigger:', e.trigger);
    const btn = e.trigger;
    btn.style.fill = '#00ff00';
    setTimeout(() => {
        btn.style.fill = '#0000ff';
    }, 2000);
});

//TODO: Implement failure callback
clipboard.on('error', function (e) {
    console.log('Copy failed!');
    console.error('Trigger:', e.trigger);
});

