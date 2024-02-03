type SaveItem = {
  round: number
  score: number | string
}

/**
 * @description
 * ゲームデータが保存されてるクラス
 */
export class Storage {
  static data: number[] | string[] | undefined[] = []

  static save(item: SaveItem) {
    this.data[item.round] = item.score
  }

  static reset() {
    this.data = []
  }
}
