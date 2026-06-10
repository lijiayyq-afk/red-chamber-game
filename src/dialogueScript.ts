import type { DialogueData } from './DialogueEngine';

export interface ChapterGuide {
  where: string;
  how: string;
}

export const redChamberGuides: Record<number, ChapterGuide> = {
  1: {
    where: '【荣国府正堂】（原地触发）',
    how: '第一回目为黛玉进府。辨识晚宴后的漱口茶与饮茶礼仪，展示高门大户的风范。'
  },
  2: {
    where: '【碧纱橱】（原地触发）',
    how: '第二回目为宝黛初见。摔玉后需拖动碎片重新拼接复原这块通灵宝玉。'
  },
  3: {
    where: '【梨香院】（原地触发）',
    how: '第三回目为金石良缘。与宝钗看金锁，需移动字词拼出锁上吉谶：“不离不弃，芳龄永继”。'
  },
  4: {
    where: '【荣国府正堂】（原地触发）',
    how: '第四回目为大观园题额。贾政考校你的才学，请依次从备选字中拼写出潇湘馆的“有凤来仪”、蘅芜苑的“蘅芷清芬”和怡红院的“红香绿玉”。'
  },
  5: {
    where: '前往大观园右下角的【滴翠亭区域】',
    how: '第五回目为宝钗避嫌。请操纵宝玉走去滴翠亭触发宝钗情节。解谜时根据风向（北风逆风，南风顺风）拉开距离，在被小红察觉时选择“假装寻找颦儿（黛玉）”以成功避嫌。'
  },
  6: {
    where: '先去左侧回廊捡拾【落花绢袋】，然后前往左下角【潇湘馆/沁芳桥】',
    how: '第六回目为黛玉葬花。唯有先在园中捡起【落花绢袋】，才可触发与黛玉葬花。解谜时需将打乱的《葬花吟》前四句拖拽排列正确。'
  },
  7: {
    where: '前往大观园正上方中间的【怡红院区域】',
    how: '第七回目为晴雯撕扇。控制宝玉走去怡红院。向晴雯连续递上折扇或泥金扇并撕碎，听到不同的裂响声效以博美人一笑，使喜悦值达到50。'
  },
  8: {
    where: '【怡红院卧房】（原地触发）',
    how: '第八回目为宝玉挨打。你躺在病榻上，黛玉和宝钗会依次来探望。面对宝钗规劝仕途与黛玉哭泣，做出不同的言语表态，调整两人的情感天平。'
  },
  9: {
    where: '先在园子右上角搜寻【金麒麟】，然后就地开启酒会',
    how: '第九回目为两宴酒令。对答鸳鸯令官念出的牙牌面。若身上带有捡来的【金麒麟】，可以解锁史湘云的特殊表白联句！'
  },
  10: {
    where: '先在左下角拾取【火折子】，然后走去正上方的【怡红院】',
    how: '第十回目为抄检风波。在 15 步限时内转移证物。若身上有【火折子】可安全烧毁私信。香囊需藏于妆奁中，不可随身携带（王熙凤会搜身）。安全躲避抄检，即可进入宿命结局。'
  }
};

export const redChamberScript: DialogueData = {
  chapters: {
    // 关卡 1: 黛玉进府 (第3回)
    1: {
      startNodeId: 'c1_start',
      nodes: {
        'c1_start': {
          id: 'c1_start',
          speaker: '贾母',
          text: '这是你林姑妈家的黛玉妹妹，远道而来，你等当好生相待。',
          options: [
            {
              text: '谨遵祖母教诲。一见妹妹，倒像是在哪里见过一般，甚是亲切。',
              nextNodeId: 'c1_fengjie',
              effects: { affection: { char: 'daiyu', amount: 15 }, personality: { char: 'daiyu', trait: 'melancholy', amount: -10 } }
            },
            {
              text: '妹妹初来乍到，可曾带了什么江南的好物？',
              nextNodeId: 'c1_fengjie',
              effects: { affection: { char: 'daiyu', amount: -5 }, personality: { char: 'daiyu', trait: 'melancholy', amount: 10 } }
            }
          ]
        },
        'c1_fengjie': {
          id: 'c1_fengjie',
          speaker: '王熙凤',
          text: '天下竟有这等标致人儿！我今日才算见识了。这通身的气派，倒不像老祖宗的外孙女，竟是个小仙女。来人，摆晚宴，为林姑娘接风洗尘！',
          options: [
            {
              text: '凤姐姐说得是，妹妹仙姿玉质，自非凡品。',
              nextNodeId: 'c1_tea_intro',
              effects: { affection: { char: 'daiyu', amount: 10 }, personality: { char: 'daiyu', trait: 'wit', amount: 5 } }
            }
          ]
        },
        'c1_tea_intro': {
          id: 'c1_tea_intro',
          speaker: '系统旁白',
          text: '晚宴结束，丫鬟捧上两盏热茶。黛玉心想：‘在家时父亲教导，饭后须用漱口茶，再等一时方可饮茶。’ 请帮助黛玉和宝二爷得体地完成茶仪。',
          options: [
            {
              text: '（开始茶仪辨识考校）',
              nextNodeId: 'c1_puzzle'
            }
          ]
        },
        'c1_puzzle': {
          id: 'c1_puzzle',
          speaker: '系统解谜提示',
          text: '荣国府晚宴刚毕，请按规矩分辨漱口茶和饮茶的顺序，不要让众人笑话。'
        }
      }
    },
    // 关卡 2: 宝黛初见 (第3回)
    2: {
      startNodeId: 'c2_start',
      nodes: {
        'c2_start': {
          id: 'c2_start',
          speaker: '贾宝玉',
          text: '妹妹，我有一问：妹妹可也有玉没有？',
          options: [
            {
              text: '我没有那个。想来那是个罕物，岂能人人有的。',
              nextNodeId: 'c2_no_gem',
              effects: { affection: { char: 'daiyu', amount: 15 }, worldly: { type: 'out', amount: 5 }, personality: { char: 'daiyu', trait: 'wit', amount: 10 } }
            }
          ]
        },
        'c2_no_gem': {
          id: 'c2_no_gem',
          speaker: '贾宝玉',
          text: '（宝玉听了，登时狂态发作，扯下通灵宝玉狠命摔去）什么罕物！连妹妹都没有，我也不要这劳什子了！',
          options: [
            {
              text: '（玉石磕在地上摔成数瓣，众人慌忙上前，请速将碎玉拼合！）',
              nextNodeId: 'c2_puzzle',
              effects: { worldly: { type: 'out', amount: 10 } }
            }
          ]
        },
        'c2_puzzle': {
          id: 'c2_puzzle',
          speaker: '系统解谜提示',
          text: '通灵宝玉因狠命摔击，裂为四瓣。请在屏幕上拖拽拼合碎玉，使通灵宝玉重现光彩！'
        }
      }
    },
    // 关卡 3: 金锁与金麒麟 (第8回)
    3: {
      startNodeId: 'c3_start',
      nodes: {
        'c3_start': {
          id: 'c3_start',
          speaker: '薛宝钗',
          text: '宝兄弟，常听人说你有一块落草时衔下来的宝玉，上面篆着字，可否借我一瞧？',
          options: [
            {
              text: '这有何难，姐姐请看。（递出通灵宝玉）',
              nextNodeId: 'c3_view_jade',
              effects: { affection: { char: 'baochai', amount: 15 }, personality: { char: 'baochai', trait: 'tact', amount: 10 } }
            }
          ]
        },
        'c3_view_jade': {
          id: 'c3_view_jade',
          speaker: '莺儿',
          text: '我听这玉上的字，倒像和我们姑娘金锁上的字是一对呢。',
          options: [
            {
              text: '哦？姐姐也有金锁？上面刻了什么字？我倒要瞧瞧。',
              nextNodeId: 'c3_view_lock',
              effects: { affection: { char: 'baochai', amount: 10 } }
            }
          ]
        },
        'c3_view_lock': {
          id: 'c3_view_lock',
          speaker: '薛宝钗',
          text: '（宝钗解下金锁）不过是癞头和尚送的吉利话，錾在锁上，非要等日后有玉的方可配对……',
          options: [
            {
              text: '（触发解谜：观察金锁字谶并与玉字组合）',
              nextNodeId: 'c3_puzzle_start'
            }
          ]
        },
        'c3_puzzle_start': {
          id: 'c3_puzzle_start',
          speaker: '系统解谜提示',
          text: '宝钗的金锁与宝玉的通灵宝玉字谶需要对齐。请完成拼图，使“不离不弃”配对“莫失莫忘”！'
        }
      }
    },
    // 关卡 4: 元妃省亲题对额 (第17-18回)
    4: {
      startNodeId: 'c4_start',
      nodes: {
        'c4_start': {
          id: 'c4_start',
          speaker: '贾政',
          text: '元妃娘娘不日省亲，命尔等游园题额。若是题得不好，看我不揭了你的皮！',
          options: [
            {
              text: '（深吸一口气）孩儿自当竭力题写，请父亲指点潇湘馆、蘅芜苑及怡红院之对额。',
              nextNodeId: 'c4_puzzle'
            }
          ]
        },
        'c4_puzzle': {
          id: 'c4_puzzle',
          speaker: '系统解谜提示',
          text: '为大观园各处题额。潇湘馆应题为“有凤来仪”；蘅芜苑应题为“蘅芷清芬”；怡红院应题为“红香绿玉”或“怡红快绿”。'
        }
      }
    },
    // 关卡 5: 宝钗扑蝶与避嫌 (第27回)
    5: {
      startNodeId: 'c5_start',
      nodes: {
        'c5_start': {
          id: 'c5_start',
          speaker: '薛宝钗',
          text: '（宝钗扑蝶来到滴翠亭外，忽听得里面有小红与坠儿的私语，提及男女授受之私）',
          options: [
            {
              text: '（需要辨音走避，避免走得过近被发觉，并选择合适的避嫌之策）',
              nextNodeId: 'c5_puzzle'
            }
          ]
        },
        'c5_puzzle': {
          id: 'c5_puzzle',
          speaker: '系统解谜提示',
          text: '根据风向和滴翠亭声源位置判定走避路径，并在被察觉时选择最佳避嫌对话。'
        }
      }
    },
    // 关卡 6: 黛玉葬花 (第27回)
    6: {
      startNodeId: 'c6_start',
      nodes: {
        'c6_start': {
          id: 'c6_start',
          speaker: '林黛玉',
          text: '（黛玉手拿花锄，满面悲戚）落花人独立，微雨燕双飞。这满地残花，最终也只能落入土中，随水流去……',
          options: [
            {
              text: '妹妹莫伤心。我建了这“埋香冢”，正要与妹妹同将落花装入绢袋，掩埋于此。',
              nextNodeId: 'c6_puzzle',
              effects: { affection: { char: 'daiyu', amount: 15 } }
            }
          ]
        },
        'c6_puzzle': {
          id: 'c6_puzzle',
          speaker: '系统解谜提示',
          text: '整理黛玉因伤心而散乱的《葬花吟》残句。请将诗句按照正确的意境顺序排列。'
        }
      }
    },
    // 关卡 7: 晴雯撕扇 (第31回)
    7: {
      startNodeId: 'c7_start',
      nodes: {
        'c7_start': {
          id: 'c7_start',
          speaker: '晴雯',
          text: '（晴雯失手跌折了扇骨，你叹她性情躁，她反唇相讥）二爷嫌我笨，尽可打发我走。',
          options: [
            {
              text: '好妹妹，那扇子原是扇的，若你喜欢听撕扇子的声音，纵撕几把又有何妨？',
              nextNodeId: 'c7_puzzle',
              effects: { worldly: { type: 'out', amount: 5 }, personality: { char: 'qingwen', trait: 'pride', amount: 15 } }
            }
          ]
        },
        'c7_puzzle': {
          id: 'c7_puzzle',
          speaker: '系统解谜提示',
          text: '搜集并递给晴雯不同材质的扇子，通过听其声（嗞啦、沙沙等）来博晴雯一笑。'
        }
      }
    },
    // 关卡 8: 宝玉挨打 (第33-34回)
    8: {
      startNodeId: 'c8_start',
      nodes: {
        'c8_start': {
          id: 'c8_start',
          speaker: '系统旁白',
          text: '（宝玉因琪官之事及金钏儿之死，被贾政按在长凳上痛笞，皮开肉绽，在怡红院病榻卧床）',
          options: [
            {
              text: '（宝钗送来疗伤药物，言辞恳切，劝你从此改悟，多读经济仕途之书）',
              nextNodeId: 'c8_baochai_visit'
            }
          ]
        },
        'c8_baochai_visit': {
          id: 'c8_baochai_visit',
          speaker: '薛宝钗',
          text: '你若早听我们一句，何至受今日之苦。往后可万万不能胡乱胡闹了，当求取功名才是。',
          options: [
            {
              text: '姐姐说得是，经此一役，我自当收心用功。（顺从宝钗，走仕途经济）',
              nextNodeId: 'c8_agree_baochai',
              effects: { affection: { char: 'baochai', amount: 15 }, worldly: { type: 'in', amount: 15 }, personality: { char: 'baochai', trait: 'economic', amount: 15 } } // 扣黛玉好感
            },
            {
              text: '姐姐此言差矣。那些仕途经济的学问，不过是禄蠹之言。我死也不学。（反驳宝钗）',
              nextNodeId: 'c8_rebel_baochai',
              effects: { affection: { char: 'baochai', amount: -5 }, worldly: { type: 'out', amount: 10 }, personality: { char: 'baochai', trait: 'economic', amount: -10 } }
            }
          ]
        },
        'c8_agree_baochai': {
          id: 'c8_agree_baochai',
          speaker: '林黛玉',
          text: '（隔窗听闻你的回答，黛玉神色暗淡，转身拭泪而去）',
          effects: { affection: { char: 'daiyu', amount: -15 }, personality: { char: 'daiyu', trait: 'melancholy', amount: 15 } },
          options: [
            {
              text: '（心中愧疚，却不得不走金玉之路）',
              nextNodeId: 'c8_end'
            }
          ]
        },
        'c8_rebel_baochai': {
          id: 'c8_rebel_baochai',
          speaker: '林黛玉',
          text: '（黛玉走到榻前，眼睛哭得肿如桃儿，抽泣道）你可都改了吧！',
          options: [
            {
              text: '好妹妹，你放心，我为你们死了也情愿，何曾觉得疼了。（极力安慰黛玉）',
              nextNodeId: 'c8_comfort_daiyu',
              effects: { affection: { char: 'daiyu', amount: 20 }, worldly: { type: 'out', amount: 15 }, personality: { char: 'daiyu', trait: 'melancholy', amount: -20 } }
            }
          ]
        },
        'c8_comfort_daiyu': {
          id: 'c8_comfort_daiyu',
          speaker: '林黛玉',
          text: '（黛玉虽破涕为笑，心中却为你这离经叛道的痴心感动万分）',
          effects: { affection: { char: 'baochai', amount: -10 }, personality: { char: 'daiyu', trait: 'wit', amount: 15 } }, // 黛玉好感剧增，但宝钗好感下降
          options: [
            {
              text: '（病榻前与黛玉心意更通）',
              nextNodeId: 'c8_end'
            }
          ]
        },
        'c8_end': {
          id: 'c8_end',
          speaker: '系统旁白',
          text: '病榻一劫，让你与黛玉、宝钗之间的命运线索产生了巨大的拉扯。'
        }
      }
    },
    // 关卡 9: 刘姥姥游园酒令 (第40回)
    9: {
      startNodeId: 'c9_start',
      nodes: {
        'c9_start': {
          id: 'c9_start',
          speaker: '鸳鸯',
          text: '今日太夫人两宴大观园，我当令官。行的是牙牌令，凡对不上或不合平仄者，罚酒一杯！',
          options: [
            {
              text: '甚好，今日当尽兴。请鸳鸯姐姐出牌。',
              nextNodeId: 'c9_puzzle'
            }
          ]
        },
        'c9_puzzle': {
          id: 'c9_puzzle',
          speaker: '系统解谜提示',
          text: '鸳鸯行牙牌令。第一张：“左边一个四五成对”；第二张：“中间三四绿配红”。请代表宝玉雅对，或帮刘姥姥谐趣应答！'
        }
      }
    },
    // 关卡 10: 抄检大观园 (第74回)
    10: {
      startNodeId: 'c10_start',
      nodes: {
        'c10_start': {
          id: 'c10_start',
          speaker: '晴雯',
          text: '二爷！大祸临头了！邢夫人不知在哪捡了个香囊，凤姐已奉命带人连夜进园抄检各屋！',
          options: [
            {
              text: '大观园清幽之地，岂能容他们如此作践！我得赶紧去把大家敏感的书信和香囊隐藏起来！',
              nextNodeId: 'c10_puzzle'
            }
          ]
        },
        'c10_puzzle': {
          id: 'c10_puzzle',
          speaker: '系统解谜提示',
          text: '在大观园被抄检前，使用有限的步数寻找“火折子”，销毁信件，并将“香囊”藏在最安全的位置。'
        }
      }
    }
  }
};
