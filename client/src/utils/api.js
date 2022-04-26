import axios from 'axios'
import { isProduction } from '@/utils/index'
import EventBus from './eventbus'

const productionUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/api/`
const developmentUrl = 'http://localhost:3333/api/'
const baseurl = isProduction() ? productionUrl : developmentUrl

const urls = {
  getFiles: `${baseurl}getFiles`,
  getRunningState: `${baseurl}getState`,
  getStatistic: (dir) => `${baseurl}getStatistic?dir=${dir}`,
  getNextFolders: `${baseurl}nextDirectories`,
  runCommand: (c) => `${baseurl}runCommand/${c}`,
  calculateStatistic: `${baseurl}calculateStatistic`,
  moveFiles: `${baseurl}moveFiles`,
  deleteFiles: `${baseurl}deleteFiles`,
  uploadFiles: `${baseurl}uploadFiles`,
  getParentDirectory: `${baseurl}getParent`,
  saveFile: `${baseurl}saveFile`,
  checkFolder: (folder) => `${baseurl}checkFolder?folder=${folder}`,
  getSubfolders: (folder) => `${baseurl}getSubfolders?folder=${folder}`,
  createFolder: `${baseurl}createFolder`,
  getWorkspace: `${baseurl}getWorkspace`,
  setWorkspace: `${baseurl}setWorkspace`,
  getLastLogs: `${baseurl}getLastLogs`,
  getLogFor: `${baseurl}logs`,
  login: `${baseurl}login`,
  logout: `${baseurl}logout`,
  getConfig: `${baseurl}config`,
  getExplorerConfig: `${baseurl}explorerConfig`,
  forwardOnly: `${baseurl}forwardOnly`,
  saveNotes: `${baseurl}notes`,
  saveConfig: `${baseurl}saveConfig`,
  listStatistics: `${baseurl}listStatistics`,
  confusionMatrix: `${baseurl}fetchConfusionMatrix`,
  syncDB: `${baseurl}convertToDatabase`,
  backup: `${baseurl}backup`,
  getFoldersByPath: `${baseurl}getFolders`,
  getImageData: `${baseurl}getImageData`,
  setImageData: `${baseurl}setImageData`,
  getImageTags: `${baseurl}getImageTags`,
}

export default {
  getFiles: async (path, to, type, batch, isStatistic) => (await axios.get(urls.getFiles, {
    params: {
      dir: path,
      to,
      type,
      batch,
      isStatistic,
    },
  })).data,
  getParent: async (path, type, batch) => (await axios.get(urls.getParentDirectory, {
    params: {
      dir: path,
      type,
      batch,
    },
  })).data,
  getNextFolders: async (dir, type, ws) => (await axios.get(urls.getNextFolders, {
    params: {
      dir, type, ws,
    },
  })).data,
  getStatistic: async (path) => (await axios.get(urls.getStatistic(path))).data,
  getRunningState: async () => (await axios.get(urls.getRunningState)).data,
  runCommand: async (command) => (await axios.get(urls.runCommand(command))).data,
  // files array like ["/path/to/file1", "/path/to/file2"]
  deleteFiles: async (files, type, batch) => (await axios.post(urls.deleteFiles, { files }, {
    params: {
      type, batch,
    },
  })).data,
  // files array like [{ file: "/path/to/file", moveTo: "/path/to/folder" }]
  moveFiles: async (files, destination, type) => (await axios.post(urls.moveFiles, {
    files,
    destination,
  }, {
    params: {
      type,
    },
  })).data,
  uploadFiles: async (formData) => (await axios.post(urls.uploadFiles,
    formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })).data,
  calculateStatistic: async (dir, safe) => (await axios.get(urls.calculateStatistic, {
    params: {
      safe,
      ...(dir ? { dir } : {}),
    },
  })).data,
  saveFile: async (path, data) => (await axios.post(urls.saveFile, {
    path,
    data,
  })).data,
  checkFolder: async (path) => (await axios.get(urls.checkFolder(path))).data,
  getSubfolders: async (folder) => (await axios.get(urls.getSubfolders(folder))).data,
  createFolder: async (folder, name) => (await axios.post(urls.createFolder, {
    folder,
    name,
  })).data,
  getWorkspace: async () => (await axios.get(urls.getWorkspace)).data,
  setWorkspace: async (workspace, isDB) => (await axios.post(urls.setWorkspace, { workspace, isDB })).data,
  getLastLogs: async () => (await axios.get(urls.getLastLogs)).data,
  getLogFor: async (filename) => (await axios.get(`${urls.getLogFor}/${filename}`)).data,
  login: async (login, password) => {
    let response = null
    try {
      response = await axios.post(urls.login, {
        login,
        password,
      })
      return response.data
    } catch (e) {
      console.log(e.toString())
      if (e.toString()
        .includes('401')) {
        throw new Error('Invalid login or password (401)')
      }
      throw e
    }
  },
  setSessionToken: async (token) => {
    if (!token) {
      await axios.post(urls.logout)
    }
    axios.defaults.headers.common.Authorization = token
  },
  getConfig: async (isDB) => (await axios.get(urls.getConfig, {
    params: {
      isDB,
    },
  })).data,
  getExplorerConfig: async (dir, type) => (await axios.get(urls.getExplorerConfig, { params: { dir, type } })).data,
  doForwardOnly: async (selectedFiles, notSelectedFiles, type, batch) => (await axios.post(urls.forwardOnly, {
    selectedFiles,
    notSelectedFiles,
  }, {
    params: {
      type, batch,
    },
  })).data,
  saveNotes: async (path, notes, highlight) => (await axios.post(urls.saveNotes, {
    path,
    notes,
    highlight,
  })).data,
  saveConfig: async (path, config) => (await axios.post(urls.saveConfig, {
    path,
    config,
  })).data,
  getFoldersByPath: async (dir, type, ws) => (await axios.get(urls.getFoldersByPath, {
    params: {
      dir, type, ws,
    },
  })).data,
  listStatistics: async (dirs = []) => (await axios.post(urls.listStatistics, {
    dirs,
  })).data,
  fetchConfusionMatrix: async (left, right) => (await axios.post(urls.confusionMatrix, {
    left,
    right,
  })).data,
  syncDB: async (wsName) => (await axios.post(urls.syncDB, {
    wsName,
  })).data,
  backup: async (wsName) => (await axios.post(urls.backup, {
    wsName,
  })).data,
  getImageData: async (fileNames) => (await axios.post(urls.getImageData, {
    fileNames,
  })).data,
  setImageData: async ({
    fileNames,
    folder,
    className,
    stars,
    tags,
    note,
  }) => (await axios.post(urls.setImageData, {
    fileNames,
    folder,
    className,
    stars,
    tags,
    note,
  })).data,
  getImageTags: async () => (await axios.get(urls.getImageTags)).data,
}

axios.interceptors.response.use((response) => response, (error) => {
  console.log(error)

  EventBus.$emit('auth_api_error', error)
  console.log(error.response)
  if (error.toString()
    .includes('401')) {
    EventBus.$emit('login', error)
  }
  return Promise.reject(error)
})
