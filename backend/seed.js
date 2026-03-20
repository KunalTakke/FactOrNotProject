const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/factornot";

const CHANNELS = [
  {
    name: "Politics",
    description: "Political claims, government policies, and election news",
    category: "Politics",
  },
  {
    name: "Health",
    description: "Medical claims, wellness trends, and health misinformation",
    category: "Health",
  },
  {
    name: "Technology",
    description: "Tech industry claims, product rumors, and digital trends",
    category: "Technology",
  },
  {
    name: "Science",
    description:
      "Scientific discoveries, research claims, and environmental topics",
    category: "Science",
  },
  {
    name: "Finance",
    description: "Economic claims, market predictions, and financial advice",
    category: "Finance",
  },
  {
    name: "Entertainment",
    description: "Celebrity news, movie rumors, and pop culture claims",
    category: "Entertainment",
  },
  {
    name: "Sports",
    description: "Sports records, transfer rumors, and athletic claims",
    category: "Sports",
  },
  {
    name: "Education",
    description: "Academic claims, educational policies, and learning myths",
    category: "Education",
  },
  {
    name: "Environment",
    description: "Climate claims, conservation topics, and ecological news",
    category: "Environment",
  },
  {
    name: "Food & Nutrition",
    description: "Dietary claims, food safety, and nutrition myths",
    category: "Lifestyle",
  },
];

const CLAIM_TEMPLATES = {
  Politics: [
    "New legislation proposes mandatory voting for all citizens over 18",
    "Government spending on infrastructure increased by 30% this year",
    "Voter turnout in last election was the highest in 50 years",
    "New policy will ban lobbying by former government officials",
    "Tax reform bill includes provisions for universal basic income",
    "Senate passes bipartisan bill on cybersecurity standards",
    "Local government proposes rent control in major cities",
    "New immigration policy changes green card requirements",
    "Campaign finance reform bill gains cross-party support",
    "Governor signs executive order on police reform",
  ],
  Health: [
    "Drinking 8 glasses of water daily is essential for health",
    "New study links screen time to increased anxiety in teens",
    "Vitamin D deficiency affects over 40% of the US population",
    "Walking 10,000 steps daily significantly reduces heart disease risk",
    "New treatment shows 90% effectiveness against resistant bacteria",
    "Sugar is more addictive than certain controlled substances",
    "Meditation can physically change brain structure in 8 weeks",
    "Flu vaccines cause the flu in some recipients",
    "Organic food is significantly more nutritious than conventional",
    "Sitting for long periods is as harmful as smoking",
  ],
  Technology: [
    "AI will replace 40% of jobs within the next decade",
    "Quantum computing breakthrough makes current encryption obsolete",
    "5G networks are 100 times faster than 4G in real-world usage",
    "Self-driving cars are safer than human-driven vehicles",
    "Social media algorithms deliberately promote divisive content",
    "Smartphone batteries degrade 20% after one year of use",
    "Cloud storage is more secure than local backup solutions",
    "AI-generated content now accounts for 10% of internet traffic",
    "New chip technology reduces energy consumption by 50%",
    "VR headsets can cause lasting vision problems with extended use",
  ],
  Science: [
    "Scientists discover high concentration of water on Mars subsurface",
    "CRISPR gene editing successfully treats genetic blindness",
    "Universe is expanding 10% faster than previously thought",
    "New element discovered in Pacific Ocean thermal vents",
    "Brain cells continue to grow throughout entire human lifespan",
    "Dark matter makes up 27% of the observable universe",
    "Lab-grown diamonds are chemically identical to mined diamonds",
    "Gravitational waves detected from two merging neutron stars",
    "Plastic-eating bacteria could solve ocean pollution crisis",
    "Human genome contains over 100,000 unknown viral sequences",
  ],
  Finance: [
    "Cryptocurrency will replace traditional banking within 20 years",
    "Average American has less than $1000 in savings",
    "Housing prices expected to drop 15% in the next year",
    "Index funds outperform 90% of actively managed funds",
    "Student loan debt exceeds total credit card debt in the US",
    "Remote work has increased commercial real estate vacancy by 25%",
    "Digital payment adoption grew 40% globally since 2020",
    "Average retirement savings for 30-year-olds is under $50,000",
    "NFT market value has declined 95% from peak",
    "Federal minimum wage hasn't kept pace with inflation since 1968",
  ],
  Entertainment: [
    "Streaming services now account for 80% of TV viewership",
    "Highest-grossing movie was filmed on a surprisingly small budget",
    "Music streaming pays artists less than $0.004 per stream",
    "Video game industry revenue exceeds movie and music combined",
    "AI-generated music has reached Billboard charts",
    "Average person spends 3 hours daily on social media",
    "Box office numbers are still below pre-pandemic levels",
    "Vinyl record sales have surpassed CD sales for first time since 1987",
    "Major studio plans to release AI-assisted animated feature film",
    "Podcast advertising revenue expected to reach $4 billion",
  ],
  Sports: [
    "Professional esports players have faster reflexes than traditional athletes",
    "Marathon world record could drop below 2 hours in official race",
    "Youth sports participation has declined 20% in the past decade",
    "Average NFL career length is only 3.3 years",
    "Women's sports viewership increased 50% year over year",
    "Sports betting market is now larger than movie box office revenue",
    "College athletes now earn more from NIL deals than some pro players",
    "Swimming is the most complete exercise for full-body fitness",
    "Home field advantage accounts for a 5% win probability increase",
    "FIFA World Cup is the most-watched sporting event globally",
  ],
  Education: [
    "Online degrees are now equally valued by most employers",
    "Average student graduates with over $30,000 in loan debt",
    "Coding should be taught as mandatory subject from grade school",
    "Homework has minimal impact on learning outcomes for young students",
    "Teacher salaries have not kept pace with inflation in most states",
    "Standardized testing accurately predicts college success",
    "Class size has no significant effect on learning outcomes",
    "Trade schools have higher job placement rates than universities",
    "AI tutors are as effective as human tutors for basic subjects",
    "Year-round schooling improves long-term knowledge retention",
  ],
  Environment: [
    "Renewable energy is now cheaper than fossil fuels in most regions",
    "Arctic ice will completely melt during summer by 2035",
    "Ocean plastic pollution has decreased for the first time in decades",
    "Electric vehicles have a larger carbon footprint during production",
    "Deforestation rate has slowed by 50% due to global initiatives",
    "Air quality in major cities improved significantly in 2024",
    "Nuclear energy is the safest form of power per kilowatt-hour",
    "Recycling rates have plateaued at 30% in most developed countries",
    "Coral reef restoration projects showing promising recovery rates",
    "Methane emissions from agriculture exceed those from fossil fuels",
  ],
  "Food & Nutrition": [
    "Breakfast is NOT the most important meal of the day",
    "Gluten-free diets offer no benefits for non-celiac individuals",
    "Microplastics have been found in 90% of bottled water brands",
    "Dark chocolate in moderation can improve cardiovascular health",
    "Organic farming cannot feed the global population sustainably",
    "Intermittent fasting provides no additional weight loss benefits",
    "Food expiration dates are mostly arbitrary and lead to waste",
    "Plant-based meat has similar nutritional value to real meat",
    "MSG is safe for consumption and does not cause headaches",
    "Frozen vegetables retain more nutrients than fresh ones stored long",
  ],
};

const USERNAMES = [
  "truthseeker42",
  "factchecker_pro",
  "skepticalmind",
  "evidencefirst",
  "mythbuster99",
  "criticalthink",
  "verifyalways",
  "datadriven",
  "sourcehunter",
  "logicmaster",
  "debunkqueen",
  "realitycheck",
  "newswatch",
  "infoverify",
  "claimscout",
  "proofpls",
  "doublechecker",
  "trustbutverify",
  "factsonly",
  "rationalrabbit",
];

const EVIDENCE_COMMENTS = [
  "I found a peer-reviewed study that supports this claim.",
  "Multiple credible news outlets have reported on this.",
  "The original source for this claim is questionable.",
  "This is taken out of context — the full study says something different.",
  "I checked the primary data and the numbers don't match.",
  "This was debunked by fact-checkers last year.",
  "While partially true, it's misleading without additional context.",
  "Government data confirms this statistic.",
  "The methodology of the cited study has been criticized.",
  "Independent researchers have replicated these findings.",
  "This appears to be a misinterpretation of the original research.",
  "Updated data shows the situation has changed since this was claimed.",
  "The expert quoted in this claim has since corrected their statement.",
  "Cross-referencing multiple sources, this appears accurate.",
  "The claim is technically true but practically misleading.",
];

const SOURCE_URLS = [
  "https://www.nature.com/articles/example",
  "https://www.reuters.com/fact-check/example",
  "https://www.sciencedirect.com/example",
  "https://pubmed.ncbi.nlm.nih.gov/example",
  "https://www.bbc.com/news/example",
  "https://www.snopes.com/fact-check/example",
  "https://apnews.com/article/example",
  "https://www.who.int/news/example",
  "https://www.nytimes.com/article/example",
  "https://www.washingtonpost.com/example",
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

async function seed() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db();

  console.log("Clearing existing data...");
  await db.collection("users").deleteMany({});
  await db.collection("channels").deleteMany({});
  await db.collection("claims").deleteMany({});

  console.log("Creating users...");
  const hashedPassword = await bcrypt.hash("password123", 10);
  const users = [];
  for (const username of USERNAMES) {
    const result = await db.collection("users").insertOne({
      username,
      password: hashedPassword,
      createdAt: randomDate(new Date("2024-01-01"), new Date("2025-01-01")),
    });
    users.push({ _id: result.insertedId, username });
  }

  const demoResult = await db.collection("users").insertOne({
    username: "demo",
    password: await bcrypt.hash("demo", 10),
    createdAt: new Date(),
  });
  users.push({ _id: demoResult.insertedId, username: "demo" });
  console.log(`Created ${users.length} users (login with demo/demo)`);

  console.log("Creating channels...");
  const channelDocs = [];
  for (const ch of CHANNELS) {
    const author = randomItem(users);
    const result = await db.collection("channels").insertOne({
      name: ch.name,
      description: ch.description,
      category: ch.category,
      author: author.username,
      authorId: author._id.toString(),
      createdAt: randomDate(new Date("2024-01-01"), new Date("2024-06-01")),
      updatedAt: new Date(),
    });
    channelDocs.push({
      _id: result.insertedId,
      name: ch.name,
      category: ch.category,
    });
  }
  console.log(`Created ${channelDocs.length} channels`);

  console.log("Creating claims...");
  const claims = [];
  let claimCount = 0;

  for (const channel of channelDocs) {
    const templates = CLAIM_TEMPLATES[channel.name] || [];

    const targetPerChannel = Math.max(
      100,
      Math.ceil(1050 / channelDocs.length)
    );

    for (let i = 0; i < targetPerChannel; i++) {
      const template = templates[i % templates.length];
      const suffix =
        i >= templates.length
          ? ` (Report #${Math.floor(i / templates.length) + 1})`
          : "";
      const author = randomItem(users);
      const factVotes = randomInt(0, 200);
      const notVotes = randomInt(0, 200);
      const totalVotes = factVotes + notVotes;
      const credibilityScore =
        totalVotes > 0 ? Math.round((factVotes / totalVotes) * 100) : 50;

      const voters = {};
      const voterSubset = [...users]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(totalVotes, users.length));
      voterSubset.forEach((u) => {
        voters[u._id.toString()] = Math.random() > 0.5 ? "fact" : "not";
      });

      const evidenceCount = randomInt(0, 4);
      const evidence = [];
      for (let e = 0; e < evidenceCount; e++) {
        const evidenceAuthor = randomItem(users);
        evidence.push({
          _id: new ObjectId(),
          comment: randomItem(EVIDENCE_COMMENTS),
          sourceUrl: Math.random() > 0.4 ? randomItem(SOURCE_URLS) : "",
          supports: Math.random() > 0.5,
          author: evidenceAuthor.username,
          authorId: evidenceAuthor._id.toString(),
          createdAt: randomDate(new Date("2024-06-01"), new Date("2025-03-01")),
        });
      }

      claims.push({
        title: template + suffix,
        description: `Community submitted claim for verification in the ${channel.name} channel.`,
        sourceUrl: Math.random() > 0.5 ? randomItem(SOURCE_URLS) : "",
        channelId: channel._id.toString(),
        channelName: channel.name,
        author: author.username,
        authorId: author._id.toString(),
        factVotes,
        notVotes,
        totalVotes,
        credibilityScore,
        voters,
        evidence,
        createdAt: randomDate(new Date("2024-06-01"), new Date("2025-03-01")),
        updatedAt: new Date(),
      });
      claimCount++;
    }
  }

  const BATCH_SIZE = 500;
  for (let i = 0; i < claims.length; i += BATCH_SIZE) {
    const batch = claims.slice(i, i + BATCH_SIZE);
    await db.collection("claims").insertMany(batch);
    console.log(
      `  Inserted ${Math.min(i + BATCH_SIZE, claims.length)} / ${claims.length} claims`
    );
  }

  console.log("Creating indexes...");
  await db.collection("claims").createIndex({ channelId: 1 });
  await db.collection("claims").createIndex({ credibilityScore: -1 });
  await db.collection("claims").createIndex({ createdAt: -1 });
  await db.collection("claims").createIndex({ title: "text" });
  await db.collection("users").createIndex({ username: 1 }, { unique: true });

  console.log(`\nSeeding complete!`);
  console.log(`  Users:    ${users.length}`);
  console.log(`  Channels: ${channelDocs.length}`);
  console.log(`  Claims:   ${claimCount}`);
  console.log(`\nDemo login: username=demo, password=demo`);

  await client.close();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
