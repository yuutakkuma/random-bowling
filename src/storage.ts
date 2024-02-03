type SaveItem = {
  round: number
  score: number
}

/**
 * @description
 * ゲームデータが保存されてるクラス
 */
export class Storage {
  static data: number[] | undefined[] = []

  static save(item: SaveItem) {
    this.data[item.round] = item.score
  }

  static reset() {
    this.data = []
  }
}
