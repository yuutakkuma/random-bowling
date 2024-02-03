import { Storage } from './storage'

export class Game {
  // 0スタートとする
  private round = 0

  private count: 1 | 2 | 3 = 1

  start() {
    console.log('game start')

    const scores = document.querySelectorAll('.score')

    // スコアを更新
    const updateScore = (round: number, score: string | number) => {
      Storage.save({ round, score })
      scores[round].textContent = score.toString()
    }

    // 投球ボタン クリック処理
    const boling = () => {
      const storageScore = Storage.data[this.round]
      const maxRandomNumber = 10 - (typeof storageScore === 'number' ? storageScore : 0)

      const randomScore = this.getRandomNum({ max: maxRandomNumber })

      console.log({
        score: storageScore,
        randomScore,
        round: this.round,
        count: this.count
      })

      if (this.round === 10) {
        console.log('game end')
        return
      }

      // ストライク判定
      if (this.count === 1 && randomScore === 10) {
        updateScore(this.round, randomScore)
        this.round += 1
        return
      }

      // 1球目且つ10未満
      if (this.count === 1 && randomScore < 10) {
        updateScore(this.round, randomScore)
        this.count = 2
        return
      }

      // 二球目
      const firstScore = Storage.data[this.round]
      if (this.count === 2 && typeof firstScore === 'number') {
        updateScore(this.round, firstScore + randomScore)

        this.round += 1
        this.count = 1
        return
      }
    }

    // リセットボタン リセット処理
    const reset = () => {
      this.count = 1
      this.round = 0
      Storage.reset()
      scores.forEach(element => {
        element.textContent = ''
      })
    }

    // 投球ボタンへ反映
    const bolingBtn = document.querySelector('.bowling_btn')
    bolingBtn?.addEventListener('click', boling)

    // リセットボタンへ反映
    const resetBtn = document.querySelector('.reset_btn')
    resetBtn?.addEventListener('click', reset)
  }

  // 指定したmax値を上限としてランダムな値を生成する
  private getRandomNum(num: { max: number }) {
    const { max } = num
    return Math.floor(Math.random() * max + 1)
  }
}
