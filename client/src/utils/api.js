import axios from 'axios'
import { isProduction } from '@/utils/index'
import EventBus from './eventbus'

const productionUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/api/`
const developmentUrl = 'http://localhost:3333/api/'
const baseurl = isProduction() ? productionUrl : developmentUrl

const urls = {
  getFiles: (dir, to) => `${baseurl}getFiles?dir=${dir}&to=${to || ''}`,
  getRunningState: `${baseurl}getState`,
  getStatistic: (dir) => `${baseurl}getStatistic?dir=${dir}`,
  getNextFolders: (dir) => `${baseurl}nextDirectories?dir=${dir}`,
  runCommand: (c) => `${baseurl}runCommand/${c}`,
  calculateStatistic: `${baseurl}calculateStatistic`,
  moveFiles: `${baseurl}moveFiles`,
  deleteFiles: `${baseurl}deleteFiles`,
  getParentDirectory: (dir) => `${baseurl}getParent?dir=${dir}`,
  saveFile: `${baseurl}saveFile`,
  checkFolder: (folder) => `${baseurl}checkFolder?folder=${folder}`,
  getSubfolders: (folder) => `${baseurl}getSubfolders?folder=${folder}`,
  createFolder: `${baseurl}createFolder`,
  getWorkspace: `${baseurl}getWorkspace`,
  setWorkspace: `${baseurl}setWorkspace`,
  getLastLogs: `${baseurl}getLastLogs`,
  login: `${baseurl}login`,
  getConfig: `${baseurl}config`,
  getExplorerConfig: `${baseurl}explorerConfig`,
  forwardOnly: `${baseurl}forward-only`,
  saveNotes: `${baseurl}notes`,
  saveConfig: `${baseurl}save-config`,
  listStatistics: `${baseurl}list-statistics`,
  confusionMatrix: `${baseurl}fetch-confusion-matrix`,
  getFoldersByPath: (dir) => (dir ? `${baseurl}get-folders?dir=${dir}` : `${baseurl}get-folders`),
}

export default {
  getFiles: async (path, to) => (await axios.get(urls.getFiles(path || '', to))).data,
  getParent: async (path) => (await axios.get(urls.getParentDirectory(path))).data,
  getNextFolders: async (path) => (await axios.get(urls.getNextFolders(path))).data,
  getStatistic: async (path) => (await axios.get(urls.getStatistic(path))).data,
  getRunningState: async () => (await axios.get(urls.getRunningState)).data,
  runCommand: async (command) => (await axios.get(urls.runCommand(command))).data,
  // files array like ["/path/to/file1", "/path/to/file2"]
  deleteFiles: async (files) => (await axios.post(urls.deleteFiles, { files })).data,
  // files array like [{ file: "/path/to/file", moveTo: "/path/to/folder" }]
  moveFiles: async (files, destination) => (await axios.post(urls.moveFiles, {
    files,
    destination,
  })).data,
  calculateStatistic: async () => (await axios.get(urls.calculateStatistic)).data,
  saveFile: async (path, data) => {
    console.log(path, data)
    return (await axios.post(urls.saveFile, {
      path,
      data,
    })).data
  },
  checkFolder: async (path) => (await axios.get(urls.checkFolder(path))).data,
  getSubfolders: async (folder) => (await axios.get(urls.getSubfolders(folder))).data,
  createFolder: async (folder, name) => (await axios.post(urls.createFolder, {
    folder,
    name,
  })).data,
  getWorkspace: async () => (await axios.get(urls.getWorkspace)).data,
  setWorkspace: async (workspace) => (await axios.post(urls.setWorkspace, { workspace })).data,
  getLastLogs: async () => (await axios.get(urls.getLastLogs)).data,
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
  setSessionToken: (token) => {
    axios.defaults.headers.common.Authorization = token
  },
  getConfig: async () => (await axios.get(urls.getConfig)).data,
  getExplorerConfig: async (dir) => (await axios.get(urls.getExplorerConfig, { params: { dir } })).data,
  doForwardOnly: async (selectedFiles, notSelectedFiles) => (await axios.post(urls.forwardOnly, {
    selectedFiles,
    notSelectedFiles,
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
  getFoldersByPath: async (dir = null) => (await axios.get(urls.getFoldersByPath(dir))).data,
  listStatistics: async (dirs = []) => (await axios.post(urls.listStatistics, {
    dirs,
  })).data,
  fetchConfusionMatrix: async (left, right) => (await axios.post(urls.confusionMatrix, {
    left,
    right,
  })).data,
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
