export default class Slider {
  container: HTMLDivElement
  el: HTMLInputElement
  callbacks: Array<Function>
  mounterId: string
  cssIndex: number
  min: number = 0
  max: number = 100
  prefix: string = ''
  suffix: string = '%'
  value: number
  constructor(id: string, options: Object, mountEl?: HTMLElement) {
    this.container = document.createElement('div')
    this.container.classList.add('slider-containder')

    this.el = document.createElement('input')
    this.el.id = id
    this.el.value = '0'
    this.el.setAttribute('type', 'range')
    this.el.classList.add('slider')
    this.container.append(this.el)

    this.el.addEventListener('input', this.update.bind(this))
    this.callbacks = []

    Object.assign(this, options)
    if (mountEl) {
      this.mountAt(mountEl)
    }
  }
  mountAt(dom: HTMLElement) {
    this.mounterId = dom.id
    dom.append(this.container)
    this.update()
  }
  get() {
    return this.value;
  }
  update() {
    this.value = this.min + (+this.el.value + 0.5) / 100 * (this.max - this.min)
    let stylesheet = <CSSStyleSheet>document.styleSheets[0];
    stylesheet.deleteRule(this.cssIndex)
    this.cssIndex = stylesheet.insertRule(
      `#${this.mounterId}::after 
        { content: "${this.prefix}${this.value.toFixed(2)}${this.suffix}" }`)
    this.callbacks.forEach(cb => cb(this.el.value))
  }
  updated(cb: Function) {
    this.callbacks.push(cb)
  }
}
