# 🦉 Owly English — Tài liệu dự án (bản nâng cấp 08/2026)

Ứng dụng học tiếng Anh online cho bé 8–12 tuổi theo chuẩn **Cambridge YLE (Pre A1 Starters → A1 Movers → A2 Flyers)** tương đương khung **CEFR** và **Khung năng lực ngoại ngữ 6 bậc của Việt Nam**.

> 📚 **Nguồn dữ liệu chính thức:** Toàn bộ từ vựng, ngữ pháp, cấu trúc đề thi và chủ đề học trong app được trích xuất trực tiếp từ 7 file PDF chính thức của Cambridge (đã tải về 08/2026):
> - `506166-starters-movers-flyers-word-list-2025.pdf` — Wordlist cập nhật mới nhất
> - `357180-starters-movers-and-flyers-handbook-for-teachers-2024.pdf` — Handbook 2024 (cấu trúc đề, ngữ pháp, tiêu chí chấm)
> - `396158/396159/396160` — Picture Books Starters/Movers/Flyers (chủ đề + từ vựng theo tranh)
> - `young-learners-sample-papers-2018-vol1.pdf` + `423014-...-volume-2.pdf` — Đề thi mẫu chính thức

---

## 1. Kiến trúc & công nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Framework | TanStack Start (React 19, SSR) + Vite |
| Ngôn ngữ | TypeScript |
| UI | Tailwind CSS 4 + shadcn/ui (Radix) |
| Routing | TanStack Router (file-based, tự sinh `routeTree.gen.ts`) |
| Giọng nói | Web Speech API (SpeechSynthesis + SpeechRecognition) — chạy hoàn toàn trên trình duyệt, không cần API key |
| Video | YouTube embed (youtube-nocookie) |

### Cây thư mục chính

```
src/
├── data/curriculum.ts          ← TOÀN BỘ nội dung: bài học (lessons/*.ts), lộ trình, giáo trình,
│                                 link tải Cambridge, kênh YouTube (chỉnh nội dung ở 1 file duy nhất)
├── lib/speech.ts               ← Engine giọng nói: giọng Nữ/Nam bản địa, tốc độ Chậm/Vừa,
│                                 nhận diện giọng nói chấm phát âm (SpeakPractice)
├── components/
│   ├── SpeakButton.tsx         ← Nút loa dùng chung toàn app
│   ├── VoiceSettings.tsx       ← Bộ chọn giọng đọc (Cô giáo/Thầy giáo + Chậm/Vừa)
│   ├── VocabCard.tsx           ← Thẻ từ vựng lật nghĩa + đọc IPA
│   ├── ReadingBlock.tsx        ← Đoạn văn tô màu theo Chủ ngữ–Động từ–Tân ngữ–Trạng ngữ
│   └── practice/
│       ├── ListenPractice.tsx  ← Nghe 2 lần + nghe chậm, chọn đáp án
│       ├── SpeakPractice.tsx   ← Bé nói vào mic, app chấm % khớp
│       └── WritePractice.tsx   ← Chính tả theo tranh, kiểm tra từng chữ
└── routes/
    ├── index.tsx               ← Trang chủ
    ├── lo-trinh.tsx            ← Lộ trình 24–30 tháng + lịch học tuần
    ├── bai-hoc.index.tsx       ← Thư viện bài học theo cấp
    ├── bai-hoc.$slug.tsx       ← Trang bài học chi tiết (7 phần)
    ├── giao-trinh.tsx          ← MỚI: giáo trình chuẩn quốc tế + link tải Cambridge
    └── ba-me.tsx               ← Góc phụ huynh
```

## 2. Cấu trúc 1 bài học (khung 7 phần thống nhất)

1. **Từ vựng có hình** — thẻ emoji + IPA + nghĩa tiếng Việt (lật thẻ), nút đọc từng từ
2. **Video sinh động** — 1 video chính nhúng trong app + link video mở rộng (kênh chính thống)
3. **Ngữ pháp** — công thức khung màu + ghi chú lỗi hay sai + ví dụ Anh–Việt có nút nghe
4. **Đoạn văn rõ cấu trúc** — tô màu 4 thành phần câu, nghe từng câu / cả đoạn, xem/ẩn bản dịch
5. **🎧 Thực hành nghe** — nghe lần 1 / nghe chậm, chọn đáp án, chấm đúng–sai ngay
6. **🗣️ Thực hành nói** — nghe mẫu → bé nói vào micro → chấm % khớp (Chrome/Edge)
7. **✍️ Thực hành viết** — chính tả theo tranh + gợi ý, cảnh báo "sai chính tả = 0 điểm" đúng quy chế Cambridge

## 3. Giọng đọc (phát âm chậm, giọng người lớn bản địa)

- Bộ chọn toàn cục ở **thanh menu** và **đầu mỗi bài học**:
  - 👩‍🏫 **Cô giáo** — giọng nữ bản địa · 👨‍🏫 **Thầy giáo** — giọng nam bản địa
  - 🐢 **Chậm** (0.7×, mặc định cho bé) · 🚶 **Vừa** (0.9×)
  - Nút **"Nghe chậm"** trong bài tập luôn đọc 0.6×
- Lựa chọn lưu trong `localStorage` — đồng bộ mọi nút loa, giữ nguyên khi tắt máy.
- Engine tự quét voice tiếng Anh của hệ điều hành, ưu tiên: **giọng Natural/Neural → Google → en-GB → en-US**, và tự nhận diện nam/nữ theo tên voice.

> ⚠️ **Lưu ý kỹ thuật quan trọng:** Web Speech API dùng voice có sẵn của thiết bị nên chất lượng phụ thuộc trình duyệt:
> - **Tốt nhất: Microsoft Edge** — có sẵn giọng *Natural* (Microsoft Sonia/Ryan/Libby/Thomas…) rất giống người thật, đủ cả nam lẫn nữ.
> - **Chrome desktop** — giọng "Google UK English Female/Male", "Google US English" ổn.
> - **Safari (iPhone/Mac)** — giọng Samantha (nữ), Daniel (nam), có thể cài thêm voice trong Cài đặt → Trợ năng → Nội dung đọc.
> - Nếu muốn giọng AI studio (đúng độ tuổi 30–35, ổn định mọi thiết bị), nâng cấp sau bằng cách thu âm sẵn file MP3 (ElevenLabs/Azure TTS) và gắn vào `SpeakButton` — kiến trúc đã sẵn sàng để thay.

## 4. Giáo trình chuẩn quốc tế đi kèm (trang /giao-trinh)

### Tải miễn phí từ Cambridge (link trực tiếp, đã kiểm tra 08/2026)

| Tài liệu | Link |
| --- | --- |
| Wordlist 3 cấp (2018) | https://www.cambridgeenglish.org/Images/506166-starters-movers-flyers-word-list-2018.pdf |
| Wordlist bản mới nhất | https://www.cambridgeenglish.org/Images/506166-starters-movers-flyers-word-list-2025.pdf |
| Starters Picture Book | https://www.cambridgeenglish.org/Images/396158-yle-starters-word-list-picture-book-2018.pdf |
| Movers Picture Book | https://www.cambridgeenglish.org/images/396159-yle-movers-word-list-picture-book-2018.pdf |
| Flyers Picture Book | https://www.cambridgeenglish.org/images/396160-yle-flyers-word-list-picture-book-2018.pdf |
| Đề mẫu YLE Vol.1 (kèm audio) | https://www.cambridgeenglish.org/Images/young-learners-sample-papers-2018-vol1.pdf |
| Đề mẫu YLE Vol.2 (kèm audio) | https://www.cambridgeenglish.org/Images/423014-cambridge-english-young-learners-sample-papers-2018-volume-2.pdf |
| Handbook for Teachers 2024 | https://www.cambridgeenglish.org/Images/357180-starters-movers-and-flyers-handbook-for-teachers-2024.pdf |
| Audio & luyện thi Starters | https://www.cambridgeenglish.org/exams-and-tests/starters/preparation/ |
| Audio & luyện thi Movers | https://www.cambridgeenglish.org/exams-and-tests/movers/preparation/ |
| Audio & luyện thi Flyers | https://www.cambridgeenglish.org/exams-and-tests/flyers/preparation/ |

### Giáo trình chính (chọn 1 bộ)

| Bộ | NXB | Vai trò |
| --- | --- | --- |
| **Family and Friends** ⭐ | Oxford | Giáo trình chính khuyên dùng — bài học app bám theo bộ này |
| Kid's Box New Generation | Cambridge | Bám khung YLE nhất |
| Everybody Up | Oxford | Mạnh giao tiếp |
| Oxford Phonics World | Oxford | Giai đoạn 0 — phonics |
| Grammar Friends | Oxford | Bổ trợ ngữ pháp từ Movers |

### Sách luyện thi: Fun for Starters/Movers/Flyers (4th ed.) → Storyfun → Authentic Practice Tests 1–4 (Cambridge).

## 5. Chạy dự án

```bash
npm install        # hoặc: bun install
npm run dev        # dev server
npm run build      # build production
npm run preview    # xem bản build
```

## 6. Thêm bài học mới

Mở `src/data/curriculum.ts`, copy 1 object trong `lessons[]` và sửa: `slug` (duy nhất), `level`, `order`, nội dung 7 phần. Kiểm tra video YouTube còn sống trước khi thêm:

```bash
curl -s "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json" | head -c 200
```

Trang danh sách, route và "bài tiếp theo" tự cập nhật — không cần sửa file nào khác.

## 7. Dữ liệu chính thức từ Cambridge (củng cố 08/2026)

Toàn bộ dữ liệu trích từ 7 file PDF Cambridge đã được đưa vào `src/data/curriculum.ts`:

### 7.1. Cấu trúc đề thi chính xác (Handbook 2024, page 8)

| Cấp | Paper | Thời gian | Số câu | Số điểm |
| --- | --- | --- | --- | --- |
| **Starters** | Listening | ~20 phút | 20 | 20 |
| | Reading & Writing | 20 phút | 25 | 25 |
| | Speaking | 3–5 phút | 4 phần | — |
| **Movers** | Listening | ~25 phút | 25 | 25 |
| | Reading & Writing | 30 phút | 35 | 35 |
| | Speaking | 5–7 phút | 4 phần | — |
| **Flyers** | Listening | ~25 phút | 25 | 25 |
| | Reading & Writing | 40 phút | 44 | 48 |
| | Speaking | 7–9 phút | 4 phần | — |

→ Xem chi tiết từng Part trong `examStructures[]`.

### 7.2. Grammar & Structures List (Handbook 2024, pages 29/52/77)

| Cấp | Ngữ pháp mới |
| --- | --- |
| **Starters** | Present simple, Present continuous, Can (ability/request), Have got, a/an/the/some, This is/These are, Question words (Who/Where/How), Prepositions of place, ing as nouns |
| **Movers** | Past simple (regular+irregular), Comparatives/Superlatives, Must/mustn't, Have got to, Shall (offers), Could (past), Verb+inf, Verb+ing, Infinitive of purpose, Relative clauses (who/which/where), What's the matter?, How/What about+ing, When clauses, Be called, Be good at, I think/know |
| **Flyers** | Past continuous, Present perfect, Be going to, Will, May/Might, Should, Shall (suggestions), Could (possibility), Tag questions, If clauses (zero conditional), Where clauses, Before/after clauses, Be/look/sound/feel/taste/smell like, Make sb+adj, What time/What else, Be made of, See you soon/later |

→ Xem đầy đủ trong `grammarLists[]`.

### 7.3. Thematic Vocabulary Lists (Handbook 2024, pages 79–84)

17 chủ đề từ vựng theo từng cấp, trích trực tiếp từ handbook:

| Chủ đề | Starters | Movers (thêm) | Flyers (thêm) |
| --- | --- | --- | --- |
| Animals | 31 từ | 15 từ | 15 từ |
| Body & Face | 13 từ | 12 từ | 4 từ |
| Clothes | 18 từ | 5 từ | 17 từ |
| Colours | 13 từ | — | 6 từ |
| Family & Friends | 24 từ | 9 từ | 4 từ |
| Food & Drink | 47 từ | 20 từ | 23 từ |
| Health | 17 từ | 2 từ | 6 từ |
| The Home | 41 từ | 20 từ | 20 từ |
| Materials | 1 từ | 3 từ | 5 từ |
| Numbers | 1–20 | 21–100, 1st–20th | 101–1,000, 21st–31st |
| Places & Directions | 16 từ | 28 từ | 34 từ |
| Sports & Leisure | 57 từ | 39 từ | 47 từ |
| Time | 11 từ | 10 từ + days | 30 từ + months |
| Toys | 23 từ | 1 từ | — |
| Transport | 17 từ | 9 từ | 16 từ |
| Weather | 1 từ | 11 từ | 3 từ |
| Work | 14 từ | — | 28 từ |
| The World Around Us | 8 từ | 24 từ | 21 từ |

→ Xem đầy đủ trong `thematicVocabLists[]`.

### 7.4. Picture Book Topics (Cambridge Picture Books 2018)

Chủ đề học theo tranh, bám sát picture book chính thức:

- **Starters (9 chủ đề):** My body → At the zoo → At the clothes shop → My friend's birthday → My favourite food → At home → At school → At the beach → My street
- **Movers (8 chủ đề):** A favourite toy shop → The party → At the doctor's → Uncle Charlie's hotel → From the countryside to the jungle → The weather → Our town → Dreaming of holidays
- **Flyers (9 chủ đề):** Meet the Flyers → Autumn/Fall → Flyers fun day → Winter → Flyers party → Spring → Flyers adventure → Summer → Tomorrow is exam day

→ Xem đầy đủ trong `pictureBookTopics[]`.

### 7.5. Can Do Summary (Handbook 2024, pages 9–10)

Mô tả năng lực đạt được ở mỗi cấp, theo khung CEFR — xem `canDoStatements[]`.

### 7.6. Names & Numbers theo cấp (Wordlist 2025)

- **Starters:** 20 tên (Alex, Alice, Ann/Anna, Ben, Bill, Dan, Eva, Grace, Hugo, Jill, Kim, Lucy, Mark, Matt, May, Nick, Pat, Sam, Sue, Tom) + số 1–20
- **Movers:** 15 tên (Charlie, Clare, Daisy, Fred, Jack, Jane, Jim, Julia, Lily, Mary, Paul, Peter, Sally, Vicky, Zoe) + số 21–100, thứ tự 1st–20th
- **Flyers:** 16 tên (Betty, David, Emma, Frank, George, Harry, Helen, Holly, Katy, Michael, Oliver, Richard, Robert, Sarah, Sophia, William) + số 101–1,000, thứ tự 21st–31st

→ Xem trong `examNames[]`.

### 7.7. Màu dùng trong bài Colouring (Listening Part 4/5)

10 màu chính thức: black, blue, brown, green, grey, orange, pink, purple, red, yellow → `examColours[]`.
