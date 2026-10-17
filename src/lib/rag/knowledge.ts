/**
 * Knowledge base builder — auto-generates chunks from curriculum.ts + hand-written FAQ.
 * All Owly answers originate from this knowledge base.
 */
import {
  lessons,
  levels,
  roadmap,
  weekPlan,
  parentRules,
  syllabus,
  coursebooks,
  examBooks,
  youtubeChannels,
  practicePlatforms,
  examStructures,
  grammarLists,
  thematicVocabLists,
  pictureBookTopics,
  canDoStatements,
  examNames,
  examColours,
  type Lesson,
} from "@/data/curriculum";

export type ChunkSource = {
  type:
    | "vocab"
    | "grammar"
    | "reading"
    | "speak"
    | "listen"
    | "write"
    | "roadmap"
    | "exam"
    | "platform"
    | "faq"
    | "phonics";
  label: string;
  lessonSlug?: string | undefined;
};

export type Chunk = {
  id: string;
  text: string;
  keywords: string;
  source: ChunkSource;
  level?: "starters" | "movers" | "flyers" | undefined;
};

// ── Chunk builders ──────────────────────────────────────────────────────

function vocabChunks(lesson: Lesson): Chunk[] {
  return lesson.vocab.map((v, i) => ({
    id: `vocab-${lesson.slug}-${i}`,
    text: `${v.emoji} ${v.word} ${v.ipa} nghĩa là "${v.vi}". Chủ đề bài ${lesson.title} (${lesson.titleVi}).`,
    keywords: `${v.word} ${v.vi} ${lesson.titleVi} ${lesson.title} từ vựng vocabulary`,
    source: { type: "vocab" as const, label: `${v.emoji} ${v.word}`, lessonSlug: lesson.slug },
    level: lesson.level,
  }));
}

function grammarChunks(lesson: Lesson): Chunk[] {
  const g = lesson.grammar;
  const chunks: Chunk[] = [
    {
      id: `grammar-${lesson.slug}`,
      text: `Ngữ pháp: ${g.title}. Công thức: ${g.formula}. Lưu ý: ${g.note}`,
      keywords: `${g.title} ngữ pháp grammar ${lesson.titleVi}`,
      source: { type: "grammar" as const, label: g.title, lessonSlug: lesson.slug },
      level: lesson.level,
    },
  ];
  g.examples.forEach((ex, i) => {
    chunks.push({
      id: `grammar-ex-${lesson.slug}-${i}`,
      text: `Ví dụ ${g.title}: "${ex.en}" — ${ex.vi}`,
      keywords: `${g.title} ${ex.en} ${ex.vi} ví dụ example`,
      source: { type: "grammar" as const, label: g.title, lessonSlug: lesson.slug },
      level: lesson.level,
    });
  });
  return chunks;
}

function readingChunks(lesson: Lesson): Chunk[] {
  const r = lesson.reading;
  const fullText = r.chunks.map((line) => line.map((c) => c.text).join(" ")).join(". ");
  return [
    {
      id: `reading-${lesson.slug}`,
      text: `Đoạn văn "${r.title}": ${fullText}. Dịch: ${r.viTranslation}`,
      keywords: `${r.title} reading đọc hiểu ${lesson.titleVi}`,
      source: { type: "reading" as const, label: r.title, lessonSlug: lesson.slug },
      level: lesson.level,
    },
  ];
}

function speakChunks(lesson: Lesson): Chunk[] {
  return lesson.speak.map((s, i) => ({
    id: `speak-${lesson.slug}-${i}`,
    text: `Luyện nói: "${s.sentence}" — ${s.vi}`,
    keywords: `${s.sentence} ${s.vi} speaking nói phát âm`,
    source: { type: "speak" as const, label: "Luyện nói", lessonSlug: lesson.slug },
    level: lesson.level,
  }));
}

export function listenChunks(lesson: Lesson): Chunk[] {
  return lesson.listen.map((q, i) => ({
    id: `listen-${lesson.slug}-${i}`,
    text: `Luyện nghe: "${q.say}" — đáp án: ${q.answer}. (${q.prompt})`,
    keywords: `${q.say} ${q.answer} listening nghe`,
    source: { type: "listen" as const, label: "Luyện nghe", lessonSlug: lesson.slug },
    level: lesson.level,
  }));
}

export function writeChunks(lesson: Lesson): Chunk[] {
  return lesson.write.map((w, i) => ({
    id: `write-${lesson.slug}-${i}`,
    text: `Chính tả: ${w.emoji} "${w.hint}" — đáp án: ${w.answer}`,
    keywords: `${w.answer} ${w.hint} writing viết chính tả spelling`,
    source: { type: "write" as const, label: "Chính tả", lessonSlug: lesson.slug },
    level: lesson.level,
  }));
}

function lessonChunks(lesson: Lesson): Chunk[] {
  return [
    ...vocabChunks(lesson),
    ...grammarChunks(lesson),
    ...readingChunks(lesson),
    ...speakChunks(lesson),
    // listen/write cố ý KHÔNG đưa vào KB: chunk chứa đáp án bài tập → lộ đáp án
    // và tạo nhiễu kiểu "Chính tả: ... đáp án: mother" khi bé hỏi từ vựng.
  ];
}

// ── Meta / reference chunks ─────────────────────────────────────────────

function metaChunks(): Chunk[] {
  const chunks: Chunk[] = [];

  levels.forEach((lv) => {
    chunks.push({
      id: `level-${lv.id}`,
      text: `Cấp ${lv.name} (${lv.emoji}): ${lv.months}, học ${lv.words}. Mục tiêu: ${lv.goal}. Thi: ${lv.exam}.`,
      keywords: `${lv.name} ${lv.id} cấp độ level CEFR`,
      source: { type: "exam" as const, label: lv.name },
    });
  });

  roadmap.forEach((r, i) => {
    chunks.push({
      id: `roadmap-${i}`,
      text: `Lộ trình ${r.phase} (${r.emoji}): ${r.time}. Trọng tâm: ${r.focus}. Đầu ra: ${r.output}.`,
      keywords: `lộ trình roadmap ${r.phase} ${r.time}`,
      source: { type: "roadmap" as const, label: r.phase },
    });
  });

  chunks.push({
    id: "weekplan",
    text: `Lịch học tuần: ${weekPlan.map((d) => `${d.day}: ${d.act} (${d.skill})`).join(". ")}.`,
    keywords: "lịch học tuần week plan thứ schedule",
    source: { type: "roadmap" as const, label: "Lịch học tuần" },
  });

  parentRules.forEach((rule, i) => {
    chunks.push({
      id: `parent-rule-${i}`,
      text: `Quy tắc cho ba mẹ: ${rule}`,
      keywords: `ba mẹ phụ huynh parent quy tắc rule ${rule.slice(0, 30)}`,
      source: { type: "faq" as const, label: "Góc ba mẹ" },
    });
  });

  syllabus.forEach((s) => {
    chunks.push({
      id: `syllabus-${s.level}`,
      text: `Giáo trình cấp ${s.level}: sách ${s.book}. Chủ đề: ${s.units}. Luyện thi: ${s.exam}.`,
      keywords: `syllabus giáo trình ${s.level} ${s.book}`,
      source: { type: "platform" as const, label: `Giáo trình ${s.level}` },
      level: s.level,
    });
  });

  coursebooks.forEach((cb, i) => {
    chunks.push({
      id: `coursebook-${i}`,
      text: `Sách ${cb.name} (${cb.publisher}): ${cb.fit}. ${cb.note}. ${cb.tag ?? ""}`,
      keywords: `${cb.name} ${cb.publisher} sách giáo trình coursebook`,
      source: { type: "platform" as const, label: cb.name },
    });
  });

  examBooks.forEach((eb, i) => {
    chunks.push({
      id: `exambook-${i}`,
      text: `Sách luyện thi: ${eb.name}. ${eb.when}.`,
      keywords: `${eb.name} luyện thi exam book`,
      source: { type: "exam" as const, label: eb.name },
    });
  });

  youtubeChannels.forEach((ch, i) => {
    chunks.push({
      id: `youtube-${i}`,
      text: `Kênh YouTube: ${ch.name} — ${ch.note}.`,
      keywords: `${ch.name} youtube video kênh channel`,
      source: { type: "platform" as const, label: ch.name },
    });
  });

  practicePlatforms.forEach((p, i) => {
    chunks.push({
      id: `platform-${i}`,
      text: `Nền tảng luyện tập: ${p.name} — ${p.skill}. Phí: ${p.fee}.`,
      keywords: `${p.name} ${p.skill} app platform luyện tập`,
      source: { type: "platform" as const, label: p.name },
    });
  });

  // ── Dữ liệu chính thức từ Cambridge PDF (củng cố 08/2026) ──────────────

  // Cấu trúc đề thi chính xác theo handbook
  examStructures.forEach((es, i) => {
    const partsDesc = es.parts
      .map(
        (p) =>
          `Part ${p.part}: ${p.taskType} — ${p.description} (${p.questions} câu, ${p.marks} điểm)`,
      )
      .join(". ");
    chunks.push({
      id: `exam-struct-${i}`,
      text: `Đề thi ${es.level} — ${es.paper} (${es.duration}): ${partsDesc}. Tổng ${es.totalMarks} điểm.`,
      keywords: `${es.level} ${es.paper} đề thi cấu trúc exam structure ${es.duration}`,
      source: { type: "exam" as const, label: `${es.level} ${es.paper}` },
    });
  });

  // Grammar & structures list theo handbook
  grammarLists.forEach((gl) => {
    gl.items.forEach((item, i) => {
      chunks.push({
        id: `grammar-list-${gl.level}-${i}`,
        text: `Ngữ pháp ${gl.level}: ${item.structure}. Ví dụ: ${item.example}`,
        keywords: `${item.category} ${item.structure} ngữ pháp grammar ${gl.level}`,
        source: { type: "grammar" as const, label: `${gl.level}: ${item.structure}` },
      });
    });
  });

  // Thematic vocabulary lists theo handbook
  thematicVocabLists.forEach((tv) => {
    chunks.push({
      id: `thematic-${tv.theme}`,
      text: `Từ vựng chủ đề "${tv.theme}": Starters: ${tv.starters.join(", ")}. Movers thêm: ${tv.movers.join(", ") || "(không thêm)"}. Flyers thêm: ${tv.flyers.join(", ") || "(không thêm)"}.`,
      keywords: `${tv.theme} từ vựng thematic vocabulary chủ đề topic`,
      source: { type: "vocab" as const, label: tv.theme },
    });
  });

  // Picture book topics theo từng cấp
  pictureBookTopics.forEach((pb) => {
    pb.topics.forEach((topic, i) => {
      chunks.push({
        id: `picturebook-${pb.level}-${i}`,
        text: `Chủ đề ${pb.level}: ${topic.title}. Từ vựng: ${topic.vocab.join(", ")}.`,
        keywords: `${topic.title} ${pb.level} picture book chủ đề tranh topic`,
        source: { type: "vocab" as const, label: `${pb.level}: ${topic.title}` },
      });
    });
  });

  // Can-do statements theo handbook
  canDoStatements.forEach((cd, i) => {
    chunks.push({
      id: `cando-${i}`,
      text: `Năng lực ${cd.level} — ${cd.skill}: ${cd.statements.join(". ")}.`,
      keywords: `${cd.level} ${cd.skill} can do năng lực CEFR`,
      source: { type: "exam" as const, label: `${cd.level} ${cd.skill}` },
    });
  });

  // Names theo từng cấp
  examNames.forEach((en) => {
    chunks.push({
      id: `names-${en.level}`,
      text: `Tên trong đề thi ${en.level}: ${en.names.join(", ")}. Bé cần nhận biết và viết đúng các tên này.`,
      keywords: `${en.level} names tên đề thi Cambridge`,
      source: { type: "exam" as const, label: `Tên ${en.level}` },
    });
  });

  // Màu dùng trong bài Colouring
  chunks.push({
    id: "exam-colours",
    text: `10 màu dùng trong bài Colouring (Listening Part 4/5): ${examColours.join(", ")}. Bé cần biết đọc và tô đúng màu.`,
    keywords: `colours màu colouring listening tô màu exam`,
    source: { type: "exam" as const, label: "Màu Colouring" },
  });

  return chunks;
}

// ── FAQ chunks (hand-written) ───────────────────────────────────────────

export const faqEntries: Array<{ q: string; a: string; kw: string }> = [
  {
    q: "Owly English là gì",
    a: "Owly English là ứng dụng học tiếng Anh online miễn phí cho bé 8–12 tuổi, theo chuẩn Cambridge YLE (Starters → Movers → Flyers).",
    kw: "owly english app ứng dụng",
  },
  {
    q: "CEFR là gì",
    a: "CEFR (Common European Framework of Reference) là Khung tham chiếu ngôn ngữ chung châu Âu, chia 6 bậc: A1 → C2. Cambridge YLE Starters = Pre A1, Movers = A1, Flyers = A2.",
    kw: "CEFR khung năng lực châu âu bậc",
  },
  {
    q: "Starters là gì",
    a: "Pre A1 Starters là kỳ thi đầu tiên trong bộ Cambridge YLE, dành cho bé bắt đầu học tiếng Anh. Bé cần ~500 từ vựng. Thi gồm Listening 20 phút, Reading & Writing 20 phút, Speaking 3–5 phút.",
    kw: "starters pre a1 kỳ thi đầu tiên",
  },
  {
    q: "Movers là gì",
    a: "A1 Movers là kỳ thi thứ hai, bé cần ~1200 từ. Thi gồm Listening 25 phút, Reading & Writing 30 phút, Speaking 5–7 phút.",
    kw: "movers a1 kỳ thi thứ hai",
  },
  {
    q: "Flyers là gì",
    a: "A2 Flyers là kỳ thi cao nhất trong bộ YLE, bé cần ~2200 từ. Thi gồm Listening 25 phút, Reading & Writing 40 phút, Speaking 7–9 phút.",
    kw: "flyers a2 kỳ thi cao nhất",
  },
  {
    q: "Bao nhiêu khiên là đạt",
    a: "Cambridge YLE không có đỗ/trượt. Mỗi kỹ năng tối đa 5 khiên (shields), tổng tối đa 15 khiên. Thường 10–11 khiên trở lên là tốt, 12–15 là xuất sắc.",
    kw: "khiên shields điểm đạt bao nhiêu",
  },
  {
    q: "Thi ở đâu",
    a: "Bé có thể thi Cambridge YLE tại British Council hoặc IDP Education tại Việt Nam. Đăng ký trên website của họ, thi khoảng 2–3 đợt mỗi năm.",
    kw: "thi ở đâu đăng ký british council IDP",
  },
  {
    q: "Khi nào nên thi",
    a: "Nên thi khi bé đã hoàn thành 70% chương trình của cấp đó và làm quen với định dạng đề qua sách Fun for + đề mẫu Cambridge.",
    kw: "khi nào thi thời điểm nên thi",
  },
  {
    q: "Phonics là gì",
    a: "Phonics là phương pháp dạy đọc bằng cách ghép âm (sound) với chữ cái (letter). Tiếng Anh có 44 âm cơ bản. Bé cần học phonics 2–3 tháng đầu trước khi vào giáo trình chính.",
    kw: "phonics âm chữ cái ghép vần đọc",
  },
  {
    q: "Sight words là gì",
    a: "Sight words là các từ xuất hiện rất thường xuyên mà bé cần nhận mặt ngay (the, is, are, have, was...). Khoảng 100 sight words đầu tiên giúp bé đọc trôi chảy hơn.",
    kw: "sight words từ nhận mặt thường gặp",
  },
  {
    q: "Shadowing là gì",
    a: "Shadowing là kỹ thuật luyện nói: bé nghe 1 câu rồi nhại lại ngay lập tức, bắt chước ngữ điệu và nhịp điệu. Rất hiệu quả cho Speaking.",
    kw: "shadowing nhại giọng luyện nói kỹ thuật",
  },
  {
    q: "Quy tắc 5 ngón tay",
    a: "Quy tắc 5 ngón tay (Five Finger Rule) giúp chọn sách đúng cấp: đọc 1 trang, giơ 1 ngón mỗi khi gặp từ không biết. 0–1 ngón = quá dễ, 2–3 = vừa, 4–5 = quá khó.",
    kw: "5 ngón tay quy tắc chọn sách five finger rule",
  },
  {
    q: "Học bao lâu mỗi ngày",
    a: "Nên học 30 phút mỗi ngày, đều đặn 6 ngày/tuần. Đều đặn quan trọng hơn cường độ — 30 phút/ngày hiệu quả hơn 3 giờ cuối tuần.",
    kw: "bao lâu mỗi ngày thời gian 30 phút",
  },
  {
    q: "a hay an",
    a: "Dùng 'a' trước từ bắt đầu bằng phụ âm (a ball, a cat), dùng 'an' trước từ bắt đầu bằng nguyên âm (an apple, an egg). Lưu ý: an hour (h câm) nhưng a university (phát âm /juː/).",
    kw: "a an mạo từ phụ âm nguyên âm",
  },
  {
    q: "Khi nào thêm s es",
    a: "Thì hiện tại đơn với he/she/it: thêm -s (plays, reads). Thêm -es sau -s, -sh, -ch, -x, -o (watches, goes). Tận cùng phụ âm + y: đổi y thành -ies (studies).",
    kw: "s es thêm quy tắc hiện tại đơn ngôi ba",
  },
  {
    q: "Didn't dùng thế nào",
    a: "Phủ định quá khứ đơn: S + didn't + V nguyên thể. SAU didn't động từ trở về nguyên mẫu: I didn't go (không phải didn't went).",
    kw: "didn't quá khứ đơn phủ định",
  },
  {
    q: "Viết hoa thứ ngày tháng",
    a: "Trong tiếng Anh, các thứ trong tuần (Monday, Tuesday...) và tháng (January, February...) luôn viết hoa chữ cái đầu. Đây là lỗi chính tả hay gặp.",
    kw: "viết hoa thứ tháng Monday January capitalize",
  },
  {
    q: "Đếm từ 1 đến 20",
    a: "1 one, 2 two, 3 three, 4 four, 5 five, 6 six, 7 seven, 8 eight, 9 nine, 10 ten, 11 eleven, 12 twelve, 13 thirteen, 14 fourteen, 15 fifteen, 16 sixteen, 17 seventeen, 18 eighteen, 19 nineteen, 20 twenty.",
    kw: "đếm số 1 20 one two three numbers",
  },
  {
    q: "Các màu sắc tiếng Anh",
    a: "red (đỏ), blue (xanh dương), green (xanh lá), yellow (vàng), orange (cam), purple (tím), pink (hồng), black (đen), white (trắng), brown (nâu), grey (xám).",
    kw: "màu sắc colours colors red blue green",
  },
  {
    q: "This these that those",
    a: "this (cái này - số ít gần), these (những cái này - số nhiều gần), that (cái kia - số ít xa), those (những cái kia - số nhiều xa).",
    kw: "this these that those chỉ định gần xa",
  },
  {
    q: "Present simple là gì",
    a: "Hiện tại đơn (Present Simple) diễn tả thói quen, sự thật. Công thức: S + V(s/es). Phủ định: S + don't/doesn't + V. Câu hỏi: Do/Does + S + V?",
    kw: "present simple hiện tại đơn thói quen",
  },
  {
    q: "Present continuous là gì",
    a: "Hiện tại tiếp diễn (Present Continuous) diễn tả việc đang xảy ra. Công thức: S + am/is/are + V-ing. Dấu hiệu: now, right now, at the moment.",
    kw: "present continuous hiện tại tiếp diễn đang",
  },
  {
    q: "Past simple là gì",
    a: "Quá khứ đơn (Past Simple) diễn tả việc đã xảy ra và kết thúc. Công thức: S + V-ed (quy tắc) hoặc V2 (bất quy tắc). Phủ định: S + didn't + V.",
    kw: "past simple quá khứ đơn đã xảy ra",
  },
  {
    q: "Present perfect là gì",
    a: "Hiện tại hoàn thành (Present Perfect): S + have/has + V3. Dùng cho việc vừa xảy ra còn liên quan hiện tại: I have lost my key (giờ vẫn chưa tìm).",
    kw: "present perfect hiện tại hoàn thành have has",
  },
  {
    q: "Tương lai will",
    a: "Tương lai đơn: S + will + V nguyên thể. Dùng cho dự đoán, lời hứa, quyết định tại chỗ. Phủ định: won't. Câu hỏi: Will + S + V?",
    kw: "will tương lai đơn sẽ future",
  },
  {
    q: "Mẹo luyện chính tả",
    a: "1) Viết mỗi từ 3 lần liên tiếp. 2) Look-Cover-Write-Check. 3) Đánh vần thành tiếng. 4) Chú ý lỗi hay sai: sai chính tả = 0 điểm ở Cambridge Writing.",
    kw: "chính tả spelling mẹo tips luyện viết",
  },
  {
    q: "Cách dùng on at in",
    a: "on + thứ/ngày (on Monday, on 5th May). at + giờ (at 8 o'clock, at night). in + buổi/tháng/năm (in the morning, in June, in 2026).",
    kw: "on at in giới từ thời gian preposition",
  },
  {
    q: "So sánh hơn",
    a: "Tính từ ngắn: adj + -er + than (taller than). Tính từ dài: more + adj + than (more beautiful than). Bất quy tắc: good → better, bad → worse.",
    kw: "so sánh hơn comparative -er more than",
  },
  {
    q: "So sánh nhất",
    a: "Tính từ ngắn: the + adj + -est (the tallest). Tính từ dài: the most + adj (the most beautiful). Bất quy tắc: good → the best, bad → the worst.",
    kw: "so sánh nhất superlative -est most the best",
  },
  {
    q: "Who where mệnh đề quan hệ",
    a: "who thay cho người: A teacher is a person who teaches. where thay cho nơi chốn: A library is a place where you read books.",
    kw: "who where mệnh đề quan hệ relative clause",
  },
  {
    q: "Can can't",
    a: "can + V nguyên thể: diễn tả khả năng. A bird can fly. A fish can't walk. Câu hỏi: Can + S + V? SAU can không thêm -s.",
    kw: "can can't khả năng ability",
  },
  {
    q: "Have got has got",
    a: "I/You/We/They + have got. He/She/It + has got. Phủ định: haven't got / hasn't got. Câu hỏi: Have you got...? Yes, I have.",
    kw: "have got has got sở hữu",
  },
  {
    q: "Tập đánh máy ở đâu",
    a: "Bé có thể tập đánh máy ngay trên trang Hỏi đáp này! Mỗi câu trả lời của cô Owly có phần «Thử thách đánh máy» — bé gõ lại câu tiếng Anh để luyện tay.",
    kw: "đánh máy typing tập gõ bàn phím keyboard",
  },
  {
    q: "Ứng dụng hoạt động offline không",
    a: "Phần RAG hỏi đáp và toàn bộ bài học hoạt động offline vì dữ liệu đã có sẵn trong app. Nếu ba mẹ cấu hình API key, Owly sẽ dùng thêm AI để trả lời phong phú hơn.",
    kw: "offline không cần mạng hoạt động",
  },
  {
    q: "Xin chào cô Owly",
    a: 'Chào bé! 🦉 Cô là Owly — cô cú thông thái. Bé hỏi cô bất cứ điều gì về tiếng Anh nhé! Ví dụ: "apple nghĩa là gì?" hoặc "cách dùng a an".',
    kw: "xin chào hello hi cô owly",
  },
  {
    q: "Cảm ơn cô",
    a: "Không có chi bé! 🦉 Keep learning, keep shining! ⭐ Bé hỏi tiếp cô nhé!",
    kw: "cảm ơn thank you thanks",
  },
];

function faqChunks(): Chunk[] {
  return faqEntries.map((f, i) => ({
    id: `faq-${i}`,
    text: `${f.q}? ${f.a}`,
    keywords: `${f.kw} ${f.q}`,
    source: { type: "faq" as const, label: f.q },
  }));
}

// ── Build full knowledge base ───────────────────────────────────────────

let _cachedKB: Chunk[] | null = null;

export function buildKnowledgeBase(): Chunk[] {
  if (_cachedKB) return _cachedKB;
  const chunks: Chunk[] = [];
  for (const lesson of lessons) {
    chunks.push(...lessonChunks(lesson));
  }
  chunks.push(...metaChunks());
  chunks.push(...faqChunks());
  _cachedKB = chunks;
  return chunks;
}

export const suggestedQuestions = [
  "Apple nghĩa là gì?",
  "Cách dùng a và an?",
  "Starters cần bao nhiêu từ vựng?",
  "Con mèo tiếng Anh là gì?",
  "Khi nào thêm s/es?",
  "Phonics là gì?",
  "Shadowing là gì?",
  "Bao nhiêu khiên là đạt?",
  "Đếm từ 1 đến 20?",
  "This và these khác nhau thế nào?",
  "Quá khứ của go là gì?",
  "Present simple là gì?",
  "So sánh hơn dùng thế nào?",
  "Can và can't khác gì nhau?",
  "Mẹo luyện chính tả?",
  "Thi Cambridge ở đâu?",
  "Đề thi Starters có mấy phần?",
  "Ngữ pháp Movers có gì mới?",
  "Từ vựng chủ đề Animals có những từ nào?",
  "Flyers cần học ngữ pháp gì?",
];
