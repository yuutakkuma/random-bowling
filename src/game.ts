import { Storage } from './storage'

type UpdateScore = {
  score: string | number
}

type LastRound = {
  score: string | number
}

export class Game {
  // 0スタートとする
  private round = 0

  private count: 1 | 2 | 3 = 1

  private scoresElement: NodeListOf<Element>

  private currentRoundText: HTMLHeadingElement

  private currentScoreText: HTMLHeadingElement

  private currentCountText: HTMLHeadingElement

  constructor() {
    // スコアElement一覧を取得
    this.scoresElement = document.querySelectorAll('.score')
    // description elementを取得
    const descriptionElement = document.querySelector<HTMLElement>('.description')
    if (!descriptionElement) {
      throw new Error('description elementがありません。')
    }
    descriptionElement.style.display = 'flex'
    descriptionElement.style.flexDirection = 'column'

    this.currentRoundText = document.createElement('h4')
    this.currentScoreText = document.createElement('h4')
    this.currentCountText = document.createElement('h4')
    this.updateDescription(undefined)

    descriptionElement.append(this.currentRoundText, this.currentCountText, this.currentScoreText)
  }

  start() {
    // 投球ボタンへ反映
    const bolingBtn = document.querySelector('.bowling_btn')
    bolingBtn?.addEventListener('click', this.bowling)

    // リセットボタンへ反映
    const resetBtn = document.querySelector('.reset_btn')
    resetBtn?.addEventListener('click', this.reset)
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
    const { score } = item
    Storage.save({ round: this.round, score })
    this.scoresElement[this.round].textContent = score.toString()
  }

  /**
   * @description
   * 投球ボタン クリック処理
   */
  private bowling() {
    const storageScore = Storage.data[this.round]
    const maxRandomNumber = 10 - (typeof storageScore === 'number' ? storageScore : 0)

    const randomScore = this.getRandomNum({ max: maxRandomNumber })

    if (this.round === 10) {
      alert('ゲーム終了')
      return
    }

    this.updateDescription(randomScore)

    // 最終ラウンド
    if (this.round === 9) {
      this.lastRound({ score: randomScore })
      return
    }

    // ストライク判定
    if (this.count === 1 && randomScore === 10) {
      this.updateScore({ score: randomScore })
      this.round += 1
      return
    }

    // 1球目且つ10未満
    if (this.count === 1 && randomScore < 10) {
      this.updateScore({ score: randomScore })
      this.count = 2
      return
    }

    // 二球目
    const firstScore = Storage.data[this.round]
    if (this.count === 2 && typeof firstScore === 'number') {
      this.updateScore({ score: firstScore + randomScore })
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
    const { score } = item
    // 1球目
    if (this.count === 1) {
      this.updateScore({ score })
      this.count = 2
      return
    }

    const storageScore = Storage.data[this.round]
    const incremented = this.increment(score, storageScore)
    const isNextCount = incremented >= 10
    // 2球目で且つ3球目がある場合
    if (this.count === 2 && isNextCount) {
      this.updateScore({ score: incremented })
      this.count = 3
      return
    }

    // 2球目で且つ3球目が無い 又は3球目
    this.updateScore({ score: incremented })
    this.count = 1
    this.round += 1
    return
  }

  /**
   * @description
   * リセットボタン リセット処理
   */
  private reset() {
    this.count = 1
    this.round = 0
    Storage.reset()
    this.scoresElement.forEach(element => {
      element.textContent = ''
    })
    this.updateDescription(undefined)
  }

  /**
   * @description
   * 加算します
   */
  private increment(a: number | string | undefined, b: number | string | undefined): number {
    // TODO: 数字になるえない値がくるとNaNになる
    return Number(a) + Number(b)
  }

  private updateDescription(randomScore: number | undefined) {
    console.log(this.count)

    this.currentRoundText.textContent = `ラウンド ${this.round + 1}`
    this.currentCountText.textContent = `投球 ${this.count}回目`
    this.currentScoreText.textContent = randomScore ? `今の投球結果: ${randomScore}` : '投球ボタンを押してね！'
  }
}
