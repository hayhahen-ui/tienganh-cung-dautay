import type { Lesson } from "../curriculum";

/** 12 bài học gốc (v1). Bài bổ sung nằm ở starters-2.ts / movers-2.ts / flyers-2.ts. */
export const coreLessons: Lesson[] = [
  {
    slug: "colours-and-numbers",
    level: "starters",
    order: 1,
    title: "Colours & Numbers",
    titleVi: "Màu sắc và con số",
    emoji: "🎨",
    summary: "Gọi tên 8 màu và đếm 1–10 — nền tảng cho phần Listening tô màu.",
    source: "Cambridge YLE Starters wordlist (Colours, Numbers) · Family and Friends Starter",
    video: { youtubeId: "tRNy2i75tCc", title: "The Rainbow Colors Song" },
    extraVideos: [
      {
        youtubeId: "YyFLBTTAbSE",
        title: "What Color Is It? Song — Learn 11 Colors",
        channel: "Dream English Kids",
      },
      {
        youtubeId: "j-XXk3dVeag",
        title: "What's this? — Easy Dialogue Role Play",
        channel: "English Singsing",
      },
    ],
    vocab: [
      { word: "red", ipa: "/red/", vi: "màu đỏ", emoji: "🍎" },
      { word: "blue", ipa: "/bluː/", vi: "màu xanh dương", emoji: "🫐" },
      { word: "green", ipa: "/ɡriːn/", vi: "màu xanh lá", emoji: "🥦" },
      { word: "yellow", ipa: "/ˈjeləʊ/", vi: "màu vàng", emoji: "🍌" },
      { word: "orange", ipa: "/ˈɒrɪndʒ/", vi: "màu cam", emoji: "🍊" },
      { word: "purple", ipa: "/ˈpɜːpl/", vi: "màu tím", emoji: "🍇" },
      { word: "pink", ipa: "/pɪŋk/", vi: "màu hồng", emoji: "🌸" },
      { word: "brown", ipa: "/braʊn/", vi: "màu nâu", emoji: "🐻" },
      { word: "one", ipa: "/wʌn/", vi: "số một", emoji: "1️⃣" },
      { word: "three", ipa: "/θriː/", vi: "số ba", emoji: "3️⃣" },
      { word: "seven", ipa: "/ˈsevn/", vi: "số bảy", emoji: "7️⃣" },
      { word: "ten", ipa: "/ten/", vi: "số mười", emoji: "🔟" },
    ],
    grammar: {
      title: "This is / These are",
      formula: "This is a + danh từ số ít  ·  These are + danh từ số nhiều",
      note: "Dùng `a` trước phụ âm, `an` trước nguyên âm (a ball / an apple).",
      examples: [
        { en: "This is a red ball.", vi: "Đây là một quả bóng màu đỏ." },
        { en: "These are three blue pens.", vi: "Đây là ba cây bút màu xanh." },
        { en: "This is an orange bag.", vi: "Đây là một chiếc cặp màu cam." },
      ],
    },
    reading: {
      title: "My colourful box",
      chunks: [
        [
          { text: "I", role: "subject" },
          { text: "have got", role: "verb" },
          { text: "a big box", role: "object" },
          { text: "in my room", role: "adverb" },
        ],
        [
          { text: "There are", role: "verb" },
          { text: "seven balls", role: "object" },
          { text: "in the box", role: "adverb" },
        ],
        [
          { text: "Two balls", role: "subject" },
          { text: "are", role: "verb" },
          { text: "red", role: "object" },
        ],
        [
          { text: "I", role: "subject" },
          { text: "like", role: "verb" },
          { text: "the yellow ball", role: "object" },
          { text: "very much", role: "adverb" },
        ],
      ],
      viTranslation:
        "Tớ có một chiếc hộp to trong phòng. Trong hộp có bảy quả bóng. Hai quả bóng màu đỏ. Tớ rất thích quả bóng màu vàng.",
    },
    listen: [
      {
        prompt: "Nghe và chọn màu đúng",
        say: "The bag is purple.",
        options: ["purple", "green", "red"],
        answer: "purple",
      },
      {
        prompt: "Nghe và chọn số đúng",
        say: "There are seven balls.",
        options: ["seven", "eleven", "seventeen"],
        answer: "seven",
      },
      {
        prompt: "Nghe và chọn câu đúng",
        say: "These are two yellow pens.",
        options: ["two yellow pens", "two yellow pencils", "ten yellow pens"],
        answer: "two yellow pens",
      },
    ],
    speak: [
      { sentence: "This is a red apple.", vi: "Đây là một quả táo đỏ." },
      { sentence: "These are six green balls.", vi: "Đây là sáu quả bóng xanh lá." },
      { sentence: "My favourite colour is blue.", vi: "Màu tớ thích nhất là màu xanh dương." },
    ],
    write: [
      { hint: "Màu của quả chuối", emoji: "🍌", answer: "yellow" },
      { hint: "Màu của quả táo trong bài", emoji: "🍎", answer: "red" },
      { hint: "Số đứng sau six", emoji: "7️⃣", answer: "seven" },
    ],
  },
  {
    slug: "my-family",
    level: "starters",
    order: 2,
    title: "My Family",
    titleVi: "Gia đình của tớ",
    emoji: "👨‍👩‍👧",
    summary: "Giới thiệu các thành viên trong gia đình và dùng `have got`.",
    source: "Cambridge YLE Starters wordlist (Family & friends) · Kid's Box 1 (My family)",
    video: { youtubeId: "d_WQEw13TCo", title: "Family Members Song" },
    extraVideos: [
      {
        youtubeId: "xb3za6PAXQE",
        title:
          "Good morning. How are you? — Easy Dialogue Role Play (luyện Speaking Part 4: hỏi–đáp cá nhân)",
        channel: "English Singsing",
      },
    ],
    vocab: [
      { word: "mother", ipa: "/ˈmʌðə/", vi: "mẹ", emoji: "👩" },
      { word: "father", ipa: "/ˈfɑːðə/", vi: "bố", emoji: "👨" },
      { word: "sister", ipa: "/ˈsɪstə/", vi: "chị/em gái", emoji: "👧" },
      { word: "brother", ipa: "/ˈbrʌðə/", vi: "anh trai, anh/em trai", emoji: "👦" },
      { word: "grandmother", ipa: "/ˈɡrænmʌðə/", vi: "bà", emoji: "👵" },
      { word: "grandfather", ipa: "/ˈɡrænfɑːðə/", vi: "ông", emoji: "👴" },
      { word: "baby", ipa: "/ˈbeɪbi/", vi: "em bé", emoji: "👶" },
      { word: "cousin", ipa: "/ˈkʌzn/", vi: "anh chị em họ", emoji: "🧒" },
    ],
    grammar: {
      title: "Have got / Has got",
      formula: "I / You / We / They + have got  ·  He / She / It + has got",
      note: "Phủ định: haven't got · hasn't got. Câu hỏi: Have you got…? — Yes, I have. / No, I haven't.",
      examples: [
        { en: "I have got two sisters.", vi: "Tớ có hai chị em gái." },
        { en: "She has got a small baby brother.", vi: "Chị ấy có một em trai nhỏ." },
        { en: "Have you got a cousin?", vi: "Bạn có anh chị em họ không?" },
      ],
    },
    reading: {
      title: "This is my family",
      chunks: [
        [
          { text: "My name", role: "subject" },
          { text: "is", role: "verb" },
          { text: "Mai", role: "object" },
        ],
        [
          { text: "I", role: "subject" },
          { text: "have got", role: "verb" },
          { text: "a brother and a sister", role: "object" },
        ],
        [
          { text: "My father", role: "subject" },
          { text: "works", role: "verb" },
          { text: "in a big school", role: "adverb" },
        ],
        [
          { text: "We", role: "subject" },
          { text: "play", role: "verb" },
          { text: "football", role: "object" },
          { text: "on Sunday", role: "adverb" },
        ],
      ],
      viTranslation:
        "Tên tớ là Mai. Tớ có một anh trai và một em gái. Bố tớ làm việc ở một ngôi trường lớn. Chúng tớ chơi bóng đá vào Chủ nhật.",
    },
    listen: [
      {
        prompt: "Nghe và chọn người đúng",
        say: "My grandmother is seventy.",
        options: ["grandmother", "grandfather", "mother"],
        answer: "grandmother",
      },
      {
        prompt: "Nghe và chọn câu đúng",
        say: "Sam has got two brothers.",
        options: ["two brothers", "two sisters", "one brother"],
        answer: "two brothers",
      },
      {
        prompt: "Nghe và chọn từ đúng",
        say: "The baby is sleeping.",
        options: ["baby", "brother", "cousin"],
        answer: "baby",
      },
    ],
    speak: [
      {
        sentence: "I have got one sister and one brother.",
        vi: "Tớ có một chị gái và một em trai.",
      },
      { sentence: "My mother is a teacher.", vi: "Mẹ tớ là giáo viên." },
      { sentence: "Have you got a big family?", vi: "Bạn có gia đình đông người không?" },
    ],
    write: [
      { hint: "Mẹ trong tiếng Anh", emoji: "👩", answer: "mother" },
      { hint: "Ông trong tiếng Anh", emoji: "👴", answer: "grandfather" },
      { hint: "Em bé trong tiếng Anh", emoji: "👶", answer: "baby" },
    ],
  },
  {
    slug: "animals-and-pets",
    level: "starters",
    order: 3,
    title: "Animals & Pets",
    titleVi: "Động vật và thú cưng",
    emoji: "🐶",
    summary: "Tên con vật, dùng `can / can't` để nói về khả năng.",
    source: "Cambridge YLE Starters wordlist (Animals) · Family and Friends 1 (Pets)",
    video: { youtubeId: "pWepfJ-8XU0", title: "Super Simple Songs — I Have A Pet" },
    extraVideos: [
      {
        youtubeId: "_Ir0Mc6Qilo",
        title: "Yes, I Can! — Animal Song (luyện đúng cấu trúc can/can't)",
        channel: "Super Simple Songs",
      },
    ],
    vocab: [
      { word: "dog", ipa: "/dɒɡ/", vi: "con chó", emoji: "🐶" },
      { word: "cat", ipa: "/kæt/", vi: "con mèo", emoji: "🐱" },
      { word: "bird", ipa: "/bɜːd/", vi: "con chim", emoji: "🐦" },
      { word: "fish", ipa: "/fɪʃ/", vi: "con cá", emoji: "🐟" },
      { word: "horse", ipa: "/hɔːs/", vi: "con ngựa", emoji: "🐴" },
      { word: "elephant", ipa: "/ˈelɪfənt/", vi: "con voi", emoji: "🐘" },
      { word: "monkey", ipa: "/ˈmʌŋki/", vi: "con khỉ", emoji: "🐵" },
      { word: "rabbit", ipa: "/ˈræbɪt/", vi: "con thỏ", emoji: "🐰" },
    ],
    grammar: {
      title: "Can / Can't",
      formula: "Chủ ngữ + can + động từ nguyên thể",
      note: "Sau `can` luôn là động từ nguyên mẫu, không thêm -s: He can swim (không phải cans/swims).",
      examples: [
        { en: "A bird can fly.", vi: "Con chim có thể bay." },
        { en: "A fish can't walk.", vi: "Con cá không thể đi bộ." },
        { en: "Can a rabbit jump? — Yes, it can.", vi: "Con thỏ có thể nhảy không? — Có." },
      ],
    },
    reading: {
      title: "At the zoo",
      chunks: [
        [
          { text: "Today", role: "adverb" },
          { text: "we", role: "subject" },
          { text: "are", role: "verb" },
          { text: "at the zoo", role: "adverb" },
        ],
        [
          { text: "The elephant", role: "subject" },
          { text: "is drinking", role: "verb" },
          { text: "water", role: "object" },
        ],
        [
          { text: "Two monkeys", role: "subject" },
          { text: "can climb", role: "verb" },
          { text: "the tall tree", role: "object" },
        ],
        [
          { text: "I", role: "subject" },
          { text: "can see", role: "verb" },
          { text: "a small rabbit", role: "object" },
          { text: "behind the box", role: "adverb" },
        ],
      ],
      viTranslation:
        "Hôm nay chúng tớ ở sở thú. Con voi đang uống nước. Hai chú khỉ có thể trèo lên cái cây cao. Tớ nhìn thấy một chú thỏ nhỏ phía sau chiếc hộp.",
    },
    listen: [
      {
        prompt: "Nghe và chọn con vật",
        say: "The monkey is in the tree.",
        options: ["monkey", "rabbit", "horse"],
        answer: "monkey",
      },
      {
        prompt: "Nghe và chọn câu đúng",
        say: "A fish can swim but it can't fly.",
        options: ["can swim", "can fly", "can run"],
        answer: "can swim",
      },
      {
        prompt: "Nghe và chọn số con vật",
        say: "There are four birds.",
        options: ["four birds", "fourteen birds", "four bears"],
        answer: "four birds",
      },
    ],
    speak: [
      { sentence: "I have got a small brown dog.", vi: "Tớ có một chú chó nhỏ màu nâu." },
      { sentence: "An elephant can't climb a tree.", vi: "Con voi không thể trèo cây." },
      { sentence: "My favourite animal is the rabbit.", vi: "Con vật tớ thích nhất là con thỏ." },
    ],
    write: [
      { hint: "Con vật có thể bay", emoji: "🐦", answer: "bird" },
      { hint: "Con vật to nhất ở sở thú trong bài", emoji: "🐘", answer: "elephant" },
      { hint: "Thú cưng kêu meo meo", emoji: "🐱", answer: "cat" },
    ],
  },
  {
    slug: "my-day",
    level: "movers",
    order: 6,
    title: "My Day",
    titleVi: "Một ngày của tớ",
    emoji: "⏰",
    summary: "Thì hiện tại đơn, trạng từ tần suất và kể lại thói quen hằng ngày.",
    source: "Cambridge YLE Movers wordlist (Time, Daily routines) · Family and Friends 2 (My day)",
    video: { youtubeId: "qD1pnquN_DM", title: "English Singsing — My Day: Daily Routine" },
    extraVideos: [
      {
        youtubeId: "_oEAdz3MAj0",
        title: "What Do You Do Every Day? — Daily Routines Song",
        channel: "Fun Kids English",
      },
    ],
    vocab: [
      { word: "wake up", ipa: "/weɪk ʌp/", vi: "thức dậy", emoji: "🛏️" },
      { word: "brush teeth", ipa: "/brʌʃ tiːθ/", vi: "đánh răng", emoji: "🪥" },
      { word: "breakfast", ipa: "/ˈbrekfəst/", vi: "bữa sáng", emoji: "🥣" },
      { word: "homework", ipa: "/ˈhəʊmwɜːk/", vi: "bài tập về nhà", emoji: "📓" },
      { word: "always", ipa: "/ˈɔːlweɪz/", vi: "luôn luôn", emoji: "💯" },
      { word: "sometimes", ipa: "/ˈsʌmtaɪmz/", vi: "thỉnh thoảng", emoji: "🔁" },
      { word: "never", ipa: "/ˈnevə/", vi: "không bao giờ", emoji: "🚫" },
      { word: "afternoon", ipa: "/ˌɑːftəˈnuːn/", vi: "buổi chiều", emoji: "🌤️" },
    ],
    grammar: {
      title: "Hiện tại đơn + trạng từ tần suất",
      formula: "S + (always/usually/often/sometimes/never) + V(s/es)",
      note: "He / She / It thêm -s: gets up, brushes, goes. Trạng từ tần suất đứng TRƯỚC động từ thường, SAU động từ to be.",
      examples: [
        { en: "I always get up at six o'clock.", vi: "Tớ luôn thức dậy lúc 6 giờ." },
        { en: "She never eats breakfast in bed.", vi: "Chị ấy không bao giờ ăn sáng trên giường." },
        { en: "We sometimes play in the park.", vi: "Chúng tớ thỉnh thoảng chơi ở công viên." },
      ],
    },
    reading: {
      title: "A busy Monday",
      chunks: [
        [
          { text: "Every morning", role: "adverb" },
          { text: "Nam", role: "subject" },
          { text: "wakes up", role: "verb" },
          { text: "at half past six", role: "adverb" },
        ],
        [
          { text: "He", role: "subject" },
          { text: "always brushes", role: "verb" },
          { text: "his teeth", role: "object" },
          { text: "before breakfast", role: "adverb" },
        ],
        [
          { text: "After school", role: "adverb" },
          { text: "he", role: "subject" },
          { text: "does", role: "verb" },
          { text: "his homework", role: "object" },
        ],
        [
          { text: "He", role: "subject" },
          { text: "never goes", role: "verb" },
          { text: "to bed", role: "adverb" },
          { text: "after nine o'clock", role: "adverb" },
        ],
      ],
      viTranslation:
        "Mỗi sáng Nam thức dậy lúc 6 giờ 30. Cậu ấy luôn đánh răng trước bữa sáng. Sau giờ học, cậu ấy làm bài tập về nhà. Cậu ấy không bao giờ đi ngủ sau 9 giờ tối.",
    },
    listen: [
      {
        prompt: "Nghe và chọn giờ đúng",
        say: "Nam wakes up at half past six.",
        options: ["half past six", "half past seven", "six o'clock"],
        answer: "half past six",
      },
      {
        prompt: "Nghe và chọn trạng từ",
        say: "She never eats breakfast at school.",
        options: ["never", "always", "sometimes"],
        answer: "never",
      },
      {
        prompt: "Nghe và chọn hoạt động",
        say: "After school he does his homework.",
        options: ["homework", "housework", "shopping"],
        answer: "homework",
      },
    ],
    speak: [
      { sentence: "I always wake up at six o'clock.", vi: "Tớ luôn thức dậy lúc 6 giờ." },
      {
        sentence: "I sometimes play football in the afternoon.",
        vi: "Tớ thỉnh thoảng chơi bóng đá buổi chiều.",
      },
      { sentence: "I never go to bed late.", vi: "Tớ không bao giờ đi ngủ muộn." },
    ],
    write: [
      { hint: "Bữa ăn đầu tiên trong ngày", emoji: "🥣", answer: "breakfast" },
      { hint: "Trạng từ nghĩa là 'không bao giờ'", emoji: "🚫", answer: "never" },
      { hint: "Bài tập cô giáo cho về nhà", emoji: "📓", answer: "homework" },
    ],
  },
  {
    slug: "last-weekend",
    level: "movers",
    order: 7,
    title: "Last Weekend",
    titleVi: "Cuối tuần vừa rồi",
    emoji: "🏖️",
    summary: "Thì quá khứ đơn và động từ bất quy tắc — bước nhảy khó nhất của Movers.",
    source: "Cambridge YLE Movers grammar (Past simple) · Grammar Friends 3",
    video: { youtubeId: "qOUBcwlnTyc", title: "Past Simple Song — Regular & Irregular Verbs" },
    extraVideos: [
      {
        youtubeId: "5gSilgIWc58",
        title: "Irregular Past Tense Verbs — Grammar Rap Song",
        channel: "Mr Spelling",
      },
    ],
    vocab: [
      { word: "went", ipa: "/went/", vi: "đã đi (go)", emoji: "🚶" },
      { word: "saw", ipa: "/sɔː/", vi: "đã thấy (see)", emoji: "👀" },
      { word: "ate", ipa: "/eɪt/", vi: "đã ăn (eat)", emoji: "🍽️" },
      { word: "played", ipa: "/pleɪd/", vi: "đã chơi (play)", emoji: "⚽" },
      { word: "beach", ipa: "/biːtʃ/", vi: "bãi biển", emoji: "🏖️" },
      { word: "picnic", ipa: "/ˈpɪknɪk/", vi: "buổi dã ngoại", emoji: "🧺" },
      { word: "yesterday", ipa: "/ˈjestədeɪ/", vi: "hôm qua", emoji: "📅" },
      { word: "swam", ipa: "/swæm/", vi: "đã bơi (swim)", emoji: "🏊" },
    ],
    grammar: {
      title: "Quá khứ đơn (Past simple)",
      formula: "V-ed (có quy tắc) · V2 (bất quy tắc) · didn't + V nguyên thể",
      note: "Sau `didn't` động từ trở về nguyên mẫu: I didn't go (không phải didn't went).",
      examples: [
        { en: "We went to the beach last Sunday.", vi: "Chúng tớ đã ra biển Chủ nhật tuần trước." },
        { en: "I ate a big ice cream.", vi: "Tớ đã ăn một cây kem to." },
        { en: "She didn't play tennis yesterday.", vi: "Cô ấy đã không chơi tennis hôm qua." },
      ],
    },
    reading: {
      title: "Our picnic",
      chunks: [
        [
          { text: "Last Saturday", role: "adverb" },
          { text: "my family", role: "subject" },
          { text: "went", role: "verb" },
          { text: "to the beach", role: "adverb" },
        ],
        [
          { text: "We", role: "subject" },
          { text: "had", role: "verb" },
          { text: "a picnic", role: "object" },
          { text: "under a big tree", role: "adverb" },
        ],
        [
          { text: "My brother and I", role: "subject" },
          { text: "swam", role: "verb" },
          { text: "in the sea", role: "adverb" },
        ],
        [
          { text: "It", role: "subject" },
          { text: "was", role: "verb" },
          { text: "the best day", role: "object" },
          { text: "of the month", role: "adverb" },
        ],
      ],
      viTranslation:
        "Thứ Bảy tuần trước gia đình tớ ra biển. Chúng tớ đã có một buổi dã ngoại dưới gốc cây to. Anh trai và tớ đã bơi ở biển. Đó là ngày tuyệt nhất trong tháng.",
    },
    listen: [
      {
        prompt: "Nghe và chọn nơi chốn",
        say: "They went to the beach on Saturday.",
        options: ["beach", "park", "zoo"],
        answer: "beach",
      },
      {
        prompt: "Nghe và chọn động từ quá khứ",
        say: "I ate a big ice cream.",
        options: ["ate", "eat", "eating"],
        answer: "ate",
      },
      {
        prompt: "Nghe và chọn câu đúng",
        say: "She didn't play tennis yesterday.",
        options: ["didn't play tennis", "played tennis", "didn't play football"],
        answer: "didn't play tennis",
      },
    ],
    speak: [
      {
        sentence: "Last weekend I went to my grandmother's house.",
        vi: "Cuối tuần trước tớ về nhà bà.",
      },
      { sentence: "We had a picnic and swam in the sea.", vi: "Chúng tớ dã ngoại và bơi ở biển." },
      { sentence: "I didn't watch television yesterday.", vi: "Hôm qua tớ đã không xem tivi." },
    ],
    write: [
      { hint: "Quá khứ của 'go'", emoji: "🚶", answer: "went" },
      { hint: "Quá khứ của 'swim'", emoji: "🏊", answer: "swam" },
      { hint: "Buổi ăn ngoài trời", emoji: "🧺", answer: "picnic" },
    ],
  },
  {
    slug: "telling-a-story",
    level: "flyers",
    order: 10,
    title: "Telling a Story",
    titleVi: "Kể một câu chuyện",
    emoji: "📖",
    summary: "Công thức 5 câu để viết truyện từ 3 bức tranh — phần khó nhất của Flyers.",
    source: "Fun for Flyers (Writing a story) · Cambridge YLE Flyers wordlist (Feelings)",
    video: { youtubeId: "B8SX7AABWmI", title: "How To Write a Story For Kids" },
    vocab: [
      { word: "suddenly", ipa: "/ˈsʌdnli/", vi: "đột nhiên", emoji: "⚡" },
      { word: "because", ipa: "/bɪˈkɒz/", vi: "bởi vì, vì", emoji: "🔗" },
      { word: "excited", ipa: "/ɪkˈsaɪtɪd/", vi: "phấn khích", emoji: "🤩" },
      { word: "worried", ipa: "/ˈwʌrid/", vi: "lo lắng", emoji: "😟" },
      { word: "finally", ipa: "/ˈfaɪnəli/", vi: "cuối cùng", emoji: "🏁" },
      { word: "adventure", ipa: "/ədˈventʃə/", vi: "cuộc phiêu lưu", emoji: "🗺️" },
      { word: "have found", ipa: "/hæv faʊnd/", vi: "đã tìm thấy", emoji: "🔎" },
      { word: "will help", ipa: "/wɪl help/", vi: "sẽ giúp", emoji: "🤝" },
    ],
    grammar: {
      title: "Hiện tại hoàn thành & tương lai `will`",
      formula: "S + have/has + V3  ·  S + will + V nguyên thể",
      note: "Hiện tại hoàn thành dùng cho việc vừa xảy ra và còn liên quan tới hiện tại: I have lost my key (giờ vẫn chưa tìm thấy).",
      examples: [
        { en: "I have found my lost cat!", vi: "Tớ đã tìm thấy chú mèo bị lạc!" },
        { en: "She has never been to London.", vi: "Chị ấy chưa bao giờ đến London." },
        { en: "If it rains, we will stay at home.", vi: "Nếu trời mưa, chúng tớ sẽ ở nhà." },
      ],
    },
    reading: {
      title: "The lost kitten — công thức 5 câu",
      chunks: [
        [
          { text: "One rainy morning", role: "adverb" },
          { text: "Lan", role: "subject" },
          { text: "was walking", role: "verb" },
          { text: "to school", role: "adverb" },
        ],
        [
          { text: "Suddenly", role: "adverb" },
          { text: "she", role: "subject" },
          { text: "heard", role: "verb" },
          { text: "a small noise", role: "object" },
        ],
        [
          { text: "She", role: "subject" },
          { text: "has found", role: "verb" },
          { text: "a wet kitten", role: "object" },
          { text: "under a car", role: "adverb" },
        ],
        [
          { text: "Lan", role: "subject" },
          { text: "was", role: "verb" },
          { text: "worried", role: "object" },
          { text: "because it was cold", role: "adverb" },
        ],
        [
          { text: "Finally", role: "adverb" },
          { text: "she", role: "subject" },
          { text: "will keep", role: "verb" },
          { text: "the kitten", role: "object" },
          { text: "at home", role: "adverb" },
        ],
      ],
      viTranslation:
        "Một buổi sáng mưa, Lan đang đi bộ tới trường. Đột nhiên cô bé nghe một tiếng động nhỏ. Cô bé đã tìm thấy một chú mèo con ướt sũng dưới gầm xe. Lan lo lắng vì trời rất lạnh. Cuối cùng, cô bé sẽ giữ chú mèo ở nhà.",
    },
    listen: [
      {
        prompt: "Nghe và chọn cảm xúc",
        say: "Lan was worried because the kitten was cold.",
        options: ["worried", "excited", "angry"],
        answer: "worried",
      },
      {
        prompt: "Nghe và chọn trạng từ",
        say: "Suddenly she heard a small noise.",
        options: ["suddenly", "finally", "slowly"],
        answer: "suddenly",
      },
      {
        prompt: "Nghe và chọn câu đúng",
        say: "She has found a wet kitten under a car.",
        options: ["has found a kitten", "has lost a kitten", "will find a kitten"],
        answer: "has found a kitten",
      },
    ],
    speak: [
      {
        sentence: "One rainy morning a girl was walking to school.",
        vi: "Một buổi sáng mưa, một cô bé đang đi bộ tới trường.",
      },
      {
        sentence: "Suddenly she found a small kitten under a car.",
        vi: "Đột nhiên cô bé thấy một chú mèo con dưới gầm xe.",
      },
      {
        sentence: "Finally she took it home and felt very happy.",
        vi: "Cuối cùng cô bé mang nó về nhà và thấy rất vui.",
      },
    ],
    write: [
      { hint: "Trạng từ mở đầu sự kiện bất ngờ", emoji: "⚡", answer: "suddenly" },
      { hint: "Trạng từ kết thúc câu chuyện", emoji: "🏁", answer: "finally" },
      { hint: "Cảm xúc khi lo lắng", emoji: "😟", answer: "worried" },
    ],
  },
  {
    slug: "food-and-drink",
    level: "starters",
    order: 4,
    title: "Food & Drink",
    titleVi: "Đồ ăn và thức uống",
    emoji: "🍎",
    summary: "Nói về món bé thích và không thích — chủ đề Food xuất hiện ở mọi đề Starters.",
    source: "Family and Friends 1 – Unit 7 · Cambridge YLE Starters wordlist (Food and drink)",
    video: {
      youtubeId: "frN3nvhIHUk",
      title: "Do You Like Broccoli Ice Cream? — Super Simple Songs",
    },
    extraVideos: [
      { youtubeId: "zXEq-QO3xTg", title: "The Animals On The Farm", channel: "Super Simple Songs" },
    ],
    vocab: [
      { word: "bread", ipa: "/bred/", vi: "bánh mì", emoji: "🍞" },
      { word: "milk", ipa: "/mɪlk/", vi: "sữa", emoji: "🥛" },
      { word: "rice", ipa: "/raɪs/", vi: "cơm", emoji: "🍚" },
      { word: "chicken", ipa: "/ˈtʃɪkɪn/", vi: "thịt gà", emoji: "🍗" },
      { word: "banana", ipa: "/bəˈnɑːnə/", vi: "quả chuối", emoji: "🍌" },
      { word: "water", ipa: "/ˈwɔːtə/", vi: "nước", emoji: "💧" },
      { word: "ice cream", ipa: "/ˈaɪs kriːm/", vi: "kem", emoji: "🍦" },
      { word: "vegetables", ipa: "/ˈvedʒtəblz/", vi: "rau củ", emoji: "🥦" },
    ],
    grammar: {
      title: "I like / I don't like — Do you like…?",
      formula: "S + like/don't like + N  ·  Do you like + N? — Yes, I do. / No, I don't.",
      note: "Với he/she dùng likes và doesn't like: She likes milk. He doesn't like rice.",
      examples: [
        { en: "I like bananas.", vi: "Tớ thích chuối." },
        { en: "I don't like vegetables.", vi: "Tớ không thích rau." },
        { en: "Do you like ice cream? Yes, I do.", vi: "Bạn thích kem không? Có." },
      ],
    },
    reading: {
      title: "My lunch box",
      chunks: [
        [
          { text: "I", role: "subject" },
          { text: "eat", role: "verb" },
          { text: "rice and chicken", role: "object" },
          { text: "at lunchtime", role: "adverb" },
        ],
        [
          { text: "My sister", role: "subject" },
          { text: "drinks", role: "verb" },
          { text: "milk", role: "object" },
          { text: "every morning", role: "adverb" },
        ],
        [
          { text: "We", role: "subject" },
          { text: "don't like", role: "verb" },
          { text: "green vegetables", role: "object" },
        ],
        [
          { text: "Mum", role: "subject" },
          { text: "makes", role: "verb" },
          { text: "banana ice cream", role: "object" },
          { text: "on Sunday", role: "adverb" },
        ],
      ],
      viTranslation:
        "Tớ ăn cơm với thịt gà vào buổi trưa. Em gái tớ uống sữa mỗi sáng. Chúng tớ không thích rau xanh. Mẹ làm kem chuối vào Chủ nhật.",
    },
    listen: [
      {
        prompt: "Nghe và chọn món ăn",
        say: "I eat rice and chicken.",
        options: ["rice", "bread", "milk"],
        answer: "rice",
      },
      {
        prompt: "Nghe và chọn đồ uống",
        say: "She drinks milk every morning.",
        options: ["milk", "water", "juice"],
        answer: "milk",
      },
      {
        prompt: "Nghe và chọn câu đúng",
        say: "I don't like vegetables.",
        options: ["don't like vegetables", "like vegetables", "like bananas"],
        answer: "don't like vegetables",
      },
    ],
    speak: [
      { sentence: "I like bananas and ice cream.", vi: "Tớ thích chuối và kem." },
      { sentence: "I don't like vegetables.", vi: "Tớ không thích rau." },
      { sentence: "Do you like milk? Yes, I do.", vi: "Bạn thích sữa không? Có." },
    ],
    write: [
      { hint: "Thức uống màu trắng", emoji: "🥛", answer: "milk" },
      { hint: "Món tráng miệng lạnh", emoji: "🍦", answer: "ice cream" },
      { hint: "Quả màu vàng dài", emoji: "🍌", answer: "banana" },
    ],
  },
  {
    slug: "my-body",
    level: "starters",
    order: 5,
    title: "My Body",
    titleVi: "Cơ thể của tớ",
    emoji: "🧍",
    summary: "Tên các bộ phận cơ thể và cách nói khi bị đau — dùng nhiều trong Speaking Part 2.",
    source: "Family and Friends 1 – Unit 5 · Kid's Box 1 – Unit 6 (My body)",
    video: { youtubeId: "SUt8q0EKbms", title: "My Body Parts — English Singsing" },
    extraVideos: [
      {
        youtubeId: "ZanHgPprl-0",
        title: "Head Shoulders Knees & Toes",
        channel: "Super Simple Songs",
      },
    ],
    vocab: [
      { word: "head", ipa: "/hed/", vi: "cái đầu", emoji: "🧠" },
      { word: "hand", ipa: "/hænd/", vi: "bàn tay", emoji: "✋" },
      { word: "foot", ipa: "/fʊt/", vi: "bàn chân", emoji: "🦶" },
      { word: "eye", ipa: "/aɪ/", vi: "mắt", emoji: "👁️" },
      { word: "ear", ipa: "/ɪə/", vi: "tai", emoji: "👂" },
      { word: "nose", ipa: "/nəʊz/", vi: "mũi", emoji: "👃" },
      { word: "hair", ipa: "/heə/", vi: "tóc", emoji: "💇" },
      { word: "tooth", ipa: "/tuːθ/", vi: "cái răng", emoji: "🦷" },
      { word: "feet", ipa: "/fiːt/", vi: "hai bàn chân (số nhiều của foot)", emoji: "👣" },
      { word: "teeth", ipa: "/tiːθ/", vi: "những cái răng (số nhiều của tooth)", emoji: "😁" },
    ],
    grammar: {
      title: "Số nhiều bất quy tắc & have got",
      formula: "foot → feet · tooth → teeth · I have got two + N số nhiều",
      note: "Đừng viết foots hay tooths — đây là lỗi chính tả bị trừ điểm ở phần Reading & Writing.",
      examples: [
        { en: "I have got two feet.", vi: "Tớ có hai bàn chân." },
        { en: "She has got long hair.", vi: "Chị ấy có mái tóc dài." },
        { en: "My tooth hurts.", vi: "Răng tớ bị đau." },
      ],
    },
    reading: {
      title: "Look at me!",
      chunks: [
        [
          { text: "I", role: "subject" },
          { text: "have got", role: "verb" },
          { text: "two big eyes", role: "object" },
        ],
        [
          { text: "My hair", role: "subject" },
          { text: "is", role: "verb" },
          { text: "short and black", role: "object" },
        ],
        [
          { text: "I", role: "subject" },
          { text: "wash", role: "verb" },
          { text: "my hands", role: "object" },
          { text: "before dinner", role: "adverb" },
        ],
        [
          { text: "Today", role: "adverb" },
          { text: "my tooth", role: "subject" },
          { text: "hurts", role: "verb" },
        ],
      ],
      viTranslation:
        "Tớ có hai con mắt to. Tóc tớ ngắn và đen. Tớ rửa tay trước bữa tối. Hôm nay răng tớ bị đau.",
    },
    listen: [
      {
        prompt: "Nghe và chọn bộ phận",
        say: "I have got two big eyes.",
        options: ["eyes", "ears", "hands"],
        answer: "eyes",
      },
      {
        prompt: "Nghe và chọn số nhiều đúng",
        say: "I have got two feet.",
        options: ["feet", "foots", "foot"],
        answer: "feet",
      },
      {
        prompt: "Nghe và chọn câu đúng",
        say: "My hair is short and black.",
        options: ["short and black", "long and black", "short and brown"],
        answer: "short and black",
      },
    ],
    speak: [
      { sentence: "I have got two hands and two feet.", vi: "Tớ có hai bàn tay và hai bàn chân." },
      { sentence: "My hair is short and black.", vi: "Tóc tớ ngắn và đen." },
      { sentence: "I wash my hands before dinner.", vi: "Tớ rửa tay trước bữa tối." },
    ],
    write: [
      { hint: "Số nhiều của foot", emoji: "🦶", answer: "feet" },
      { hint: "Số nhiều của tooth", emoji: "🦷", answer: "teeth" },
      { hint: "Bộ phận để nghe", emoji: "👂", answer: "ear" },
    ],
  },
  {
    slug: "clothes-and-weather",
    level: "movers",
    order: 8,
    title: "Clothes & Weather",
    titleVi: "Quần áo và thời tiết",
    emoji: "🌦️",
    summary: "Mô tả thời tiết và chọn trang phục — dạng bài mô tả tranh quen thuộc của Movers.",
    source: "Family and Friends 2 – Unit 9 · Cambridge YLE Movers wordlist (Clothes, Weather)",
    video: { youtubeId: "rD6FRDd9Hew", title: "How's The Weather? — Super Simple Songs" },
    extraVideos: [
      { youtubeId: "Q_EwuVHDb5U", title: "Clothes — Kids Vocab", channel: "English Singsing" },
      { youtubeId: "I8GeA3anPdo", title: "How's the Weather Song", channel: "Maple Leaf Learning" },
    ],
    vocab: [
      { word: "sunny", ipa: "/ˈsʌni/", vi: "nắng", emoji: "☀️" },
      { word: "rainy", ipa: "/ˈreɪni/", vi: "mưa", emoji: "🌧️" },
      { word: "windy", ipa: "/ˈwɪndi/", vi: "có gió", emoji: "🌬️" },
      { word: "cloudy", ipa: "/ˈklaʊdi/", vi: "nhiều mây", emoji: "☁️" },
      { word: "jacket", ipa: "/ˈdʒækɪt/", vi: "áo khoác", emoji: "🧥" },
      { word: "boots", ipa: "/buːts/", vi: "ủng", emoji: "🥾" },
      { word: "shorts", ipa: "/ʃɔːts/", vi: "quần đùi", emoji: "🩳" },
      { word: "hat", ipa: "/hæt/", vi: "cái mũ", emoji: "🧢" },
    ],
    grammar: {
      title: "Hiện tại tiếp diễn & mệnh đề with when",
      formula: "S + am/is/are + V-ing  ·  When it is + thời tiết, S + wear(s) + N",
      note: "Hiện tại tiếp diễn tả việc đang xảy ra ngay lúc nói: It is raining now.",
      examples: [
        { en: "It is raining now.", vi: "Trời đang mưa." },
        { en: "She is wearing a red jacket.", vi: "Chị ấy đang mặc áo khoác đỏ." },
        { en: "When it is sunny, I wear shorts.", vi: "Khi trời nắng, tớ mặc quần đùi." },
      ],
    },
    reading: {
      title: "A rainy Monday",
      chunks: [
        [
          { text: "Today", role: "adverb" },
          { text: "it", role: "subject" },
          { text: "is raining", role: "verb" },
          { text: "in my town", role: "adverb" },
        ],
        [
          { text: "I", role: "subject" },
          { text: "am wearing", role: "verb" },
          { text: "a blue jacket and black boots", role: "object" },
        ],
        [
          { text: "My brother", role: "subject" },
          { text: "is playing", role: "verb" },
          { text: "a game", role: "object" },
          { text: "inside the house", role: "adverb" },
        ],
        [
          { text: "When it is sunny", role: "adverb" },
          { text: "we", role: "subject" },
          { text: "ride", role: "verb" },
          { text: "our bikes", role: "object" },
        ],
      ],
      viTranslation:
        "Hôm nay trời đang mưa ở thị trấn của tớ. Tớ đang mặc áo khoác xanh và đi ủng đen. Anh trai tớ đang chơi game trong nhà. Khi trời nắng, chúng tớ đạp xe.",
    },
    listen: [
      {
        prompt: "Nghe và chọn thời tiết",
        say: "Today it is raining in my town.",
        options: ["raining", "snowing", "sunny"],
        answer: "raining",
      },
      {
        prompt: "Nghe và chọn trang phục",
        say: "I am wearing a blue jacket.",
        options: ["jacket", "hat", "shorts"],
        answer: "jacket",
      },
      {
        prompt: "Nghe và chọn câu đúng",
        say: "When it is sunny we ride our bikes.",
        options: ["ride our bikes", "read our books", "ride the bus"],
        answer: "ride our bikes",
      },
    ],
    speak: [
      { sentence: "It is windy today.", vi: "Hôm nay trời có gió." },
      { sentence: "I am wearing a jacket and boots.", vi: "Tớ đang mặc áo khoác và đi ủng." },
      {
        sentence: "When it is sunny, I wear shorts and a hat.",
        vi: "Khi trời nắng, tớ mặc quần đùi và đội mũ.",
      },
    ],
    write: [
      { hint: "Thời tiết khi có mặt trời", emoji: "☀️", answer: "sunny" },
      { hint: "Giày cao đi khi trời mưa", emoji: "🥾", answer: "boots" },
      { hint: "Thời tiết nhiều mây", emoji: "☁️", answer: "cloudy" },
    ],
  },
  {
    slug: "school-timetable",
    level: "movers",
    order: 9,
    title: "School & Timetable",
    titleVi: "Trường học và thời khoá biểu",
    emoji: "🏫",
    summary: "Thứ trong tuần, môn học và giờ giấc — nền cho phần nghe điền thời gian biểu.",
    source: "Kid's Box 3 – Unit 2 · Cambridge YLE Movers wordlist (School, Days of the week)",
    video: { youtubeId: "mXMofxtDPUQ", title: "Days of the Week Song — The Singing Walrus" },
    extraVideos: [
      {
        youtubeId: "P-uwIskha3M",
        title: "Theme — School (Subjects, Supplies & More)",
        channel: "English Singsing",
      },
      {
        youtubeId: "JoDm0RC5gk8",
        title: "School Subjects Song — What Do You Study at School?",
        channel: "Fun Kids English",
      },
    ],
    vocab: [
      { word: "Monday", ipa: "/ˈmʌndeɪ/", vi: "thứ Hai", emoji: "📅" },
      { word: "Friday", ipa: "/ˈfraɪdeɪ/", vi: "thứ Sáu", emoji: "🗓️" },
      { word: "maths", ipa: "/mæθs/", vi: "môn toán", emoji: "➗" },
      { word: "science", ipa: "/ˈsaɪəns/", vi: "môn khoa học", emoji: "🔬" },
      { word: "art", ipa: "/ɑːt/", vi: "môn mĩ thuật", emoji: "🎨" },
      { word: "playground", ipa: "/ˈpleɪɡraʊnd/", vi: "sân chơi", emoji: "🛝" },
      { word: "timetable", ipa: "/ˈtaɪmteɪbl/", vi: "thời khoá biểu", emoji: "📋" },
      { word: "break", ipa: "/breɪk/", vi: "giờ ra chơi", emoji: "⏰" },
    ],
    grammar: {
      title: "Giới từ thời gian on / at / in",
      formula: "on + thứ · at + giờ · in + buổi (the morning/afternoon)",
      note: "Ngoại lệ: at night, không nói in the night khi tả thói quen.",
      examples: [
        { en: "We have maths on Monday.", vi: "Chúng tớ học toán vào thứ Hai." },
        { en: "School starts at eight o'clock.", vi: "Trường bắt đầu lúc 8 giờ." },
        { en: "I play football in the afternoon.", vi: "Tớ chơi bóng đá vào buổi chiều." },
      ],
    },
    reading: {
      title: "My school week",
      chunks: [
        [
          { text: "My school", role: "subject" },
          { text: "starts", role: "verb" },
          { text: "at eight o'clock", role: "adverb" },
        ],
        [
          { text: "We", role: "subject" },
          { text: "have", role: "verb" },
          { text: "maths and science", role: "object" },
          { text: "on Monday", role: "adverb" },
        ],
        [
          { text: "I", role: "subject" },
          { text: "play", role: "verb" },
          { text: "with my friends", role: "object" },
          { text: "in the playground", role: "adverb" },
        ],
        [
          { text: "On Friday", role: "adverb" },
          { text: "our class", role: "subject" },
          { text: "paints", role: "verb" },
          { text: "big pictures", role: "object" },
        ],
      ],
      viTranslation:
        "Trường tớ bắt đầu lúc 8 giờ. Chúng tớ học toán và khoa học vào thứ Hai. Tớ chơi với các bạn ở sân chơi. Vào thứ Sáu, lớp tớ vẽ những bức tranh lớn.",
    },
    listen: [
      {
        prompt: "Nghe và chọn thứ",
        say: "We have maths on Monday.",
        options: ["Monday", "Sunday", "Friday"],
        answer: "Monday",
      },
      {
        prompt: "Nghe và chọn giờ",
        say: "My school starts at eight o'clock.",
        options: ["eight", "nine", "seven"],
        answer: "eight",
      },
      {
        prompt: "Nghe và chọn nơi chốn",
        say: "I play with my friends in the playground.",
        options: ["playground", "classroom", "library"],
        answer: "playground",
      },
    ],
    speak: [
      { sentence: "We have science on Wednesday.", vi: "Chúng tớ học khoa học vào thứ Tư." },
      { sentence: "School starts at eight o'clock.", vi: "Trường bắt đầu lúc 8 giờ." },
      { sentence: "My favourite subject is art.", vi: "Môn tớ thích nhất là mĩ thuật." },
    ],
    write: [
      { hint: "Ngày đầu tuần đi học", emoji: "📅", answer: "Monday" },
      { hint: "Môn học có số và phép tính", emoji: "➗", answer: "maths" },
      { hint: "Nơi bé chơi giờ ra chơi", emoji: "🛝", answer: "playground" },
    ],
  },
  {
    slug: "jobs-and-my-town",
    level: "flyers",
    order: 11,
    title: "Jobs & My Town",
    titleVi: "Nghề nghiệp và thị trấn của tớ",
    emoji: "🏙️",
    summary: "Nghề nghiệp, địa điểm trong thành phố và cách chỉ đường — chủ đề trọng tâm Flyers.",
    source: "Family and Friends 4 – Unit 3 · Cambridge YLE Flyers wordlist (Work, Places)",
    video: { youtubeId: "R69YKFmlcnA", title: "Jobs — Kids Vocab (English Singsing)" },
    extraVideos: [
      { youtubeId: "EfD2k9beP-4", title: "Around My Town", channel: "English Singsing" },
      { youtubeId: "x39KwsXxl_0", title: "Theme — City (Town, Jobs)", channel: "English Singsing" },
    ],
    vocab: [
      { word: "engineer", ipa: "/ˌendʒɪˈnɪə/", vi: "kĩ sư", emoji: "👷" },
      { word: "dentist", ipa: "/ˈdentɪst/", vi: "nha sĩ", emoji: "🦷" },
      { word: "journalist", ipa: "/ˈdʒɜːnəlɪst/", vi: "nhà báo", emoji: "📰" },
      { word: "library", ipa: "/ˈlaɪbrəri/", vi: "thư viện", emoji: "📚" },
      { word: "hospital", ipa: "/ˈhɒspɪtl/", vi: "bệnh viện", emoji: "🏥" },
      { word: "market", ipa: "/ˈmɑːkɪt/", vi: "chợ", emoji: "🛒" },
      { word: "opposite", ipa: "/ˈɒpəzɪt/", vi: "đối diện", emoji: "↔️" },
      { word: "between", ipa: "/bɪˈtwiːn/", vi: "ở giữa", emoji: "🔀" },
    ],
    grammar: {
      title: "Mệnh đề quan hệ với who / where",
      formula: "N (người) + who + V …  ·  N (nơi chốn) + where + S + V …",
      note: "who thay cho người, where thay cho nơi chốn — dạng câu định nghĩa rất hay gặp ở Flyers Reading Part 1.",
      examples: [
        {
          en: "A dentist is a person who looks after your teeth.",
          vi: "Nha sĩ là người chăm sóc răng cho bạn.",
        },
        {
          en: "A library is a place where you borrow books.",
          vi: "Thư viện là nơi bạn mượn sách.",
        },
        { en: "The market is opposite the hospital.", vi: "Chợ nằm đối diện bệnh viện." },
      ],
    },
    reading: {
      title: "People in my town",
      chunks: [
        [
          { text: "My aunt", role: "subject" },
          { text: "is", role: "verb" },
          { text: "a dentist", role: "object" },
          { text: "in a small hospital", role: "adverb" },
        ],
        [
          { text: "She", role: "subject" },
          { text: "helps", role: "verb" },
          { text: "children who have got toothache", role: "object" },
        ],
        [
          { text: "The library", role: "subject" },
          { text: "is", role: "verb" },
          { text: "between the market and the park", role: "adverb" },
        ],
        [
          { text: "Every Saturday", role: "adverb" },
          { text: "I", role: "subject" },
          { text: "borrow", role: "verb" },
          { text: "two story books", role: "object" },
        ],
      ],
      viTranslation:
        "Dì tớ là nha sĩ ở một bệnh viện nhỏ. Dì giúp các bạn nhỏ bị đau răng. Thư viện nằm giữa chợ và công viên. Mỗi thứ Bảy tớ mượn hai quyển truyện.",
    },
    listen: [
      {
        prompt: "Nghe và chọn nghề",
        say: "My aunt is a dentist.",
        options: ["dentist", "engineer", "journalist"],
        answer: "dentist",
      },
      {
        prompt: "Nghe và chọn vị trí",
        say: "The library is between the market and the park.",
        options: ["between", "opposite", "behind"],
        answer: "between",
      },
      {
        prompt: "Nghe và chọn câu đúng",
        say: "Every Saturday I borrow two story books.",
        options: ["borrow two books", "buy two books", "read ten books"],
        answer: "borrow two books",
      },
    ],
    speak: [
      {
        sentence: "A dentist is a person who looks after your teeth.",
        vi: "Nha sĩ là người chăm sóc răng cho bạn.",
      },
      {
        sentence: "A library is a place where you borrow books.",
        vi: "Thư viện là nơi bạn mượn sách.",
      },
      { sentence: "The market is opposite the hospital.", vi: "Chợ đối diện bệnh viện." },
    ],
    write: [
      { hint: "Người chữa răng", emoji: "🦷", answer: "dentist" },
      { hint: "Nơi mượn sách", emoji: "📚", answer: "library" },
      { hint: "Từ chỉ vị trí ở giữa hai nơi", emoji: "🔀", answer: "between" },
    ],
  },
  {
    slug: "comparing-things",
    level: "flyers",
    order: 12,
    title: "Comparing Things",
    titleVi: "So sánh sự vật",
    emoji: "📏",
    summary: "So sánh hơn và so sánh nhất — bắt buộc cho phần mô tả tranh và viết đoạn Flyers.",
    source: "Kid's Box 5 – Unit 4 · Fun for Flyers – Comparatives & superlatives",
    video: {
      youtubeId: "XTMT9BQU7j0",
      title: "The Superlatives Song — Biggest, Smallest, Fastest",
    },
    extraVideos: [
      {
        youtubeId: "jfSlzpe4hZU",
        title: "Song of the Comparative and Superlative Adjectives",
        channel: "English with Us",
      },
    ],
    vocab: [
      { word: "taller", ipa: "/ˈtɔːlə/", vi: "cao hơn", emoji: "📏" },
      { word: "heavier", ipa: "/ˈhevɪə/", vi: "nặng hơn", emoji: "⚖️" },
      { word: "the fastest", ipa: "/ðə ˈfɑːstɪst/", vi: "nhanh nhất", emoji: "🏃" },
      { word: "the most beautiful", ipa: "/ðə məʊst ˈbjuːtɪfl/", vi: "đẹp nhất", emoji: "🌸" },
      { word: "better", ipa: "/ˈbetə/", vi: "tốt hơn", emoji: "👍" },
      { word: "worse", ipa: "/wɜːs/", vi: "tệ hơn", emoji: "👎" },
      { word: "expensive", ipa: "/ɪkˈspensɪv/", vi: "đắt", emoji: "💰" },
      { word: "quiet", ipa: "/ˈkwaɪət/", vi: "yên tĩnh", emoji: "🤫" },
    ],
    grammar: {
      title: "So sánh hơn & so sánh nhất",
      formula: "tính từ ngắn + -er … than · the + tính từ ngắn + -est  |  more/most + tính từ dài",
      note: "Bất quy tắc: good → better → the best; bad → worse → the worst. Tính từ tận cùng -y đổi thành -ier (heavy → heavier).",
      examples: [
        { en: "My brother is taller than me.", vi: "Anh tớ cao hơn tớ." },
        {
          en: "This book is more interesting than that one.",
          vi: "Quyển sách này thú vị hơn quyển kia.",
        },
        { en: "Nam is the fastest runner in my class.", vi: "Nam là bạn chạy nhanh nhất lớp tớ." },
      ],
    },
    reading: {
      title: "The three houses",
      chunks: [
        [
          { text: "My house", role: "subject" },
          { text: "is", role: "verb" },
          { text: "smaller than Nam's house", role: "object" },
        ],
        [
          { text: "Nam's house", role: "subject" },
          { text: "is", role: "verb" },
          { text: "the biggest", role: "object" },
          { text: "in our street", role: "adverb" },
        ],
        [
          { text: "But my garden", role: "subject" },
          { text: "is", role: "verb" },
          { text: "more beautiful", role: "object" },
          { text: "in spring", role: "adverb" },
        ],
        [
          { text: "I", role: "subject" },
          { text: "think", role: "verb" },
          { text: "a quiet house is better than a big house", role: "object" },
        ],
      ],
      viTranslation:
        "Nhà tớ nhỏ hơn nhà Nam. Nhà Nam là nhà to nhất trên phố. Nhưng khu vườn của tớ đẹp hơn vào mùa xuân. Tớ nghĩ một ngôi nhà yên tĩnh thì tốt hơn một ngôi nhà to.",
    },
    listen: [
      {
        prompt: "Nghe và chọn so sánh đúng",
        say: "My house is smaller than Nam's house.",
        options: ["smaller", "bigger", "older"],
        answer: "smaller",
      },
      {
        prompt: "Nghe và chọn so sánh nhất",
        say: "Nam's house is the biggest in our street.",
        options: ["the biggest", "the smallest", "the newest"],
        answer: "the biggest",
      },
      {
        prompt: "Nghe và chọn câu đúng",
        say: "A quiet house is better than a big house.",
        options: ["better than a big house", "worse than a big house", "as big as a house"],
        answer: "better than a big house",
      },
    ],
    speak: [
      { sentence: "My brother is taller than me.", vi: "Anh tớ cao hơn tớ." },
      {
        sentence: "This book is more interesting than that one.",
        vi: "Quyển sách này thú vị hơn quyển kia.",
      },
      {
        sentence: "Nam is the fastest runner in my class.",
        vi: "Nam là bạn chạy nhanh nhất lớp tớ.",
      },
    ],
    write: [
      { hint: "So sánh hơn của tall", emoji: "📏", answer: "taller" },
      { hint: "So sánh hơn của good", emoji: "👍", answer: "better" },
      { hint: "So sánh nhất của fast (có 'the')", emoji: "🏃", answer: "the fastest" },
    ],
  },
];
