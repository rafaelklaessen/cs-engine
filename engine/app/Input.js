export default class Input {
   static state = 0
   static openBy = 0
   static text = ''
   static form = undefined
   static input = undefined
   static button = undefined

   static create() {
      const form = document.createElement('form')
      form.id = 'textInputForm'
      form.setAttribute('onsubmit', 'cs.input.close() return false')
      form.setAttribute('autocomplete', 'off')
      const input = document.createElement('input')
      input.id = 'textInputText'
      input.setAttribute('autocomplete', 'off')
      input.type = 'text'

      const button = document.createElement('button')
      button.type = 'submit'
      button.innerHTML = 'Enter'

      form.appendChild(input)
      form.appendChild(button)
      document.body.appendChild(form)

      this.form = form
      this.input = input
      this.button = button
   }

   static open(id) {
      if (this.form.style.display !== 'block') {
         this.openBy = id
         this.form.style.display = 'block'
         this.input.click()
         this.input.focus()
      }
   }

   static close() {
      if (this.form.style.display == 'block') {
         this.form.style.display = 'none'
         this.text = this.input.value
         document.getElementById('view').click()
         document.getElementById('view').focus()
         this.input.value = ''
      }
      return false
   }

   static return(id) {
      const text = this.text
      if (this.openBy == id && text !== '') {
         this.text = ''
         return text
      }
      return ''
   }

   static resize() {
      const winWidth = window.innerWidth

      const border = 2
      const cont = this.form
      const input = this.input
      const button = this.button
      const h = 50
      const nw = winWidth

      const bw = 100
      const iw = nw - bw
      // Width
      cont.style.width = `${nw}px`
      input.style.width = `${iw}px`
      button.style.width = `${bw}px`
      // Height
      input.style.height = `${h}px`
      button.style.height = `${h}px`
      button.style.lineHeight = `${(h - border * 2)}px`

      button.style.border = `${border}px solid black`
      input.style.border = `${border}px solid black`
   }
}
