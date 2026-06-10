export class AvoidanceSolver {
  private readonly DETECT_DISTANCE = 5;       // 距离过近直接被发现
  private readonly BASE_HEAR_DISTANCE = 8;     // 基础可听见距离
  private readonly WIND_HEAR_DISTANCE = 15;    // 顺风可听见距离

  /**
   * 判断宝钗当前位置是否能听见滴翠亭的谈话
   * @param bx 宝钗 X
   * @param by 宝钗 Y
   * @param cx 谈话中心 X
   * @param cy 谈话中心 Y
   * @param windDirection 风向 ('North' | 'South' | 'East' | 'West')
   */
  public canHearConversation(
    bx: number,
    by: number,
    cx: number,
    cy: number,
    windDirection: string
  ): boolean {
    const dx = bx - cx;
    const dy = by - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 1. 如果距离在直接被察觉范围内，绝对听得到
    if (distance < this.DETECT_DISTANCE) {
      return true;
    }

    // 2. 判断是否属于顺风发送声音的区域
    let isTailwind = false;
    if (windDirection === 'South' && dy > 0) {
      // 南风往北吹，宝钗在谈话中心北面 (dy > 0) -> 顺风
      isTailwind = true;
    } else if (windDirection === 'North' && dy < 0) {
      // 北风往南吹，宝钗在谈话中心南面 (dy < 0) -> 顺风
      isTailwind = true;
    } else if (windDirection === 'West' && dx > 0) {
      // 西风往东吹，宝钗在谈话中心东面 (dx > 0) -> 顺风
      isTailwind = true;
    } else if (windDirection === 'East' && dx < 0) {
      // 东风往西吹，宝钗在谈话中心西面 (dx < 0) -> 顺风
      isTailwind = true;
    }

    // 3. 根据顺风或逆风/侧风判断距离限制
    const maxHearDistance = isTailwind ? this.WIND_HEAR_DISTANCE : this.BASE_HEAR_DISTANCE;
    return distance <= maxHearDistance;
  }

  /**
   * 判断是否因为距离过近而被直接发觉
   */
  public isDetected(bx: number, by: number, cx: number, cy: number): boolean {
    const dx = bx - cx;
    const dy = by - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.DETECT_DISTANCE;
  }

  /**
   * 避嫌话术选择判定
   * @param dialogueChoice 玩家选取的对话选项文本
   */
  public solveEvasionTactics(dialogueChoice: string): { success: boolean; affectionChange: number } {
    switch (dialogueChoice) {
      case '假装追寻林黛玉（颦儿）':
        return { success: true, affectionChange: 10 };
      case '直接推门质问她们':
        return { success: false, affectionChange: -15 };
      case '假装在寻找宝二爷':
        return { success: false, affectionChange: -5 };
      default:
        return { success: false, affectionChange: -10 };
    }
  }
}
