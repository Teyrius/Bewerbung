const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  listApplications: () => ipcRenderer.invoke("applications:list"),
  addApplication: (payload) => ipcRenderer.invoke("applications:add", payload),
  updateApplication: (payload) => ipcRenderer.invoke("applications:update", payload),
  deleteApplication: (id) => ipcRenderer.invoke("applications:delete", id)
});
