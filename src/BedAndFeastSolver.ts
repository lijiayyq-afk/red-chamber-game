export interface BedInteractionResult {
  daiyuChange: number;
  baochaiChange: number;
  worldlyOutChange: number;
  worldlyInChange: number;
}

export class BedAndFeastSolver {
  private readonly RHYME_ANSWERS: Record<string, string[]> = {
    '左边一个四五成对': ['双瞻玉兔升天莹', '是个耗子往外蹦'],
    '中间三四绿配红': ['双管迎春分外红'],
  };

  /**
   * 挨打病榻情感交互联动计算
   * @param choice 交互选择 ('comfort_daiyu' | 'agree_baochai')
   */
  public interactOnBed(choice: 'comfort_daiyu' | 'agree_baochai'): BedInteractionResult {
    if (choice === 'comfort_daiyu') {
      return {
        daiyuChange: 20,
        baochaiChange: -10,
        worldlyOutChange: 15, // 追求真情，叛逆世俗礼教，大增出世值
        worldlyInChange: 0,
      };
    } else if (choice === 'agree_baochai') {
      return {
        daiyuChange: -15, // 顺从世俗功名，与黛玉心意产生隔阂
        baochaiChange: 15,
        worldlyOutChange: 0,
        worldlyInChange: 15, // 认可仕途经济学问，大增入世值
      };
    }
    
    return {
      daiyuChange: 0,
      baochaiChange: 0,
      worldlyOutChange: 0,
      worldlyInChange: 0,
    };
  }

  /**
   * 宴席牙牌酒令拼句校验
   * @param cardName 鸳鸯令官念出的牙牌骨牌名
   * @param reply 玩家或角色的下联对答诗句
   */
  public solveFeastRhyme(cardName: string, reply: string): boolean {
    const validReplies = this.RHYME_ANSWERS[cardName];
    if (!validReplies) {
      return false;
    }
    return validReplies.includes(reply.trim());
  }
}
