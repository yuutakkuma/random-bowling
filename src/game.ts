import { Storage, StrikeStatus } from './storage'

type Score = {
  score: number
}

type UpdateScore = Score & {
  flame: number
  strikeStatus: StrikeStatus
}

export class Game {
  // 0スタートとする
  private flame = 0

  // 1フレーム単位での現在カウント
  private currentCount: 1 | 2 | 3 = 1

  // カウント総数
  private totalCount: number = 0

  private scoresElement: NodeListOf<Element>

  private currentFlameText: HTMLHeadingElement

  private currentScoreText: HTMLHeadingElement

  private currentCountText: HTMLHeadingElement

  /** 前回スペアだったかの判定 */
  private isSpare: boolean = false

  /** 前フレームのスコア */
  private beforeFlameScore: number = 0

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

    this.currentFlameText = document.createElement('h4')
    this.currentScoreText = document.createElement('h4')
    this.currentCountText = document.createElement('h4')
    this.updateDescription(undefined)

    descriptionElement.append(this.currentFlameText, this.currentCountText, this.currentScoreText)
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

    return Math.floor(Math.random() * max + 1)
  }

  /**
   * @description
   * スコアを更新する
   */
  private updateScore(item: UpdateScore) {
    const { flame, score, strikeStatus } = item
    Storage.save({ flame, score, strikeStatus })
    this.scoresElement[flame].textContent = score.toString()

    if (this.isSpare) {
      const updatedBeforeFlameScore = this.beforeFlameScore + Number(score)
      Storage.save({ flame: flame - 1, score: updatedBeforeFlameScore, strikeStatus: Storage.strikeStatus[flame - 1] })
      this.scoresElement[flame - 1].textContent = updatedBeforeFlameScore.toString()
      this.isSpare = false
    }

    // ストライクチェック
    Storage.strikeStatus.forEach((status, flameIndex) => {
      // ストライクフラグがtrue 且つ ストライク後から3球までの値を加算する
      if (status.isStrike && status.count !== this.totalCount && this.totalCount <= status.count + 3) {
        const existScoreData = Storage.scoreData[flameIndex]
        const scoreData = this.increment(existScoreData, item.score)
        const strikeStatus = Storage.strikeStatus[flameIndex]

        Storage.save({ flame: flameIndex, score: scoreData, strikeStatus })
        this.scoresElement[flameIndex].textContent = scoreData.toString()
      }
    })
  }

  /**
   * @description
   * 投球ボタン クリック処理
   */
  private bowling() {
    const storageScore = Storage.scoreData[this.flame]
    const maxRandomNumber = 10 - (typeof storageScore === 'number' ? storageScore : 0)

    const randomScore = this.getRandomNum({ max: maxRandomNumber })
    this.totalCount += 1

    if (this.flame === 10) {
      alert('ゲーム終了')
      return
    }

    this.updateDescription(randomScore)

    // 最終フレーム
    if (this.flame === 9) {
      this.lastFlame({ score: randomScore })
      return
    }

    // ストライク判定
    if (this.currentCount === 1 && randomScore === 10) {
      this.updateScore({
        flame: this.flame,
        score: randomScore,
        strikeStatus: { isStrike: true, count: this.totalCount }
      })
      this.updateFlame({ score: randomScore })
      return
    }

    // 1球目且つ10未満
    if (this.currentCount === 1 && randomScore < 10) {
      this.updateScore({
        flame: this.flame,
        score: randomScore,
        strikeStatus: { isStrike: false, count: this.totalCount }
      })
      this.currentCount = 2
      return
    }

    /*
     * 2球目且つスペア
     * - スペアを取った場合、次の投球分を加算することができる
     * @example
     * フレーム1 - 1 => 3
     * フレーム1 - 2 => 7 スペア！！
     *
     * フレーム2 - 1 => 5 この時点でフレーム1の得点 = 15となる
     *
     */
    const firstScore = Storage.scoreData[this.flame]
    if (this.currentCount === 2 && typeof firstScore === 'number' && firstScore + randomScore === 10) {
      const score = firstScore + randomScore
      this.updateScore({ flame: this.flame, score, strikeStatus: { isStrike: false, count: this.totalCount } })
      this.updateFlame({ score })
      this.currentCount = 1
      this.isSpare = true
      this.beforeFlameScore = score
      return
    }

    // 2球目
    if (this.currentCount === 2 && typeof firstScore === 'number') {
      const score = firstScore + randomScore
      this.updateScore({ flame: this.flame, score, strikeStatus: { isStrike: false, count: this.totalCount } })
      this.updateFlame({ score })
      this.currentCount = 1
      return
    }
  }

  /**
   * @description
   * 最終フレームの処理
   */
  private lastFlame(item: Score) {
    const { score } = item
    // 1球目
    if (this.currentCount === 1) {
      this.updateScore({ flame: this.flame, score, strikeStatus: { isStrike: score === 10, count: this.totalCount } })
      this.currentCount = 2
      return
    }

    const storageScore = Storage.scoreData[this.flame]
    const incremented = this.increment(score, storageScore)
    const isNextCount = incremented >= 10
    // 2球目で且つ3球目がある場合
    if (this.currentCount === 2 && isNextCount) {
      this.updateScore({
        flame: this.flame,
        score: incremented,
        strikeStatus: { isStrike: score === 10, count: this.totalCount }
      })
      this.currentCount = 3
      return
    }

    // 2球目で且つ3球目が無い 又は3球目
    this.updateScore({
      flame: this.flame,
      score: incremented,
      strikeStatus: { isStrike: score === 10, count: this.totalCount }
    })
    this.updateFlame({ score })
    this.currentCount = 1
    return
  }

  /**
   * @description
   * リセットボタン リセット処理
   */
  private reset() {
    this.currentCount = 1
    this.flame = 0
    this.beforeFlameScore = 0
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
    this.currentFlameText.textContent = `フレーム ${this.flame + 1}`
    this.currentCountText.textContent = `投球 ${this.currentCount}回目`
    this.currentScoreText.textContent = randomScore ? `今の投球結果: ${randomScore}` : '投球ボタンを押してね！'
  }

  /**
   * @description
   * ラウンドを更新し、前ラウンドスコアを更新します。
   */
  private updateFlame(item: Score) {
    const { score } = item
    this.flame += 1
    this.beforeFlameScore = Number(score)
  }
}
