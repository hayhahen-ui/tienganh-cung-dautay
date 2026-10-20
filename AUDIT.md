# 🔍 Audit dự án HOCTIENGANH (Owly English v1) → v2

Ngày audit: 17/10/2026 · Phạm vi: 107 file trong `HOCTIENGANH-main.zip` (đọc toàn bộ source, trừ 40 file shadcn/ui mặc định và lockfile).

## 1. Tổng quan kiến trúc v1

| Hạng mục | Nhận xét |
| --- | --- |
| Stack | Vite 8 + React 19 + TanStack Router (file-based) + Tailwind 4 + shadcn/ui. Thực tế là **SPA thuần** (main.tsx + createRoot) dù README/HUONG-DAN ghi "TanStack Start SSR". |
| Nội dung | 1 file `curriculum.ts` 2 028 dòng: 12 bài học (5 Starters / 4 Movers / 3 Flyers), dữ liệu Cambridge (cấu trúc đề, grammar list, wordlist theo chủ đề, picture-book topics, can-do), link tải, giáo trình, kênh YouTube. |
| Tính năng | Từ vựng flip-card + TTS, video YouTube, ngữ pháp, đoạn văn tô màu S-V-O-A, nghe/nói/viết, chatbot RAG (BM25 + trigram + RRF) có fallback LLM qua proxy Qwen. |
| Chất lượng | Build pass, nhưng `tsc --noEmit` **9 lỗi**; không có test; không có theo dõi tiến độ; không có game/quiz. |

## 2. Lỗi & vấn đề đã phát hiện (và trạng thái ở v2)

### 2.1 Bảo mật / an toàn trẻ em
| # | Vấn đề | File | v2 |
| --- | --- | --- | --- |
| S1 | `RichText` dùng `dangerouslySetInnerHTML` không escape → LLM hoặc câu bé gõ có thể chèn HTML/script (XSS). | AskOwly.tsx L372 | ✅ Thay bằng renderer React node (không innerHTML). |
| S2 | Không giới hạn độ dài input chat, không `aria-label`. | AskOwly.tsx | ✅ `maxLength=200`, thêm aria-label. |
| S3 | Serverless đọc API key từ biến `mrbit1` (tên cá nhân) — khó bảo trì. | api/ask-owly.js | ⚠️ Giữ nguyên để không gãy deploy hiện tại, nên đổi sang `OWLY_LLM_API_KEY`. |
| S4 | Chưa có lọc từ ngữ không phù hợp cho input/LLM output. | — | ⏳ Đề xuất backlog. |

### 2.2 Lỗi logic / code
| # | Vấn đề | File | v2 |
| --- | --- | --- | --- |
| B1 | Ternary chết: `corrective ? "🤖 X" : "🤖 X"` — câu trả lời RAG luôn bị LLM ghi đè. | AskOwly.tsx L133 | ✅ RAG tự tin → giữ RAG + nối giải thích AI; RAG fail → dùng AI. |
| B2 | `sort(() => Math.random() - 0.5)` — xáo trộn thiên lệch. | AskOwly.tsx L444 | ✅ Fisher–Yates (`lib/random.ts`). |
| B3 | Ký tự Trung Quốc rò vào chip gợi ý: `"Animals有哪些?"`. | rag/knowledge.ts L362 | ✅ Sửa. |
| B4 | `speakText` tiếng Anh lệch với bubble tiếng Việt (3 chỗ). | AskOwly, answerer.ts | ✅ Sửa. |
| B5 | 9 lỗi TypeScript: `env.VITE_*` vi phạm `noPropertyAccessFromIndexSignature`; `start.ts`/`server.ts` import `@tanstack/react-start` **không có trong package.json**. | vite.config.ts, src/start.ts, src/server.ts | ✅ Xóa 3 file SSR chết, sửa truy cập env. `tsc` sạch. |
| B6 | File trùng lặp: `llm-proxy-plugin.ts` là bản copy của plugin trong vite.config.ts; `router.tsx` không dùng; `lovable-error-reporting.ts`, `error-capture.ts`, `error-page.ts` chỉ phục vụ Lovable editor. | src/lib | ✅ Xóa. |
| B7 | `ListenPractice` cho chọn lại đáp án vô hạn → không chấm điểm được; đáp án đúng thường đứng đầu `options`. | practice/ListenPractice.tsx | ✅ Chỉ tính lần chọn đầu, xáo trộn options theo seed. |
| B8 | "Bài tiếp theo" dựa vào `order + 1` toàn cục → gãy khi thêm bài. | bai-hoc.$slug.tsx | ✅ Dựa vào index trong mảng đã sort; `order` được đánh lại tự động. |
| B9 | Link Cambridge lẫn `Images/` và `images/` (CDN phân biệt hoa thường). | curriculum.ts | ✅ Chuẩn hóa `Images/`. |
| B10 | Script `push-to-github.bat` dùng `git push --force` lên 2 repo, đường dẫn máy cá nhân `E:\AI\...`. | root | ✅ Loại khỏi v2 (nguy hiểm, không liên quan). |

### 2.3 Nội dung / sư phạm
| # | Vấn đề | v2 |
| --- | --- | --- |
| C1 | Bài *Colours & Numbers* hứa "8 màu, đếm 1–20" nhưng chỉ có 6 màu + 2 số. | ✅ Thêm pink, brown, three, ten; sửa summary. |
| C2 | Bài *My Body* dạy/kiểm tra `feet`, `teeth` nhưng vocab không có. | ✅ Thêm 2 từ. |
| C3 | Phân bố ngược: Starters 5 bài, Movers 4, Flyers 3 trong khi Flyers cần nhiều thời gian nhất. Tổng 12 bài quá ít so với mục tiêu 500–2 200 từ. | ✅ Thêm 12 bài → **24 bài (9/8/7)**, mỗi bài mới 10 từ, 4 nghe, 4 nói, 4 viết. |
| C4 | Mỗi bài chỉ 3 câu nghe/nói/viết, không có game, không quiz, không ôn tập → khó giữ động lực lứa 8–12. | ✅ 3 game + quiz 10 câu + flashcard SRS + XP/sao/streak/huy hiệu. |
| C5 | Không có đánh giá đầu vào → bé 11 tuổi cũng bắt đầu từ Starters bài 1. | ✅ Trang `/kiem-tra` 15 câu, xếp cấp + gợi ý bài đầu tiên. |
| C6 | Role tagging trong đoạn văn gán nhầm bổ ngữ (`red`, `worried`, `Mai`) thành "object". | ⚠️ Giữ (nhãn hiển thị là "Tân ngữ / bổ ngữ" nên vẫn đúng với bé); backlog thêm role `complement`. |
| C7 | Lỗi chính tả tiếng Việt "ngưới" (4 chỗ). | ✅ Sửa. |
| C8 | Định vị "6–12 tuổi" nhưng không có phonics/pre-reading cho bé 6–7. | ✅ Định vị lại **8–12 tuổi** (đúng với Starters→Flyers; bé 8 tuổi đã đọc được). |

### 2.4 RAG / chatbot
- `listenChunks` nhúng đáp án vào chunk → bé hỏi là lộ đáp án (⚠️ backlog).
- `grade()` ngưỡng cứng `0.008`, chỉ xem top-1 (⚠️ backlog: dùng khoảng cách top1–top2).
- Probe LLM khi mount gửi câu "hi" tốn quota (⚠️ backlog: dùng GET health-check đã có sẵn ở `api/ask-owly.js`).
- Knowledge base tự động index các bài mới → chatbot v2 trả lời được cả 24 bài.

## 3. Những gì v2 bổ sung

| Tính năng | File |
| --- | --- |
| Progress store (localStorage, sync tab): XP, streak, sao, huy hiệu, SRS SM-2 rút gọn, nhật ký ngày | `src/lib/progress.ts` |
| Trang bài học 9 phần có checklist tiến độ, nút "đã xong", mở khóa quiz | `src/routes/bai-hoc.$slug.tsx` |
| Game ghép hình–từ · điền chỗ trống (sinh từ ví dụ ngữ pháp + đoạn đọc) · xếp từ thành câu | `src/components/games/` |
| Quiz 10 câu trộn 5 dạng, seed ổn định, 0–3 sao | `games/LessonQuiz.tsx` |
| Ôn tập flashcard theo lịch nhắc lại ngắt quãng | `src/routes/on-tap.tsx` |
| Kiểm tra đầu vào 15 câu, xếp cấp Starters/Movers/Flyers | `src/routes/kiem-tra.tsx` |
| Dashboard tiến độ + báo cáo tuần cho ba mẹ + đổi tên/avatar + reset | `src/routes/tien-do.tsx` |
| Nav hiển thị XP · streak · số từ đến hạn | `components/SiteNav.tsx` |
| 12 bài học mới, mọi video đã verify qua YouTube oEmbed | `src/data/lessons/*-2.ts` |
| PWA manifest, `lang="vi"`, hiệu ứng confetti tôn trọng `prefers-reduced-motion` | `public/`, `styles.css` |

## 4. Kiểm chứng
- `tsc --noEmit`: 0 lỗi · `eslint .`: 0 lỗi (9 warning react-refresh của shadcn mặc định) · `vite build`: OK (483 kB JS / 152 kB gzip).
- Smoke test Chromium headless: 11 route render đúng; luồng học → XP cộng đúng (4 phần = 40 XP, nghe 4/4 = +20, game +15), từ vào hộp ôn tập (10 từ), kiểm tra đầu vào xếp cấp thành công, **0 lỗi console**.
- 27 video v1 + 33 video mới: tất cả HTTP 200 qua oEmbed.

## 5. Backlog đề xuất (ưu tiên giảm dần)
1. Tài khoản + đồng bộ cloud (Supabase) để học nhiều thiết bị; chế độ nhiều bé trong 1 nhà.
2. Lọc nội dung (profanity) cho chat + rate-limit `/api/ask-owly`; đổi tên biến env.
3. Audio thu sẵn (Azure/ElevenLabs) thay Web Speech cho giọng đồng nhất mọi thiết bị.
4. Đề thi thử Starters/Movers/Flyers theo đúng format từng Part (dữ liệu `examStructures` đã có).
5. Thêm 6–12 bài nữa để phủ hết 18 chủ đề wordlist; thêm phần Speaking Part 1–4 mô phỏng.
6. Unit test cho `progress.ts`, `buildQuiz`, `buildBlankQuestions`; e2e Playwright.

---

# 🔍 Audit bổ sung 19/10/2026 → commit `892c461`

## A. "📚 Giáo trình (AI chưa bật)" — đấu nối key API kiểu mt5-mrbit-2026 (BYOK)
**Nguyên nhân badge:** production `/api/ask-owly` trả `hasKey: false` — Vercel chưa hề
cấu hình `OWLY_LLM_API_KEY`, và client cũ chỉ nhìn key server.
**Fix:** ba mẹ dán key TRONG APP (nút ⚙️ ở trang Hỏi cô Owly) → lưu `localStorage`
(`owly-ai-key-v1`, xem `src/lib/rag/owlyKeys.ts` — chỉ hiện `••••abcd`) → gửi kèm
mỗi request; proxy (`api/_owly-proxy.js` dùng chung dev + Vercel) ưu tiên key user,
chỉ chuyển tiếp, **không lưu, không log**. Badge tự bật `🤖 AI + giáo trình` khi
máy này có key hoặc server có key (`isLlmOn()`).
- `src/lib/rag/owlyProviders.ts`: 6 provider, tự nhận diện từ tiền tố key.
- `AiKeySettings.tsx`: dialog nhập key + nút "Kiểm tra kết nối & lưu key"
  (proxy gọi `GET /models`, không tốn token chat) + link lấy key miễn phí
  (Groq/Gemini/OpenRouter).
- Lỗi tạm thời (mạng/quota) không còn tắt hẳn badge — chỉ hiện lỗi, key vẫn giữ.

## B. Bug proxy phát hiện khi audit
| # | Vấn đề | Fix |
|---|--------|-----|
| P1 | Provider `anthropic` (`sk-ant-`) bị gọi sai endpoint `…/v1/chat/completions` (không tồn tại) với auth Bearer → mọi key Claude đều lỗi | Dùng đúng Anthropic Messages API: `POST /v1/messages` + header `x-api-key` + `anthropic-version` |
| P2 | Logic proxy trùng lặp giữa `vite.config.ts` và `api/ask-owly.js` (đã từng gây lệch nhau) | Tách `api/_owly-proxy.js` dùng chung (+ `.d.ts`) |
| P3 | Proxy không giới hạn tần suất → key user đi qua proxy có thể bị lạm dụng | Rate-limit 30 req/phút/IP (backlog #2 đã xong 1 nửa) |

## C. Link chết trang Giáo trình (kiểm bằng curl 19/10/2026)
| # | Link cũ | Tình trạng | Link mới |
|---|---------|------------|----------|
| L1 | `Images/506166-…-word-list-2018.pdf` | **301 → file 2025** (nhãn "bản 2018" sai + trùng entry 2025) | Gộp thành 1 entry trỏ thẳng file 2025 |
| L2 | `…/fun-starters-movers-and-flyers-fourth-edition` | **404** | `https://www.cambridge.org/funfor` (verify 200) |
| L3 | `…/storyfun-starters-movers-and-flyers-2nd-edition` | **404** | `https://www.cambridge.org/storyfun` (verify 200) |
| L4 | `…/cambridge-english-young-learners-practice-tests` | **404** | `https://www.cambridge.org/practicetests` (short URL chính thức trong catalogue 2026) |

## D. Tích hợp Oxford Picture Dictionary theo cấp độ
- `src/data/oxfordPicture.ts`: **36 chủ đề** (12 🌱 Starters / 12 🌿 Movers / 12 🌳 Flyers),
  mỗi chủ đề 8–14 từ, gắn nhóm unit OPD.
- Trang Giáo trình thêm mục **🖼️ Từ vựng tranh Oxford theo cấp độ**: lọc theo cấp,
  bấm chủ đề mở từ vựng, bấm từng từ nghe phát âm (Web Speech).
- RAG: +36 chunk (`oxford-picture-*`) có gắn `level` → cô Owly trả lời được từ OPD.
- ⚠️ File PICTURE_OXFORD trên Google Drive **chưa chia sẻ công khai** (mở link ẩn danh
  bị chuyển về trang đăng nhập Google) → nội dung trên dựng từ cấu trúc chuẩn OPD;
  khi ba/mẹ mở chia sẻ link, sẽ merge đúng file gốc vào.

## Kiểm chứng
- `tsc --noEmit`: 0 lỗi · `eslint` (file đổi): 0 lỗi · `vite build`: OK.
- Unit logic proxy (node): user key ưu tiên > env > not-configured; rate-limit chặn
  đúng ở request 31; detect provider đúng 6/6 tiền tố.
- Dev server E2E: `GET /api/ask-owly` → `hasKey:false`; `POST validate` key giả →
  `{valid:false}` đúng định dạng; `POST` không key → `{mode:"not-configured"}`.
- RAG runtime: `buildKnowledgeBase()` → 670 chunk, trong đó 36 chunk OPD đủ 3 level.

## E. Fix "không dịch được" — cô Owly trả lời sai khi hỏi dịch Việt→Anh (19/10/2026, commit `e7fe137`)
**Hiện tượng (user báo, có ảnh chụp):** hỏi *"con bướm đậu trên bông hoa tiếng anh nghĩa là gì"*
→ cô trả lời *"Trong tiếng Anh, các thứ trong tuần (Monday, Tuesday...) luôn viết hoa…"* — sai hoàn toàn.
**Nguyên nhân (tái hiện local, xác nhận 3 lỗi):**
1. `detectDictionaryQuery` từ chối cụm > 4 từ → câu dịch cả câu không bao giờ vào từ điển.
2. Grader quá dễ dãi: ngưỡng 0.008 cho chunk FAQ "viết hoa thứ/ngày" (khớp nhờ đúng 2 từ
   chung "tiếng anh") qua mặt với score 0.0328 → trả lời tự tin sai (`corrective: false`).
3. (phụ) Bỏ dấu trước khi khớp khiến "đậu" nhầm thành "đầu" (head).
**Fix trong `src/lib/rag/answerer.ts`:**
- Intent mới **dịch Việt→Anh**: pattern `"…tiếng anh là gì"`, `"dịch … sang tiếng anh"`,
  `"…nói/viết sao"` → khớp tham lam cụm dài nhất qua map nghĩa Việt→entry (926 từ).
  Ưu tiên khớp **có dấu** trước ("đậu" ≠ "đầu"); chỉ bỏ dấu với từ bé gõ không dấu.
  Trả lời: từng từ + IPA + emoji + nút nghe + thử thách đánh máy.
- Grader cứng hơn: chunk top phải chứa ≥ 1 từ nội dung của câu hỏi (đã trừ khung
  câu hỏi + stop-word), nếu không → `corrective` để LLM (khi bật) trả lời thẳng.
- Từ điển: `teacher` thêm alias "thầy giáo, cô giáo" (sửa cả `dictionary.ts` và
  `lessons/starters-2.ts` vì entry bài học được dedupe ưu tiên).
**Kiểm chứng:** câu lỗi → butterfly/on/flower đúng; 8 câu hồi quy
(hello, dog, "cách dùng a an", "present simple là gì", "màu đỏ…", xyzabc…) giữ nguyên
hành vi; `tsc` 0 lỗi, `eslint` 0 lỗi, `vite build` OK.

## F. Chuyển frontend lên Render — Vercel chạm trần 100 deploys/ngày (19/10/2026, commit `b8c4e2a`)
**Hiện tượng:** Vercel báo `Resource is limited - try again in 24 hours (more than 100,
code: "api-deployments-free-per-day")` — deploy thủ công lẫn tự động đều đứng.
**Hướng xử lý (giống mt5-mrbit-2026):** frontend → **Render Static Site** (không giới
hạn deploy/ngày, free không ngủ), Vercel giữ làm **API backend** (`/api/ask-owly`).
- `render.yaml` mới: build `npm install && npm run build`, publish `dist`,
  rewrite SPA `/* → /index.html`, env `VITE_OWLY_API_URL=https://tienganh-cung-dautay.vercel.app`.
- `src/lib/rag/ask-server.ts`: API base đọc từ `VITE_OWLY_API_URL` (build-time);
  bỏ trống = gọi cùng origin như cũ (không vỡ dev/Vercel).
- `api/_owly-proxy.js` + `api/ask-owly.js`: mở CORS `*` (GET/POST/OPTIONS) cho
  frontend Render gọi API Vercel. API không dùng cookie nên `*` an toàn.
**Lưu ý:** key AI và XP trong localStorage tính theo origin → sang domain Render phải
dán key lại 1 lần. Deploy Vercel mang CORS headers sẽ tự chạy sau khi hết trần 24h
(nếu Vercel không tự retry, bấm Redeploy tay trên commit mới nhất).

## G. Groq khai tử llama-3.3-70b-versatile — chat AI lỗi 404 model_not_found (19/10/2026, commit `ef3acbf`)
**Hiện tượng:** user dán key Groq (hợp lệ) nhưng chat báo
`HTTP 404: {"error":{"message":"The model 'llama-3.3-70b-versatile' does not exist..."}}`.
**Nguyên nhân:** Groq ngừng phục vụ llama-3.3-70b-versatile cho gói Free/Developer từ
16/08/2026 (chỉ còn Enterprise) — API trả 404 model_not_found cho key thường.
**Fix trong `api/_owly-proxy.js`:**
- Model mặc định Groq → `openai/gpt-oss-20b` (model thay thế chính thức Groq khuyến nghị)
  + `fallbackModel: "openai/gpt-oss-120b"`.
- `callChat` tách thành `singleChatAttempt`; gặp lỗi model_not_found tự thử model dự
  phòng 1 lần, lỗi khác (401/429) không retry; hết cách → thông báo tiếng Việt thân
  thiện thay vì JSON thô.
- Test Node 3 kịch bản pass (retry fallback OK / lỗi thân thiện / 401 không retry).
**Kiểm chứng production:** POST key giả lên API Vercel → trả 401 invalid_api_key
(thay vì 404 model_not_found) = model mới đã live.

## H. Chuyển API sang Cloudflare Workers — bỏ phụ thuộc Vercel (20/10/2026)
**Lý do:** user yêu cầu "không phụ thuộc vào việc deploy Vercel, chỉ cần deploy
Render là chạy". Vercel free chạm trần 100 deploys/ngày liên tục trong ngày 19/10,
API kẹt theo.
**Triển khai:**
- `worker/ask-owly-worker.js` mới: Cloudflare Worker dùng chung logic
  `api/_owly-proxy.js` (resolveConfig/callChat/validateKey/checkRateLimit) —
  key user chỉ chuyển tiếp, không lưu/log. API tương thích 1:1 với bản Vercel
  (GET health, POST validate, POST chat, CORS *, rate-limit 30 req/phút/IP).
- `wrangler.toml`: deploy bằng Cloudflare dashboard → Workers & Pages → Connect Git.
- Test Node 5 kịch bản pass (OPTIONS/CORS, GET health, validate key giả → 401,
  chat không key → not-configured, chat key giả → 401 và KHÔNG còn model_not_found).
- `render.yaml`: VITE_OWLY_API_URL trỏ sang worker (đổi URL thật sau khi user deploy).
**Sau khi user deploy worker:** đổi VITE_OWLY_API_URL trong Render dashboard →
Environment → rebuild. Vercel giữ nguyên trong repo nhưng không còn dùng.
