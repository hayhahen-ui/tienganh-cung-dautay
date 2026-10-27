import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TouchRead, type TouchLine } from "@/components/TouchRead";
import { VoiceSettings } from "@/components/VoiceSettings";

export const Route = createFileRoute("/doc-cham")({
  head: () => ({
    meta: [
      { title: "Đọc chạm — chạm vào đâu, đọc theo đó | Owly English" },
      {
        name: "description",
        content:
          "Bài đọc song ngữ chạm được: bé chạm vào từ nào, giọng đọc chạy từ đó trở đi, từ đang đọc sáng xanh theo giọng.",
      },
    ],
  }),
  component: TouchReadPage,
});

/**
 * Bài mẫu do app tự viết (trình độ A1) kèm bản dịch tiếng Việt và cảnh
 * minh họa theo câu — mô phỏng đúng bố cục video mẫu (song ngữ từng câu,
 * tranh đổi cảnh theo nội dung), nhưng KHÔNG lấy nguyên văn từ video.
 */
const SAMPLES: { title: string; lines: TouchLine[] }[] = [
  {
    title: "☀️ My Weekend",
    lines: [
      { en: "Hello everyone!", vi: "Xin chào mọi người!", scene: "👋 Chào hỏi" },
      { en: "On Saturday, I wake up late.", vi: "Vào thứ Bảy, mình dậy muộn.", scene: "🛏️ Buổi sáng" },
      { en: "I eat bread and drink milk for breakfast.", vi: "Mình ăn bánh mì và uống sữa cho bữa sáng.", scene: "🍳 Ăn sáng" },
      { en: "After breakfast, I play in the garden.", vi: "Sau bữa sáng, mình chơi trong vườn.", scene: "🌳 Ngoài vườn" },
      { en: "My dog runs and jumps happily.", vi: "Chú chó của mình chạy và nhảy vui vẻ.", scene: "🐶 Chú chó" },
      { en: "In the afternoon, I read a story book.", vi: "Buổi chiều, mình đọc một cuốn truyện.", scene: "📖 Đọc sách" },
      { en: "My favourite book is about a little cat.", vi: "Cuốn sách mình thích nhất kể về một chú mèo nhỏ.", scene: "🐱 Chú mèo" },
      { en: "In the evening, we watch a funny film together.", vi: "Buổi tối, cả nhà cùng xem một bộ phim hài.", scene: "🎬 Buổi tối" },
      { en: "I feel happy on weekends.", vi: "Mình cảm thấy vui vẻ vào cuối tuần.", scene: "😊 Cuối tuần vui vẻ" },
    ],
  },
  {
    title: "🏫 A Day at School",
    lines: [
      { en: "Tom goes to school in the morning.", vi: "Buổi sáng, Tom đi học." },
      { en: "He puts his books in his bag.", vi: "Cậu bỏ sách vào cặp." },
      { en: "At school, he sees his friends.", vi: "Ở trường, cậu gặp các bạn." },
      { en: "They sing a song and read a story.", vi: "Các bạn hát một bài và đọc một câu chuyện." },
      { en: "Tom likes English class.", vi: "Tom thích giờ học tiếng Anh." },
      { en: "His teacher is kind and funny.", vi: "Cô giáo của cậu hiền và vui tính." },
      { en: "At lunch, Tom eats rice and chicken.", vi: "Bữa trưa, Tom ăn cơm và gà." },
      { en: "After lunch, he plays football with his friends.", vi: "Sau bữa trưa, cậu chơi bóng đá với các bạn." },
      { en: "He runs fast and scores a goal.", vi: "Cậu chạy nhanh và ghi một bàn thắng." },
      { en: "Tom goes home happy in the afternoon.", vi: "Buổi chiều, Tom về nhà vui vẻ." },
    ],
  },
  {
    title: "🧺 My Family Picnic",
    lines: [
      { en: "On Sunday, my family goes to the park.", vi: "Vào Chủ nhật, gia đình mình đi công viên." },
      { en: "We take sandwiches, apples and water.", vi: "Nhà mình mang theo bánh mì kẹp, táo và nước." },
      { en: "My mum sits on a big mat.", vi: "Mẹ mình ngồi trên một tấm thảm lớn." },
      { en: "My dad flies a red kite.", vi: "Bố mình thả một con diều đỏ." },
      { en: "My little sister plays with a ball.", vi: "Em gái mình chơi với một quả bóng." },
      { en: "I see birds in the trees.", vi: "Mình thấy những chú chim trên cây." },
      { en: "We eat lunch and drink juice.", vi: "Cả nhà ăn trưa và uống nước trái cây." },
      { en: "After lunch, we walk around the lake.", vi: "Sau bữa trưa, cả nhà đi dạo quanh hồ." },
      { en: "The sun is warm and the sky is blue.", vi: "Nắng ấm và bầu trời xanh." },
      { en: "It is a wonderful day for my family.", vi: "Đó là một ngày tuyệt vời của gia đình mình." },
    ],
  },
];

/** Tách đoạn dán tay thành từng câu để hiển thị theo từng câu như bài mẫu. */
function splitSentences(text: string): TouchLine[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((en) => ({ en }));
}

function TouchReadPage() {
  const [sampleIdx, setSampleIdx] = useState(0);
  const [custom, setCustom] = useState("");
  const [activeLines, setActiveLines] = useState<TouchLine[]>(SAMPLES[0]!.lines);
  const [activeTitle, setActiveTitle] = useState(SAMPLES[0]!.title);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">👆 Đọc chạm — chạm vào đâu, đọc theo đó</h1>
      <p className="mt-2 text-muted-foreground">
        Theo đúng mẫu video "Book &amp; Audio": mỗi câu có dòng tiếng Việt ở trên, câu tiếng Anh
        đậm ở dưới. Giọng đọc chạy liên tục, từ đang đọc sáng xanh theo giọng. Bé chạm vào từ
        nào, giọng đọc nhảy ngay tới đó. Thử ngay bên dưới rồi cho cô Owly biết chỗ nào cần
        chỉnh nhé.
      </p>

      <div className="mt-4">
        <VoiceSettings />
      </div>

      {/* Chọn bài mẫu */}
      <div className="mt-6 flex flex-wrap gap-2">
        {SAMPLES.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => {
              setSampleIdx(i);
              setActiveLines(s.lines);
              setActiveTitle(s.title);
            }}
            className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-colors ${
              sampleIdx === i && activeTitle === s.title
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <TouchRead lines={activeLines} title={activeTitle} />
      </div>

      {/* Dán đoạn văn riêng */}
      <div className="mt-8 rounded-3xl border-2 border-dashed border-border bg-card p-4">
        <h2 className="font-display text-lg font-bold">✏️ Dán đoạn văn của bé vào đây</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Dán bất kỳ đoạn tiếng Anh nào (bài trong sách, đoạn cô giao...) rồi bấm "Dùng đoạn
          này" — app tự tách thành từng câu, bé chạm vào đâu cũng đọc được.
        </p>
        <textarea
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          rows={4}
          placeholder="Paste an English paragraph here..."
          className="mt-3 w-full rounded-2xl border-2 border-border bg-background p-3 text-base outline-none focus:border-primary"
        />
        <button
          type="button"
          disabled={custom.trim().length < 10}
          onClick={() => {
            setActiveLines(splitSentences(custom.trim()));
            setActiveTitle("✏️ Đoạn của bé");
          }}
          className="mt-3 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground disabled:opacity-40"
        >
          Dùng đoạn này
        </button>
      </div>
    </main>
  );
}
