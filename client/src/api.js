import axios from 'axios'

const baseurl = `https://localhost:3333/`
const urls = {
  getFiles: dir => `${baseurl}getFiles?dir=${dir}`,
  getRunningState: `${baseurl}getState`,
  getStatistic: dir => `${baseurl}getStatistic?dir=${dir}`,
  getNextFolders: dir => `${baseurl}nextDirectories?dir=${dir}`,
  runCommand: c => `${baseurl}runCommand/${c}`,
  calculateStatistic: `${baseurl}calculateStatistic`,
  moveFiles: `${baseurl}moveFiles`,
  deleteFiles: `${baseurl}deleteFiles`,
  getParentDirectory: dir => `${baseurl}getParent?dir=${dir}`,
  saveFile: `${baseurl}saveFile`,
  checkFolder: folder => `${baseurl}checkFolder?folder=${folder}`,
  getSubfolders: folder => `${baseurl}getSubfolders?folder=${folder}`,
  createFolder: `${baseurl}createFolder`,
  getWorkspace: `${baseurl}getWorkspace`,
  setWorkspace: `${baseurl}setWorkspace`,
  getLastLogs: `${baseurl}getLastLogs`,
  login: `${baseurl}login`,
  getConfig: `${baseurl}config`,
  forwardOnly: `${baseurl}forward-only`,
}

export default {
  getFiles: async (path) => {
    return (await axios.get(urls.getFiles(path || ''))).data
  },

  getParent: async path => {
    return (await axios.get(urls.getParentDirectory(path))).data
  },

  getNextFolders: async (path) => {
    return (await axios.get(urls.getNextFolders(path))).data
  },

  getStatistic: async (path) => {
    return (await axios.get(urls.getStatistic(path))).data
  },

  getRunningState: async () => {
    return (await axios.get(urls.getRunningState)).data
  },

  runCommand: async (command) => {
    return (await axios.get(urls.runCommand(command))).data
  },

  // files array like ["/path/to/file1", "/path/to/file2"]
  deleteFiles: async (files) => {
    return (await axios.post(urls.deleteFiles, {files})).data
  },

  // files array like [{ file: "/path/to/file", moveTo: "/path/to/folder" }]
  moveFiles: async (files, destination) => {
    return (await axios.post(urls.moveFiles, {files, destination})).data
  },

  calculateStatistic: async () => {
    return (await axios.get(urls.calculateStatistic)).data
  },

  saveFile: async (path, data) => {
    console.log(path, data)
    return (await axios.post(urls.saveFile, {path, data})).data
  },

  checkFolder: async (path) => {
    return (await axios.get(urls.checkFolder(path))).data
  },

  getSubfolders: async (folder) => {
    return (await axios.get(urls.getSubfolders(folder))).data
  },

  createFolder: async (folder, name) => {
    return (await axios.post(urls.createFolder, {folder, name})).data
  },

  getWorkspace: async () => {
    return (await axios.get(urls.getWorkspace)).data
  },

  setWorkspace: async (workspace) => {
    return (await axios.post(urls.setWorkspace, {workspace})).data
  },
  getLastLogs: async () => {
    return (await axios.get(urls.getLastLogs)).data
  },
  login: async (login, password) => {
    let response = null
    console.log('aga')
    try {
      response = await axios.post(urls.login, {login, password})
      return response.data
    } catch (e) {
      console.log(e.toString())
      if (e.toString().includes('401')) {
        throw new Error('Invalid login or password (401)')
      }
      throw e
    }
  },

  setSessionToken: token => {
    axios.defaults.headers.common['Authorization'] = token
  },

  getConfig: async () => {
    return (await axios.get(urls.getConfig)).data
  },

  doForwardOnly: async (selectedFiles, notSelectedFiles) => {
    return (await axios.post(urls.forwardOnly, {selectedFiles, notSelectedFiles})).data
  }
}

axios.interceptors.response.use(function (response) {
  return response
}, function (error) {
  if (error.toString().includes('401')) {
    window.location.href = '#/login'
  }
  return Promise.reject(error)
})
