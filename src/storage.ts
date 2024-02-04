type SaveItem = {
  flame: number
  score: number | string
  strikeStatus: StrikeStatus
}

export type StrikeStatus = {
  isStrike: boolean
  count: number
}

/**
 * @description
 * ゲームデータが保存されてるクラス
 */
export class Storage {
  static scoreData: number[] | string[] | undefined[] = []

  static strikeStatus: StrikeStatus[] = []

  static save(item: SaveItem) {
    this.scoreData[item.flame] = item.score
    this.strikeStatus[item.flame] = item.strikeStatus
  }

  static reset() {
    this.scoreData = []
    this.strikeStatus = []
  }
}
