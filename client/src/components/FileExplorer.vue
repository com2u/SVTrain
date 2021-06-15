<template>
  <div
    id="keyupevents"
    tabindex="0"
    @keyup.self.exact.shift.space="selectCurrent(true)"
    @keyup.left="shiftingMove($event, 'left')"
    @keyup.up="shiftingMove($event, 'up')"
    @keyup.down="shiftingMove($event, 'down')"
    @keyup.right="shiftingMove($event, 'right')"
    @keyup.self.exact.107="zoomIn(true)"
    @keyup.self.exact.187="zoomIn(true)"
    @keyup.self.exact.109="zoomOut(true)"
    @keyup.self.exact.189="zoomOut(true)"
    @keyup.self.exact.stop.prevent="onKeyUp"
  >
    <div tabindex="0"></div>
    <window-splitting ref="WindowSplitting">
      <template v-slot:side>
        <div class="right-side-section">
          <div class="section-item">
            <svg-icon
              v-b-popover.hover.html.top="'<b>-</b>'" title="Shortcut"
              icon-class="zoom-out" class="section-icon" @click="zoomOut"/>
            <svg-icon
              v-b-popover.hover.html.top="'<b>+</b>'" title="Shortcut"
              icon-class="zoom-in" class="section-icon" @click="zoomIn"/>
            <svg-icon icon-class="info" class="section-icon" @click="showShortcutsModal"/>
            <b-button @click="showStatistic" :disabled="!canViewStatistics" class="statistic-btn">
              <b-icon icon="bar-chart-fill"/>
              <span> Statistic</span>
            </b-button>
          </div>
          <div v-if="imageViewer" class="image-viewer-ctn">
            <b-button variant="primary" :disabled="!viewerImages.length" @click="showImageViewer">Show selected images</b-button>
          </div>
        </div>
        <div v-if="systemConfig.moveMenu" class="right-side-section">
          Selected files count: {{ selectedFiles.length }}<br><br>
          <div v-if="selectedFiles.length > 0 && canSeeMoveMenu">
            <div v-if="forwardOnly && nextFolders.length === 0">
              <div>
              Please confirm images that show a/an
              </div>
              <div class="link-current-folder">{{relativeDir}}</div>
            </div>
            <span v-else>
              Please select images and move them to the according defect class
            </span>
            <span v-if="isLoading.moving"><v-icon
              name="spinner"></v-icon> (Moving...)</span>:
            <div class="next-folders">
              <div v-for="f in nextFolders" v-bind:key="f.path" @click="moveFiles(f.path)">
                <span v-if="showNavigationIcon">
                  <img v-if="f.icon" :src="`${staticServer}${f.icon}`" alt="icon"
                       class="next-folders-icon">
                <span v-else>
                  <svg-icon icon-class="unknown"/>
                </span>
                </span>
                <span class="folder-name" :style="{fontSize: fontSize}">{{f.name}}</span>
              </div>
              <div>
                <span v-if="showNavigationIcon">
                  <svg-icon icon-class="delete"/>
                </span>
                <span
                  class="folder-name"
                  :style="{fontSize: fontSize}"
                  @click="deleteFiles()">
                  Delete image(s)
                </span>
              </div>
            </div>
          </div>
          <div v-else>
            (Select one or more images to show defect class buttons)
          </div>
        </div>
        <div v-if="systemConfig.forwardLocation === 'right'" class="right-side-section">
          <div class="pagination-group">
            <template v-if="forwardOnly">
              <b-button
                class="confirm-btn"
                v-b-popover.hover.html.top="'<b>PageDown</b>'" title="Shortcut"
                variant="primary" size="sm" @click="forward()">
                <b-icon icon="folder-fill" v-if="showNavigationIcon"></b-icon>
                Confirm
              </b-button>
            </template>
            <template v-else>
              <b-button
                v-b-popover.hover.html.top="'<b>PageUp</b>'" title="Shortcut"
                variant="primary"
                size="sm"
                @click="backward()">
                <b-icon icon="chevron-left"></b-icon>
                Backward
              </b-button>
              <b-button
                style="margin-left: 10px"
                v-b-popover.hover.html.top="'<b>PageDown</b>'" title="Shortcut"
                variant="primary" size="sm" @click="forward()">Forward
                <b-icon icon="chevron-right"></b-icon>
              </b-button>
            </template>
          </div>
        </div>
        <div v-if="showExplorerNotes" class="right-side-section">
          <b-form-textarea :disabled="!systemConfig['editExplorerNotes']" id="textarea" v-model="notesContent" rows="3" placeholder="Note"/>
        </div>
        <div class="right-side-section">
          <b-form-checkbox v-model="notesHighlight" :disabled="! (showExplorerNotes && systemConfig['editExplorerNotes'])">Highlight Note</b-form-checkbox>
        </div>
        <div v-if="showExplorerNotes && systemConfig['editExplorerNotes']" class="right-side-section">
          <b-button size="sm" variant="primary" @click="saveNotes()">Save notes</b-button>
        </div>
      </template>
      <template v-slot:main>
        <div class="mb-2 d-flex flex-column">
          <div><strong>{{relativeDir}}</strong></div>
          <div v-if="!['defectclass', 'batch', 'ws'].includes(type)" class="list-folders">
            <div class="list-folder-item" v-for="file in folder.folders" :key="file.path">
              <file
                v-if="file.shortcut"
                v-b-popover.hover.html.top="`<b>${file.shortcut}</b>`" title="Shortcut"
                class="folder"
                v-bind:file="file"
                v-on:click.native="goToTheFolder(file)">
              </file>
              <file
                v-else
                class="folder"
                v-bind:class="{'text-primary': !file.name}"
                v-bind:file="file"
                :icon-name="file.name ? null: 'arrow-alt-circle-left'"
                v-on:click.native="goToTheFolder(file)">
              </file>
            </div>
            <div class="list-folder-item" v-if="systemConfig.newFolder && newFolder">
              <new-folder-button @click.native="createNewFolder"/>
            </div>
          </div>
        </div>
        <div class="mb-2 mt-2" v-if="systemConfig.forwardLocation === 'top'">
          <div class="pagination-group">
            <b-button
              class="mr-2"
              v-if="!forwardOnly"
              variant="primary"
              size="sm"
              @click="backward()">
              <b-icon icon="chevron-left"></b-icon>Backward
            </b-button>
            <b-button variant="primary" size="sm" @click="forward()">Forward
              <b-icon icon="chevron-right"></b-icon>
            </b-button>
            <span v-if="currentIndexPage()" class="ml-2">{{currentIndexPage()}}</span>
          </div>
        </div>
        <div class="file-explorer-grid">
          <file
            zoom-able
            v-for="(file, index) in screenFiles"
            v-b-popover.hover.html.top="index < 10 ? `<b>${(index + 1) % 10}</b>` : null"
            :title="index< 10 ? 'Shortcut' : null"
            :show-file-name="showFileName"
            :id="`file_${file.path}`"
            :file="file"
            :key="file.path"
            :size="defaultFileSize"
            @click.native="setCursorAndSelect(file, $event)"
            @dblclick.native="openFile(file)"/>
        </div>
      </template>
    </window-splitting>
    <show-file
      ref="FileViewing"
      v-if="viewingFile"
      v-bind:file="viewingFile"
      v-on:shown="onOpenModal"
      v-on:hidden="onCloseModal"
      @navigate="imageShowNavigate"
    />
    <!-- </b-modal> -->
    <creating-folder
      @folder-created="onFolderCreated"
      v-on:shown="onOpenModal"
      v-on:hidden="onCloseModal"
      v-bind:path="openedPath || path"
    />
    <b-modal v-model="showShortcuts" title="Shortcuts" size="lg">
      <div>
        <b-row>
          <b-col>
            <div v-for="shortcut in shortCuts.left" :key="shortcut.label" class="shortcut-item">
              <div>{{shortcut.label}}</div>
              <div class="shortcut-btn">
                <span v-for="key in shortcut.keys" :key="key">{{key}}</span>
              </div>
            </div>

          </b-col>
          <b-col>
            <div v-for="shortcut in shortCuts.right" :key="shortcut.label" class="shortcut-item">
              <div>{{shortcut.label}}</div>
              <div class="shortcut-btn">
                <span v-for="key in shortcut.keys" :key="key">{{key}}</span>
              </div>
            </div>
          </b-col>
        </b-row>
      </div>
      <template v-slot:modal-footer><span></span></template>
    </b-modal>
    <v-gallery :images="viewerImages" :index="viewerIndex" @close="viewerIndex = null" />
  </div>
</template>

<script>
/* eslint no-plusplus: 0 */
/* eslint no-param-reassign: 0 */
import { mapGetters } from 'vuex'
import { getFileServerPath } from '@/utils'
import api from '@/utils/api'
import socket from '@/utils/socket'
import EventBus from '@/utils/eventbus'
import File from './File.vue'
import ShowFile from './ShowFile.vue'
import CreatingFolder from './CreatingFolder.vue'
import NewFolderButton from './NewFolderButton.vue'
import WindowSplitting from './WindowSplitting.vue'

function preventDefaultScrolling(e) {
  // space and arrow keys
  if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
    e.preventDefault()
  }
}

export default {
  props: [
    'dir',
    'type',
  ],
  components: {
    File,
    ShowFile,
    CreatingFolder,
    NewFolderButton,
    WindowSplitting,
  },
  data: () => ({
    viewerIndex: null,
    isLoading: {
      deleting: false,
      moving: false,
      statistic: false,
    },
    showShortcuts: false,
    status: null,
    viewingFile: null,
    statisticShown: false,
    fileSize: 100,
    minFileSize: 20,
    maxFileSize: 1000,
    page: 0,
    page_count: null,
    perPage: 10,
    staticServer: getFileServerPath(),
    path: null,
    openedPath: null,
    moveDestination: null,
    nextFolders: [],
    statistic: {
      calculated: false,
      matched: null,
      missed: null,
      missmatched: null,
      table: null,
    },
    lastSelectedFileIndex: null,
    screenFiles: [],
    folder: {
      files: [],
      folders: [],
      total_file: 0,
    },
    createdFolders: [],
    selectedFiles: [],
    filter: {},
    shortCuts: {
      left: [
        {
          label: 'Zoom In',
          keys: ['-'],
        },
        {
          label: 'Select/Unselect Image',
          keys: ['Space'],
        },
        {
          label: 'Move left',
          keys: ['Left'],
        },
        {
          label: 'Move up',
          keys: ['Up'],
        },
        {
          label: 'Backward',
          keys: ['PageUp'],
        },
        {
          label: 'Select image by index',
          keys: ['1, 2, ...9, 0'],
        },
      ],
      right: [
        {
          label: 'Zoom Out',
          keys: ['+'],
        },
        {
          label: 'Multiple select',
          keys: ['Shift', 'Space'],
        },
        {
          label: 'Move right',
          keys: ['Right'],
        },
        {
          label: 'Move down',
          keys: ['Down'],
        },
        {
          label: 'Forward / Confirm',
          keys: ['PageDown'],
        },
        {
          label: 'Select folder by name',
          keys: ['A-Z'],
        },
      ],
    },
    fileSizeRatio: 1,
  }),
  computed: {
    notesContent: {
      get() {
        return this.$store.state.notes.folder.notes
      },
      set(val) {
        this.$store.dispatch('notes/setContent', val)
      },
    },
    notesHighlight: {
      get() {
        return this.$store.state.notes.folder.highlight
      },
      set(val) {
        this.$store.dispatch('notes/setHighlight', val)
      },
    },
    viewerImages() {
      return this.selectedFiles.map((file) => file.serverPath)
    },
    backgroundCalculating() {
      return this.$store.state.app.calculating
    },
    fontSize() {
      const config = this.systemConfig
      if (config.rightMenu && config.rightMenu.fontSize) {
        return config.rightMenu.fontSize
      }
      return '1rem'
    },
    configFilePerPage() {
      const config = this.systemConfig
      if (Number.isInteger(config.filePerPage) && config.filePerPage >= 0) {
        return config.filePerPage
      }
      return 0
    },
    forwardOnly() {
      return this.systemConfig.forwardOnly
    },
    showFileName() {
      return this.systemConfig.showFileName
    },
    systemConfig() {
      return this.$store.state.app.explorerConfig
    },
    defaultFileSize() {
      if (typeof this.systemConfig.defaultPictureSize === 'object') {
        return {
          width: this.systemConfig.defaultPictureSize.width * this.fileSizeRatio,
          height: this.systemConfig.defaultPictureSize.height * this.fileSizeRatio,
        }
      }
      return {
        width: this.systemConfig.defaultPictureSize * this.fileSizeRatio,
        height: this.systemConfig.defaultPictureSize * this.fileSizeRatio,
      }
    },
    relativeDir() {
      const { root } = this.systemConfig
      return this.dir && root ? this.dir.substring(root.length) : this.dir
    },
    ...mapGetters([
      'newFolder',
      'canViewStatistics',
      'canSeeMoveMenu',
      'imageViewer',
      'showNavigationIcon',
      'showExplorerNotes',
    ]),
  },
  watch: {
    configFilePerPage() {
      if (this.configFilePerPage) {
        this.perPage = this.configFilePerPage
      } else {
        this.perPage = 100
      }
      this.calculatePage(this.page)
    },
  },
  mounted() {
    const c = this.systemConfig && this.systemConfig.imgContrast ? this.systemConfig.imgContrast : 100
    const b = this.systemConfig && this.systemConfig.imgBrightness ? this.systemConfig.imgBrightness : 100
    document.getElementsByTagName('body')[0].style.setProperty('--image--filter', `contrast(${c}%) brightness(${b}%)`)
  },
  methods: {
    imageShowNavigate(flag) {
      const files = this.screenFiles.filter((x) => !x.selected || x.path === this.viewingFile.path)
      const index = files.map((x) => x.path).indexOf(this.viewingFile.path)
      let next = 0
      if (flag === 'prev') {
        next = index > 0 ? index - 1 : files.length - 1
      } else {
        next = index < files.length - 1 ? index + 1 : 0
      }
      this.viewingFile = files[next]
    },
    saveNotes() {
      this.$store.dispatch('notes/save')
    },
    showImageViewer() {
      if (this.selectedFiles.length) {
        this.viewerIndex = 0
      }
    },
    zoomIn(byShortCut = false) {
      if (!this.systemConfig.useShortcuts && byShortCut) return
      this.fileSizeRatio += 0.05
    },
    zoomOut(byShortCut = false) {
      if (!this.systemConfig.useShortcuts && byShortCut) return
      this.fileSizeRatio -= 0.05
    },
    showShortcutsModal() {
      this.showShortcuts = true
    },
    onKeyUp(event) {
      if (event) {
        event.preventDefault()
      }
      if (!this.systemConfig.useShortcuts) return
      const keys = {
        space: 32,
        pageUp: 33,
        pageDown: 34,
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        delete: 46,
        digit0: 48,
        digit9: 57,
        numpad0: 96,
        numpad9: 105,
        a: 65,
        z: 90,
      }
      switch (event.keyCode) {
        case keys.left:
          this.cursor('left')
          break
        case keys.up:
          this.cursor('up')
          break
        case keys.right:
          this.cursor('right')
          break
        case keys.down:
          this.cursor('down')
          break
        case keys.space:
          this.selectCurrent(false)
          break
        case keys.delete:
          this.deleteFiles()
          break
        case keys.pageUp:
          this.backward()
          break
        case keys.pageDown:
          this.forward()
          break
        default:
          if (event.keyCode >= keys.a && event.keyCode <= keys.z) {
            this.selectFolderByLetter(event.key)
          } else if ((event.keyCode >= keys.digit0 && event.keyCode <= keys.digit9)
              || (event.keyCode >= keys.numpad0 && event.keyCode <= keys.numpad9)) {
            const number = event.keyCode < keys.numpad0 ? event.keyCode - keys.digit0 : event.keyCode - keys.numpad0
            this.selectFileByIndex(number)
          }
          break
      }
    },
    selectFolderByLetter(letter) {
      const folder = this.folder.folders.find((f) => f.name.toLowerCase()
        .startsWith(letter))
      if (folder) this.goToTheFolder(folder)
    },
    selectFileByIndex(number) {
      const index = (number + 10) % 11
      if (this.screenFiles.length > index) {
        this.toggleSelect(this.screenFiles[index])
      }
    },
    openCurrentFile() {
      this.viewingFile = this.screenFiles.find((f) => f.cursor)
      this.$nextTick(() => this.$refs.FileViewing.show())
    },
    openFile(file) {
      this.viewingFile = file
      this.$nextTick(() => this.$refs.FileViewing.show())
    },
    async calculateStatistic() {
      this.isLoading.statistic = true
      try {
        await api.calculateStatistic()
      } catch (e) {
        console.error('An error occurred!')
      }
      await this.loadStatistic(this.path)
      this.isLoading.statistic = false
    },
    async selectFolder({ folder, filter }) {
      const folderFromArray = this.createdFolders.find((f) => f.name === folder)
      const openedPath = folderFromArray.path
      this.filter = filter || {}
      socket.unsubscribeForFolder(this.openedPath)
      await this.loadFiles(folderFromArray.path)
      socket.subscibeForFolder(openedPath, this.fileChanged())
      this.openedPath = openedPath
    },
    statisticExpanded() {
      this.$refs.WindowSplitting.expand()
      this.statisticShown = true
    },
    statisticHidden() {
      this.$refs.WindowSplitting.shrink()
      this.statisticShown = false
    },
    setCursorAndSelect(file, $event) {
      const currentCursorFile = this.screenFiles.find((f) => f.cursor)
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
    scrollToFocusFile(focusFileIndex) {
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
       * @param {Boolean} isSelect - only cursor or select
       */
    cursor(to, isSelect) {
      const fileInFocusIndex = this.screenFiles.findIndex((f) => f.cursor)
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
        default:
          break
      }
      if (nextFileFocusIndex || nextFileFocusIndex === 0) {
        this.screenFiles[fileInFocusIndex].cursor = false
        this.screenFiles[nextFileFocusIndex].cursor = true
        this.scrollToFocusFile(nextFileFocusIndex)
      }
      if (isSelect) {
        this.selectCurrent(true)
      }
    },
    selectCurrent(selectAll) {
      const fileInFocusIndex = this.screenFiles.findIndex((f) => f.cursor)
      if (fileInFocusIndex === -1) return
      this.toggleSelect(this.screenFiles[fileInFocusIndex], true)
      if (selectAll && (this.lastSelectedFileIndex || this.lastSelectedFileIndex === 0)) {
        const different = fileInFocusIndex - this.lastSelectedFileIndex
        const beginFrom = Math.sign(different) > 0 ? this.lastSelectedFileIndex + 1 : fileInFocusIndex + 1
        const endWith = Math.sign(different) > 0 ? fileInFocusIndex - 1 : this.lastSelectedFileIndex - 1
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
    toggleSelect(file, doNotUpdateLastSelectedFileIndex) {
      file.selected = !file.selected
      if (file.selected) {
        this.selectedFiles.push(file)
      } else {
        let index = -1
        for (let i = 0; i < this.selectedFiles.length; ++i) {
          if (this.selectedFiles[i].path === file.path) {
            index = i
            break
          }
        }
        if (index > -1) {
          this.selectedFiles.splice(index, 1)
        }
      }
      if (!doNotUpdateLastSelectedFileIndex) {
        this.lastSelectedFileIndex = this.screenFiles.findIndex((f) => f.path === file.path)
      }
    },
    async loadStatistic(path) {
      const {
        matched,
        missed,
        missmatched,
        calculated,
        table,
      } = await api.getStatistic(path)
      this.statistic.calculated = calculated
      this.statistic.matched = matched
      this.statistic.missed = missed
      this.statistic.missmatched = missmatched
      this.statistic.table = table
    },
    onFolderCreated() {
      this.loadFiles(this.openedPath)
    },
    async loadFiles(path) {
      // clear old files
      this.folder.files = []
      this.folder.folders = []
      this.screenFiles = []
      this.selectedFiles = []

      // load data
      const content = await api.getFiles(path, this.$route.query.to, this.type, this.$route.query.batch)
      // prepare files
      this.folder.files = content.files.map((f) => {
        f.selected = false
        f.serverPath = this.staticServer + f.relativePath
        f.cursor = false
        return f
      })
        .filter((f) => {
          // console.log(f.name, this.filter.exclude, this.filter.include)
          let excludeFactor = true
          let includeFactor = true
          if (this.filter.exclude) {
            if (f.name.toLowerCase()
              .includes(this.filter.exclude.toLowerCase())) {
              excludeFactor = false
            }
          }
          if (this.filter.include) {
            includeFactor = f.name.toLowerCase()
              .includes(this.filter.include.toLowerCase())
          }
          return includeFactor && excludeFactor
        })

      this.folder.total_file = this.folder.files.length

      // prepare folders
      let previousLetter = '-'
      this.folder.folders = content.folders.map((f) => {
        f.selected = false
        const lowerName = f.name.toLowerCase()
        const firstLetter = lowerName.substring(0, 1)
        if (!lowerName.startsWith(previousLetter) && firstLetter.toUpperCase() !== firstLetter.toLowerCase()) {
          f.shortcut = firstLetter.toUpperCase()
          previousLetter = firstLetter
        }
        return f
      })

      // add parent dir to folder list
      const parentDir = await api.getParent(path, this.type, this.$route.query.batch)
      if (parentDir.access) {
        this.folder.folders.unshift({
          path: parentDir.path,
          type: parentDir.type,
        })
      }

      // prepare next folder for move
      this.nextFolders = await api.getNextFolders(path, this.type, this.$route.query.ws)

      // prepare to show page
      if (!this.page) {
        this.page = 1
      }

      if (!this.configFilePerPage) {
        this.perPage = this.folder.files.length
      } else {
        this.perPage = this.configFilePerPage
      }
      this.page_count = Math.ceil(this.folder.files.length / this.perPage)
      if (this.page > this.page_count) {
        this.page = this.page_count
      }

      this.calculatePage(this.page)

      return {
        currentPath: content.path,
      }
    },
    calculatePage(page) {
      if (!this.perPage) {
        this.screenFiles = [...this.folder.files]
      } else {
        this.screenFiles = this.folder.files.slice((page - 1) * this.perPage, page * this.perPage)
      }
      if (this.screenFiles.length) {
        this.screenFiles = this.screenFiles.map((f) => {
          f.cursor = false
          return f
        })
        this.screenFiles[0].cursor = true
      }
    },
    currentIndexPage() {
      if (!this.perPage) {
        return false
      }
      const first = this.page * this.perPage - this.perPage
      const last = first + this.screenFiles.length
      return `${first} - ${last} of ${this.folder.files.length}`
    },
    onPageChange(page) {
      this.page = page
      this.calculatePage(page)
    },
    backward() {
      if (this.page > 1) {
        this.page -= 1
        this.calculatePage(this.page)
      }
    },
    forward() {
      if (!this.forwardOnly) {
        if (this.page < this.page_count) {
          this.page += 1
          this.calculatePage(this.page)
        }
      } else {
        this.onForwardOnly()
      }
    },
    async onForwardOnly() {
      const selected = this.selectedFiles.map((f) => f.path)
      const notSelected = this.screenFiles.filter((f) => !selected.includes(f.path) && f.image)
        .map((f) => f.path)
      const { type, batch } = this.$route.query
      await api.doForwardOnly(selected, notSelected, type, batch)
      await this.loadFiles(this.path)
    },
    async goToTheFolder(file) {
      if (file.path === this.path) {
        socket.unsubscribeForFolder(this.openedPath)
        socket.subscibeForFolder(this.path, this.fileChanged())
        this.openedPath = this.path
        this.filter = {}
        await this.loadFiles(this.path)
        return
      }
      if (this.statisticShown && file.path.length > this.path.length) {
        // eslint-disable-next-line no-return-await,consistent-return
        return await this.selectFolder({
          folder: file.name,
          filter: {},
        })
      }
      await this.$router.push({
        name: 'explorer',
        query: {
          dir: file.path,
          type: file.type,
          batch: file.batch,
        },
      })
    },
    async deleteFiles() {
      if (this.selectedFiles.length === 0) return
      this.isLoading.deleting = true
      const { type, batch } = this.$route.query
      await api.deleteFiles(this.selectedFiles.map((f) => f.path), type, batch)
      this.isLoading.deleting = false
      // delete that files from folder
      await this.loadFiles(this.path)
    },
    async moveFiles(dest) {
      if (this.selectedFiles.length === 0) return
      if (this.nextFolders.length === 0) return
      this.isLoading.moving = true
      await api.moveFiles(this.selectedFiles.map((f) => f.path), dest, this.type)
      this.isLoading.moving = false
      // move files
      await this.loadFiles(this.path)
    },
    fileChanged() {
      const self = this
      return (file) => {
        if (file.event === 'add' && file.type === 'file') {
          file.selected = false
          file.serverPath = this.staticServer + file.relativePath
          self.folder.files.push(file)
          if (self.page === self.page_count) {
            self.screenFiles.push(file)
          }
        } else if (file.event === 'add' && file.type === 'folder') {
          file.selected = false
          self.folder.folders.push(file)
        } else if (file.event === 'remove' && file.type === 'folder') {
          let index = -1
          for (let i = 0; i < self.folder.folders.length; i++) {
            if (self.folder.folders[i].path === file.path) {
              index = i
              break
            }
          }
          if (index > -1) self.folder.folders.splice(index, 1)
        } else if (file.event === 'remove' && file.type === 'file') {
          let index = -1
          for (let i = 0; i < self.folder.files.length; i++) {
            if (self.folder.files[i].path === file.path) {
              index = i
              break
            }
          }
          if (index > -1) self.folder.files.splice(index, 1)

          index = -1
          for (let i = 0; i < self.selectedFiles.length; i++) {
            if (self.selectedFiles[i].path === file.path) {
              index = i
              break
            }
          }
          if (index > -1) self.selectedFiles.splice(index, 1)

          index = -1
          for (let i = 0; i < self.screenFiles.length; i++) {
            if (self.screenFiles[i].path === file.path) {
              index = i
              break
            }
          }
          if (index > -1) self.screenFiles.splice(index, 1)
        }
      }
    },
    setFocusOnFiles() {
      window.document.getElementById('keyupevents')
        .focus()
    },
    enablePreventingScrolling() {
      window.addEventListener('keydown', preventDefaultScrolling, false)
    },
    disablePreventingScrolling() {
      window.removeEventListener('keydown', preventDefaultScrolling)
    },
    onOpenModal() {
      this.disablePreventingScrolling()
    },
    onCloseModal() {
      this.setFocusOnFiles()
      this.enablePreventingScrolling()
    },
    showStatistic() {
      EventBus.$emit('show-statistic', this.path)
    },
    createNewFolder() {
      console.log('create new folder')
      EventBus.$emit('create-new-folder', this.path)
    },
    shiftingMove(e, flag) {
      if (e && e.shiftKey) {
        this.cursor(flag, true)
      }
    },
  },
  async created() {
    this.perPage = this.configFilePerPage
    const { currentPath } = await this.loadFiles(this.dir || null)
    this.createdFolders = this.folder.folders
    await this.loadStatistic(this.dir || currentPath || this.path || null)
    // set current path if he hasn't defined
    this.path = currentPath
    this.openedPath = currentPath
    // subscribe for that folder
    socket.subscibeForFolder(this.path, this.fileChanged())
    // set focus on keyupevents
    this.setFocusOnFiles()
    // get status
    this.status = await api.getRunningState()
    socket.subscibeForFolder('running.lock', (data) => {
      if (data.event === 'change') this.status = data.content
      if (data.event === 'unlink') this.status = false
    })
    this.enablePreventingScrolling()
    this.$store.commit('notes/SET_FOLDER', {
      notesPath: `${currentPath}/notes.txt`,
      notes: this.systemConfig.notes || null,
      highlight: Boolean(this.systemConfig.highlight),
    })
  },
  beforeDestroy() {
    socket.unsubscribeForFolder(this.path)
    socket.unsubscribeForFolder('running.lock')
  },
}
</script>

<style lang="scss">
  #keyupevents {
    outline: none;
    min-height: 100%;
    display: flex;
  }

  .file-container {
    width: calc(100% - 250px);
  }

  .next-folders {
    /*height: 100%;*/
    /*overflow-y: auto;*/
    /*width: 240px;*/
    /*position: fixed;*/
    /*top: 10px;*/
    /*right: 0px*/

    & > div {
      background: var(--primary);
      margin-bottom: 10px;
      padding: 0 10px;
      border-radius: 4px;
      cursor: pointer;
      color: #fff;
      font-weight: 600;
      font-size: 25px;
      line-height: 25px;

      .folder-name {
        padding-left: 10px;
        font-size: 1rem;
      }

      .next-folders-icon {
        width: 20px;
        height: 20px;
      }
    }
  }

  .right-side-section {
    margin-top: 10px;
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

  .pagination-group {
    /*padding: 5px;*/
    .confirm-btn {
      width: 100%;
      max-width: 220px;
      text-align: left;
    }
  }

  .section-item {
    .section-icon {
      margin-right: 20px;

      font-size: 20px;
      cursor: pointer;
    }
  }

  .shortcut-item {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px #dedede solid;
    padding-bottom: 10px;
    margin-bottom: 15px;

    .shortcut-btn {
      span {
        border: 1px #777 solid;
        margin-right: 5px;
        padding: 5px;
        border-radius: 2px;
        box-shadow: 0 1px 6px -2px #777;
      }
    }
  }

  .statistic-btn {
    color: #000;
    background: #D9D4CF;
    border: 1px solid #D9D4CF;

    &:hover, &:focus, &:active {
      background: #D9D4CF !important;
      color: #000 !important;
    }
  }

  .file-explorer-item {
    overflow: hidden;
    word-wrap: break-word;
    padding: 5px;
    position: relative;

    &.selected {
      background: var(--primary)
    }

    &.cursor {
      border: 3px solid gray;
    }
  }

  .file-explorer-preview {

    margin: auto;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    &.image-fill {
      object-fit: cover;
    }

    &.image-fit {
      object-fit: contain;
    }
  }

  .file-explorer-file-name {
    font-size: 12px;
    padding: 1px;
    display: inline-block;
    word-break: break-word;

    &.matched {
      background: #a0fcac;
      color: black;
    }

    &.missmatched {
      background: rgb(255, 183, 183);
      color: black;
    }
  }

  .list-folders {
    display: flex;
    flex-wrap: wrap;
    margin-left: -.25rem;
    margin-right: -.25rem;
    .list-folder-item {
      margin-left: .25rem;
      margin-right: .25rem;
      margin-bottom: .5rem;
      .file-explorer-file-name {
        margin-left: .125rem;
      }
      .new-folder-button {
        padding: unset;
      }
    }

    .folder {
      display: inline;
      cursor: pointer;
    }

    .file-explorer-item {
      margin-right: 0 !important;
      padding: 0;
      display: contents;
    }
  }
  .link-current-folder {
    color: #39d1ff;
  }
  .image-viewer-ctn {
    padding-top: 10px;
    button {
      width: 100%;
    }
  }
</style>
