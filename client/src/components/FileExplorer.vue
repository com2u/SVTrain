<template>
  <div
    id="keyupevents"
    tabindex="0"
    v-on:keyup.self.space.exact.prevent="selectCurrent(false)"
    v-on:keyup.self.shift.space.exact.prevent="selectCurrent(true)"
    v-on:keyup.self.down.exact.prevent="cursor('down')"
    v-on:keyup.self.left.exact.prevent="cursor('left')"
    v-on:keyup.self.right.exact.prevent="cursor('right')"
    v-on:keyup.self.enter.exact.prevent="openCurrentFile()"
    v-on:keyup.self.up.exact.prevent="cursor('up')"
  >
    <window-splitting ref="WindowSplitting">
      <template v-slot:side>
        <div class="right-side-section">
          <div class="section-item">
            <span v-if="status !== null">
              <font v-if="status" color=red>Status: {{status}}%</font>
              <font v-else>Status: idle</font>
            </span>
            <span v-else>
              Status: no info
            </span>
          </div>
          <div class="section-item">
            Set file size (in pixels): <input type="number" v-model="fileSize">
          </div>
        </div>

        <div class="right-side-section" v-if="statistic.calculated">
          <button 
            v-bind:disabled="isLoading.statistic"
            v-on:click="calculateStatistic()">
            Statistics{{ isLoading.statistic ? ' (loading...)' : ''}}
          </button><br>
          <span v-if="!statistic.table">
            Statistic: matched={{statistic.matched}}, missed={{statistic.missed}}, missmatched={{statistic.missmatched}}
          </span>
          <button v-b-toggle.statistics v-if="statistic.table">Expand statistic table</button>
          <b-collapse id="statistics" v-on:show="statisticExpanded()" v-on:hide="statisticHidden()">
            <statistic-table 
              v-on:folderselected="selectFolder"
              v-bind:folder="path"
              v-bind:table="statistic.table"/>
          </b-collapse>
        </div>
        <div v-else class="right-side-section">
          Statistic didn't calculated
        </div>
        
        <div class="right-side-section">
          Selected files count: {{ selectedFiles.length }}<br><br>
          <div v-if="selectedFiles.length > 0">
            <a href="javascript:void(0)" v-on:click="deleteFiles()">Delete files</a> <span v-if="isLoading.deleting"><v-icon name="spinner"></v-icon> Removing...</span><br><br>
            Move files to the next folders <span v-if="isLoading.moving"><v-icon name="spinner"></v-icon> (Moving...)</span>:
            <ul style="list-style: none">
              <li v-for="f in nextFolders" v-bind:key="f.path">
                <v-icon name="folder"></v-icon> <a href="javascript:void(0)" v-on:click="moveFiles(f.path)">{{f.name}}</a>
              </li>
            </ul>
          </div>
          <div v-else>
            (select one or more files for show control buttons)
          </div>
        </div>
      </template>
      <template v-slot:main>
        <div class="header">
          <router-link to="/">To main screen</router-link>
          | <b>{{ openedPath }}</b>
        </div>
        <div class="file-explorer-grid bottom-border">
          <new-folder-button v-b-modal.creating-folder-modal/>
          <file
            v-for = "file in folder.folders"
            v-bind:file="file"
            v-on:click.native="goToTheFolder(file)"
            v-bind:key="file.path">
          </file>
        </div>
        <div class="file-explorer-grid" v-infinite-scroll="loadMore">
          <file 
            v-bind:id="`file_${file.path}`"
            v-for="file in screenFiles" 
            v-bind:file="file"
            v-on:click.native="setCursorAndSelect(file, $event)"
            v-on:dblclick.native="openFile(file)"
            v-bind:key="file.path"
            v-bind:size="fileSize">
          </file>
        </div>
      </template>
    </window-splitting>

      <show-file 
        ref="FileViewing"
        v-if="viewingFile"
        v-bind:file="viewingFile"
        v-on:shown="onOpenModal"
        v-on:hidden="onCloseModal"
      />
    <!-- </b-modal> -->
    <creating-folder
      v-on:shown="onOpenModal"
      v-on:hidden="onCloseModal"
      v-bind:path="openedPath || path"
    />
  </div>
</template>

<script>
import File from './File.vue'
import api from '../api'
import socket from '../socket'
import StatisticTable from './StatisticTable.vue'
import ShowFile from './ShowFile.vue'
import CreatingFolder from './CreatingFolder.vue'
import NewFolderButton from './NewFolderButton.vue'
import WindowSplitting from './WindowSplitting.vue'

export default {
  props: [
    'dir'
  ],
  components: {
    File,
    StatisticTable,
    ShowFile,
    CreatingFolder,
    NewFolderButton,
    WindowSplitting
  },
  data: () => ({
    isLoading: {
      deleting: false,
      moving: false,
      statistic: false,
    },
    status: null,
    viewingFile: null,
    statisticShown: false,
    fileSize: 100,
    page: 0,
    page_count: null,
    page_size: 100,
    staticServer: 'http://localhost:2929/',
    path: null,
    openedPath: null,
    showStatistic: false,
    moveDestination: null,
    nextFolders: [],
    statistic: {
      calculated: false,
      matched: null,
      missed: null,
      missmatched: null,
      table: null
    },
    lastSelectedFileIndex: null,
    screenFiles: [],
    folder: {
      files: [],
      folders: []
    },
    createdFolders: [],
    selectedFiles: [],
    filter: {}
  }),
  methods: {
    openCurrentFile () {
      const fileInFocus = this.screenFiles.find(f => f.cursor)
      this.viewingFile = fileInFocus
      this.$nextTick(() => this.$refs.FileViewing.show())
    },
    openFile (file) {
      console.log(file)
      this.viewingFile = file
      this.$nextTick(() => this.$refs.FileViewing.show())
    },
    async calculateStatistic () {
      this.isLoading.statistic = true
      try { await api.calculateStatistic() }
      catch (e) { alert('An error occurred!') }
      await this.loadStatistic(this.path)
      this.isLoading.statistic = false
    },
    async selectFolder({ folder, filter }) {
      const folderFromArray = this.createdFolders.find(f => f.name === folder)
      const openedPath = folderFromArray.path
      console.log(folderFromArray)
      this.filter = filter || {}
      socket.unsubscribeForFolder(this.openedPath)
      await this.loadFiles(folderFromArray.path)
      socket.subscibeForFolder(openedPath, this.fileChanged())
      this.openedPath = openedPath
    },
    statisticExpanded () {
      this.$refs.WindowSplitting.expand()
    },
    statisticHidden () {
      this.$refs.WindowSplitting.shrink()
    },
    setCursorAndSelect (file, $event) {
      const currentCursorFile = this.screenFiles.find(f => f.cursor)
      if (currentCursorFile) currentCursorFile.cursor = false
      file.cursor = true
      if ($event.shiftKey) {
        this.selectCurrent(true)
      } else {
        this.toggleSelect(file)
      }
    },
    /**
     * Scroll browser page to focused image
     * @param {Number} focusFileIndex - Index of file with focus
     */
    scrollToFocusFile (focusFileIndex) {
      const focusedFile = this.screenFiles[focusFileIndex]
      const element = document.getElementById(`file_${focusedFile.path}`)
      const windowHeight = window.innerHeight
      const elementHeight = element.getBoundingClientRect().top - element.getBoundingClientRect().bottom
      if (element) {
        element.scrollIntoView(false)
        window.scrollBy(0, Math.floor(windowHeight / 2) + elementHeight)
      }
    },
    /**
     * Move cursor with "up", "right", "down" and "left" directions
     * Call method scrollToFocusFile if cursor was moved
     * @param {String} to - Direction to move cursor
     */
    cursor (to) {
      console.log('cursor to', to)
      const fileInFocusIndex = this.screenFiles.findIndex(f => f.cursor)
      let nextFileFocusIndex = null
      if (fileInFocusIndex === -1) {
        this.screenFiles[0].cursor = true
        return
      }

      let fileInFocusCoords = null
      switch (to) {
        case 'right':
          if (fileInFocusIndex + 1 < this.screenFiles.length) {
            nextFileFocusIndex = fileInFocusIndex + 1
          }
          break
        case 'left':
          if (fileInFocusIndex > 0) {
            nextFileFocusIndex = fileInFocusIndex - 1
          }
          break
        case 'down':
          fileInFocusCoords = document
            .getElementById(`file_${this.screenFiles[fileInFocusIndex].path}`)
            .getBoundingClientRect()
          for (let i = fileInFocusIndex + 1; i < this.screenFiles.length; ++i) {
            const nextFileCoords = document
              .getElementById(`file_${this.screenFiles[i].path}`)
              .getBoundingClientRect()
            if (fileInFocusCoords.x === nextFileCoords.x) {
              nextFileFocusIndex = i
              break
            }
          }
          break
        case 'up':
          fileInFocusCoords = document
            .getElementById(`file_${this.screenFiles[fileInFocusIndex].path}`)
            .getBoundingClientRect()
          for (let i = fileInFocusIndex - 1; i >= 0; --i) {
            const nextFileCoords = document
              .getElementById(`file_${this.screenFiles[i].path}`)
              .getBoundingClientRect()
            if (fileInFocusCoords.left === nextFileCoords.left) {
              nextFileFocusIndex = i
              break
            }
          }
          break
      }

      if (nextFileFocusIndex || nextFileFocusIndex === 0) {
        this.screenFiles[fileInFocusIndex].cursor = false
        this.screenFiles[nextFileFocusIndex].cursor = true
        this.scrollToFocusFile(nextFileFocusIndex)
      }
    },
    selectCurrent (selectAll) {
      console.log('Select all: ', selectAll)
      const fileInFocusIndex = this.screenFiles.findIndex(f => f.cursor)
      if (fileInFocusIndex === -1) return
      this.toggleSelect(this.screenFiles[fileInFocusIndex], true)
      if (selectAll && (this.lastSelectedFileIndex || this.lastSelectedFileIndex === 0)) {
        const different = fileInFocusIndex - this.lastSelectedFileIndex
        const beginFrom = Math.sign(different) > 0 ? this.lastSelectedFileIndex + 1 : fileInFocusIndex + 1
        const endWith = Math.sign(different) > 0 ? fileInFocusIndex - 1 : this.lastSelectedFileIndex - 1
        console.log(beginFrom, endWith, 'kokoko')
        for (let i = beginFrom; i <= endWith; ++i) {
          this.toggleSelect(this.screenFiles[i], true)
        }
        this.lastSelectedFileIndex = null
      }
      if (!selectAll) {
        this.lastSelectedFileIndex = fileInFocusIndex
      }
    },
    selected: () => {
      console.log('selected')
    },
    toggleSelect: function (file, doNotUpdateLastSelectedFileIndex) {
      console.log(`File ${file.path} ${ file.selected ? 'unselected' : 'selected' }`)
      file.selected = !file.selected
      if ( file.selected ) {
        this.selectedFiles.push(file)
      } else {
        let index = -1
        for ( let i = 0; i < this.selectedFiles.length; ++i ) {
          if ( this.selectedFiles[i].path === file.path ) {
            index = i
            break
          }
        }
        if ( index > -1 ) {
          this.selectedFiles.splice(index, 1)
        }
      }
      if (!doNotUpdateLastSelectedFileIndex) {
        this.lastSelectedFileIndex = this.screenFiles.findIndex(f => f.path === file.path)
      }
    },
    loadStatistic: async function (path) {
      const {
        matched,
        missed,
        missmatched,
        calculated,
        table
      } = await api.getStatistic(path)
      this.statistic.calculated = calculated
      this.statistic.matched = matched
      this.statistic.missed = missed
      this.statistic.missmatched = missmatched
      this.statistic.table = table
      console.log('statistic table: ', this.statistic.table)
    },
    loadFiles: async function (path) {
      // clear old files
      this.folder.files = []
      this.folder.folders = []
      this.screenFiles = []
      this.selectedFiles = []

      // load data
      const content = await api.getFiles(path)
      
      // prepare files
      this.folder.files = content.files.map( f => { 
        f.type ='file'
        f.selected = false
        f.serverPath = this.staticServer+f.relativePath
        f.cursor = false
        return f 
      }).filter(f => {
        console.log(f.name, this.filter.exclude, this.filter.include)
        let excludeFactor = true
        let includeFactor = true
        if (this.filter.exclude) {
          if (f.name.toLowerCase().includes(this.filter.exclude.toLowerCase())) {
            excludeFactor = false
          }
        }
        if (this.filter.include) {
          if (f.name.toLowerCase().includes(this.filter.include.toLowerCase())) {
            includeFactor = true
          } else {
            includeFactor = false
          }
        }
        return includeFactor && excludeFactor
      })

      // prepare folders
      this.folder.folders = content.folders.map( f => { 
        f.type='folder';
        f.selected = false
        return f 
      })

      // add parent dir to folder list
      const parentDir = await api.getParent(path)
      if ( parentDir.access )
        this.folder.folders.unshift({
          path: parentDir.path,
          name: '../',
          type: 'folder'
        })

      // prepare next folder for move
      this.nextFolders = await api.getNextFolders(path)

      // prepare to show page
      this.page = 0
      this.page_count = Math.floor( this.folder.files.length / this.page_size )
      this.addPage(this.page)

      return {
        currentPath: content.path
      }
    },
    addPage: function (p) {
      const startImage = p * this.page_size
      const finishImage = startImage + this.page_size
      for ( let i = startImage; i < finishImage; ++i ) {
        if ( i >= this.folder.files.length ) return
        this.screenFiles.push( this.folder.files[i] )
      }
    },
    loadMore: function () {
      if ( this.folder.files.length === 0 ) return
      if ( this.page >= this.page_count ) return
      this.page++
      this.addPage(this.page)
    },
    goToTheFolder: async function (file) {
      if (file.path === this.path) {
        socket.unsubscribeForFolder(this.openedPath)
        socket.subscibeForFolder(this.path, this.fileChanged())
        this.openedPath = this.path
        this.filter = {}
        await this.loadFiles(this.path)
        return
      }
      if (this.statisticShown && file.path.length > this.path.length) {
        return await this.selectFolder({ folder: file.name, filter: {}})
      }
      this.$router.push({ name: 'explorer', query: { dir: file.path }})
    },
    deleteFiles: async function () {
      if ( this.selectedFiles.length === 0 ) return
      console.log(`Delete files`)
      this.isLoading.deleting = true
      await api.deleteFiles(this.selectedFiles.map(f => f.path))
      this.isLoading.deleting = false
      // delete that files from folder
      // await this.loadFiles(this.path)
    },
    moveFiles: async function (dest) {
      if ( this.selectedFiles.length === 0 ) return
      if ( this.nextFolders.length === 0 ) return
      this.isLoading.moving = true
      await api.moveFiles(this.selectedFiles.map( f => f.path), dest)
      this.isLoading.moving = false
      //move files
      // await this.loadFiles(this.path)
    },
    fileChanged: function () {
      const self = this
      return (file) => {
        console.log(file)
        if ( file.event === 'add' && file.type === 'file' ) {
          file.selected = false
          self.folder.files.push(file)
          if ( self.page === self.page_count ) {
            self.screenFiles.push(file)
          }
        } else if ( file.event === 'add' && file.type === 'folder' ) {
          file.selected = false
          self.folder.folders.push(file)
        } else if ( file.event === 'remove' && file.type === 'folder' ) {
          let index = -1
          for (let i = 0; i < self.folder.folders.length; i++) {
            if (self.folder.folders[i].path === file.path) {
              index = i
              break
            }
          }
          if (index > -1) self.folder.folders.splice(index, 1)
        } else if ( file.event === 'remove' && file.type === 'file' ) {
          let index = -1
          for( let i = 0; i < self.folder.files.length; i++) {
            if (self.folder.files[i].path === file.path ) {
              index = i
              break
            }
          }
          if ( index > -1 ) self.folder.files.splice(index, 1)

          index = -1
          for( let i = 0; i < self.selectedFiles.length; i++) {
            if (self.selectedFiles[i].path === file.path ) {
              index = i
              break
            }
          }
          if ( index > -1 ) self.selectedFiles.splice(index, 1)  
          
          index = -1
          for( let i = 0; i < self.screenFiles.length; i++) {
            if (self.screenFiles[i].path === file.path ) {
              index = i
              break
            }
          }
          if ( index > -1 ) self.screenFiles.splice(index, 1) 
        }
      }
    },
    setFocusOnFiles () {
      console.log('set focus on files')
      window.document.getElementById('keyupevents').focus()
    },
    enablePreventingScrolling () {
      window.addEventListener('keydown', preventDefaultScrolling, false)
    },
    disablePreventingScrolling () {
      window.removeEventListener('keydown', preventDefaultScrolling)
    },
    onOpenModal () {
      this.disablePreventingScrolling()
    },
    onCloseModal () {
      this.setFocusOnFiles()
      this.enablePreventingScrolling()
    }
  },
  created: async function () {
    const { currentPath } = await this.loadFiles(this.dir || null)
    this.createdFolders = this.folder.folders
    await this.loadStatistic( this.dir || currentPath || this.path || null )

    // set current path if he hasn't defined
    this.path = currentPath
    this.openedPath = currentPath

    // subscribe for that folder
    socket.subscibeForFolder(this.path, this.fileChanged())

    // set focus on keyupevents
    this.setFocusOnFiles()

    // get status
    this.status = await api.getRunningState()
    socket.subscibeForFolder('running.lock', data => {
      if (data.event === 'change') this.status = data.content
      if (data.event === 'unlink') this.status = false
    })
    this.enablePreventingScrolling()
  },
  beforeDestroy: function () {
    socket.unsubscribeForFolder(this.path)
    socket.unsubscribeForFolder('running.lock')
  }
}

function preventDefaultScrolling (e) {
  // space and arrow keys
  if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault();
  }
}
</script>

<style lang="scss">
#keyupevents {
  outline: none;
}
.file-container {
  width: calc(100% - 250px);
}
.next-folders {
  height: 100%;
  overflow-y: auto;
  width: 240px;
  position: fixed;
  top: 10px;
  right: 0px
}
.right-side-section {
  margin-top: 10px;
  border: 1px solid black;
  padding: 5px;
}
.file-explorer-grid {
  display: flex;
  flex-wrap: wrap;
}
.file-explorer-controls {
  svg { 
    cursor: pointer; 
  }
  &.disable {
    color: silver;
    svg {
      cursor: default;
    }
  }
}
.bottom-border {
  border-bottom: 1px dashed silver;
}
</style>

