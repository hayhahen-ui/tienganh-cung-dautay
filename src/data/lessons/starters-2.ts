import type { Lesson } from "../curriculum";

export const startersLessons2: Lesson[] = [
  {
    slug: "toys-and-birthday",
    level: "starters",
    order: 6,
    title: "Toys & Birthday",
    titleVi: "Đồ chơi & Sinh nhật",
    emoji: "🎁",
    summary:
      "Gọi tên đồ chơi, đếm số lượng và hỏi 'How many … have you got?' trong bữa tiệc sinh nhật.",
    source: "Cambridge YLE Starters wordlist (Toys, Time) · Family and Friends 1 – Unit 3 (Toys)",
    video: { youtubeId: "OOfc9QE6ONE", title: "What Do You Have? — Toys Song for Children" },
    extraVideos: [
      { youtubeId: "BoJBeGUHGv8", title: "Toy — Word Songs · Word Power", channel: "Pinkfong" },
      {
        youtubeId: "c-v-7JRisLA",
        title: "Happy Birthday — Kids Songs",
        channel: "Super Simple Songs",
      },
    ],
    vocab: [
      { word: "ball", ipa: "/bɔːl/", vi: "quả bóng", emoji: "⚽" },
      { word: "doll", ipa: "/dɒl/", vi: "búp bê", emoji: "🪆" },
      { word: "robot", ipa: "/ˈrəʊbɒt/", vi: "người máy", emoji: "🤖" },
      { word: "teddy", ipa: "/ˈtedi/", vi: "gấu bông", emoji: "🧸" },
      { word: "kite", ipa: "/kaɪt/", vi: "con diều", emoji: "🪁" },
      { word: "car", ipa: "/kɑː/", vi: "ô tô (đồ chơi)", emoji: "🚗" },
      { word: "train", ipa: "/treɪn/", vi: "tàu hoả", emoji: "🚂" },
      { word: "balloon", ipa: "/bəˈluːn/", vi: "bóng bay", emoji: "🎈" },
      { word: "cake", ipa: "/keɪk/", vi: "bánh kem", emoji: "🎂" },
      { word: "birthday", ipa: "/ˈbɜːθdeɪ/", vi: "sinh nhật", emoji: "🎉" },
    ],
    grammar: {
      title: "Have got & How many … ?",
      formula: "How many + N (số nhiều) + have you got? → I've got + số + N",
      note: "Sau 'How many' danh từ phải ở dạng SỐ NHIỀU (balls, dolls). Với He/She dùng 'has got': She's got two kites, không nói 'She have got'.",
      examples: [
        {
          en: "How many balls have you got? I've got three.",
          vi: "Cậu có bao nhiêu quả bóng? Tớ có ba quả.",
        },
        { en: "Sam has got a robot and a teddy.", vi: "Sam có một người máy và một chú gấu bông." },
        { en: "I haven't got a kite.", vi: "Tớ không có con diều nào." },
      ],
    },
    reading: {
      title: "Sam's birthday party",
      chunks: [
        [
          { text: "It", role: "subject" },
          { text: "is", role: "verb" },
          { text: "Sam's birthday", role: "object" },
          { text: "today", role: "adverb" },
        ],
        [
          { text: "He", role: "subject" },
          { text: "has got", role: "verb" },
          { text: "a big cake", role: "object" },
          { text: "and" },
          { text: "ten balloons", role: "object" },
        ],
        [
          { text: "Lucy", role: "subject" },
          { text: "gives", role: "verb" },
          { text: "him", role: "object" },
          { text: "a red kite", role: "object" },
        ],
        [
          { text: "Tom and Anna", role: "subject" },
          { text: "have got", role: "verb" },
          { text: "a robot and a teddy", role: "object" },
          { text: "for Sam", role: "adverb" },
        ],
        [
          { text: "Now", role: "adverb" },
          { text: "Sam", role: "subject" },
          { text: "has got", role: "verb" },
          { text: "many new toys", role: "object" },
        ],
      ],
      viTranslation:
        "Hôm nay là sinh nhật của Sam. Cậu ấy có một chiếc bánh kem to và mười quả bóng bay. Lucy tặng cậu ấy một con diều màu đỏ. Tom và Anna có một người máy và một chú gấu bông dành cho Sam. Bây giờ Sam có rất nhiều đồ chơi mới.",
    },
    listen: [
      {
        prompt: "Nghe và chọn số đúng",
        say: "I've got three balls.",
        options: ["three", "thirteen", "two"],
        answer: "three",
      },
      {
        prompt: "Nghe và chọn đồ chơi",
        say: "Lucy has got a red kite.",
        options: ["kite", "cat", "car"],
        answer: "kite",
      },
      {
        prompt: "Nghe và chọn đồ chơi",
        say: "How many balloons have you got?",
        options: ["balloons", "balls", "dolls"],
        answer: "balloons",
      },
      {
        prompt: "Nghe và chọn số đúng",
        say: "Sam has got fifteen toys.",
        options: ["fifteen", "fifty", "five"],
        answer: "fifteen",
      },
    ],
    speak: [
      { sentence: "I've got a robot and a teddy.", vi: "Tớ có một người máy và một chú gấu bông." },
      { sentence: "How many kites have you got?", vi: "Cậu có bao nhiêu con diều?" },
      { sentence: "I've got two red cars.", vi: "Tớ có hai chiếc ô tô màu đỏ." },
      {
        sentence: "Happy birthday! Here is a big cake.",
        vi: "Chúc mừng sinh nhật! Đây là một chiếc bánh to.",
      },
    ],
    write: [
      { hint: "Đồ chơi bằng kim loại biết đi, biết nói", emoji: "🤖", answer: "robot" },
      { hint: "Đồ chơi bay cao trên trời khi có gió", emoji: "🪁", answer: "kite" },
      { hint: "Món ngọt có nến trong ngày sinh nhật", emoji: "🎂", answer: "cake" },
      { hint: "Quả tròn bơm hơi, bay lên trời", emoji: "🎈", answer: "balloon" },
    ],
  },
  {
    slug: "my-house",
    level: "starters",
    order: 7,
    title: "My House",
    titleVi: "Ngôi nhà của tớ",
    emoji: "🏠",
    summary:
      "Các phòng và đồ đạc trong nhà, dùng 'There is / There are' cùng giới từ chỉ nơi chốn.",
    source:
      "Cambridge YLE Starters wordlist (The home, Places & directions) · Family and Friends 1 – Unit 6 (My house)",
    video: {
      youtubeId: "IjnlkdZvYTE",
      title: "Dream English Kids — Rooms of the House Song with Matt",
    },
    extraVideos: [
      {
        youtubeId: "R9intHqlzhc",
        title: "House — Welcome to My House! Rooms & House Words",
        channel: "English Singsing",
      },
      {
        youtubeId: "1lqZmMu5wkk",
        title: "Learn Rooms of the House — Talking Flashcards",
        channel: "Maple Leaf Learning",
      },
    ],
    vocab: [
      { word: "kitchen", ipa: "/ˈkɪtʃɪn/", vi: "nhà bếp", emoji: "🍳" },
      { word: "bedroom", ipa: "/ˈbedruːm/", vi: "phòng ngủ", emoji: "🌙" },
      { word: "bathroom", ipa: "/ˈbɑːθruːm/", vi: "phòng tắm", emoji: "🛁" },
      { word: "living room", ipa: "/ˈlɪvɪŋ ruːm/", vi: "phòng khách", emoji: "📺" },
      { word: "bed", ipa: "/bed/", vi: "cái giường", emoji: "🛏️" },
      { word: "sofa", ipa: "/ˈsəʊfə/", vi: "ghế sô pha", emoji: "🛋️" },
      { word: "chair", ipa: "/tʃeə/", vi: "cái ghế", emoji: "🪑" },
      { word: "lamp", ipa: "/læmp/", vi: "cái đèn", emoji: "💡" },
      { word: "cupboard", ipa: "/ˈkʌbəd/", vi: "tủ đựng đồ", emoji: "🗄️" },
      { word: "mirror", ipa: "/ˈmɪrə/", vi: "cái gương", emoji: "🪞" },
    ],
    grammar: {
      title: "There is / There are + giới từ chỉ nơi chốn",
      formula:
        "There is + a/an + N (số ít) · There are + số + N (số nhiều) + in / on / under / next to / between",
      note: "Số ít dùng 'There is', số nhiều dùng 'There are' — bé hay nói 'There is two lamps'. 'Between' luôn đi với HAI thứ: between the bed and the cupboard.",
      examples: [
        {
          en: "There is a big sofa in the living room.",
          vi: "Có một chiếc sô pha to trong phòng khách.",
        },
        { en: "There are two lamps next to the bed.", vi: "Có hai cái đèn cạnh giường." },
        { en: "The cat is under the chair.", vi: "Con mèo ở dưới cái ghế." },
      ],
    },
    reading: {
      title: "Kim's new house",
      chunks: [
        [
          { text: "Kim", role: "subject" },
          { text: "lives", role: "verb" },
          { text: "in a small house", role: "adverb" },
          { text: "with her family", role: "adverb" },
        ],
        [
          { text: "There" },
          { text: "is", role: "verb" },
          { text: "a big sofa", role: "subject" },
          { text: "in the living room", role: "adverb" },
        ],
        [
          { text: "In her bedroom", role: "adverb" },
          { text: "there" },
          { text: "are", role: "verb" },
          { text: "two lamps", role: "subject" },
          { text: "next to the bed", role: "adverb" },
        ],
        [
          { text: "Her cat", role: "subject" },
          { text: "sleeps", role: "verb" },
          { text: "under the chair", role: "adverb" },
          { text: "in the kitchen", role: "adverb" },
        ],
        [
          { text: "The mirror", role: "subject" },
          { text: "is", role: "verb" },
          { text: "on the wall", role: "adverb" },
          { text: "between the window and the cupboard", role: "adverb" },
        ],
      ],
      viTranslation:
        "Kim sống trong một ngôi nhà nhỏ cùng gia đình. Có một chiếc sô pha to trong phòng khách. Trong phòng ngủ của bạn ấy có hai cái đèn cạnh giường. Con mèo của bạn ấy ngủ dưới cái ghế trong bếp. Cái gương ở trên tường, giữa cửa sổ và tủ đựng đồ.",
    },
    listen: [
      {
        prompt: "Nghe và chọn căn phòng",
        say: "There is a big sofa in the living room.",
        options: ["living room", "dining room", "bedroom"],
        answer: "living room",
      },
      {
        prompt: "Nghe và chọn giới từ",
        say: "The cat is under the chair.",
        options: ["under", "on", "in"],
        answer: "under",
      },
      {
        prompt: "Nghe và chọn đồ vật",
        say: "There are two lamps next to the bed.",
        options: ["lamps", "lambs", "maps"],
        answer: "lamps",
      },
      {
        prompt: "Nghe và chọn căn phòng",
        say: "The mirror is in the bathroom.",
        options: ["bathroom", "bedroom", "kitchen"],
        answer: "bathroom",
      },
    ],
    speak: [
      { sentence: "There is a lamp next to my bed.", vi: "Có một cái đèn cạnh giường của tớ." },
      { sentence: "There are three chairs in the kitchen.", vi: "Có ba cái ghế trong bếp." },
      { sentence: "My teddy is under the sofa.", vi: "Gấu bông của tớ ở dưới ghế sô pha." },
      { sentence: "The mirror is on the wall.", vi: "Cái gương ở trên tường." },
    ],
    write: [
      { hint: "Căn phòng để nấu ăn", emoji: "🍳", answer: "kitchen" },
      { hint: "Ghế dài êm trong phòng khách", emoji: "🛋️", answer: "sofa" },
      { hint: "Đồ vật phát sáng khi trời tối", emoji: "💡", answer: "lamp" },
      { hint: "Đồ vật để soi mặt mình", emoji: "🪞", answer: "mirror" },
    ],
  },
  {
    slug: "at-school",
    level: "starters",
    order: 8,
    title: "At School",
    titleVi: "Ở trường học",
    emoji: "🏫",
    summary:
      "Đồ dùng học tập trong lớp, câu mệnh lệnh của cô giáo và cách xin phép lịch sự với 'Can I … ?'.",
    source:
      "Cambridge YLE Starters wordlist (School) · Family and Friends 1 – Unit 1 (What's this?)",
    video: {
      youtubeId: "AS5nhKzaOqo",
      title: "English Singsing — School Supplies: What's in My Bag?",
    },
    extraVideos: [
      {
        youtubeId: "aVSnDZHNEQc",
        title: "What Is In Your Bag? Song with Matt — School Classroom Items",
        channel: "Dream English Kids",
      },
      {
        youtubeId: "DzA1VQL1oME",
        title: "Open Shut Them #2 — Kids Songs",
        channel: "Super Simple Songs",
      },
    ],
    vocab: [
      { word: "book", ipa: "/bʊk/", vi: "quyển sách", emoji: "📖" },
      { word: "pen", ipa: "/pen/", vi: "cái bút mực", emoji: "🖊️" },
      { word: "pencil", ipa: "/ˈpensl/", vi: "bút chì", emoji: "✏️" },
      { word: "ruler", ipa: "/ˈruːlə/", vi: "cái thước kẻ", emoji: "📏" },
      { word: "rubber", ipa: "/ˈrʌbə/", vi: "cục tẩy", emoji: "🧽" },
      { word: "bag", ipa: "/bæɡ/", vi: "cái cặp sách", emoji: "🎒" },
      { word: "desk", ipa: "/desk/", vi: "bàn học", emoji: "🪑" },
      { word: "board", ipa: "/bɔːd/", vi: "cái bảng", emoji: "🟩" },
      { word: "classroom", ipa: "/ˈklɑːsruːm/", vi: "lớp học", emoji: "🏫" },
      { word: "teacher", ipa: "/ˈtiːtʃə/", vi: "giáo viên", emoji: "👩‍🏫" },
    ],
    grammar: {
      title: "Can I … ? & câu mệnh lệnh",
      formula:
        "Can I + V + …, please? → Yes, you can. / No, you can't. · V (nguyên mẫu) + …! (Open your book! Sit down!)",
      note: "Câu mệnh lệnh KHÔNG có chủ ngữ: nói 'Sit down!' chứ không nói 'You sit down!'. Khi xin phép, thêm 'please' cho lịch sự. Hỏi chủ nhân đồ vật dùng 'Whose … ?': Whose bag is this?",
      examples: [
        {
          en: "Can I have a pencil, please? Yes, you can.",
          vi: "Tớ xin một cái bút chì được không ạ? Được chứ.",
        },
        { en: "Open your books and look at the board!", vi: "Mở sách ra và nhìn lên bảng nào!" },
        { en: "Whose ruler is this? It's Ben's.", vi: "Cái thước này của ai? Của Ben đấy." },
      ],
    },
    reading: {
      title: "In the classroom",
      chunks: [
        [
          { text: "Ben", role: "subject" },
          { text: "is", role: "verb" },
          { text: "in the classroom", role: "adverb" },
          { text: "with his teacher", role: "adverb" },
        ],
        [
          { text: "Open", role: "verb" },
          { text: "your books", role: "object" },
          { text: "and" },
          { text: "sit down", role: "verb" },
          { text: "please", role: "adverb" },
        ],
        [
          { text: "Ben", role: "subject" },
          { text: "hasn't got", role: "verb" },
          { text: "a pencil", role: "object" },
          { text: "in his bag", role: "adverb" },
        ],
        [
          { text: "Can", role: "verb" },
          { text: "I", role: "subject" },
          { text: "have", role: "verb" },
          { text: "a pencil", role: "object" },
          { text: "please", role: "adverb" },
        ],
        [
          { text: "Grace", role: "subject" },
          { text: "gives", role: "verb" },
          { text: "him", role: "object" },
          { text: "a yellow pencil and a rubber", role: "object" },
        ],
      ],
      viTranslation:
        "Ben đang ở trong lớp học cùng cô giáo. 'Các con mở sách ra và ngồi xuống nào.' Ben không có bút chì trong cặp. 'Cho tớ xin một cái bút chì được không?' Grace đưa cho cậu ấy một cái bút chì màu vàng và một cục tẩy.",
    },
    listen: [
      {
        prompt: "Nghe và chọn đồ dùng",
        say: "Can I have a pen, please?",
        options: ["pen", "pencil", "ten"],
        answer: "pen",
      },
      {
        prompt: "Nghe và chọn hành động",
        say: "Open your books, children!",
        options: ["open", "close", "clean"],
        answer: "open",
      },
      {
        prompt: "Nghe và chọn đồ dùng",
        say: "Whose ruler is this?",
        options: ["ruler", "rubber", "robot"],
        answer: "ruler",
      },
      {
        prompt: "Nghe và chọn hành động",
        say: "Sit down and look at the board.",
        options: ["sit down", "stand up", "sit up"],
        answer: "sit down",
      },
    ],
    speak: [
      { sentence: "Can I have a rubber, please?", vi: "Cho tớ xin một cục tẩy được không?" },
      { sentence: "I've got a pencil and a ruler.", vi: "Tớ có một cái bút chì và một cái thước." },
      { sentence: "My book is on the desk.", vi: "Quyển sách của tớ ở trên bàn học." },
      { sentence: "Can I open the window, please?", vi: "Tớ mở cửa sổ được không ạ?" },
    ],
    write: [
      { hint: "Bút để viết, có thể tẩy được", emoji: "✏️", answer: "pencil" },
      { hint: "Dụng cụ để kẻ đường thẳng", emoji: "📏", answer: "ruler" },
      { hint: "Đồ để đựng sách vở đi học", emoji: "🎒", answer: "bag" },
      { hint: "Người dạy bé học ở trường", emoji: "👩‍🏫", answer: "teacher" },
    ],
  },
  {
    slug: "sports-and-hobbies",
    level: "starters",
    order: 9,
    title: "Sports & Hobbies",
    titleVi: "Thể thao & Sở thích",
    emoji: "⚽",
    summary:
      "Nói về môn thể thao và sở thích với 'like / love + V-ing' và hỏi đáp 'Do you like … ?'.",
    source:
      "Cambridge YLE Starters wordlist (Sports & leisure) · Family and Friends 1 – Unit 11 (I like sport)",
    video: {
      youtubeId: "WCYTlVF-djw",
      title: "Fun Kids English — Sports Song: Do You Like Sports?",
    },
    extraVideos: [
      {
        youtubeId: "tgUSHk6JaTY",
        title: "Sports Song — Soccer, Baseball & Basketball",
        channel: "English Singsing",
      },
      {
        youtubeId: "tYNap8gVNK4",
        title: "What Do You Like To Do? — Hobbies Song for Kids",
        channel: "Maple Leaf Learning",
      },
    ],
    vocab: [
      { word: "football", ipa: "/ˈfʊtbɔːl/", vi: "bóng đá", emoji: "⚽" },
      { word: "basketball", ipa: "/ˈbɑːskɪtbɔːl/", vi: "bóng rổ", emoji: "🏀" },
      { word: "tennis", ipa: "/ˈtenɪs/", vi: "quần vợt", emoji: "🎾" },
      { word: "badminton", ipa: "/ˈbædmɪntən/", vi: "cầu lông", emoji: "🏸" },
      { word: "swim", ipa: "/swɪm/", vi: "bơi", emoji: "🏊" },
      { word: "ride a bike", ipa: "/raɪd ə baɪk/", vi: "đạp xe", emoji: "🚴" },
      { word: "draw", ipa: "/drɔː/", vi: "vẽ", emoji: "🎨" },
      { word: "sing", ipa: "/sɪŋ/", vi: "hát", emoji: "🎤" },
      { word: "read", ipa: "/riːd/", vi: "đọc", emoji: "📚" },
      { word: "hobby", ipa: "/ˈhɒbi/", vi: "sở thích", emoji: "⭐" },
    ],
    grammar: {
      title: "Like / love + V-ing & Do you like … ?",
      formula: "S + like(s) / love(s) + V-ing · Do you like + V-ing? → Yes, I do. / No, I don't.",
      note: "Sau 'like / love' động từ thêm -ing: like swimming, không nói 'like swim'. Chú ý chính tả: swim → swimming (gấp đôi m), ride → riding (bỏ e). Trả lời ngắn dùng 'do / don't', không nói 'Yes, I like'.",
      examples: [
        {
          en: "Do you like playing football? Yes, I do.",
          vi: "Cậu có thích chơi bóng đá không? Có, tớ thích.",
        },
        { en: "I love swimming in the sea.", vi: "Tớ rất thích bơi ở biển." },
        { en: "She doesn't like riding a bike.", vi: "Bạn ấy không thích đạp xe." },
      ],
    },
    reading: {
      title: "Dan's favourite hobbies",
      chunks: [
        [
          { text: "Dan", role: "subject" },
          { text: "loves", role: "verb" },
          { text: "playing football", role: "object" },
          { text: "with his friends", role: "adverb" },
        ],
        [
          { text: "He", role: "subject" },
          { text: "likes", role: "verb" },
          { text: "swimming", role: "object" },
          { text: "in the sea", role: "adverb" },
          { text: "too", role: "adverb" },
        ],
        [
          { text: "His sister Grace", role: "subject" },
          { text: "likes", role: "verb" },
          { text: "reading books and drawing", role: "object" },
        ],
        [
          { text: "They", role: "subject" },
          { text: "don't like", role: "verb" },
          { text: "playing basketball", role: "object" },
        ],
        [
          { text: "Their favourite hobby", role: "subject" },
          { text: "is", role: "verb" },
          { text: "singing songs", role: "object" },
          { text: "at home", role: "adverb" },
        ],
      ],
      viTranslation:
        "Dan rất thích chơi bóng đá với các bạn. Cậu ấy cũng thích bơi ở biển. Chị gái Grace của cậu ấy thích đọc sách và vẽ. Hai chị em không thích chơi bóng rổ. Sở thích yêu thích nhất của họ là hát ở nhà.",
    },
    listen: [
      {
        prompt: "Nghe và chọn môn thể thao",
        say: "Do you like playing basketball?",
        options: ["basketball", "baseball", "football"],
        answer: "basketball",
      },
      {
        prompt: "Nghe và chọn câu trả lời",
        say: "Do you like swimming? No, I don't.",
        options: ["No, I don't", "Yes, I do", "No, I can't"],
        answer: "No, I don't",
      },
      {
        prompt: "Nghe và chọn sở thích",
        say: "Grace loves reading books.",
        options: ["reading", "riding", "writing"],
        answer: "reading",
      },
      {
        prompt: "Nghe và chọn môn thể thao",
        say: "I like playing tennis with my dad.",
        options: ["tennis", "table tennis", "ten"],
        answer: "tennis",
      },
    ],
    speak: [
      {
        sentence: "I love playing football with my friends.",
        vi: "Tớ rất thích chơi bóng đá với các bạn.",
      },
      { sentence: "Do you like swimming?", vi: "Cậu có thích bơi không?" },
      { sentence: "I like drawing and singing.", vi: "Tớ thích vẽ và hát." },
      { sentence: "I don't like riding a bike.", vi: "Tớ không thích đạp xe." },
    ],
    write: [
      { hint: "Môn thể thao đá quả bóng vào khung thành", emoji: "⚽", answer: "football" },
      { hint: "Môn thể thao dùng vợt và quả bóng nhỏ màu vàng", emoji: "🎾", answer: "tennis" },
      { hint: "Hoạt động dưới nước ở bể bơi hoặc biển", emoji: "🏊", answer: "swim" },
      { hint: "Việc bé thích làm lúc rảnh rỗi", emoji: "⭐", answer: "hobby" },
    ],
  },
];
