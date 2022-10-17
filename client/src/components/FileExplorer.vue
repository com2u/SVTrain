<template>
  <div
    class="file-explorer-container"
    @keyup.self.exact.shift.space="selectCurrent(true)"
    @keyup.left="shiftingMove($event, 'left')"
    @keyup.up="shiftingMove($event, 'up')"
    @keyup.down="shiftingMove($event, 'down')"
    @keyup.right="shiftingMove($event, 'right')"
    @keyup.self.exact.107="zoomIn(true)"
    @keyup.self.exact.187="zoomIn(true)"
    @keyup.self.exact.109="zoomOut(true)"
    @keyup.self.exact.189="zoomOut(true)"
  >
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
            <b-button @click="showStatistic" :disabled="!canViewStatistics" class="statistic-btn sandy-color">
              <b-icon icon="bar-chart-fill"/>
              <span> Statistic</span>
            </b-button>
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
            Select one or more images to (re)label the data
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
                class="sandy-color"
                @click="backward()">
                <b-icon icon="chevron-left"></b-icon>
                Backward
              </b-button>
              <b-button
                class="sandy-color"
                style="margin-left: 10px;"
                v-b-popover.hover.html.top="'<b>PageDown</b>'" title="Shortcut"
                variant="primary" size="sm" @click="forward()">Forward
                <b-icon icon="chevron-right"></b-icon>
              </b-button>
            </template>
          </div>
        </div>
        <div v-if="addImageData && canAddImageData && selectedFiles.length" class="image-data right-side-section">
          <div class="star-rating">
            <v-icon name="star" v-for="i in 5" :class="{'active': i <= newImagesData.stars}" :key="i" @click="setNewRating(i)"></v-icon>
          </div>
          <div class="tags">
              <b-badge
                v-for="(tag, index) in newImagesData.tags"
                :key="index"
                pill
                :style="`background-color: ${imageTags.find(t => t.Text === tag).Color}!important`"
                >
                  {{tag}}
                  <v-icon name="times" class="times" @click="removeTag(index)"></v-icon>
              </b-badge>
              <span v-if="newImagesData.dirty && (!newImagesData.tags || !newImagesData.tags.length)">Inconsistent data</span>
              <b-form-select id="tag_selector" :options="imageTags.filter(t => !(newImagesData.tags||[]).includes(t.Text)).map(tag=> ({
                  text: tag.Text,
                  value: tag.Text
                }))"
                @change="setNewTag($event)"
                v-model="newImagesData.newTag"
                :reset-on-options-change="true"
              ></b-form-select>
          </div>
          <div class="notes">
            <b-form-textarea id="textarea" v-model="newImagesData.note" rows="3" :placeholder="newImagesData.dirty ? 'Inconsistent Data':'Note'"/>
          </div>
          <b-button :disabled="isLoading.updating" variant="primary" @click="updateImageData">Update</b-button>
        </div>
        <div v-if="showExplorerNotes" class="right-side-section">
          <h4>Workspace notes</h4>
          <b-form-textarea :disabled="!systemConfig['editExplorerNotes']" id="textarea" v-model="notesContent" rows="3" placeholder="Note"/>
        </div>
        <div class="right-side-section">
          <b-form-checkbox v-model="notesHighlight" :disabled="! (showExplorerNotes && systemConfig['editExplorerNotes'])">Highlight Note</b-form-checkbox>
        </div>
        <div v-if="showExplorerNotes && systemConfig['editExplorerNotes']" class="right-side-section">
          <b-button size="sm" style="background: rgb(0, 96, 255);" variant="primary" @click="saveNotes()">Save notes</b-button>
        </div>
      </template>
      <template v-slot:main>
        <div class="mb-2 d-flex flex-column">
          <div><strong>{{relativeDir.replace(/^\/|\/$/g, '')}}</strong></div>
          <div class="filters">
            <div class="filter-item">
              <span class="filter-select"  v-if="showSortBy">
                Sort By:
                <select class="filter-select" v-if="showSortBy" v-model="selectedSortBy" @change="sortChanged">
                  <option value="">Default</option>
                  <option value="name">Filename</option>
                  <option value="date-mod">Modified</option>
                  <option value="date-create">Created</option>
                  <option value="size">Size</option>
                  <option value="note">Note</option>
                  <option value="stars">Stars</option>
                </select> <select class="filter-select" v-if="showSortBy" v-model="selectedSortByOrder" @change="sortChanged">
                  <option value="">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </span>
              <span class="filter-select"  v-if="showFilters">
                Show:
                <select v-model="selectedFilter" @change="filterChanged">
                  <option value="">All</option>
                  <option value="matching">Matching</option>
                  <option value="not-matching">Not matching</option>
                  <option value="search">Search</option>
                  <option value="with-note">With Note</option>
                  <option value="without-note">Without Note</option>
                  <option :value="`stars-${i}`" v-for="(e, i) in 6" :key="i">{{'☆'.repeat(i)|| 'Unrated'}}</option>
                  <option :value="`tag-${tag.Text}`" v-bind:key="tag.Text" v-for="tag in imageTags">Tag: {{tag.Text}}</option>
                </select>
              </span>
              <input class="filter-search" v-if="showFilters && selectedFilter === 'search'" v-model="searchText" @change="filterChanged" placeholder="Search"/>
            </div>
            <div class="filter-item">
              <v-icon v-if="filterFiles" name="filter"
                :class="{'active': showFilters, 'filter-icon':true}"
                @click="showFilters = !showFilters"
              ></v-icon>
              <v-icon v-if="sortFiles" name="sort-amount-down"
                :class="{'active': showSortBy, 'filter-icon':true}"
                @click="showSortBy = !showSortBy"
              ></v-icon>
            </div>
          </div>
          <div v-if="!['defectclass', 'batch', 'ws'].includes(type)" class="list-folders">
            <back-button @click.native="goToPreviousDir()" v-if="relativeDir.replace(/^\/|\/$/g, '').indexOf('/') > -1"></back-button>
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
            <div class="list-folder-item" v-if="systemConfig.importFiles && importFiles">
              <label for="import-files">
                <import-files-button/>
                <span v-if="isLoading.uploading"><v-icon
                name="spinner"></v-icon> (Uploading...)</span>
                <input id="import-files" type="file" @change="onFilesSelected()" ref="filesInput" multiple="multiple" style="display:none">
              </label>
            </div>
          </div>
        </div>
        <div class="mb-2 mt-2" v-if="systemConfig.forwardLocation === 'top'">
          <div class="pagination-group">
            <b-button
              class="mr-2 sandy-color"
              variant="primary"
              size="sm"
              @click="backward()">
              <b-icon icon="chevron-left"></b-icon>Backward
            </b-button>
            <b-button
              variant="primary sandy-color"
              size="sm"
              @click="forward()">
              Forward
              <b-icon icon="chevron-right"></b-icon>
            </b-button>
            <span v-if="currentIndexPage()" class="ml-2">{{currentIndexPage()}}</span>
          </div>
        </div>
        <div class="file-explorer-grid">
          <file
            zoom-able
            v-for="(file) in screenFiles"
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
import ImportFilesButton from './ImportFilesButton.vue'
import BackButton from './BackButton.vue'
import WindowSplitting from './WindowSplitting.vue'

function preventDefaultScrolling(e) {
  // space and arrow keys
  if ([32, 33, 34, 37, 38, 39, 40].indexOf(e.keyCode) > -1 && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
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
    ImportFilesButton,
    BackButton,
    WindowSplitting,
  },
  data: () => ({
    viewerIndex: null,
    isLoading: {
      deleting: false,
      moving: false,
      statistic: false,
      uploading: false,
      updating: false,
    },
    showShortcuts: false,
    showFilters: false,
    selectedFilter: '',
    searchText: '',
    filteredFolderFiles: [],
    sortedFolderFiles: [],
    showSortBy: false,
    selectedSortBy: '',
    selectedSortByOrder: '',
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
      mismatched: null,
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
    newImagesData: {},
    imageTags: [],
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
      return this.selectedFiles.map((file) => this.convertURIPath(file.serverPath))
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
      const configFilePerPage = parseInt(config.filePerPage, 10)
      if (Number.isInteger(configFilePerPage) && configFilePerPage > 0) {
        return configFilePerPage
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
      return this.dir
    },
    ...mapGetters([
      'newFolder',
      'canViewStatistics',
      'canSeeMoveMenu',
      'imageViewer',
      'showNavigationIcon',
      'showExplorerNotes',
      'importFiles',
      'imageInvert',
      'imageColorMap',
      'filterFiles',
      'sortFiles',
      'addImageData',
      'canAddImageData',
      'oldFilenameIgnore',
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
    viewerIndex() {
      if (this.viewerIndex !== null) {
        // setting a timeout to wait for the gallery to be mounted
        setTimeout(() => {
          document.querySelectorAll('img.slide-content').forEach((el) => {
            // add this attribute to allow canvas.toDataURL() to work
            el.setAttribute('crossorigin', 'anonymous')
            // if some filters are enabled, we need to load the image first
            // then apply the filters
            if (this.imageInvert || this.imageColorMap) {
              // if image not loaded, apply filters when it loads
              el.onload = () => this.applyFiltersToImgElement(el)
              // if image is loaded, apply filters now
              if (el.complete && el.naturalWidth !== 0) this.applyFiltersToImgElement(el)
            } else {
              // if no filters are enabled, just display the image as it is
              el.classList.add('loaded')
            }
          })
        }, 500)
      }
    },
    async selectedFiles() {
      if (!this.addImageData || !this.canAddImageData) return
      this.isLoading.updating = true
      this.newImagesData = {}
      const imagesData = await api.getImageData(this.selectedFiles.map((file) => {
        if (this.oldFilenameIgnore) {
          return file.name.replace(/^[^___]*___/, '')
        }
        return file.name
      }))
      // make sure all objects in imagesData have the same keys and values
      // and mark as dirty if it's not the case
      let dirty = imagesData.length && imagesData.length !== this.selectedFiles.length && this.selectedFiles.length > 1 && (!this.oldFilenameIgnore || this.selectedFiles.some((file) => file.name.replace(/^[^___]*___/, '') !== this.selectedFiles[0].name.replace(/^[^___]*___/, '')))
      const relevantKeys = ['note', 'tags', 'stars']
      relevantKeys.forEach((key) => {
        if (!imagesData.every((imageData) => imageData[key] === imagesData[0][key])) {
          dirty = true
        }
      })
      this.isLoading.updating = false
      if (dirty) {
        this.newImagesData = {
          dirty,
        }
        return
      }
      if (!imagesData.length) return
      this.newImagesData = {
        ...imagesData[0],
        tags: JSON.parse(imagesData[0]?.tags),
      }
    },
  },
  mounted() {
    const c = this.systemConfig && this.systemConfig.imgContrast ? this.systemConfig.imgContrast : 100
    const b = this.systemConfig && this.systemConfig.imgBrightness ? this.systemConfig.imgBrightness : 100
    document.getElementsByTagName('body')[0].style.setProperty('--image--filter', `contrast(${c}%) brightness(${b}%)`)
  },
  methods: {
    convertURIPath(p) {
      return `${p.replaceAll('#', '{hash_tag}')}?token=${localStorage.getItem('sessionToken', null)}`
    },
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
      api.refreshToken()
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
      if (document.activeElement.type === 'textarea') return
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
      const index = (number + 9) % 10
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
        mismatched,
        calculated,
        table,
      } = await api.getStatistic(path)
      this.statistic.calculated = calculated
      this.statistic.matched = matched
      this.statistic.missed = missed
      this.statistic.mismatched = mismatched
      this.statistic.table = table
    },
    onFolderCreated() {
      this.loadFiles(this.openedPath)
    },
    async loadFiles(path) {
      // clear old files
      this.folder.files = []
      this.filteredFolderFiles = []
      this.folder.folders = []
      this.screenFiles = []
      this.selectedFiles = []

      // load data
      const content = await api.getFiles(path, this.$route.query.to, this.type, this.$route.query.batch, this.$route.query.isStatistic, this.oldFilenameIgnore)
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
      this.sortChanged()
      api.refreshToken()
      return {
        currentPath: content.path,
      }
    },
    sortChanged() {
      this.sortedFolderFiles = [...this.folder.files]
      this.sortedFolderFiles.sort((a, b) => {
        if (this.selectedSortBy === 'name') {
          return a.name.localeCompare(b.name)
        }
        if (this.selectedSortBy === 'note') {
          return a.note.localeCompare(b.note)
        }
        if (this.selectedSortBy === 'size') {
          return a.size - b.size
        }
        if (this.selectedSortBy === 'stars') {
          return a.stars - b.stars
        }
        if (this.selectedSortBy === 'date-mod') {
          return a.date_mod - b.date_mod
        }
        if (this.selectedSortBy === 'date-create') {
          return a.date_create - b.date_create
        }
        return 0
      })
      if (this.selectedSortByOrder === 'desc') {
        this.sortedFolderFiles = this.sortedFolderFiles.reverse()
      }
      this.filterChanged()
    },
    filterChanged() {
      switch (this.selectedFilter) {
        case 'matching':
          this.filteredFolderFiles = this.sortedFolderFiles.filter((f) => f.match)
          break
        case 'not-matching':
          this.filteredFolderFiles = this.sortedFolderFiles.filter((f) => !f.match)
          break
        case 'search':
          this.filteredFolderFiles = this.sortedFolderFiles.filter((f) => f.name.toLowerCase()
            .includes(this.searchText))
          break
        case 'with-note':
          this.filteredFolderFiles = this.sortedFolderFiles.filter((f) => f.note)
          break
        case 'without-note':
          this.filteredFolderFiles = this.sortedFolderFiles.filter((f) => !f.note)
          break
        case 'stars-0':
          this.filteredFolderFiles = this.sortedFolderFiles.filter((f) => f.stars === 0)
          break
        default:
          this.filteredFolderFiles = this.sortedFolderFiles
          if (this.selectedFilter.indexOf('stars-') === 0) {
            this.filteredFolderFiles = this.sortedFolderFiles.filter((f) => f.stars === parseInt(this.selectedFilter.substring(6), 10))
          }
          if (this.selectedFilter.indexOf('tag-') === 0) {
            this.filteredFolderFiles = this.sortedFolderFiles.filter((f) => f.tags.includes(this.selectedFilter.substring(4)))
          }
          break
      }
      this.calculatePage(this.page)
    },
    calculatePage(page) {
      if (!this.perPage) {
        this.screenFiles = [...this.filteredFolderFiles]
      } else {
        this.screenFiles = this.filteredFolderFiles.slice((page - 1) * this.perPage, page * this.perPage)
      }
      if (this.screenFiles.length) {
        this.screenFiles = this.screenFiles.map((f) => {
          f.cursor = false
          return f
        })
        this.screenFiles[0].cursor = true
      }
      api.refreshToken()
    },
    currentIndexPage() {
      if (!this.perPage) {
        return false
      }
      const first = this.page * this.perPage - this.perPage
      const last = first + this.screenFiles.length
      return `${first} - ${last} of ${this.filteredFolderFiles.length}`
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
      this.folder.files = this.folder.files.filter((f) => !([...selected, ...notSelected]).includes(f.path))
      this.sortChanged()
      api.refreshToken()
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
      this.folder.files = this.folder.files.filter((f) => !this.selectedFiles.map((df) => df.path).includes(f.path))
      this.sortChanged()
      api.refreshToken()
    },
    async moveFiles(dest) {
      if (this.selectedFiles.length === 0) return
      if (this.nextFolders.length === 0) return
      if (dest.endsWith(this.folder.files[0].path.substring(0, this.folder.files[0].path.lastIndexOf('/')))) return
      this.isLoading.moving = true
      await api.moveFiles(this.selectedFiles.map((f) => f.path), dest, this.type)
      this.isLoading.moving = false
      this.folder.files = this.folder.files.filter((f) => !this.selectedFiles.map((df) => df.path).includes(f.path))
      this.sortChanged()
      api.refreshToken()
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
    enablePreventingScrolling() {
      window.addEventListener('keydown', preventDefaultScrolling, false)
    },
    disablePreventingScrolling() {
      window.removeEventListener('keydown', preventDefaultScrolling, false)
    },
    onOpenModal() {
      this.disablePreventingScrolling()
    },
    onCloseModal() {
      this.enablePreventingScrolling()
    },
    showStatistic() {
      EventBus.$emit('show-statistic', this.path)
    },
    createNewFolder() {
      EventBus.$emit('create-new-folder', this.path)
    },
    shiftingMove(e, flag) {
      if (e && e.shiftKey) {
        this.cursor(flag, true)
      }
    },
    async onFilesSelected() {
      if (!this.$refs.filesInput.files.length) return
      const formData = new FormData()
      for (let index = 0; index < this.$refs.filesInput.files.length; index++) {
        if (this.$refs.filesInput.files[index].size > 1024 * 1024 * this.systemConfig.maxFileSize) {
          this.$notify({
            type: 'error',
            title: 'Error',
            text: `File size is too big. Max size is ${this.systemConfig.maxFileSize}MB.`,
          })
          return
        }
        formData.append(`files[${index}]`, this.$refs.filesInput.files[index])
      }
      formData.append('path', this.path)
      this.isLoading.uploading = true
      try {
        await api.uploadFiles(formData)
        await this.loadFiles(this.path)
      } finally {
        this.isLoading.uploading = false
      }
    },
    applyFiltersToImgElement(imgEl) {
      const filters = []
      if (this.imageInvert) filters.push('invert')
      if (this.imageColorMap) filters.push('colormap')
      if (!imgEl || imgEl.classList.contains('loaded') || !imgEl.complete || imgEl.naturalHeight === 0) return
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = imgEl.width
      canvas.height = imgEl.height
      ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height)
      const sequencer = window.ImageSequencer()
      sequencer.loadImage(canvas.toDataURL('image/png'), function callback() {
        this.addSteps(filters)
        this.run((out) => {
          imgEl.src = out
          imgEl.classList.add('loaded')
        })
      })
    },
    setNewRating(newRating) {
      this.newImagesData = {
        ...this.newImagesData,
        stars: newRating,
      }
    },
    setNewTag(value) {
      if (!this.newImagesData.tags?.includes(value)) {
        this.newImagesData = {
          ...this.newImagesData,
          tags: [...(this.newImagesData.tags || []), value],
        }
      }
    },
    removeTag(index) {
      this.newImagesData.tags.splice(index, 1)
    },
    async updateImageData() {
      this.isLoading.updating = true
      await api.setImageData({
        fileNames: this.selectedFiles.map((f) => {
          if (this.oldFilenameIgnore) {
            return f.name.replace(/^[^___]*___/, '')
          }
          return f.name
        }),
        folder: this.path,
        className: this.path.split('/').pop(),
        ...this.newImagesData,
      })
      this.isLoading.updating = false
      this.folder.files = this.folder.files.map((f) => {
        if (this.selectedFiles.find((s) => s.name === f.name)) {
          f.stars = this.newImagesData.stars
          f.tags = this.newImagesData.tags
          f.note = this.newImagesData.note || ''
        }
        return f
      })
      this.sortChanged()
      api.refreshToken()
    },
    goToPreviousDir() {
      const path = this.relativeDir.split('/')
      path.pop()
      this.goToTheFolder({
        path: path.join('/'),
        type: path.join('/').replace(/^\/|\/$/g, '').indexOf('/') > -1 ? 'folder' : null,
      })
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
    // add keyup event listener
    window.addEventListener('keyup', this.onKeyUp)
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
    this.imageTags = await api.getImageTags()
  },
  beforeDestroy() {
    window.removeEventListener('keyup', this.onKeyUp)
    socket.unsubscribeForFolder(this.path)
    socket.unsubscribeForFolder('running.lock')
    this.disablePreventingScrolling()
  },
}
</script>

<style lang="scss">
  .file-explorer-container {
    outline: none;
    min-height: 100%;
    display: flex;
  }

  .sandy-color {
    background-color: rgb(211, 204, 194);
    border: 1px solid rgb(211, 204, 194);
    color: rgb(0, 0, 0);

    &:hover, &:focus, &:active {
      background: #D9D4CF !important;
      color: #000 !important;
      border-color: #000;
    }
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
    display: flex;
    align-items: center;
    .section-icon {
      &:not(:last-of-type) {
        margin-right: 20px;
      }

      font-size: 20px;
      cursor: pointer;
    }
    .statistic-btn {
      margin-left: auto;
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
      background: rgb(153, 191, 255);
      color: black;
    }

    &.mismatched {
      background: rgb(254, 182, 123);
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
      .new-folder-button, .import-files-button {
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
.slide-content {
  visibility: hidden;
  &.loaded {
    visibility: visible;
  }
}
.filters {
     display: flex;
     justify-content: flex-end;
     align-items: center;
     margin-bottom: 10px;
     height: 1.8rem;
     .filter-item {
         margin-inline: 10px;
         .filter-icon {
             cursor: pointer;
             width: 1.8rem;
             height: 1.8rem;
            margin-inline: 1rem;
             &.active {
                margin-left: 1rem;
                 fill: #0f00e4;
            }
        }
         .filter-select, .filter-search {
            margin-left: 1rem;
            input, select {
              background: #fff;
              border: 1px solid #dedede;
              border-radius: 4px;
              padding: 5px;
              height: 100%;
            }
        }
    }
}
.image-data {
  .star-rating {
    display: flex;
    justify-content: center;
    width: 100%;
    svg {
      &:hover > svg {
        fill: gray;
      }
      fill: gray;
      cursor: pointer;
      height: 2rem;
      width: 2rem;
      margin-inline: 5px;
      &.active {
        fill: #ffd900;
      }
    }
  }
  .tags {
    padding: 0.5rem;
    margin-top: 1rem;
    border: 1px solid #dedede;
    .badge {
      margin: 0.2rem;
      white-space: nowrap;
      .times {
        cursor: pointer;
        margin-left: 0.1rem;
        font-size: 1rem;
        &:hover {
          color: red;
        }
      }
    }
    select {
      margin-top: 1rem;
      border: none;
      border-radius: none;
      &:focus {
        outline: none;
      }
    }
  }
  .notes {
    margin: 1rem 0;
  }
}
</style>
