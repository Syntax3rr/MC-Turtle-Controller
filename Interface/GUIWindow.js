document.getElementById('minimize').addEventListener('click', () => {
    window.ipc.send('windowEvent', 'minimize');
});

document.getElementById('maximize').addEventListener('click', () => {
    window.ipc.send('windowEvent', 'maximize');
});

document.getElementById('close').addEventListener('click', () => {
    window.ipc.send('windowEvent', 'exit');
});