const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  onUpdateTasks(callback) {
    const listener = (_event, tasks) => callback(tasks);
    ipcRenderer.on('tasks:update', listener);

    return () => {
      ipcRenderer.removeListener('tasks:update', listener);
    };
  },

  setIgnoreMouseEvents(ignore) {
    ipcRenderer.send('hud:set-ignore-mouse-events', Boolean(ignore));
  }
});
