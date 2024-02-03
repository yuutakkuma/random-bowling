type Score = {
  one?: number
  two?: number
  three?: number
}

type SaveData = {
  [round: number]:
    | {
        score: Score
      }
    | undefined
}

type SaveItem = {
  round: number
  score: Score
}

/**
 * @description
 * ゲームデータが保存されてるクラス
 */
export class Storage {
  static data: SaveData = {}

  static save(item: SaveItem) {
    this.data[item.round] = {
      score: {
        ...this.data[item.round]?.score,
        ...item.score
      }
    }
  }

  static reset() {
    this.data = {}
  }
}
