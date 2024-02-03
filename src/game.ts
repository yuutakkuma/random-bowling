import { Storage } from './storage'

export class Game {
  // 0スタートとする
  private round = 0

  private count: 1 | 2 | 3 = 1

  start() {
    console.log('game start')

    const scores = document.querySelectorAll('.score')

    const bolingBtn = document.querySelector('.bowling_btn')
    bolingBtn?.addEventListener('click', () => {
      const score = Storage.data[this.round]
      const num = this.getRandomNum({ max: 10 - (score ?? 0) })
      console.log({ score, num, round: this.round, count: this.count })

      if (this.round === 10) {
        console.log('game end')
        return
      }

      // ストライク判定
      if (this.count === 1 && num === 10) {
        Storage.save({ round: this.round, score: num })
        scores[this.round].textContent = String(Storage.data[this.round])
        this.round += 1
        return
      }

      if (this.count === 1 && num < 10) {
        Storage.save({ round: this.round, score: num })
        scores[this.round].textContent = String(Storage.data[this.round])
        this.count = 2
        return
      }

      // 二球目
      const oldScore = Storage.data[this.round]
      if (this.count === 2) {
        Storage.save({ round: this.round, score: (oldScore ?? 0) + num })
        scores[this.round].textContent = String(Storage.data[this.round])
        this.round += 1
        this.count = 1
        return
      }
    })
  }

  private getRandomNum(num: { max: number }) {
    const { max } = num
    return Math.floor(Math.random() * max + 1)
  }
}
