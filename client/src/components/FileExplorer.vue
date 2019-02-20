<template>
  <div>
    <div 
      class='next-folders'
      v-bind:class="{ disable: selectedFiles.length === 0 }">
      <u>Statistic:</u>
      <ul v-if="statistic.calculated">
        <li>matched: {{ statistic.matched }}</li>
        <li>missed: {{ statistic.missed }}</li>
        <li>missmatched: {{ statistic.missmatched }}</li>
      </ul>
      <span v-else>
        not calculated
      </span>
      <br><br>
      Set file size (in pixels): <input type="number" v-model="fileSize"><br><br>
      Selected files count: {{ selectedFiles.length }}<br><br>

      <div v-if="selectedFiles.length > 0">
        <a href="javascript:void(0)" v-on:click="deleteFiles()">Delete files</a> <span v-if="isLoading.deleting"><v-icon name="spinner"></v-icon> Removing...</span></br><br>
        Move files to the next folders <span v-if="isLoading.moving"><v-icon name="spinner"></v-icon> (Moving...)</span></span>:
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
    <div class='container'>
      <div class="header">
        <router-link to="/">To main screen</router-link>
        | <b>{{ path }}</b>
      </div>
      <div class="file-explorer-grid bottom-border">
        <file
          v-for = "file in folder.folders"
          v-bind:file="file"
          v-on:click.native="goToTheFolder(file)"
          v-bind:key="file.path">
        </file>
      </div>
      <div class="file-explorer-grid" v-infinite-scroll="loadMore" v-on:mouseup="mouseUp()">
        <file 
          v-for="file in screenFiles" 
          v-bind:file="file"
          v-on:click.native="toggleSelect(file)"
          v-bind:key="file.path"
          v-bind:size="fileSize">
        </file>
      </div>

      <modal name="define-destination">
        <span>Pick the distination for moving files:</span>
        <ul>
          <li 
            v-for="f in nextFolders" 
            v-bind:key="f.path"
            v-on:click="moveFiles(f.path)">
            {{ f.name }}
          </li>
        </ul>
      </modal>
    </div>
  </div>
</template>

<script>
import File from './File.vue'
import api from '../api'
import socket from '../socket'

export default {
  props: [
    'dir'
  ],
  components: {
    File
  },
  data: () => ({
    isLoading: {
      deleting: false,
      moving: false,
    },
    fileSize: 100,
    page: 0,
    page_count: null,
    page_size: 100,
    staticServer: 'http://localhost:2929/',
    path: null,
    showStatistic: false,
    moveDestination: null,
    nextFolders: [],
    statistic: {
      calculated: false,
      matched: null,
      missed: null,
      missmatched: null
    },
    screenFiles: [],
    folder: {
      files: [],
      folders: []
    },
    selectedFiles: []
  }),
  methods: {
    selected: () => {
      console.log('selected')
    },
    toggleSelect: function (file) {
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
    },
    loadStatistic: async function (path) {
      const {
        matched,
        missed,
        missmatched,
        calculated
      } = await api.getStatistic(path)
      this.statistic.calculated = calculated
      this.statistic.matched = matched
      this.statistic.missed = missed
      this.statistic.missmatched = missmatched
    },
    loadFiles: async function (path) {
      // load data
      console.log(`try to load path: ${path}`)
      const content = await api.getFiles(path)
      
      // prepare files
      this.folder.files = content.files.map( f => { 
        f.type ='file'
        f.selected = false
        f.serverPath = this.staticServer+f.relativePath
        return f 
      })
      console.log(this.folder.files)

      // prepare folders
      this.folder.folders = content.folders.map( f => { 
        f.type='folder';
        f.selected = false
        return f 
      })

      // add parent dir to folder list
      const parentDir = await api.getParent(path)
      console.log('Parent dir: ', parentDir)
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
        console.log(this.folder.files, i, this.folder.files.length)
        this.screenFiles.push( this.folder.files[i] )
      }
    },
    loadMore: function () {
      console.log(this.page, this.page_count)
      if ( this.folder.files.length === 0 ) return
      if ( this.page >= this.page_count ) return
      this.page++
      this.addPage(this.page)
    },
    goToTheFolder: function (file) {
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
    pickDestination: async function () {
      if ( this.selectedFiles.length === 0 ) return
      if ( this.nextFolders.length === 0 ) return
      const folders = await api.getNextFolders(this.path)
      this.$modal.show('define-destination')
    },
    moveFiles: async function (dest) {
      if ( this.selectedFiles.length === 0 ) return
      if ( this.nextFolders.length === 0 ) return
      this.$modal.hide('define-destination')
      this.isLoading.moving = true
      await api.moveFiles(this.selectedFiles.map( f => f.path), dest)
      this.isLoading.moving = false
      //move files
      // await this.loadFiles(this.path)
    },
    fileChanged: function () {
      const self = this
      return (file) => {
        if ( file.event === 'add' ) {
          file.selected = false
          self.folder.files.push(file)
          if ( self.page === self.page_count ) {
            self.screenFiles.push(file)
          }
        } else if ( file.event === 'remove' ) {
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
    mouseUp: function () {
      const selection = window.getSelection()
      if ( selection.toString().length < 2 ) return

      let index = -1
      let paths = selection.toString().split('\n')
      for ( let i = 0; i < this.folder.files.length; ++i ) {
        if ( i === this.folder.files.length -1 ) break
        if ( this.folder.files[i].path.indexOf(paths[0]) > -1 
              && this.folder.files[i+1].path.indexOf(paths[1] > -1 ) ) {
          index = i
          break
        }
      }

      if ( index > -1 ) {
        for ( let i = 0; i < paths.length; ++i ) 
          this.toggleSelect(this.folder.files[i+index])
      }

      // empty selection
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
      }
    }
  },
  created: async function () {
    const { currentPath } = await this.loadFiles(this.dir || null)
    await this.loadStatistic( this.dir || currentPath || this.path || null )

    // set current path if he hasn't defined
    this.path = currentPath

    // subscribe for that folder
    socket.subscibeForFolder(this.path, this.fileChanged())
  },
  beforeDestroy: function () {
    socket.unsubscribeForFolder(this.path)
  }
}
</script>

<style lang="scss">
.container {
  width: calc(100% - 250px);
}
.next-folders {
  width: 240px;
  position: fixed;
  top: 10px;
  right: 0px
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

