import type { Lesson } from "../curriculum";

/** Bài bổ sung Movers (v2): Health · Places in town · The world around us · Hobbies. */
export const moversLessons2: Lesson[] = [
  {
    slug: "at-the-doctors",
    level: "movers",
    order: 10,
    title: "At the Doctor's",
    titleVi: "Đi khám bác sĩ",
    emoji: "🩺",
    summary:
      "Nói mình bị ốm gì với 'What's the matter? I've got…' và dùng must / mustn't để nói điều phải làm.",
    source: "Cambridge YLE Movers wordlist (Health) · Kid's Box 3 – Unit 5 (Get well soon)",
    video: {
      youtubeId: "5xZYFPJ0fps",
      title: "English Singsing — Health Problems: What's the matter?",
    },
    extraVideos: [
      {
        youtubeId: "QyF8HEOybqQ",
        title: "I Have a Bad Cold — Simple Songs for Kids",
        channel: "Maple Leaf Learning",
      },
      {
        youtubeId: "1qQHJBC3D7o",
        title: "What's wrong? I have a toothache — Easy Dialogue",
        channel: "English Singsing",
      },
    ],
    vocab: [
      { word: "headache", ipa: "/ˈhedeɪk/", vi: "đau đầu", emoji: "🤕" },
      { word: "stomach-ache", ipa: "/ˈstʌmək eɪk/", vi: "đau bụng", emoji: "🤢" },
      { word: "toothache", ipa: "/ˈtuːθeɪk/", vi: "đau răng", emoji: "🦷" },
      { word: "earache", ipa: "/ˈɪəreɪk/", vi: "đau tai", emoji: "👂" },
      { word: "cold", ipa: "/kəʊld/", vi: "cảm lạnh", emoji: "🤧" },
      { word: "cough", ipa: "/kɒf/", vi: "ho", emoji: "😮‍💨" },
      { word: "temperature", ipa: "/ˈtemprətʃə/", vi: "sốt, nhiệt độ", emoji: "🌡️" },
      { word: "ill", ipa: "/ɪl/", vi: "ốm, bị bệnh", emoji: "🤒" },
      { word: "hurt", ipa: "/hɜːt/", vi: "đau, bị thương", emoji: "🩹" },
      { word: "doctor", ipa: "/ˈdɒktə/", vi: "bác sĩ", emoji: "👨‍⚕️" },
    ],
    grammar: {
      title: "Hỏi thăm sức khoẻ · must / mustn't",
      formula:
        "What's the matter? — I've got a + headache / cold / cough… · You must / mustn't + V (nguyên thể)",
      note: "Sau must / mustn't KHÔNG có 'to': You must rest (không nói must to rest). 'Mustn't' nghĩa là 'không được', không phải 'không cần'. Nhớ có 'a': I've got a cold.",
      examples: [
        {
          en: "What's the matter? — I've got a headache.",
          vi: "Có chuyện gì thế? — Tớ bị đau đầu.",
        },
        {
          en: "You must stay in bed and drink lots of water.",
          vi: "Bé phải nằm nghỉ trên giường và uống nhiều nước.",
        },
        {
          en: "You mustn't eat sweets when you've got toothache.",
          vi: "Bé không được ăn kẹo khi đang đau răng.",
        },
      ],
    },
    reading: {
      title: "Jim is ill",
      chunks: [
        [
          { text: "Today", role: "adverb" },
          { text: "Jim", role: "subject" },
          { text: "feels", role: "verb" },
          { text: "very ill", role: "object" },
        ],
        [
          { text: "He", role: "subject" },
          { text: "has got", role: "verb" },
          { text: "a headache and a bad cough", role: "object" },
        ],
        [
          { text: "His mum", role: "subject" },
          { text: "takes", role: "verb" },
          { text: "him", role: "object" },
          { text: "to the doctor", role: "adverb" },
        ],
        [
          { text: "The doctor", role: "subject" },
          { text: "says", role: "verb" },
          { text: '"You must stay in bed and drink lots of water."', role: "object" },
        ],
        [
          { text: "Jim", role: "subject" },
          { text: "mustn't go", role: "verb" },
          { text: "to school", role: "adverb" },
          { text: "tomorrow", role: "adverb" },
        ],
      ],
      viTranslation:
        'Hôm nay Jim thấy rất mệt. Cậu ấy bị đau đầu và ho nhiều. Mẹ đưa cậu ấy đến bác sĩ. Bác sĩ nói: "Cháu phải nằm nghỉ trên giường và uống thật nhiều nước." Ngày mai Jim không được đi học.',
    },
    listen: [
      {
        prompt: "Nghe và chọn bệnh bạn ấy đang bị",
        say: "What's the matter? I've got a headache.",
        options: ["headache", "toothache", "earache"],
        answer: "headache",
      },
      {
        prompt: "Nghe và chọn từ bác sĩ dùng",
        say: "You must drink lots of water.",
        options: ["must", "mustn't", "can't"],
        answer: "must",
      },
      {
        prompt: "Nghe và chọn bệnh của Peter",
        say: "Peter has got a stomach-ache today.",
        options: ["stomach-ache", "headache", "toothache"],
        answer: "stomach-ache",
      },
      {
        prompt: "Nghe và chọn từ đúng",
        say: "You mustn't eat ice cream when you're ill.",
        options: ["mustn't", "must", "can"],
        answer: "mustn't",
      },
    ],
    speak: [
      { sentence: "I've got a headache and a cold.", vi: "Tớ bị đau đầu và cảm lạnh." },
      { sentence: "I must stay in bed today.", vi: "Hôm nay tớ phải nằm nghỉ trên giường." },
      {
        sentence: "I mustn't eat too many sweets today.",
        vi: "Hôm nay tớ không được ăn quá nhiều kẹo.",
      },
      {
        sentence: "My leg hurts, so I must see the doctor.",
        vi: "Chân tớ đau nên tớ phải đi khám bác sĩ.",
      },
    ],
    write: [
      { hint: "Đầu bé bị đau nhức", emoji: "🤕", answer: "headache" },
      { hint: "Khụ khụ! Cổ họng khó chịu", emoji: "😮‍💨", answer: "cough" },
      { hint: "Người khám bệnh cho bé ở bệnh viện", emoji: "👨‍⚕️", answer: "doctor" },
      { hint: "Hắt xì! Bé bị cảm…", emoji: "🤧", answer: "cold" },
    ],
  },
  {
    slug: "places-in-town",
    level: "movers",
    order: 11,
    title: "Places in Town",
    titleVi: "Những nơi trong thị trấn",
    emoji: "🏙️",
    summary:
      "Hỏi và chỉ đường trong thị trấn, dùng opposite / near / behind và quá khứ của be: was / were.",
    source:
      "Cambridge YLE Movers wordlist (Places & directions) · Kid's Box 3 – Unit 6 (In the town)",
    video: { youtubeId: "jWY6N9QXmEY", title: "English Singsing — Where is it? Asking the way" },
    extraVideos: [
      {
        youtubeId: "AgTkKGM0TWE",
        title: "Excuse me. Where's the bank? — Education Rap for Kids",
        channel: "English Singsing",
      },
    ],
    vocab: [
      { word: "library", ipa: "/ˈlaɪbrəri/", vi: "thư viện", emoji: "📚" },
      { word: "supermarket", ipa: "/ˈsuːpəmɑːkɪt/", vi: "siêu thị", emoji: "🛒" },
      { word: "bus stop", ipa: "/ˈbʌs stɒp/", vi: "trạm xe buýt", emoji: "🚏" },
      { word: "cinema", ipa: "/ˈsɪnəmə/", vi: "rạp chiếu phim", emoji: "🎬" },
      { word: "swimming pool", ipa: "/ˈswɪmɪŋ puːl/", vi: "bể bơi", emoji: "🏊" },
      { word: "hospital", ipa: "/ˈhɒspɪtl/", vi: "bệnh viện", emoji: "🏥" },
      { word: "café", ipa: "/ˈkæfeɪ/", vi: "quán cà phê", emoji: "☕" },
      { word: "market", ipa: "/ˈmɑːkɪt/", vi: "chợ", emoji: "🧺" },
      { word: "station", ipa: "/ˈsteɪʃn/", vi: "nhà ga", emoji: "🚉" },
      { word: "opposite", ipa: "/ˈɒpəzɪt/", vi: "đối diện", emoji: "↔️" },
    ],
    grammar: {
      title: "Hỏi đường · was / were",
      formula:
        "Where's the + nơi? → Go straight / Turn left / Turn right. It's opposite / near / behind the… · I/he/she/it + was · you/we/they + were",
      note: "Nói 'turn left', không nói 'turn to left'. 'Opposite' là 'đối diện', không phải 'ngược lại'. Quá khứ của is là was, của are là were: They were (không nói They was).",
      examples: [
        {
          en: "Where's the library? — Go straight and turn left.",
          vi: "Thư viện ở đâu ạ? — Đi thẳng rồi rẽ trái.",
        },
        {
          en: "The cinema is opposite the supermarket.",
          vi: "Rạp chiếu phim ở đối diện siêu thị.",
        },
        { en: "We were at the swimming pool yesterday.", vi: "Hôm qua chúng tớ ở bể bơi." },
      ],
    },
    reading: {
      title: "Lost in town",
      chunks: [
        [
          { text: "Yesterday", role: "adverb" },
          { text: "Sally and her dad", role: "subject" },
          { text: "were", role: "verb" },
          { text: "in the town centre", role: "adverb" },
        ],
        [
          { text: "They", role: "subject" },
          { text: "wanted to go", role: "verb" },
          { text: "to the new library", role: "adverb" },
        ],
        [
          { text: "But" },
          { text: "the library", role: "subject" },
          { text: "was", role: "verb" },
          { text: "behind the hospital", role: "adverb" },
          { text: "and" },
          { text: "they", role: "subject" },
          { text: "couldn't find", role: "verb" },
          { text: "it", role: "object" },
        ],
        [
          { text: "A woman", role: "subject" },
          { text: "said", role: "verb" },
          { text: '"Go straight and turn left at the bus stop."', role: "object" },
        ],
        [
          { text: "After that", role: "adverb" },
          { text: "they", role: "subject" },
          { text: "had", role: "verb" },
          { text: "a milkshake", role: "object" },
          { text: "in the café opposite the station", role: "adverb" },
        ],
      ],
      viTranslation:
        'Hôm qua Sally và bố ở trung tâm thị trấn. Hai bố con muốn đến thư viện mới. Nhưng thư viện nằm sau bệnh viện nên họ không tìm thấy. Một cô nói: "Đi thẳng rồi rẽ trái ở trạm xe buýt." Sau đó hai bố con uống sữa lắc ở quán cà phê đối diện nhà ga.',
    },
    listen: [
      {
        prompt: "Nghe và chọn vị trí của thư viện",
        say: "Where's the library? It's opposite the supermarket.",
        options: ["opposite", "behind", "near"],
        answer: "opposite",
      },
      {
        prompt: "Nghe và chọn hướng đi",
        say: "Turn right at the bus stop.",
        options: ["turn right", "turn left", "go straight"],
        answer: "turn right",
      },
      {
        prompt: "Nghe và chọn nơi các bạn đã ở",
        say: "The children were at the swimming pool.",
        options: ["swimming pool", "sports centre", "supermarket"],
        answer: "swimming pool",
      },
      {
        prompt: "Nghe và chọn động từ đúng",
        say: "Fred was at the cinema yesterday.",
        options: ["was", "were", "is"],
        answer: "was",
      },
    ],
    speak: [
      {
        sentence: "Excuse me, where's the bus stop, please?",
        vi: "Cho tớ hỏi, trạm xe buýt ở đâu ạ?",
      },
      { sentence: "I was at the library yesterday.", vi: "Hôm qua tớ ở thư viện." },
      {
        sentence: "We were at the cinema last Saturday.",
        vi: "Thứ Bảy tuần trước chúng tớ ở rạp chiếu phim.",
      },
      { sentence: "My house is near the market.", vi: "Nhà tớ ở gần chợ." },
    ],
    write: [
      { hint: "Nơi bé mượn sách để đọc", emoji: "📚", answer: "library" },
      { hint: "Nơi mẹ đẩy xe đi mua đồ ăn", emoji: "🛒", answer: "supermarket" },
      { hint: "Nơi xem phim trên màn hình to", emoji: "🎬", answer: "cinema" },
      { hint: "Nơi bác sĩ và y tá làm việc", emoji: "🏥", answer: "hospital" },
    ],
  },
  {
    slug: "in-the-countryside",
    level: "movers",
    order: 12,
    title: "In the Countryside",
    titleVi: "Về miền quê",
    emoji: "🏞️",
    summary:
      "Từ vựng về thiên nhiên và động vật hoang dã, cùng cách so sánh hơn: bigger than, more beautiful than.",
    source:
      "Cambridge YLE Movers wordlist (The world around us, Animals) · Kid's Box 3 – Unit 7 (In the countryside)",
    video: { youtubeId: "mmjbF3A30eQ", title: "Super Simple Songs — I Love The Mountains" },
    extraVideos: [
      {
        youtubeId: "f7ph7zh7em4",
        title: "Bigger, smaller, higher, lower — Comparative adjectives song (English on Tour)",
        channel: "qoop TV · Cambridge English on Tour",
      },
      {
        youtubeId: "LF3crlV28xA",
        title: "Opposite Words — Big & Small, Tall & Short",
        channel: "English Singsing",
      },
    ],
    vocab: [
      { word: "forest", ipa: "/ˈfɒrɪst/", vi: "rừng", emoji: "🌲" },
      { word: "river", ipa: "/ˈrɪvə/", vi: "dòng sông", emoji: "🏞️" },
      { word: "field", ipa: "/fiːld/", vi: "cánh đồng", emoji: "🌾" },
      { word: "mountain", ipa: "/ˈmaʊntɪn/", vi: "núi", emoji: "⛰️" },
      { word: "lake", ipa: "/leɪk/", vi: "hồ", emoji: "🛶" },
      { word: "waterfall", ipa: "/ˈwɔːtəfɔːl/", vi: "thác nước", emoji: "💦" },
      { word: "island", ipa: "/ˈaɪlənd/", vi: "hòn đảo", emoji: "🏝️" },
      { word: "lion", ipa: "/ˈlaɪən/", vi: "sư tử", emoji: "🦁" },
      { word: "kangaroo", ipa: "/ˌkæŋɡəˈruː/", vi: "chuột túi", emoji: "🦘" },
      { word: "dolphin", ipa: "/ˈdɒlfɪn/", vi: "cá heo", emoji: "🐬" },
    ],
    grammar: {
      title: "So sánh hơn",
      formula:
        "Tính từ ngắn + -er + than: bigger / smaller / taller than · Tính từ dài: more + tính từ + than: more beautiful than",
      note: "Tính từ ngắn chỉ thêm -er, KHÔNG thêm 'more': taller (không nói more taller). Viết 'than', đừng nhầm với 'then'. Bất quy tắc: good → better, bad → worse.",
      examples: [
        { en: "The mountain is bigger than the hill.", vi: "Ngọn núi to hơn ngọn đồi." },
        { en: "A lion is more dangerous than a kangaroo.", vi: "Sư tử nguy hiểm hơn chuột túi." },
        { en: "The countryside is quieter than the city.", vi: "Miền quê yên tĩnh hơn thành phố." },
      ],
    },
    reading: {
      title: "A trip to the mountains",
      chunks: [
        [
          { text: "Last weekend", role: "adverb" },
          { text: "Zoe's family", role: "subject" },
          { text: "went", role: "verb" },
          { text: "to the countryside", role: "adverb" },
        ],
        [
          { text: "The mountains", role: "subject" },
          { text: "were", role: "verb" },
          { text: "much bigger than the hills near her town", role: "object" },
        ],
        [
          { text: "Zoe", role: "subject" },
          { text: "saw", role: "verb" },
          { text: "a waterfall and a long river", role: "object" },
          { text: "in the forest", role: "adverb" },
        ],
        [
          { text: "The lake", role: "subject" },
          { text: "was", role: "verb" },
          { text: "quieter and more beautiful than the sea", role: "object" },
        ],
        [
          { text: "Now", role: "adverb" },
          { text: "Zoe", role: "subject" },
          { text: "thinks", role: "verb" },
          { text: "the countryside is better than the city", role: "object" },
        ],
      ],
      viTranslation:
        "Cuối tuần trước, gia đình Zoe về miền quê chơi. Những ngọn núi to hơn hẳn mấy ngọn đồi gần thị trấn của bạn ấy. Zoe thấy một thác nước và một dòng sông dài trong rừng. Hồ nước yên tĩnh hơn và đẹp hơn biển. Giờ Zoe nghĩ miền quê tuyệt hơn thành phố.",
    },
    listen: [
      {
        prompt: "Nghe và chọn từ so sánh",
        say: "The mountain is bigger than the hill.",
        options: ["bigger", "smaller", "taller"],
        answer: "bigger",
      },
      {
        prompt: "Nghe: con vật nào nguy hiểm hơn?",
        say: "A lion is more dangerous than a kangaroo.",
        options: ["lion", "kangaroo", "dolphin"],
        answer: "lion",
      },
      {
        prompt: "Nghe: cái gì dài hơn?",
        say: "The river is longer than the lake.",
        options: ["river", "lake", "waterfall"],
        answer: "river",
      },
      {
        prompt: "Nghe và chọn cụm so sánh",
        say: "Dolphins are more beautiful than sharks.",
        options: ["more beautiful", "more dangerous", "more famous"],
        answer: "more beautiful",
      },
    ],
    speak: [
      {
        sentence: "I think mountains are more beautiful than fields.",
        vi: "Tớ nghĩ núi đẹp hơn cánh đồng.",
      },
      { sentence: "My brother is taller than me.", vi: "Anh tớ cao hơn tớ." },
      { sentence: "My village is quieter than the city.", vi: "Làng tớ yên tĩnh hơn thành phố." },
      { sentence: "I like dolphins more than lions.", vi: "Tớ thích cá heo hơn sư tử." },
    ],
    write: [
      { hint: "Rất cao, có đỉnh nhọn, đôi khi có tuyết", emoji: "⛰️", answer: "mountain" },
      { hint: "Nơi có thật nhiều cây cối", emoji: "🌲", answer: "forest" },
      { hint: "Chúa tể rừng xanh, có bờm", emoji: "🦁", answer: "lion" },
      { hint: "Vùng đất có biển bao quanh", emoji: "🏝️", answer: "island" },
    ],
  },
  {
    slug: "hobbies-and-free-time",
    level: "movers",
    order: 13,
    title: "Hobbies and Free Time",
    titleVi: "Sở thích và thời gian rảnh",
    emoji: "🛼",
    summary:
      "Kể về sở thích với be good at + V-ing, want to / like to + V và rủ bạn bằng How about…ing?",
    source: "Cambridge YLE Movers wordlist (Sports & leisure) · Kid's Box 3 – Unit 8 (Free time)",
    video: {
      youtubeId: "90LfcLAjLiI",
      title: "Fun Kids English — The Hobbies Song: What Do You Like to Do?",
    },
    extraVideos: [
      {
        youtubeId: "tYNap8gVNK4",
        title: "What Do You Like To Do? — Hobbies Song for Kids",
        channel: "Maple Leaf Learning",
      },
      {
        youtubeId: "M6n96yjmKLY",
        title: "What Do You Want To Do? — Hobbies Song for Kids",
        channel: "Maple Leaf Learning",
      },
    ],
    vocab: [
      { word: "ice skating", ipa: "/ˈaɪs skeɪtɪŋ/", vi: "trượt băng", emoji: "⛸️" },
      { word: "roller skating", ipa: "/ˈrəʊlə skeɪtɪŋ/", vi: "trượt pa-tanh", emoji: "🛼" },
      { word: "comic", ipa: "/ˈkɒmɪk/", vi: "truyện tranh", emoji: "📖" },
      { word: "film", ipa: "/fɪlm/", vi: "bộ phim", emoji: "🎞️" },
      { word: "dance", ipa: "/dɑːns/", vi: "nhảy múa", emoji: "💃" },
      { word: "sail", ipa: "/seɪl/", vi: "đi thuyền buồm", emoji: "⛵" },
      { word: "fish", ipa: "/fɪʃ/", vi: "câu cá", emoji: "🎣" },
      { word: "skip", ipa: "/skɪp/", vi: "nhảy dây", emoji: "🪢" },
      { word: "ride", ipa: "/raɪd/", vi: "cưỡi, đạp (xe)", emoji: "🚲" },
      { word: "score", ipa: "/skɔː/", vi: "ghi bàn", emoji: "🥅" },
    ],
    grammar: {
      title: "Nói về sở thích: good at · want to / like to · How about…?",
      formula: "be good at + V-ing · want to / like to + V (nguyên thể) · How about + V-ing?",
      note: "Sau 'good at' và 'How about' động từ PHẢI thêm -ing: good at swimming (không nói good at swim). Sau 'want to / like to' là động từ nguyên thể: want to swim (không nói want to swimming).",
      examples: [
        { en: "Vicky is good at ice skating.", vi: "Vicky trượt băng giỏi." },
        { en: "I want to read a new comic.", vi: "Tớ muốn đọc một cuốn truyện tranh mới." },
        { en: "How about going fishing on Sunday?", vi: "Chủ nhật đi câu cá thì sao nhỉ?" },
      ],
    },
    reading: {
      title: "Charlie's weekend",
      chunks: [
        [
          { text: "Charlie", role: "subject" },
          { text: "is good at", role: "verb" },
          { text: "roller skating", role: "object" },
        ],
        [
          { text: "On Saturdays", role: "adverb" },
          { text: "he", role: "subject" },
          { text: "likes to go", role: "verb" },
          { text: "to the sports centre", role: "adverb" },
          { text: "with his friend Paul", role: "adverb" },
        ],
        [
          { text: "Paul", role: "subject" },
          { text: "wants to learn", role: "verb" },
          { text: "ice skating", role: "object" },
          { text: "but" },
          { text: "he", role: "subject" },
          { text: "falls", role: "verb" },
          { text: "a lot", role: "adverb" },
        ],
        [
          { text: "Charlie", role: "subject" },
          { text: "says", role: "verb" },
          { text: '"How about reading comics instead?"', role: "object" },
        ],
        [
          { text: "Now", role: "adverb" },
          { text: "the two boys", role: "subject" },
          { text: "read", role: "verb" },
          { text: "funny comics", role: "object" },
          { text: "every weekend", role: "adverb" },
        ],
      ],
      viTranslation:
        'Charlie trượt pa-tanh rất giỏi. Thứ Bảy nào cậu ấy cũng thích đến trung tâm thể thao cùng bạn Paul. Paul muốn học trượt băng nhưng cứ ngã hoài. Charlie bảo: "Hay là mình đọc truyện tranh nhé?" Giờ thì cuối tuần nào hai cậu bạn cũng đọc truyện tranh vui nhộn.',
    },
    listen: [
      {
        prompt: "Nghe: Vicky giỏi môn gì?",
        say: "Vicky is good at ice skating.",
        options: ["ice skating", "roller skating", "skipping"],
        answer: "ice skating",
      },
      {
        prompt: "Nghe: bạn ấy muốn xem gì?",
        say: "I want to watch a film tonight.",
        options: ["a film", "a comic", "a game"],
        answer: "a film",
      },
      {
        prompt: "Nghe: bạn ấy rủ làm gì?",
        say: "How about sailing on the lake?",
        options: ["sailing", "skipping", "swimming"],
        answer: "sailing",
      },
      {
        prompt: "Nghe và chọn cụm từ đúng",
        say: "Jack likes to read comics after school.",
        options: ["likes to read", "wants to read", "is good at reading"],
        answer: "likes to read",
      },
    ],
    speak: [
      { sentence: "I'm good at swimming and dancing.", vi: "Tớ bơi và nhảy giỏi." },
      { sentence: "I want to go roller skating today.", vi: "Hôm nay tớ muốn đi trượt pa-tanh." },
      {
        sentence: "I like to read comics at the weekend.",
        vi: "Tớ thích đọc truyện tranh vào cuối tuần.",
      },
      {
        sentence: "How about playing football after school?",
        vi: "Tan học đi đá bóng thì sao nhỉ?",
      },
    ],
    write: [
      { hint: "Truyện có nhiều hình vẽ, rất vui", emoji: "📖", answer: "comic" },
      { hint: "Lắc lư theo điệu nhạc", emoji: "💃", answer: "dance" },
      { hint: "Đi thuyền có cánh buồm trên hồ", emoji: "⛵", answer: "sail" },
      { hint: "Bé xem ở rạp chiếu phim", emoji: "🎞️", answer: "film" },
    ],
  },
];
