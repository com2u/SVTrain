<template>
  <div
    id="keyupevents"
    tabindex="0"
    @keyup.self.exact.shift.space="selectCurrent(true)"
    @keyup.self.exact.187="zoomIn(true)"
    @keyup.self.exact.189="zoomOut(true)"
    @keyup.self.exact.stop.prevent="onKeyUp"
  >
    <div
      tabindex="0"
    >

    </div>
    <window-splitting ref="WindowSplitting">
      <template v-slot:side>
        <div class="right-side-section">
          <div class="section-item">
            <svg-icon
              v-b-popover.hover.html.top="'<b>-</b>'" title="Shortcut"
              icon-class="zoom-out" class="section-icon" @click="zoomOut"/>
            <svg-icon
              v-b-popover.hover.html.top="'<b>=</b>'" title="Shortcut"
              icon-class="zoom-in" class="section-icon" @click="zoomIn"/>
            <svg-icon icon-class="info" class="section-icon" @click="showShortcutsModal"/>
            <b-button @click="showStatistic" :disabled="!canViewStatistics">

              <b-icon
                icon="bar-chart-fill"
              />
              <span> Statistic</span>
            </b-button>
          </div>
        </div>

        <div v-if="systemConfig.moveMenu" class="right-side-section">
          Selected files count: {{ selectedFiles.length }}<br><br>
          <div v-if="selectedFiles.length > 0 && canSeeMoveMenu">
            Move files to the next folders <span v-if="isLoading.moving"><v-icon
            name="spinner"></v-icon> (Moving...)</span>:
            <ul class="next-folders">
              <li v-for="f in nextFolders" v-bind:key="f.path" @click="moveFiles(f.path)">
                <img v-if="f.icon" :src="`${staticServer}${f.icon}`" alt="icon"
                     class="next-folders-icon">
                <span v-else>
                  <svg-icon icon-class="unknown"/>
                </span>
                <span class="folder-name"
                      :style="{fontSize: fontSize}">{{f.name}}</span>
              </li>
              <li>
                <span>
                  <svg-icon icon-class="delete"/>
                </span>
                <span
                  class="folder-name"
                  :style="{fontSize: fontSize}"
                  @click="deleteFiles()">
                  Delete image(s)
                </span>
              </li>
            </ul>
          </div>
          <div v-else>
            (select one or more files for show control buttons)
          </div>

        </div>
        <div v-if="systemConfig.forwardLocaltion === 'right'" class="right-side-section">
          <div class="pagination-group">
            <template v-if="forwardOnly">
              <b-button
                v-b-popover.hover.html.top="'<b>PageDown</b>'" title="Shortcut"
                variant="primary" size="sm" @click="forward()">
                <b-icon icon="folder-fill"></b-icon>
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
      </template>
      <template v-slot:main>
        <div>
          <div><strong>{{relativeDir}}</strong></div>
          <div v-if="systemConfig.newFolder && newFolder">
            <new-folder-button v-b-modal.creating-folder-modal/>
          </div>
          <div class="list-folders">
            <span v-for="file in folder.folders" :key="file.path">
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
                v-bind:file="file"
                v-on:click.native="goToTheFolder(file)">
              </file>
            </span>
          </div>
        </div>
        <div class="file-explorer-grid bottom-border">

        </div>
        <div v-if="systemConfig.forwardLocaltion === 'top'">
          <div class="pagination-group">
            <b-button
              v-if="!forwardOnly"
              variant="primary"
              size="sm"
              @click="backward()">
              <b-icon icon="chevron-left"></b-icon>
              Backward
            </b-button>
            <b-button variant="primary" size="sm" @click="forward()">Forward
              <b-icon icon="chevron-right"></b-icon>
            </b-button>
          </div>
        </div>
        <div class="file-explorer-grid">
          <file
            v-for="(file, index) in screenFiles"
            v-b-popover.hover.html.top="index < 10 ? `<b>${(index + 1) % 10}</b>` : null"
            :title="index< 10 ? 'Shortcut' : null"
            :show-file-name="showFileName"
            :id="`file_${file.path}`"
            :file="file"
            :key="file.path"
            :size="fileSize"
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
  </div>
</template>

<script>
/* eslint no-plusplus: 0 */
/* eslint no-param-reassign: 0 */
import { mapGetters } from 'vuex';
import File from './File.vue';
import api from '../utils/api';
import socket from '../utils/socket';
import ShowFile from './ShowFile.vue';
import CreatingFolder from './CreatingFolder.vue';
import NewFolderButton from './NewFolderButton.vue';
import WindowSplitting from './WindowSplitting.vue';
import { getFileServerPath } from '../utils';
import EventBus from '../utils/eventbus';

function preventDefaultScrolling(e) {
  // space and arrow keys
  if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
    e.preventDefault();
  }
}

export default {
  props: [
    'dir',
  ],
  components: {
    File,
    ShowFile,
    CreatingFolder,
    NewFolderButton,
    WindowSplitting,
  },
  data: () => ({
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
    // staticServer: 'http://localhost:2929/',
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
      ],
      right: [
        {
          label: 'Zoom Out',
          keys: ['='],
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
      ],
    },
  }),
  computed: {
    backgroundCalculating() {
      return this.$store.state.app.calculating;
    },
    fontSize() {
      const { config } = this.$store.state.app;
      if (config.rightMenu && config.rightMenu.fontSize) {
        return config.rightMenu.fontSize;
      }
      return '1rem';
    },
    configFilePerPage() {
      const { config } = this.$store.state.app;
      if (Number.isInteger(config.filePerPage) && config.filePerPage >= 0) {
        return config.filePerPage;
      }
      return 0;
    },
    forwardOnly() {
      return this.$store.state.app.config.forwardOnly;
    },
    showFileName() {
      return this.$store.state.app.config.showFileName;
    },
    systemConfig() {
      return this.$store.state.app.config;
    },
    defaultFileSize() {
      return this.$store.state.app.config.defaultPictureSize;
    },
    relativeDir() {
      const { root } = this.$store.state.app.config;
      return this.dir && root ? this.dir.substring(root.length) : this.dir;
    },
    ...mapGetters([
      'newFolder',
      'canViewStatistics',
      'canSeeMoveMenu',
    ]),
  },
  watch: {
    configFilePerPage() {
      if (this.configFilePerPage) {
        this.perPage = this.configFilePerPage;
      } else {
        this.perPage = 100;
      }
      this.calculatePage(this.page);
    },
    defaultFileSize(size) {
      if (Number.isInteger(size) && size > 0) {
        this.fileSize = size;
      }
    },
  },
  mounted() {
    const size = this.defaultFileSize;
    if (Number.isInteger(size) && size > 0) {
      this.fileSize = size;
    }
  },
  methods: {
    zoomIn(byShortCut = false) {
      if (!this.systemConfig.useShortcuts && byShortCut) return;
      const zoom = Math.floor((this.fileSize * 105) / 100);
      this.fileSize = (zoom < this.maxFileSize) ? zoom : this.maxFileSize;
    },
    zoomOut(byShortCut = false) {
      if (!this.systemConfig.useShortcuts && byShortCut) return;
      const zoom = Math.floor((this.fileSize * 95) / 100);
      this.fileSize = (zoom > this.minFileSize) ? zoom : this.minFileSize;
    },

    showShortcutsModal() {
      this.showShortcuts = true;
    },
    onKeyUp(event) {
      if (event) {
        event.preventDefault();
      }
      if (!this.systemConfig.useShortcuts) return;
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
      };
      switch (event.keyCode) {
        case keys.left:
          this.cursor('left');
          break;
        case keys.up:
          this.cursor('up');
          break;
        case keys.right:
          this.cursor('right');
          break;
        case keys.down:
          this.cursor('down');
          break;
        case keys.space:
          this.selectCurrent(false);
          break;
        case keys.delete:
          this.deleteFiles();
          break;
        case keys.pageUp:
          this.backward();
          break;
        case keys.pageDown:
          this.forward();
          break;
        default:
          if (event.keyCode >= keys.a && event.keyCode <= keys.z) {
            this.selectFolderByLetter(event.key);
          } else if ((event.keyCode >= keys.digit0 && event.keyCode <= keys.digit9)
              || (event.keyCode >= keys.numpad0 && event.keyCode <= keys.numpad9)) {
            const number = event.keyCode < keys.numpad0 ? event.keyCode - keys.digit0 : event.keyCode - keys.numpad0;
            this.selectFileByIndex(number);
          }
          break;
      }
    },

    selectFolderByLetter(letter) {
      console.log(`leteter: ${letter}`);
      const folder = this.folder.folders.find((f) => f.name.toLowerCase()
        .startsWith(letter));
      if (folder) this.goToTheFolder(folder);
    },

    selectFileByIndex(number) {
      const index = (number + 10) % 11;
      if (this.screenFiles.length > index) {
        this.toggleSelect(this.screenFiles[index]);
      }
    },

    openCurrentFile() {
      const fileInFocus = this.screenFiles.find((f) => f.cursor);
      this.viewingFile = fileInFocus;
      this.$nextTick(() => this.$refs.FileViewing.show());
    },
    openFile(file) {
      console.log(file);
      this.viewingFile = file;
      this.$nextTick(() => this.$refs.FileViewing.show());
    },
    async calculateStatistic() {
      this.isLoading.statistic = true;
      try {
        await api.calculateStatistic();
      } catch (e) {
        console.log(e);
        console.error('An error occurred!');
      }
      await this.loadStatistic(this.path);
      this.isLoading.statistic = false;
    },
    async selectFolder({ folder, filter }) {
      const folderFromArray = this.createdFolders.find((f) => f.name === folder);
      const openedPath = folderFromArray.path;
      console.log(folderFromArray);
      this.filter = filter || {};
      socket.unsubscribeForFolder(this.openedPath);
      await this.loadFiles(folderFromArray.path);
      socket.subscibeForFolder(openedPath, this.fileChanged());
      this.openedPath = openedPath;
    },
    statisticExpanded() {
      this.$refs.WindowSplitting.expand();
      this.statisticShown = true;
    },
    statisticHidden() {
      this.$refs.WindowSplitting.shrink();
      this.statisticShown = false;
    },
    setCursorAndSelect(file, $event) {
      const currentCursorFile = this.screenFiles.find((f) => f.cursor);
      if (currentCursorFile) currentCursorFile.cursor = false;
      file.cursor = true;
      if ($event.shiftKey) {
        this.selectCurrent(true);
      } else {
        this.toggleSelect(file);
      }
    },
    /**
       * Scroll browser page to focused image
       * @param {Number} focusFileIndex - Index of file with focus
       */
    scrollToFocusFile(focusFileIndex) {
      const focusedFile = this.screenFiles[focusFileIndex];
      const element = document.getElementById(`file_${focusedFile.path}`);
      const windowHeight = window.innerHeight;
      const elementHeight = element.getBoundingClientRect().top - element.getBoundingClientRect().bottom;
      if (element) {
        element.scrollIntoView(false);
        window.scrollBy(0, Math.floor(windowHeight / 2) + elementHeight);
      }
    },
    /**
       * Move cursor with "up", "right", "down" and "left" directions
       * Call method scrollToFocusFile if cursor was moved
       * @param {String} to - Direction to move cursor
       */
    cursor(to) {
      console.log('cursor to', to);
      const fileInFocusIndex = this.screenFiles.findIndex((f) => f.cursor);
      let nextFileFocusIndex = null;
      if (fileInFocusIndex === -1) {
        this.screenFiles[0].cursor = true;
        return;
      }

      let fileInFocusCoords = null;
      switch (to) {
        case 'right':
          if (fileInFocusIndex + 1 < this.screenFiles.length) {
            nextFileFocusIndex = fileInFocusIndex + 1;
          }
          break;
        case 'left':
          if (fileInFocusIndex > 0) {
            nextFileFocusIndex = fileInFocusIndex - 1;
          }
          break;
        case 'down':
          fileInFocusCoords = document
            .getElementById(`file_${this.screenFiles[fileInFocusIndex].path}`)
            .getBoundingClientRect();
          for (let i = fileInFocusIndex + 1; i < this.screenFiles.length; ++i) {
            const nextFileCoords = document
              .getElementById(`file_${this.screenFiles[i].path}`)
              .getBoundingClientRect();
            if (fileInFocusCoords.x === nextFileCoords.x) {
              nextFileFocusIndex = i;
              break;
            }
          }
          break;
        case 'up':
          fileInFocusCoords = document
            .getElementById(`file_${this.screenFiles[fileInFocusIndex].path}`)
            .getBoundingClientRect();
          for (let i = fileInFocusIndex - 1; i >= 0; --i) {
            const nextFileCoords = document
              .getElementById(`file_${this.screenFiles[i].path}`)
              .getBoundingClientRect();
            if (fileInFocusCoords.left === nextFileCoords.left) {
              nextFileFocusIndex = i;
              break;
            }
          }
          break;
        default:
          break;
      }

      if (nextFileFocusIndex || nextFileFocusIndex === 0) {
        this.screenFiles[fileInFocusIndex].cursor = false;
        this.screenFiles[nextFileFocusIndex].cursor = true;
        this.scrollToFocusFile(nextFileFocusIndex);
      }
    },
    selectCurrent(selectAll) {
      const fileInFocusIndex = this.screenFiles.findIndex((f) => f.cursor);
      if (fileInFocusIndex === -1) return;
      this.toggleSelect(this.screenFiles[fileInFocusIndex], true);
      if (selectAll && (this.lastSelectedFileIndex || this.lastSelectedFileIndex === 0)) {
        const different = fileInFocusIndex - this.lastSelectedFileIndex;
        const beginFrom = Math.sign(different) > 0 ? this.lastSelectedFileIndex + 1 : fileInFocusIndex + 1;
        const endWith = Math.sign(different) > 0 ? fileInFocusIndex - 1 : this.lastSelectedFileIndex - 1;
        console.log(beginFrom, endWith, 'kokoko');
        for (let i = beginFrom; i <= endWith; ++i) {
          this.toggleSelect(this.screenFiles[i], true);
        }
        this.lastSelectedFileIndex = null;
      }
      if (!selectAll) {
        this.lastSelectedFileIndex = fileInFocusIndex;
      }
    },
    selected: () => {
      console.log('selected');
    },
    toggleSelect(file, doNotUpdateLastSelectedFileIndex) {
      console.log(`File ${file.path} ${file.selected ? 'unselected' : 'selected'}`);
      file.selected = !file.selected;
      if (file.selected) {
        this.selectedFiles.push(file);
      } else {
        let index = -1;
        for (let i = 0; i < this.selectedFiles.length; ++i) {
          if (this.selectedFiles[i].path === file.path) {
            index = i;
            break;
          }
        }
        if (index > -1) {
          this.selectedFiles.splice(index, 1);
        }
      }
      if (!doNotUpdateLastSelectedFileIndex) {
        this.lastSelectedFileIndex = this.screenFiles.findIndex((f) => f.path === file.path);
      }
    },
    async loadStatistic(path) {
      const {
        matched,
        missed,
        missmatched,
        calculated,
        table,
      } = await api.getStatistic(path);
      this.statistic.calculated = calculated;
      this.statistic.matched = matched;
      this.statistic.missed = missed;
      this.statistic.missmatched = missmatched;
      this.statistic.table = table;
      console.log('statistic table: ', this.statistic.table);
    },
    onFolderCreated() {
      this.loadFiles(this.openedPath);
    },
    async loadFiles(path) {
      // clear old files
      this.folder.files = [];
      this.folder.folders = [];
      this.screenFiles = [];
      this.selectedFiles = [];

      // load data
      const content = await api.getFiles(path);

      // prepare files
      this.folder.files = content.files.map((f) => {
        f.type = 'file';
        f.selected = false;
        f.serverPath = this.staticServer + f.relativePath;
        f.cursor = false;
        return f;
      })
        .filter((f) => {
          // console.log(f.name, this.filter.exclude, this.filter.include)
          let excludeFactor = true;
          let includeFactor = true;
          if (this.filter.exclude) {
            if (f.name.toLowerCase()
              .includes(this.filter.exclude.toLowerCase())) {
              excludeFactor = false;
            }
          }
          if (this.filter.include) {
            if (f.name.toLowerCase()
              .includes(this.filter.include.toLowerCase())) {
              includeFactor = true;
            } else {
              includeFactor = false;
            }
          }
          return includeFactor && excludeFactor;
        });

      this.folder.total_file = this.folder.files.length;

      // prepare folders
      let previousLetter = '-';
      this.folder.folders = content.folders.map((f) => {
        f.type = 'folder';
        f.selected = false;
        const lowerName = f.name.toLowerCase();
        const firstLetter = lowerName.substring(0, 1);
        if (!lowerName.startsWith(previousLetter) && firstLetter.toUpperCase() !== firstLetter.toLowerCase()) {
          f.shortcut = firstLetter.toUpperCase();
          console.log(firstLetter.toUpperCase());
          previousLetter = firstLetter;
        }
        return f;
      });

      // add parent dir to folder list
      const parentDir = await api.getParent(path);
      if (parentDir.access) {
        this.folder.folders.unshift({
          path: parentDir.path,
          name: '../',
          type: 'folder',
        });
      }

      // prepare next folder for move
      this.nextFolders = await api.getNextFolders(path);

      // prepare to show page
      if (!this.page) {
        this.page = 1;
      }

      if (!this.configFilePerPage) {
        this.perPage = this.folder.files.length;
      } else {
        this.perPage = this.configFilePerPage;
      }
      this.page_count = Math.ceil(this.folder.files.length / this.perPage);
      if (this.page > this.page_count) {
        this.page = this.page_count;
      }

      this.calculatePage(this.page);

      return {
        currentPath: content.path,
      };
    },

    calculatePage(page) {
      if (!this.perPage) {
        this.screenFiles = [...this.folder.files];
      } else {
        this.screenFiles = this.folder.files.slice((page - 1) * this.perPage, page * this.perPage);
      }
      if (this.screenFiles.length) {
        this.screenFiles = this.screenFiles.map((f) => {
          f.cursor = false;
          return f;
        });
        this.screenFiles[0].cursor = true;
      }
    },
    onPageChange(page) {
      this.page = page;
      this.calculatePage(page);
    },
    backward() {
      if (this.page > 1) {
        this.page -= 1;
        this.calculatePage(this.page);
      }
    },

    forward() {
      if (!this.forwardOnly) {
        if (this.page < this.page_count) {
          this.page += 1;
          this.calculatePage(this.page);
        }
      } else {
        this.onForwardOnly();
      }
    },

    async onForwardOnly() {
      const selected = this.selectedFiles.map((f) => f.path);
      const notSelected = this.screenFiles.filter((f) => !selected.includes(f.path) && f.image)
        .map((f) => f.path);
      await api.doForwardOnly(selected, notSelected);
      this.loadFiles(this.path);
    },

    async goToTheFolder(file) {
      if (file.path === this.path) {
        socket.unsubscribeForFolder(this.openedPath);
        socket.subscibeForFolder(this.path, this.fileChanged());
        this.openedPath = this.path;
        this.filter = {};
        await this.loadFiles(this.path);
        return;
      }
      if (this.statisticShown && file.path.length > this.path.length) {
        // eslint-disable-next-line no-return-await,consistent-return
        return await this.selectFolder({
          folder: file.name,
          filter: {},
        });
      }
      this.$router.push({
        name: 'explorer',
        query: { dir: file.path },
      });
    },
    async deleteFiles() {
      if (this.selectedFiles.length === 0) return;
      console.log('Delete files');
      this.isLoading.deleting = true;
      await api.deleteFiles(this.selectedFiles.map((f) => f.path));
      this.isLoading.deleting = false;
      // delete that files from folder
      await this.loadFiles(this.path);
    },
    async moveFiles(dest) {
      if (this.selectedFiles.length === 0) return;
      if (this.nextFolders.length === 0) return;
      this.isLoading.moving = true;
      await api.moveFiles(this.selectedFiles.map((f) => f.path), dest);
      this.isLoading.moving = false;
      // move files
      await this.loadFiles(this.path);
    },
    fileChanged() {
      const self = this;
      return (file) => {
        console.log(file);
        if (file.event === 'add' && file.type === 'file') {
          file.selected = false;
          file.serverPath = this.staticServer + file.relativePath;
          self.folder.files.push(file);
          if (self.page === self.page_count) {
            self.screenFiles.push(file);
          }
        } else if (file.event === 'add' && file.type === 'folder') {
          file.selected = false;
          self.folder.folders.push(file);
        } else if (file.event === 'remove' && file.type === 'folder') {
          let index = -1;
          for (let i = 0; i < self.folder.folders.length; i++) {
            if (self.folder.folders[i].path === file.path) {
              index = i;
              break;
            }
          }
          if (index > -1) self.folder.folders.splice(index, 1);
        } else if (file.event === 'remove' && file.type === 'file') {
          let index = -1;
          for (let i = 0; i < self.folder.files.length; i++) {
            if (self.folder.files[i].path === file.path) {
              index = i;
              break;
            }
          }
          if (index > -1) self.folder.files.splice(index, 1);

          index = -1;
          for (let i = 0; i < self.selectedFiles.length; i++) {
            if (self.selectedFiles[i].path === file.path) {
              index = i;
              break;
            }
          }
          if (index > -1) self.selectedFiles.splice(index, 1);

          index = -1;
          for (let i = 0; i < self.screenFiles.length; i++) {
            if (self.screenFiles[i].path === file.path) {
              index = i;
              break;
            }
          }
          if (index > -1) self.screenFiles.splice(index, 1);
        }
      };
    },
    setFocusOnFiles() {
      console.log('set focus on files');
      window.document.getElementById('keyupevents')
        .focus();
    },
    enablePreventingScrolling() {
      window.addEventListener('keydown', preventDefaultScrolling, false);
    },
    disablePreventingScrolling() {
      window.removeEventListener('keydown', preventDefaultScrolling);
    },
    onOpenModal() {
      this.disablePreventingScrolling();
    },
    onCloseModal() {
      this.setFocusOnFiles();
      this.enablePreventingScrolling();
    },
    showStatistic() {
      EventBus.$emit('show-statistic', this.path);
    },
  },
  async created() {
    this.perPage = this.configFilePerPage;
    const { currentPath } = await this.loadFiles(this.dir || null);
    this.createdFolders = this.folder.folders;
    await this.loadStatistic(this.dir || currentPath || this.path || null);

    // set current path if he hasn't defined
    this.path = currentPath;
    this.openedPath = currentPath;

    // subscribe for that folder
    socket.subscibeForFolder(this.path, this.fileChanged());

    // set focus on keyupevents
    this.setFocusOnFiles();

    // get status
    this.status = await api.getRunningState();
    socket.subscibeForFolder('running.lock', (data) => {
      if (data.event === 'change') this.status = data.content;
      if (data.event === 'unlink') this.status = false;
    });
    this.enablePreventingScrolling();
  },
  beforeDestroy() {
    socket.unsubscribeForFolder(this.path);
    socket.unsubscribeForFolder('running.lock');
  },
};


</script>

<style lang="scss">
  #keyupevents {
    outline: none;
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
    list-style-type: none;

    li {
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
    padding: 5px;
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
        box-shadow: 0px 1px 6px -2px #777;
      }
    }
  }

  .list-folders {
    .folder {
      display: inline;
      cursor: pointer;
    }
  }
</style>
