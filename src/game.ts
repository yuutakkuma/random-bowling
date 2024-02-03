import { Storage } from './storage'

type Score = {
  score: string | number
}

type UpdateScore = Score & {
  round: number
}

export class Game {
  // 0スタートとする
  private round = 0

  private count: 1 | 2 | 3 = 1

  private scoresElement: NodeListOf<Element>

  private currentRoundText: HTMLHeadingElement

  private currentScoreText: HTMLHeadingElement

  private currentCountText: HTMLHeadingElement

  /** 前回スペアだったかの判定 */
  private isSpare: boolean = false

  /** 前ラウンドのスコア */
  private beforeRoundScore: number = 0

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
    bolingBtn?.addEventListener('click', () => {
      this.bowling()
    })

    // リセットボタンへ反映
    const resetBtn = document.querySelector('.reset_btn')
    resetBtn?.addEventListener('click', () => {
      this.reset()
    })
  }

  /**
   * @description
   * 指定したmax値を上限としてランダムな値を生成する
   */
  private getRandomNum(num: { max: number }) {
    const { max } = num
    console.log({ max })

    return Math.floor(Math.random() * max + 1)
  }

  /**
   * @description
   * スコアを更新する
   */
  private updateScore(item: UpdateScore) {
    const { round, score } = item
    Storage.save({ round, score })
    this.scoresElement[round].textContent = score.toString()

    if (this.isSpare) {
      const updatedBeforeRoundScore = this.beforeRoundScore + Number(score)
      Storage.save({ round: round - 1, score: updatedBeforeRoundScore })
      this.scoresElement[round - 1].textContent = updatedBeforeRoundScore.toString()
      this.isSpare = false
    }
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
      this.updateScore({ round: this.round, score: randomScore })
      this.updateRound({ score: randomScore })
      return
    }

    // 1球目且つ10未満
    if (this.count === 1 && randomScore < 10) {
      this.updateScore({ round: this.round, score: randomScore })
      this.count = 2
      return
    }

    /*
     * 2球目且つスペア
     * - スペアを取った場合、次の投球分を加算することができる
     * @example
     * ラウンド1 - 1 => 3
     * ラウンド1 - 2 => 7 スペア！！
     *
     * ラウンド2 - 1 => 5 この時点でラウンド1の得点 = 15となる
     *
     */
    const firstScore = Storage.data[this.round]
    if (this.count === 2 && typeof firstScore === 'number' && firstScore + randomScore === 10) {
      const score = firstScore + randomScore
      this.updateScore({ round: this.round, score })
      this.updateRound({ score })
      this.count = 1
      this.isSpare = true
      this.beforeRoundScore = score
      return
    }

    // 2球目
    if (this.count === 2 && typeof firstScore === 'number') {
      const score = firstScore + randomScore
      this.updateScore({ round: this.round, score })
      this.updateRound({ score })
      this.count = 1
      return
    }
  }

  /**
   * @description
   * 最終ラウンドの処理
   */
  private lastRound(item: Score) {
    const { score } = item
    // 1球目
    if (this.count === 1) {
      this.updateScore({ round: this.round, score })
      this.count = 2
      return
    }

    const storageScore = Storage.data[this.round]
    const incremented = this.increment(score, storageScore)
    const isNextCount = incremented >= 10
    // 2球目で且つ3球目がある場合
    if (this.count === 2 && isNextCount) {
      this.updateScore({ round: this.round, score: incremented })
      this.count = 3
      return
    }

    // 2球目で且つ3球目が無い 又は3球目
    this.updateScore({ round: this.round, score: incremented })
    this.updateRound({ score })
    this.count = 1
    return
  }

  /**
   * @description
   * リセットボタン リセット処理
   */
  private reset() {
    this.count = 1
    this.round = 0
    this.beforeRoundScore = 0
    this.scoresElement.forEach(element => {
      element.textContent = ''
    })
    this.updateDescription(undefined)
    Storage.reset()
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
    this.currentRoundText.textContent = `ラウンド ${this.round + 1}`
    this.currentCountText.textContent = `投球 ${this.count}回目`
    this.currentScoreText.textContent = randomScore ? `今の投球結果: ${randomScore}` : '投球ボタンを押してね！'
  }

  /**
   * @description
   * ラウンドを更新し、前ラウンドスコアを更新します。
   */
  private updateRound(item: Score) {
    const { score } = item
    this.round += 1
    this.beforeRoundScore = Number(score)
  }
}
