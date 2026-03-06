import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoryNames = ['开场欢迎', '产品介绍', '颜色尺寸', '价格物流', '催单促单', '消除顾虑'];

const phraseTemplates = {
  开场欢迎: [
    ['Hey guys, welcome in.', '大家好，欢迎来到直播间。', '观众刚进入直播间时。', 'Hey everyone, welcome in.', 'Welcome in guys.', 'welcome in 是美区直播常用开场，听起来亲切自然。'],
    ['So happy you are here.', '很开心你来到这里。', '直播刚开始和观众打招呼。', 'I’m so glad you’re here.', 'Glad you’re here.', '用 glad 比 very happy 更口语。'],
    ['Drop a hi in the chat.', '在聊天区打个招呼吧。', '想提高互动时。', 'Say hi in the chat for me.', 'Say hi in chat.', 'drop a hi 是直播常用互动口吻。']
  ],
  产品介绍: [
    ['This one feels super soft.', '这个摸起来超级柔软。', '介绍材质手感时。', 'This one is insanely soft.', 'Super soft one.', 'feels super soft 比 touch is soft 更像母语。'],
    ['This is perfect for travel.', '这个特别适合旅行。', '强调使用场景时。', 'This is amazing for travel.', 'Great for travel.', 'perfect for + 场景 是高频直播短句。'],
    ['The quality is really nice.', '质量真的很好。', '强调做工时。', 'The quality is seriously good.', 'Quality is great.', 'really nice 听起来比 very good 更自然。']
  ],
  颜色尺寸: [
    ['We have this in pink too.', '这个也有粉色。', '回答颜色问题时。', 'It also comes in pink.', 'Also in pink.', 'comes in 常用于“有这个颜色/款式”。'],
    ['It is one size and stretchy.', '它是均码而且有弹性。', '回答尺寸问题时。', 'It’s one size with stretch.', 'One size, stretchy.', 'one size and stretchy 简短好懂。'],
    ['The bag is about this big.', '这个包大概这么大。', '手比划尺寸时。', 'The size is around this.', 'About this size.', 'about this big 常搭配手势展示。']
  ],
  价格物流: [
    ['Today we have a special price.', '今天有特别优惠价。', '介绍活动价格时。', 'It’s on special today.', 'Special price today.', 'on special 是美区常见促销说法。'],
    ['We ship in 24 hours.', '24小时内发货。', '回答发货速度时。', 'Orders go out within 24 hours.', 'Ships in 24h.', 'go out within 24 hours 更自然。'],
    ['You can get free shipping now.', '现在下单可以免运费。', '强调物流优惠时。', 'You can unlock free shipping now.', 'Free shipping now.', 'unlock free shipping 很有电商语感。']
  ],
  催单促单: [
    ['Tap the cart if you want one.', '想要的话点购物车。', '引导下单时。', 'Grab it from the cart now.', 'Tap cart now.', 'tap the cart 是TikTok直播经典口令。'],
    ['This deal is only for live.', '这个价格只在直播间有。', '制造限时感时。', 'This deal is live-only.', 'Live-only deal.', 'live-only 简洁且有稀缺感。'],
    ['I only have a few left.', '只剩几个了。', '库存紧张时。', 'I have just a few left now.', 'Few left.', 'a few left 是催单高频句。']
  ],
  消除顾虑: [
    ['It is beginner-friendly.', '新手也很容易上手。', '用户担心不会用时。', 'It’s super easy even for beginners.', 'Easy for beginners.', 'beginner-friendly 让表达更专业。'],
    ['If you do not like it, return is easy.', '如果不喜欢，退货很方便。', '用户担心售后时。', 'If it’s not for you, returns are easy.', 'Easy returns.', 'it’s not for you 委婉自然。'],
    ['No weird smell at all.', '完全没有异味。', '用户担心气味时。', 'There is no weird smell at all.', 'No weird smell.', 'weird smell 是口语里常见表达。']
  ]
} as const;

const scenarios = [
  ['颜色咨询', 'Do you have this in pink?', '观众问：有粉色吗？', 'easy'],
  ['尺寸咨询', 'Will this fit a lot of makeup?', '观众问：这个能装很多化妆品吗？', 'easy'],
  ['材质担忧', 'Is this material easy to clean?', '观众问：这个材质好清洁吗？', 'medium'],
  ['价格对比', 'Why is this better than cheaper ones?', '观众问：为什么这个比便宜款好？', 'medium'],
  ['物流时效', 'How fast can I get it in California?', '观众问：寄到加州要多久？', 'medium'],
  ['礼物场景', 'Is this good as a birthday gift?', '观众问：这个适合当生日礼物吗？', 'easy'],
  ['睡眠需求', 'Will this sleep mask block light well?', '观众问：这款眼罩遮光效果好吗？', 'medium'],
  ['香薰体验', 'Is the candle scent too strong?', '观众问：香薰蜡烛味道会不会太重？', 'medium'],
  ['售后顾虑', 'What if I do not like it after receiving?', '观众问：收到后不喜欢怎么办？', 'hard'],
  ['催单时机', 'Should I buy now or wait for another sale?', '观众问：现在买还是等下次活动？', 'hard']
];

async function main() {
  await prisma.favorite.deleteMany();
  await prisma.liveTurn.deleteMany();
  await prisma.liveSession.deleteMany();
  await prisma.practiceRecord.deleteMany();
  await prisma.phrase.deleteMany();
  await prisma.phraseCategory.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.user.deleteMany();

  const demoUser = await prisma.user.create({ data: { email: 'demo@coach.cn', name: '演示卖家' } });

  for (const name of categoryNames) {
    const category = await prisma.phraseCategory.create({ data: { name } });
    const base = phraseTemplates[name as keyof typeof phraseTemplates];

    const expanded = Array.from({ length: 13 }, (_, i) => {
      const t = base[i % base.length];
      return {
        english: `${t[0]} ${i > 2 ? `#${i + 1}` : ''}`.trim(),
        chinese: t[1],
        useWhen: t[2],
        naturalVersion: t[3],
        shortVersion: t[4],
        explanation: `${t[5]} 这句适合销售化妆包、眼罩、香薰蜡烛等舒适生活类商品。`
      };
    });

    expanded[0].english = base[0][0];
    expanded[1].english = base[1][0];
    expanded[2].english = base[2][0];

    await prisma.phrase.createMany({
      data: expanded.slice(0, name === '消除顾虑' ? 15 : 13).map((item) => ({
        ...item,
        categoryId: category.id
      }))
    });
  }

  await prisma.scenario.createMany({
    data: scenarios.map(([title, prompt, chineseHint, difficulty]) => ({
      title,
      prompt,
      chineseHint,
      difficulty
    }))
  });

  await prisma.practiceRecord.create({
    data: {
      userId: demoUser.id,
      userInput: 'Welcome to my live stream everyone',
      corrected: 'Hey guys, welcome in.',
      naturalVersion: 'Hey everyone, welcome in.',
      shortVersion: 'Welcome in guys.',
      chineseExplanation: '欢迎开场建议用 welcome in，更像美国直播口吻。',
      score: 82,
      issueType: '太正式'
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
