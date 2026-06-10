export class PuzzleSolver {
  private readonly GOLD_LOCK_WORDS = ['不离', '不弃', '芳龄', '永继'];
  private readonly JADE_WORDS = ['莫失', '莫忘', '仙寿', '恒昌'];

  private readonly COUPLET_ANSWERS: Record<string, string[]> = {
    '潇湘馆': ['有凤来仪'],
    '蘅芜苑': ['蘅芷清芬'],
    '怡红院': ['红香绿玉', '怡红快绿'],
  };

  /**
   * 校验薛宝钗金锁字谶拼图
   * @param words 玩家拼接的词组数组
   */
  public solveGoldLockPuzzle(words: string[]): boolean {
    return this.compareArrays(words, this.GOLD_LOCK_WORDS);
  }

  /**
   * 校验贾宝玉通灵宝玉字谶拼图
   * @param words 玩家拼接的词组数组
   */
  public solveJadePuzzle(words: string[]): boolean {
    return this.compareArrays(words, this.JADE_WORDS);
  }

  /**
   * 校验大观园景点的题匾/对联
   * @param location 景点名称（潇湘馆、蘅芜苑、怡红院等）
   * @param text 玩家题写的文本
   */
  public solveCouplet(location: string, text: string): boolean {
    const answers = this.COUPLET_ANSWERS[location];
    if (!answers) {
      return false;
    }
    return answers.includes(text.trim());
  }

  /**
   * 内部辅助函数：对比两数组内容和顺序是否完全一致
   */
  private compareArrays(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }
    return arr1.every((value, index) => value === arr2[index]);
  }
}
