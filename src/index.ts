import { Game } from './game'

const root = document.getElementById('root')
const text = document.createElement('h2')
text.textContent = 'Hello world'
root?.appendChild(text)

Game.start()
