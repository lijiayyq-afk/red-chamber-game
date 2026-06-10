export interface RaidAssessmentResult {
  safe: boolean;
  exposedItems: string[];
}

export class SearchAndHideSolver {
  private maxSteps: number;
  private stepsUsed: number;
  private itemHidingLocations: Record<string, string>;
  private destroyedItems: string[];

  constructor(maxSteps = 15) {
    this.maxSteps = maxSteps;
    this.stepsUsed = 0;
    this.itemHidingLocations = {};
    this.destroyedItems = [];
  }

  /**
   * 玩家进行移动或搜证，消耗一步
   */
  public takeAction(): void {
    if (this.stepsUsed < this.maxSteps) {
      this.stepsUsed++;
    }
  }

  /**
   * 获取剩余行动步数
   */
  public getStepsLeft(): number {
    return Math.max(0, this.maxSteps - this.stepsUsed);
  }

  /**
   * 判断行动步数是否已经用光（抄检队伍到达）
   */
  public isTimeOut(): boolean {
    return this.stepsUsed >= this.maxSteps;
  }

  /**
   * 藏匿敏感物品
   * @param item 物品名称 ('香囊' | '私相授受的书信')
   * @param location 藏匿地点 ('妆奁暗格' | '书架暗格' | '随身携带' | '烧毁')
   * @param inventory 宝玉的当前背包道具
   */
  public hideItem(item: string, location: string, inventory: string[] = []): void {
    if (location === '烧毁') {
      // 只有背包里有“火折子”才可以烧毁销毁证据
      if (inventory.includes('火折子')) {
        this.destroyedItems.push(item);
        delete this.itemHidingLocations[item];
      } else {
        // 没有火折子，销毁失败，仍记为未藏匿/暴露
        this.itemHidingLocations[item] = '未隐藏';
      }
    } else {
      this.itemHidingLocations[item] = location;
    }
  }

  /**
   * 凤姐抄检队伍到来时，评估藏匿安全性
   */
  public runRaidAssessment(): RaidAssessmentResult {
    const exposedItems: string[] = [];

    // 1. 评估“香囊”的安全性
    const sachetLoc = this.itemHidingLocations['香囊'];
    const isSachetDestroyed = this.destroyedItems.includes('香囊');
    
    if (!isSachetDestroyed) {
      if (!sachetLoc || sachetLoc === '随身携带' || sachetLoc === '未隐藏') {
        // 随身携带会被搜身暴露，未隐藏也会被搜查出来
        exposedItems.push('香囊');
      }
    }

    // 2. 评估“私相授受的书信”的安全性
    const letterLoc = this.itemHidingLocations['私相授受的书信'];
    const isLetterDestroyed = this.destroyedItems.includes('私相授受的书信');

    if (!isLetterDestroyed) {
      if (!letterLoc || letterLoc === '未隐藏' || letterLoc === '随身携带') {
        // 信件如果未隐藏、随身携带（搜身），或者由于没有火折子被留置为“未隐藏”
        exposedItems.push('私相授受的书信');
      }
    }

    return {
      safe: exposedItems.length === 0,
      exposedItems,
    };
  }
}
