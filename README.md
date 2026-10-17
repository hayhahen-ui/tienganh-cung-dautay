# 🦉 Owly English v2 — Học tiếng Anh online cho bé 8–12 tuổi

Lộ trình Cambridge YLE (Pre A1 Starters → A1 Movers → A2 Flyers). 24 bài học × 9 phần, 3 trò chơi + quiz mỗi bài, ôn từ theo nhắc lại ngắt quãng, XP – chuỗi ngày – huy hiệu, kiểm tra đầu vào, dashboard cho ba mẹ, chatbot "cô Owly" trả lời từ giáo trình.

## Chạy
```bash
bun install        # hoặc npm install
npm run dev        # http://localhost:5173
npm run build && npm run preview
npm run lint
```
Chatbot hoạt động offline (RAG cục bộ). Muốn bật AI: copy `.env.example` → `.env`, điền `VITE_OWLY_LLM_API_KEY`.

## Cấu trúc
```
src/
├── data/curriculum.ts        types + dữ liệu Cambridge; gộp bài học từ data/lessons/*
├── data/lessons/             core.ts (12 bài v1) · starters-2 · movers-2 · flyers-2
├── lib/progress.ts           XP, streak, sao, huy hiệu, SRS — localStorage
├── lib/speech.ts             TTS/ASR Web Speech API
├── lib/rag/                  BM25 + trigram + RRF, answerer, LLM client
├── components/games/         MatchGame · FillBlank · SentenceScramble · LessonQuiz
├── components/practice/      ListenPractice · SpeakPractice · WritePractice
└── routes/                   / · bai-hoc · bai-hoc.$slug · on-tap · kiem-tra · tien-do
                              hoi-dap · lo-trinh · giao-trinh · ba-me
```

## Thêm bài học
Thêm 1 object `Lesson` vào file cấp tương ứng trong `src/data/lessons/`. Số thứ tự, "bài tiếp theo", quiz, game, hộp ôn tập và chatbot đều tự cập nhật. Verify video:
```bash
curl -s "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json"
```

Xem `AUDIT.md` để biết các lỗi của v1 đã sửa và backlog. Chi tiết sư phạm/giọng đọc: `HUONG-DAN.md`.
