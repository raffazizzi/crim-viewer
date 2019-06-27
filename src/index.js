import fetch from 'isomorphic-fetch'

class CrimViewer {
  constructor(options) {
    this.omas = options.omas ? options.omas : 'http://mith.umd.edu/ema/'
    this.meiUrl = options.mei
    this.ema = options.ema
    this.fullEma = `${this.omas}${encodeURIComponent(this.meiUrl)}/${this.ema}/highlight`
    this.div = document.getElementById(options.div)
    this.controls = document.getElementById(options.controls)
    this.vrv = options.vrv
    this.meiData = ''
    this.curPage = 0
    this.startPage = 1
    this.highlightedIds = []
  }

  getMeiData() {
    return fetch(this.fullEma)
      .then(response => response.text())
      .then(mei => {
        this.meiData = mei
        return mei
      })
  }

  setupVerovio() {
    this.div.innerHTML = 'Loading score...'
    const x = this.div.offsetWidth
    const y = this.div.offsetHeight
    const vrvOptions = {
      pageWidth: x * 100 / 35,
      pageHeight: y * 100 / 35,
      ignoreLayout: 1,
      adjustPageHeight: 1,
      border: 10,
      scale: 35
    }
    this.vrv.setOptions(vrvOptions)
  }

  renderMei() {
    this.vrv.loadData( this.meiData + '\n', '' )
    // Parse MEI to find highlighted ids
    if (this.highlightedIds.length == 0) {
      const parser = new window.DOMParser()
      const meiDoc = parser.parseFromString(this.meiData, 'text/xml')
      this.highlightedIds = meiDoc.querySelector("annot[type='ema_highlight']").getAttribute('plist').split(' ')
    }

    this.startPage = this.vrv.getPageWithElement(this.highlightedIds[0].replace('#', ''))
    this.curPage = this.startPage
    this.renderPage()
  }

  renderPage() {
    // Since there could be multiple verovio scores, the MEI data must be reloaded each time
    if (this.meiData) {
      this.vrv.loadData( this.meiData + '\n', '' )
      const svg = this.vrv.renderPage(this.curPage)
      this.div.innerHTML = svg
      this.highlightMusic()
    }
  }

  highlightMusic() {
    // Add classes to highlighted ids
    for (const id of this.highlightedIds) {
      const event = this.div.querySelector(id)
      if (event) {
        // Do not highlight ties (something weird going on in omas?)
        if (!event.classList.contains('tie')) {
          event.classList.add('cw-highlighted')
        }
      }
    }
  }

  prevPage() {
    if (this.curPage > 1) {
      this.curPage = this.curPage - 1
      this.renderPage()
    }
  }

  nextPage() {
    if (this.curPage < this.vrv.getPageCount()) {
      this.curPage = this.curPage + 1
      this.renderPage()
    }
  }

  firstHighlightedPage() {
    this.curPage = this.startPage
    this.renderPage()
  }

  bindControls() {
    this.controls.querySelector('.cw-prev').onclick = () => { this.prevPage() }
    this.controls.querySelector('.cw-next').onclick = () => { this.nextPage() }
    this.controls.querySelector('.cw-show').onclick = () => { this.firstHighlightedPage() }
  }

  render() {
    this.setupVerovio()
    this.bindControls()
    this.getMeiData().then(() => {
      this.renderMei()
    })

    // When width changes, re-render
    // window.addEventListener('resize', (event) => {
    //   console.log('resize')
    //   this.setupVerovio()
    //   this.renderPage()
    // })
  }
}

window.CrimViewer = CrimViewer
