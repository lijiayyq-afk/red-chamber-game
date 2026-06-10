import { describe, it, expect, beforeEach } from 'vitest';
import { PlotStateManager } from './PlotStateManager';
import { DialogueEngine } from './DialogueEngine';
import type { DialogueData } from './DialogueEngine';

describe('DialogueEngine 对话引擎测试', () => {
  let stateManager: PlotStateManager;
  let dialogueEngine: DialogueEngine;

  // 模拟关卡1和关卡2的简化剧本数据
  const mockScript: DialogueData = {
    chapters: {
      1: {
        startNodeId: 'node_1_start',
        nodes: {
          'node_1_start': {
            id: 'node_1_start',
            speaker: '贾母',
            text: '这是你林妹妹，往后要好生相处。',
            options: [
              {
                text: '谨遵老祖宗吩咐，自当爱护妹妹。',
                nextNodeId: 'node_1_good',
                effects: { affection: { char: 'daiyu', amount: 10 } }
              },
              {
                text: '怎么又来了一个爱哭的妹妹。',
                nextNodeId: 'node_1_bad',
                effects: { affection: { char: 'daiyu', amount: -10 } }
              }
            ]
          },
          'node_1_good': {
            id: 'node_1_good',
            speaker: '林黛玉',
            text: '（黛玉微微低头，面上泛起一丝浅笑）'
          },
          'node_1_bad': {
            id: 'node_1_bad',
            speaker: '林黛玉',
            text: '（黛玉听罢，眼圈儿微红，侧过身去）'
          }
        }
      },
      2: {
        startNodeId: 'node_2_start',
        nodes: {
          'node_2_start': {
            id: 'node_2_start',
            speaker: '贾宝玉',
            text: '妹妹可也有玉没有？',
            options: [
              {
                text: '我没有那个。想来那是个罕物，岂能人人有的。',
                nextNodeId: 'node_2_no_gem',
                effects: { affection: { char: 'daiyu', amount: 15 }, worldly: { type: 'out', amount: 5 } }
              }
            ]
          },
          'node_2_no_gem': {
            id: 'node_2_no_gem',
            speaker: '贾宝玉',
            text: '（宝玉听罢，登时发作，摘下通灵宝玉狠命摔去）什么罕物！连妹妹都没有，我也不要这劳什子了！',
            effects: { inventory: { action: 'add', item: '通灵宝玉' } } // 剧情互动添加道具
          }
        }
      }
    }
  };

  beforeEach(() => {
    stateManager = new PlotStateManager();
    dialogueEngine = new DialogueEngine(stateManager, mockScript);
  });

  it('应该能正确加载指定章节的起始对话', () => {
    dialogueEngine.startChapter(1);
    const node = dialogueEngine.getCurrentNode();
    
    expect(node).toBeDefined();
    expect(node?.id).toBe('node_1_start');
    expect(node?.speaker).toBe('贾母');
    expect(dialogueEngine.isEnded()).toBe(false);
  });

  it('玩家选择选项后应能正确跳转，并触发好感度变化副作用', () => {
    dialogueEngine.startChapter(1);
    
    // 选择第一个友善选项
    dialogueEngine.chooseOption(0);
    
    const node = dialogueEngine.getCurrentNode();
    expect(node?.id).toBe('node_1_good');
    expect(stateManager.getState().daiyuAffection).toBe(10);
    expect(dialogueEngine.isEnded()).toBe(true); // 没有下级选项，判定为结束节点
  });

  it('玩家选择另一个粗鲁选项，应能正确扣减好感度', () => {
    dialogueEngine.startChapter(1);
    
    // 选择第二个选项
    dialogueEngine.chooseOption(1);
    
    const node = dialogueEngine.getCurrentNode();
    expect(node?.id).toBe('node_1_bad');
    expect(stateManager.getState().daiyuAffection).toBe(0); // 最小限制为0
    expect(dialogueEngine.isEnded()).toBe(true);
  });

  it('应该支持关卡2的道具获取副作用和出世值增加', () => {
    dialogueEngine.startChapter(2);
    expect(stateManager.hasItem('通灵宝玉')).toBe(false);

    // 选择回答
    dialogueEngine.chooseOption(0);
    expect(stateManager.getState().daiyuAffection).toBe(15);
    expect(stateManager.getState().worldlyOut).toBe(5);

    // 到了摔玉节点，由于该节点有进入时的直接副作用，应该在转换时被触发
    expect(stateManager.hasItem('通灵宝玉')).toBe(true);
    expect(dialogueEngine.isEnded()).toBe(true);
  });

  it('应该支持个性属性心智变化的副作用', () => {
    const customScript: DialogueData = {
      chapters: {
        1: {
          startNodeId: 'node_1',
          nodes: {
            'node_1': {
              id: 'node_1',
              speaker: '贾宝玉',
              text: '妹妹可喜欢读书？',
              options: [
                {
                  text: '不过认得几个字罢了。',
                  nextNodeId: 'node_2',
                  effects: {
                    personality: { char: 'daiyu', trait: 'wit', amount: 15 }
                  }
                }
              ]
            },
            'node_2': {
              id: 'node_2',
              speaker: '林黛玉',
              text: '（黛玉微微一笑）',
              effects: {
                personality: { char: 'daiyu', trait: 'melancholy', amount: -10 }
              }
            }
          }
        }
      }
    };

    const localEngine = new DialogueEngine(stateManager, customScript);
    localEngine.startChapter(1);
    
    expect(stateManager.getState().daiyuWit).toBe(50); // 初始值
    expect(stateManager.getState().daiyuMelancholy).toBe(50); // 初始值

    localEngine.chooseOption(0);

    // 选项触发 wit 增加
    expect(stateManager.getState().daiyuWit).toBe(65);
    // 目标节点 node_2 的进入副作用触发 melancholy 减少
    expect(stateManager.getState().daiyuMelancholy).toBe(40);
  });
});

