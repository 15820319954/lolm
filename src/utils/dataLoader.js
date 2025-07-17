// 数据加载工具函数

// 加载英雄数据
export async function loadHeroData() {
  try {
    const response = await fetch('/hero.json')
    if (!response.ok) throw new Error('无法加载英雄数据')
    const heroes = await response.json()
    console.log('英雄数据加载成功:', heroes.length, '个英雄')
    return heroes
  } catch (error) {
    console.error('加载英雄数据失败:', error)
    // 返回备用数据
    return [
      {
        "alias": "gailun",
        "assistL": 1,
        "avatar": "https://game.gtimg.cn/images/lgamem/act/lrlib/img/HeadIcon/H_S_10001.png",
        "card": "https://game.gtimg.cn/images/lgamem/act/lrlib/img/CardPictures/S_R_1000101.png",
        "difficultyL": 1,
        "heroId": 10001,
        "intro": "“德玛西亚之力”盖伦加入你的队伍\n<color=#5A5A5A>“人在塔在。”</color>",
        "introShort": "人在塔在。",
        "lane": "单人路",
        "name": "盖伦",
        "poster": "https://game.gtimg.cn/images/lgamem/act/lrlib/img/Posters/Garen_0.jpg",
        "roles": ["战士"],
        "surviveL": 3,
        "title": "德玛西亚之力"
      },
      {
        "alias": "yasuos",
        "assistL": 1,
        "avatar": "https://game.gtimg.cn/images/lgamem/act/lrlib/img/HeadIcon/H_S_10037.png",
        "card": "https://game.gtimg.cn/images/lgamem/act/lrlib/img/CardPictures/S_R_1003701.png",
        "difficultyL": 3,
        "heroId": 10037,
        "intro": "“疾风剑豪”亚索加入你的队伍\n<color=#5A5A5A>“死亡如风，常伴吾身。”</color>",
        "introShort": "死亡如风，常伴吾身。",
        "lane": "中路;单人路",
        "name": "亚索",
        "poster": "https://game.gtimg.cn/images/lgamem/act/lrlib/img/Posters/Yasuo_0.jpg",
        "roles": ["战士"],
        "surviveL": 1,
        "title": "疾风剑豪"
      }
    ]
  }
}

// 加载黄历数据
export async function loadAlmanacData() {
  try {
    const response = await fetch('/almanac.json')
    if (!response.ok) throw new Error('无法加载黄历数据')
    const almanac = await response.json()
    console.log('黄历数据加载成功')
    return almanac
  } catch (error) {
    console.error('加载黄历数据失败:', error)
    // 返回备用黄历数据
    const today = new Date()
    return {
      [today.getFullYear()]: {
        [today.getMonth() + 1]: {
          [today.getDate()]: {
            lunarDate: "六月廿一",
            suitableActivities: ["开业", "结婚", "搬家"],
            unsuitableActivities: ["动土", "安葬", "诉讼"],
            luckyNumbers: [3, 8, 9],
            luckyColors: ["红色", "黄色", "金色"],
            luckyDirections: ["东南", "正南"],
            zodiac: "龙",
            constellation: "巨蟹座",
            fiveElements: "火"
          }
        }
      }
    }
  }
}

// 加载宜忌活动数据
export async function loadActivitiesData() {
  try {
    const response = await fetch('/src/data/activities.json')
    if (!response.ok) throw new Error('无法加载宜忌数据')
    const activities = await response.json()
    console.log('宜忌数据加载成功')
    return activities
  } catch (error) {
    console.error('加载宜忌数据失败:', error)
    // 返回备用宜忌数据
    return {
      suitable: [
        "开黑上分",
        "草丛蹲人",
        "抢河蟹",
        "抢人头",
        "双排开黑",
        "换线游走",
        "出装优化",
        "组队确认"
      ],
      unsuitable: [
        "单带送头",
        "盲探草丛",
        "1v5",
        "送人头",
        "吵架挂机",
        "单排",
        "抢位置",
        "乱开团"
      ]
    }
  }
}

// 生成搞笑黄历内容（使用动态宜忌数据）
export function generateLmaoContent(almanacData, hero, activitiesData = null) {
  let suitableActivities = []
  let unsuitableActivities = []

  if (activitiesData) {
    // 使用动态宜忌数据
    suitableActivities = activitiesData.suitable || []
    unsuitableActivities = activitiesData.unsuitable || []
  } else if (almanacData) {
    // 使用传统黄历数据映射
    const gameActivities = {
      "开业": "开黑上分",
      "结婚": "双排开黑",
      "搬家": "换线游走",
      "装修": "出装优化",
      "签约": "组队确认",
      "出行": "游走支援",
      "祭祀": "打龙拿buff",
      "祈福": "求队友别坑",
      "开光": "装备成型",
      "入学": "学习新英雄",
      "纳采": "选英雄",
      "订盟": "组队",
      "嫁娶": "双排"
    }

    const gameUnsuitable = {
      "动土": "乱开团",
      "安葬": "送人头",
      "诉讼": "吵架挂机",
      "嫁娶": "单排",
      "开市": "单带",
      "立券": "抢位置"
    }

    suitableActivities = almanacData.suitableActivities
      ?.map(act => gameActivities[act] || act) || ["打游戏"]
    
    unsuitableActivities = almanacData.unsuitableActivities
      ?.map(act => gameUnsuitable[act] || act) || ["送人头"]
  } else {
    // 默认宜忌
    suitableActivities = ["草丛蹲人", "抢河蟹", "抢人头"]
    unsuitableActivities = ["单带送头", "盲探草丛", "1v5"]
  }

  // 随机选择3个宜忌活动
  const randomSuitable = suitableActivities
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .join('，')

  const randomUnsuitable = unsuitableActivities
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .join('，')

  const luckyNumbers = almanacData?.luckyNumbers?.join('、') || 
    Array.from({length: 3}, () => Math.floor(Math.random() * 9) + 1).join('、')
  
  const luckyColors = almanacData?.luckyColors?.join('、') || 
    ["红色", "蓝色", "金色", "紫色"][Math.floor(Math.random() * 4)]

  const stars = '★'.repeat(Math.floor(Math.random() * 3) + 3) + '☆'
  const lunarDate = almanacData?.lunarDate || '今日'

  return `宜：${randomSuitable}<br>忌：${randomUnsuitable}<br>幸运英雄：${hero.name}<br>今日运势：${stars}<br>幸运数字：${luckyNumbers}<br>幸运颜色：${luckyColors}<br>农历：${lunarDate}`
}
