import { Storage } from './storage'

type UpdateScore = {
  score: string | number
  scoresElement: NodeListOf<Element>
}

type LastRound = {
  score: string | number
  scoresElement: NodeListOf<Element>
}

export class Game {
  // 0スタートとする
  private round = 0

  private count: 1 | 2 | 3 = 1

  start() {
    console.log('game start')
    const scores = document.querySelectorAll('.score')

    // 投球ボタンへ反映
    const bolingBtn = document.querySelector('.bowling_btn')
    bolingBtn?.addEventListener('click', () => {
      this.bowling(scores)
    })

    // リセットボタンへ反映
    const resetBtn = document.querySelector('.reset_btn')
    resetBtn?.addEventListener('click', () => {
      this.reset(scores)
    })
  }

  /**
   * @description
   * 指定したmax値を上限としてランダムな値を生成する
   */
  private getRandomNum(num: { max: number }) {
    const { max } = num
    return Math.floor(Math.random() * max + 1)
  }

  /**
   * @description
   * スコアを更新する
   */
  private updateScore(item: UpdateScore) {
    const { score, scoresElement } = item
    Storage.save({ round: this.round, score })
    scoresElement[this.round].textContent = score.toString()
  }

  /**
   * @description
   * 投球ボタン クリック処理
   */
  private bowling(scoresElement: NodeListOf<Element>) {
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
      alert('ゲーム終了')
      return
    }

    // 最終ラウンド
    if (this.round === 9) {
      this.lastRound({ score: randomScore, scoresElement })
      return
    }

    // ストライク判定
    if (this.count === 1 && randomScore === 10) {
      this.updateScore({ score: randomScore, scoresElement })
      this.round += 1
      return
    }

    // 1球目且つ10未満
    if (this.count === 1 && randomScore < 10) {
      this.updateScore({ score: randomScore, scoresElement })
      this.count = 2
      return
    }

    // 二球目
    const firstScore = Storage.data[this.round]
    if (this.count === 2 && typeof firstScore === 'number') {
      this.updateScore({ score: firstScore + randomScore, scoresElement })
      this.round += 1
      this.count = 1
      return
    }
  }

  /**
   * @description
   * 最終ラウンドの処理
   */
  private lastRound(item: LastRound) {
    const { score, scoresElement } = item
    // 1球目
    if (this.count === 1) {
      this.updateScore({ score, scoresElement })
      this.count = 2
      return
    }

    const storageScore = Storage.data[this.round]
    const incremented = this.increment(score, storageScore)
    // TODO: 2回連続ストライクの時に対応できない
    const isNextCount = incremented >= 10
    // 2球目で且つ3球目がある場合
    if (this.count === 2 && isNextCount) {
      this.updateScore({ score: incremented, scoresElement })
      this.count = 3
      return
    }

    // 2球目で且つ3球目が無い 又は3球目
    this.updateScore({ score: incremented, scoresElement })
    this.count = 1
    this.round += 1
    return
  }

  /**
   * @description
   * リセットボタン リセット処理
   */
  private reset(scoresElement: NodeListOf<Element>) {
    this.count = 1
    this.round = 0
    Storage.reset()
    scoresElement.forEach(element => {
      element.textContent = ''
    })
  }

  private increment(a: number | string | undefined, b: number | string | undefined): number {
    return Number(a) + Number(b)
  }
}
