import type { Lesson } from "../curriculum";

export const flyersLessons2: Lesson[] = [
  {
    slug: "future-plans",
    level: "flyers",
    order: 14,
    title: "Future Plans",
    titleVi: "Kế hoạch tương lai",
    emoji: "🚀",
    summary:
      "Nói về dự định và dự đoán tương lai với be going to, will, may / might qua chủ đề vũ trụ.",
    source:
      "Cambridge YLE Flyers wordlist (Time, The world around us, Work) · Family and Friends 4 – Unit 12",
    video: { youtubeId: "U8L2m8TeIWA", title: "What are you going to do? — Will / Be going to" },
    extraVideos: [
      { youtubeId: "vphJ6WyuxGk", title: "Should We Go to Mars?", channel: "SciShow Kids" },
      {
        youtubeId: "joq-IUFNkrw",
        title: "Explore the Solar System: The Rocky Planets",
        channel: "SciShow Kids",
      },
    ],
    vocab: [
      { word: "tomorrow", ipa: "/təˈmɒrəʊ/", vi: "ngày mai", emoji: "📅" },
      { word: "next week", ipa: "/nekst wiːk/", vi: "tuần sau", emoji: "🗓️" },
      { word: "tonight", ipa: "/təˈnaɪt/", vi: "tối nay", emoji: "🌙" },
      { word: "future", ipa: "/ˈfjuːtʃə/", vi: "tương lai", emoji: "🔮" },
      { word: "astronaut", ipa: "/ˈæstrənɔːt/", vi: "phi hành gia", emoji: "👩‍🚀" },
      { word: "planet", ipa: "/ˈplænɪt/", vi: "hành tinh", emoji: "🪐" },
      { word: "rocket", ipa: "/ˈrɒkɪt/", vi: "tên lửa", emoji: "🚀" },
      { word: "spaceship", ipa: "/ˈspeɪsʃɪp/", vi: "tàu vũ trụ", emoji: "🛸" },
      { word: "space", ipa: "/speɪs/", vi: "không gian vũ trụ", emoji: "🌌" },
      { word: "Earth", ipa: "/ɜːθ/", vi: "Trái Đất", emoji: "🌍" },
    ],
    grammar: {
      title: "be going to và will · may / might",
      formula:
        "S + am/is/are going to + V (dự định) · S + will + V (dự đoán, quyết định ngay) · S + may/might + V (có thể, chưa chắc)",
      note: "Các bé hay nói \"I will going to\" hoặc \"She going to visit\". Nhớ: going to luôn đi cùng am/is/are, còn will + động từ nguyên mẫu, không thêm to. May / might KHÔNG thêm 's' và không có 'to'.",
      examples: [
        {
          en: "I'm going to visit the space museum tomorrow.",
          vi: "Ngày mai tớ sẽ đi thăm bảo tàng vũ trụ.",
        },
        {
          en: "One day people will live on another planet.",
          vi: "Một ngày nào đó con người sẽ sống trên hành tinh khác.",
        },
        {
          en: "It might rain tonight, so take an umbrella.",
          vi: "Tối nay có thể mưa đấy, nhớ mang ô nhé.",
        },
      ],
    },
    reading: {
      title: "Holly's big dream",
      chunks: [
        [
          { text: "Next summer", role: "adverb" },
          { text: "Holly", role: "subject" },
          { text: "is going to visit", role: "verb" },
          { text: "the space museum", role: "object" },
          { text: "with her dad", role: "adverb" },
        ],
        [
          { text: "She", role: "subject" },
          { text: "wants to be", role: "verb" },
          { text: "an astronaut", role: "object" },
          { text: "in the future", role: "adverb" },
        ],
        [
          { text: "Tomorrow", role: "adverb" },
          { text: "she", role: "subject" },
          { text: "is going to read", role: "verb" },
          { text: "a book about planets", role: "object" },
        ],
        [
          { text: "Maybe", role: "adverb" },
          { text: "she", role: "subject" },
          { text: "will fly", role: "verb" },
          { text: "to Mars", role: "adverb" },
          { text: "one day", role: "adverb" },
        ],
        [
          { text: "Her brother Michael", role: "subject" },
          { text: "might go", role: "verb" },
          { text: "with her", role: "adverb" },
          { text: ", but" },
          { text: "he", role: "subject" },
          { text: "isn't sure", role: "verb" },
          { text: "yet", role: "adverb" },
        ],
      ],
      viTranslation:
        "Mùa hè tới, Holly sẽ đi thăm bảo tàng vũ trụ cùng bố. Bạn ấy muốn trở thành phi hành gia trong tương lai. Ngày mai bạn ấy định đọc một cuốn sách về các hành tinh. Có lẽ một ngày nào đó bạn ấy sẽ bay lên sao Hoả. Anh trai Michael có thể sẽ đi cùng, nhưng anh ấy vẫn chưa chắc.",
    },
    listen: [
      {
        prompt: "Nghe và chọn thời gian",
        say: "I'm going to visit my grandma next week.",
        options: ["next week", "next weekend", "this week"],
        answer: "next week",
      },
      {
        prompt: "Nghe và chọn nghề nghiệp",
        say: "Holly wants to be an astronaut in the future.",
        options: ["astronaut", "artist", "actor"],
        answer: "astronaut",
      },
      {
        prompt: "Nghe và chọn từ đúng",
        say: "The rocket will fly to a new planet.",
        options: ["planet", "plane", "plant"],
        answer: "planet",
      },
      {
        prompt: "Nghe và chọn động từ khuyết thiếu",
        say: "It might be very cold on the Moon.",
        options: ["might", "must", "will"],
        answer: "might",
      },
    ],
    speak: [
      {
        sentence: "I'm going to watch a film about space tonight.",
        vi: "Tối nay tớ sẽ xem một bộ phim về vũ trụ.",
      },
      {
        sentence: "Next week I'm going to visit the science museum.",
        vi: "Tuần sau tớ sẽ đi thăm bảo tàng khoa học.",
      },
      {
        sentence: "I think I will be an astronaut one day.",
        vi: "Tớ nghĩ một ngày nào đó tớ sẽ là phi hành gia.",
      },
      {
        sentence: "It might rain tomorrow, so I'll stay at home.",
        vi: "Ngày mai có thể mưa nên tớ sẽ ở nhà.",
      },
    ],
    write: [
      { hint: "Người bay vào vũ trụ, mặc bộ đồ trắng to", emoji: "👩‍🚀", answer: "astronaut" },
      { hint: "Trái Đất, sao Hoả, sao Mộc đều là một ...", emoji: "🪐", answer: "planet" },
      { hint: "Thứ bay vút lên trời để đưa người vào vũ trụ", emoji: "🚀", answer: "rocket" },
      { hint: "Ngày sau hôm nay", emoji: "📅", answer: "tomorrow" },
    ],
  },
  {
    slug: "travel-and-transport",
    level: "flyers",
    order: 15,
    title: "Travel and Transport",
    titleVi: "Du lịch và phương tiện đi lại",
    emoji: "✈️",
    summary:
      "Kể về những chuyến đi với thì hiện tại hoàn thành: Have you ever…?, I've never…, already / yet.",
    source: "Cambridge YLE Flyers wordlist (Transport, Places) · Family and Friends 4 – Unit 8",
    video: {
      youtubeId: "lcdWNmvvyew",
      title: "English Singsing — Transportation: Car, Bus, Train, Helicopter",
    },
    extraVideos: [
      {
        youtubeId: "WFsV2PFyAGA",
        title: "Have you ever… — Present Perfect Song",
        channel: "Engames",
      },
      {
        youtubeId: "5-DeiXPJ3H8",
        title: "Transportation Song — Cars, Boats & Trains",
        channel: "English Singsing",
      },
    ],
    vocab: [
      { word: "airport", ipa: "/ˈeəpɔːt/", vi: "sân bay", emoji: "🛫" },
      { word: "helicopter", ipa: "/ˈhelɪkɒptə/", vi: "máy bay trực thăng", emoji: "🚁" },
      { word: "passenger", ipa: "/ˈpæsɪndʒə/", vi: "hành khách", emoji: "🙋" },
      { word: "journey", ipa: "/ˈdʒɜːni/", vi: "chuyến đi, hành trình", emoji: "🗺️" },
      { word: "platform", ipa: "/ˈplætfɔːm/", vi: "sân ga", emoji: "🚉" },
      { word: "railway", ipa: "/ˈreɪlweɪ/", vi: "đường sắt", emoji: "🛤️" },
      { word: "taxi", ipa: "/ˈtæksi/", vi: "xe tắc-xi", emoji: "🚕" },
      { word: "suitcase", ipa: "/ˈsuːtkeɪs/", vi: "va li", emoji: "🧳" },
      { word: "motorway", ipa: "/ˈməʊtəweɪ/", vi: "đường cao tốc", emoji: "🛣️" },
      { word: "traffic", ipa: "/ˈtræfɪk/", vi: "xe cộ, giao thông", emoji: "🚦" },
    ],
    grammar: {
      title: "Hiện tại hoàn thành: Have you ever…? · already / yet",
      formula:
        "Have/Has + S + ever + V3? · S + have/has + never + V3 · S + have/has + already + V3 · S + haven't/hasn't + V3 + yet",
      note: "Các bé hay dùng V2 thay vì V3: \"I have went\" ❌ → \"I have gone\" ✅. 'Ever' chỉ dùng trong câu hỏi, 'never' dùng trong câu kể (không thêm 'not'). 'Already' đứng giữa câu, 'yet' đứng cuối câu phủ định hoặc câu hỏi.",
      examples: [
        { en: "Have you ever flown in a helicopter?", vi: "Cậu đã bao giờ bay trực thăng chưa?" },
        { en: "I've never been to an airport.", vi: "Tớ chưa bao giờ đến sân bay." },
        {
          en: "Dad has already packed the suitcase, but Mum hasn't found the tickets yet.",
          vi: "Bố đã xếp xong va li rồi, nhưng mẹ vẫn chưa tìm thấy vé.",
        },
      ],
    },
    reading: {
      title: "Emma's first flight",
      chunks: [
        [
          { text: "Emma", role: "subject" },
          { text: "has just come back", role: "verb" },
          { text: "from London", role: "adverb" },
          { text: "with her parents", role: "adverb" },
        ],
        [
          { text: "It", role: "subject" },
          { text: "was", role: "verb" },
          { text: "her first journey", role: "object" },
          { text: "by plane", role: "adverb" },
        ],
        [
          { text: "At the airport", role: "adverb" },
          { text: "the passengers", role: "subject" },
          { text: "waited", role: "verb" },
          { text: "for two hours", role: "adverb" },
          { text: "because of the fog", role: "adverb" },
        ],
        [
          { text: "Emma", role: "subject" },
          { text: "has already written", role: "verb" },
          { text: "a story about the trip", role: "object" },
          { text: "for her teacher", role: "adverb" },
        ],
        [
          { text: "She", role: "subject" },
          { text: "hasn't shown", role: "verb" },
          { text: "it", role: "object" },
          { text: "to her friends", role: "adverb" },
          { text: "yet", role: "adverb" },
        ],
      ],
      viTranslation:
        "Emma vừa trở về từ Luân Đôn cùng bố mẹ. Đó là chuyến đi bằng máy bay đầu tiên của bạn ấy. Ở sân bay, hành khách phải đợi hai tiếng vì sương mù. Emma đã viết xong một bài kể về chuyến đi cho cô giáo. Bạn ấy vẫn chưa cho các bạn xem.",
    },
    listen: [
      {
        prompt: "Nghe và chọn phương tiện",
        say: "Have you ever flown in a helicopter?",
        options: ["helicopter", "hot air balloon", "plane"],
        answer: "helicopter",
      },
      {
        prompt: "Nghe và chọn địa điểm",
        say: "We waited at the airport for two hours.",
        options: ["airport", "bus station", "platform"],
        answer: "airport",
      },
      {
        prompt: "Nghe và chọn trạng từ",
        say: "Dad has already packed the suitcase.",
        options: ["already", "yet", "never"],
        answer: "already",
      },
      {
        prompt: "Nghe và chọn từ đúng",
        say: "There was a lot of traffic on the motorway.",
        options: ["traffic", "trucks", "taxis"],
        answer: "traffic",
      },
    ],
    speak: [
      {
        sentence: "I have never flown in a helicopter before.",
        vi: "Tớ chưa bao giờ bay trực thăng cả.",
      },
      {
        sentence: "I've already packed my suitcase for the trip.",
        vi: "Tớ đã xếp xong va li cho chuyến đi rồi.",
      },
      {
        sentence: "I haven't been to London yet, but I want to.",
        vi: "Tớ chưa đến Luân Đôn, nhưng tớ rất muốn.",
      },
      {
        sentence: "Have you ever travelled by train at night?",
        vi: "Cậu đã bao giờ đi tàu hoả ban đêm chưa?",
      },
    ],
    write: [
      { hint: "Nơi máy bay cất cánh và hạ cánh", emoji: "🛫", answer: "airport" },
      { hint: "Người đi trên xe buýt, tàu hoặc máy bay", emoji: "🙋", answer: "passenger" },
      {
        hint: "Chiếc hộp to có bánh xe để đựng quần áo khi đi xa",
        emoji: "🧳",
        answer: "suitcase",
      },
      { hint: "Nơi đứng chờ tàu ở nhà ga", emoji: "🚉", answer: "platform" },
    ],
  },
  {
    slug: "materials-and-inventions",
    level: "flyers",
    order: 16,
    title: "Materials and Inventions",
    titleVi: "Chất liệu và những món đồ",
    emoji: "🔩",
    summary: "Mô tả đồ vật được làm từ gì với be made of, mệnh đề where và câu hỏi What else?",
    source: "Cambridge YLE Flyers wordlist (Materials, The home) · Family and Friends 5 – Unit 4",
    video: { youtubeId: "JCKSMsbpn1Y", title: "Materials for Kids — What are Things Made From?" },
    extraVideos: [
      { youtubeId: "x0HeCL6nano", title: "Wonderful Wool!", channel: "SciShow Kids" },
      { youtubeId: "s236Q1nuWXg", title: "Fun with Magnets!", channel: "SciShow Kids" },
    ],
    vocab: [
      { word: "wood", ipa: "/wʊd/", vi: "gỗ", emoji: "🪵" },
      { word: "metal", ipa: "/ˈmetl/", vi: "kim loại", emoji: "🔩" },
      { word: "plastic", ipa: "/ˈplæstɪk/", vi: "nhựa", emoji: "🧴" },
      { word: "glass", ipa: "/ɡlɑːs/", vi: "thuỷ tinh, kính", emoji: "🪟" },
      { word: "gold", ipa: "/ɡəʊld/", vi: "vàng", emoji: "🥇" },
      { word: "silver", ipa: "/ˈsɪlvə/", vi: "bạc", emoji: "🥈" },
      { word: "wool", ipa: "/wʊl/", vi: "len", emoji: "🧶" },
      { word: "stone", ipa: "/stəʊn/", vi: "đá", emoji: "🪨" },
      { word: "ring", ipa: "/rɪŋ/", vi: "chiếc nhẫn", emoji: "💍" },
      { word: "necklace", ipa: "/ˈnekləs/", vi: "vòng cổ", emoji: "📿" },
    ],
    grammar: {
      title: "be made of · mệnh đề where · What else?",
      formula: "S + is/are made of + chất liệu · S + V + where + S + V · What else + …?",
      note: 'Các bé hay quên \'of\' hoặc nói "made by wood" ❌ → "made of wood" ✅ (by dùng cho người làm ra). Sau \'where\' trong mệnh đề KHÔNG đảo ngữ: "I know where the key is", không phải "where is the key".',
      examples: [
        { en: "This table is made of wood.", vi: "Cái bàn này làm bằng gỗ." },
        {
          en: "Grandma has forgotten where she put her glasses.",
          vi: "Bà quên mất đã để kính ở đâu rồi.",
        },
        {
          en: "What else is made of plastic in your room?",
          vi: "Trong phòng cậu còn thứ gì làm bằng nhựa nữa?",
        },
      ],
    },
    reading: {
      title: "Grandpa's old box",
      chunks: [
        [
          { text: "Last Sunday", role: "adverb" },
          { text: "Richard", role: "subject" },
          { text: "found", role: "verb" },
          { text: "an old wooden box", role: "object" },
          { text: "in Grandpa's garage", role: "adverb" },
        ],
        [
          { text: "Inside the box", role: "adverb" },
          { text: "he", role: "subject" },
          { text: "saw", role: "verb" },
          { text: "a silver spoon, a gold ring and a glass bottle", role: "object" },
        ],
        [
          { text: "The ring", role: "subject" },
          { text: "is made of", role: "verb" },
          { text: "real gold", role: "object" },
          { text: ", but" },
          { text: "the spoon", role: "subject" },
          { text: "is made of", role: "verb" },
          { text: "silver", role: "object" },
        ],
        [
          { text: "Grandpa", role: "subject" },
          { text: "has forgotten", role: "verb" },
          { text: "where he put the key for the box", role: "object" },
        ],
        [
          { text: "Richard", role: "subject" },
          { text: "wants to know", role: "verb" },
          { text: "what else is inside", role: "object" },
        ],
      ],
      viTranslation:
        "Chủ nhật tuần trước, Richard tìm thấy một chiếc hộp gỗ cũ trong ga-ra của ông. Bên trong hộp, cậu thấy một chiếc thìa bạc, một chiếc nhẫn vàng và một cái chai thuỷ tinh. Chiếc nhẫn làm bằng vàng thật, còn chiếc thìa làm bằng bạc. Ông đã quên mất đã để chìa khoá của chiếc hộp ở đâu. Richard rất muốn biết bên trong còn có gì nữa.",
    },
    listen: [
      {
        prompt: "Nghe và chọn chất liệu",
        say: "My grandma's scarf is made of wool.",
        options: ["wool", "wood", "wax"],
        answer: "wool",
      },
      {
        prompt: "Nghe và chọn chất liệu",
        say: "The bottle on the table is made of glass.",
        options: ["glass", "grass", "gold"],
        answer: "glass",
      },
      {
        prompt: "Nghe và chọn đồ vật",
        say: "Mum has forgotten where she put her necklace.",
        options: ["necklace", "bracelet", "ring"],
        answer: "necklace",
      },
      {
        prompt: "Nghe và chọn chất liệu",
        say: "Is this spoon made of silver or metal?",
        options: ["silver or metal", "silver or plastic", "stone or metal"],
        answer: "silver or metal",
      },
    ],
    speak: [
      {
        sentence: "My desk is made of wood and metal.",
        vi: "Bàn học của tớ làm bằng gỗ và kim loại.",
      },
      {
        sentence: "I've forgotten where I put my new pencil case.",
        vi: "Tớ quên mất đã để hộp bút mới ở đâu rồi.",
      },
      {
        sentence: "What else is made of plastic in this room?",
        vi: "Trong phòng này còn gì làm bằng nhựa nữa nhỉ?",
      },
      {
        sentence: "My mum's ring is made of gold, I think.",
        vi: "Tớ nghĩ chiếc nhẫn của mẹ tớ làm bằng vàng.",
      },
    ],
    write: [
      { hint: "Chất liệu lấy từ cây, dùng làm bàn ghế", emoji: "🪵", answer: "wood" },
      { hint: "Chất liệu trong suốt, dễ vỡ, làm cửa sổ và chai lọ", emoji: "🪟", answer: "glass" },
      { hint: "Chất liệu màu vàng óng, rất quý, làm nhẫn và vòng cổ", emoji: "🥇", answer: "gold" },
      { hint: "Sợi ấm từ lông cừu, dùng đan khăn và áo", emoji: "🧶", answer: "wool" },
    ],
  },
  {
    slug: "feelings-and-advice",
    level: "flyers",
    order: 17,
    title: "Feelings and Advice",
    titleVi: "Cảm xúc và lời khuyên",
    emoji: "💛",
    summary:
      "Gọi tên cảm xúc, đưa lời khuyên với should / shouldn't, câu hỏi đuôi và câu điều kiện loại 0.",
    source:
      "Cambridge YLE Flyers wordlist (Feelings, Family and friends) · Family and Friends 5 – Unit 9",
    video: {
      youtubeId: "UuNrP4Q_y9U",
      title: "British Council — Robot Songs: Feelings are feelings",
    },
    extraVideos: [
      {
        youtubeId: "BXWNhq-lPD8",
        title: "Feel — How Do You Feel? Happy, Sad & Angry",
        channel: "English Singsing",
      },
      {
        youtubeId: "foyWhOHhTT0",
        title: "Question tags — 6 Minute Grammar",
        channel: "BBC Learning English",
      },
    ],
    vocab: [
      { word: "worried", ipa: "/ˈwʌrid/", vi: "lo lắng", emoji: "😟" },
      { word: "pleased", ipa: "/pliːzd/", vi: "hài lòng, vui", emoji: "😊" },
      { word: "surprised", ipa: "/səˈpraɪzd/", vi: "ngạc nhiên", emoji: "😲" },
      { word: "lonely", ipa: "/ˈləʊnli/", vi: "cô đơn", emoji: "😔" },
      { word: "frightened", ipa: "/ˈfraɪtnd/", vi: "sợ hãi", emoji: "😨" },
      { word: "bored", ipa: "/bɔːd/", vi: "chán", emoji: "🥱" },
      { word: "excited", ipa: "/ɪkˈsaɪtɪd/", vi: "háo hức", emoji: "🤩" },
      { word: "upset", ipa: "/ʌpˈset/", vi: "buồn bực", emoji: "😢" },
      { word: "friendly", ipa: "/ˈfrendli/", vi: "thân thiện", emoji: "🤝" },
      { word: "kind", ipa: "/kaɪnd/", vi: "tốt bụng", emoji: "💛" },
    ],
    grammar: {
      title: "should / shouldn't · câu hỏi đuôi · câu điều kiện loại 0",
      formula:
        "S + should/shouldn't + V · Câu khẳng định, + trợ động từ phủ định + S? (…, isn't it? / …, don't you?) · If + S + V(hiện tại), S + V(hiện tại)",
      note: "Sau 'should' không thêm 'to': \"You should to sleep\" ❌ → \"You should sleep\" ✅. Câu hỏi đuôi: câu chính khẳng định thì đuôi phủ định và dùng cùng trợ động từ (\"You like it, don't you?\", không phải \"isn't it?\"). Điều kiện loại 0 cả hai vế đều dùng hiện tại đơn, không dùng 'will'.",
      examples: [
        {
          en: "You look worried. You should talk to your teacher.",
          vi: "Trông cậu lo lắng quá. Cậu nên nói chuyện với cô giáo.",
        },
        { en: "Katy is very friendly, isn't she?", vi: "Katy thân thiện lắm, đúng không?" },
        {
          en: "If you feel lonely, call a friend.",
          vi: "Nếu bé thấy cô đơn, hãy gọi cho một người bạn.",
        },
      ],
    },
    reading: {
      title: "A new friend for Sophia",
      chunks: [
        [
          { text: "On her first day at the new school", role: "adverb" },
          { text: "Sophia", role: "subject" },
          { text: "felt", role: "verb" },
          { text: "worried and a bit lonely", role: "object" },
        ],
        [
          { text: "Nobody", role: "subject" },
          { text: "talked", role: "verb" },
          { text: "to her", role: "adverb" },
          { text: "at lunchtime", role: "adverb" },
        ],
        [
          { text: "Then", role: "adverb" },
          { text: "a friendly girl called Katy", role: "subject" },
          { text: "sat", role: "verb" },
          { text: "next to her", role: "adverb" },
          { text: "and" },
          { text: "smiled", role: "verb" },
        ],
        [
          { text: "\"You're new here, aren't you?\"", role: "object" },
          { text: "she", role: "subject" },
          { text: "asked", role: "verb" },
          { text: "kindly", role: "adverb" },
        ],
        [
          { text: "Now", role: "adverb" },
          { text: "Sophia", role: "subject" },
          { text: "feels", role: "verb" },
          { text: "pleased and excited", role: "object" },
          { text: "every morning", role: "adverb" },
        ],
      ],
      viTranslation:
        'Ngày đầu tiên ở trường mới, Sophia thấy lo lắng và hơi cô đơn. Giờ ăn trưa chẳng ai nói chuyện với bạn ấy. Rồi một cô bạn thân thiện tên Katy ngồi xuống cạnh và mỉm cười. "Cậu mới đến đây, đúng không?" bạn ấy hỏi một cách dịu dàng. Bây giờ sáng nào Sophia cũng thấy vui và háo hức.',
    },
    listen: [
      {
        prompt: "Nghe và chọn cảm xúc",
        say: "Sophia felt worried on her first day at school.",
        options: ["worried", "tired", "bored"],
        answer: "worried",
      },
      {
        prompt: "Nghe và chọn cảm xúc",
        say: "Harry was surprised when he opened the present.",
        options: ["surprised", "pleased", "frightened"],
        answer: "surprised",
      },
      {
        prompt: "Nghe và chọn lời khuyên",
        say: "If you feel lonely, you should call a friend.",
        options: ["should call a friend", "shouldn't call a friend", "should read a book"],
        answer: "should call a friend",
      },
      {
        prompt: "Nghe và chọn câu hỏi đuôi",
        say: "Your sister is very kind, isn't she?",
        options: ["isn't she", "doesn't she", "is she"],
        answer: "isn't she",
      },
    ],
    speak: [
      {
        sentence: "I feel excited when my friends come to visit.",
        vi: "Tớ thấy háo hức khi các bạn đến chơi.",
      },
      {
        sentence: "If I feel bored, I usually draw a picture.",
        vi: "Nếu thấy chán, tớ thường vẽ một bức tranh.",
      },
      {
        sentence: "I think I should go to bed earlier tonight.",
        vi: "Tớ nghĩ tối nay tớ nên đi ngủ sớm hơn.",
      },
      {
        sentence: "You like football, don't you? I do too!",
        vi: "Cậu thích bóng đá, đúng không? Tớ cũng thế!",
      },
    ],
    write: [
      { hint: "Cảm giác khi lo nghĩ về bài kiểm tra ngày mai", emoji: "😟", answer: "worried" },
      { hint: "Cảm giác khi bất ngờ nhận được quà", emoji: "😲", answer: "surprised" },
      { hint: "Cảm giác khi ở một mình, không có bạn chơi cùng", emoji: "😔", answer: "lonely" },
      {
        hint: "Tính từ chỉ người luôn giúp đỡ người khác, trái với 'xấu tính'",
        emoji: "💛",
        answer: "kind",
      },
    ],
  },
];
