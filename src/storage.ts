type SaveItem = {
  flame: number
  score: number | string
}

/**
 * @description
 * ゲームデータが保存されてるクラス
 */
export class Storage {
  static data: number[] | string[] | undefined[] = []

  static save(item: SaveItem) {
    this.data[item.flame] = item.score
  }

  static reset() {
    this.data = []
  }
}
