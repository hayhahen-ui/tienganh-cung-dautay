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

## I. Đấu nối LarpRouter — model DeepSeek V4.1 Flash free (20/10/2026)
**Yêu cầu:** user tạo key LarpRouter (`lrsk_…`), muốn dùng model `deepseek-v4.1-flash`
(free tier) trong app.
**Triển khai:**
- `api/_owly-proxy.js`: thêm provider `larprouter` (test `lrsk_`, base
  `https://larprouter.com/v1`, model `deepseek-v4.1-flash`, fallback `glm-5.3-flash`)
  đặt TRƯỚC catch-all dashscope. OpenAI-compatible, auth Bearer.
- `src/lib/rag/owlyProviders.ts`: thêm meta LarpRouter (đứng đầu danh sách gợi ý),
  sửa `detectOwlyProvider` (cập nhật toàn bộ index), sửa defaultModel Groq cũ
  `llama-3.3-70b-versatile` → `openai/gpt-oss-20b`.
- `src/components/AiKeySettings.tsx`: thêm larprouter vào mục "Lấy key miễn phí ở đâu?".
**Test:** Node — resolveConfig `lrsk_` → đúng base/model; gọi thật validate/chat với
key giả → LarpRouter trả 401 (đúng endpoint + auth format). detectOwlyProvider đúng
cả 7 loại key. TSC/lint/build pass.

## J. Fix tiền tố key LarpRouter: lrsk- (gạch ngang), không phải lrsk_ (20/10/2026, commit `19e2dd9`)
**Hiện tượng:** user dán key LarpRouter (`lrsk-72c0d40…` trong ảnh dashboard) nhưng UI
nhận diện thành "Alibaba Qwen (DashScope)" → bấm Kiểm tra kết nối → 401
"Incorrect API key" từ Alibaba.
**Nguyên nhân:** code test tiền tố `lrsk_` (gạch dưới) trong khi key thật của
LarpRouter dùng `lrsk-` (gạch ngang) → không khớp provider nào → rớt về catch-all
dashscope ở cả frontend (detectOwlyProvider) lẫn proxy (resolveConfig).
**Fix:** chấp nhận cả `lrsk-` và `lrsk_` ở `api/_owly-proxy.js` và
`src/lib/rag/owlyProviders.ts`. Test lại bằng đúng định dạng key thật: detect
đúng larprouter, validate gọi đúng LarpRouter. Vercel deploy xong, verify production.
**Bài học:** khi test tiền tố key, dùng ĐÚNG định dạng trong ảnh/tài liệu của nhà
cung cấp, đừng tự đoán gạch ngang/gạch dưới.

## K. Dịch Việt→Anh: AI phải luôn ghép thành 1 câu hoàn chỉnh (20/10/2026)
**Hiện tượng:** cùng câu hỏi dịch, câu trên AI ghép thành câu hoàn chỉnh
("The butterfly is on the flower."), câu dưới mục "Cô Owly giải thích thêm" TRỐNG.
Kèm 2 lỗi phụ: "anh" trong "tiếng anh" bị dịch thành brother; "anh trai" bị tách
thành brother + son.
**Nguyên nhân:**
1. Model (DeepSeek qua LarpRouter) đôi lúc trả 200 nhưng nội dung rỗng; app in
   header "giải thích thêm" vô điều kiện. Prompt gửi AI cũng không hề yêu cầu
   ghép câu — câu trên ghép được là do model tự suy.
2. `detectTranslationQuery` giữ "tiếng anh" trong cụm cần dịch ("học tiếng anh
   rất vui") → từ "anh" khớp form "anh" (tách từ "anh/em trai") → brother.
3. Entry brother chỉ có form "anh"/"em trai", không có "anh trai" → greedy khớp
   "anh" trước, thừa "trai" → son. (Chú ý: dictionary() ưu tiên lesson entries —
   phải sửa ở lessons/core.ts, sửa wordlist không ăn.)
**Fix:**
- `answerer.ts`: `stripLangMarker()` bỏ "tiếng anh"/"tieng anh" khỏi cụm dịch.
- `dictionary.ts` + `lessons/core.ts`: vi brother → "anh trai, anh/em trai"
  (forms gồm cả "anh trai" 2 từ → khớp trước).
- `api/_owly-proxy.js`: SYSTEM_PROMPT thêm luật dịch → luôn ghép 1 câu hoàn chỉnh;
  `callChat` gặp response rỗng tự thử model dự phòng.
- `AskOwly.tsx`: câu hỏi dịch ≥2 từ → gửi kèm lệnh bắt buộc ghép câu + danh sách
  từ đã dịch; AI trả rỗng → thử lại 1 lần; vẫn rỗng → giữ đáp án giáo trình,
  KHÔNG in header trống.
**Test:** esbuild chạy 3 câu thật — hits đúng hết (không còn brother lạc, "anh trai"
là 1 hit); mock callChat: model chính rỗng → fallback trả câu đầy đủ. TSC/lint/build OK.

## L. Đọc cả câu phải liền mạch (20/10/2026)
**Hiện tượng:** nút "Đọc hết" trong SpeakWords đọc từng từ riêng lẻ (mỗi từ 1
utterance + setTimeout) → nghe rời rạc, ngắt nghỉ giữa từng từ, không giống
người bản địa.
**Fix:**
- `AskOwly.tsx` `SpeakWords.speakAll()`: dựng lại câu tự nhiên (gắn dấu câu
  sát từ) và đọc TRỌN CÂU bằng 1 utterance duy nhất qua `speak()` → ngữ điệu
  liền mạch. Highlight từng từ chuyển sang `boundary` event (progressive
  enhancement — voice không hỗ trợ thì vẫn đọc liền, chỉ không highlight).
  Nút đổi nhãn "Đọc cả câu"; playId chống callback của lượt đọc cũ ghi đè UI.
- `speech.ts`: `speak()` thêm opts `onBoundary`/`onEnd` (onerror cũng map về
  onEnd để reset UI) + export `stopSpeaking()`.
- Bấm từng từ riêng lẻ giữ nguyên (đó là tính năng học phát âm 1 từ).
**Test:** TSC/lint/build OK. (Audio cần test tai nghe trên production.)

## M. Dịch nguyên câu phải đầy đủ và tự nhiên (20/10/2026)
**Hiện tượng:** câu "học tiếng anh rất vui, vì bé có cú thông thái hỗ trợ"
từ điển chỉ dịch được 2 từ (study, pleased) nhưng vẫn đề "Trong tiếng Anh:"
như thể đó là bản dịch; AI bị lệnh cũ "ghép câu từ các từ đã dịch" trói nên
dịch "I am pleased to study English." — BỎ MẤT cả mệnh đề sau.
**Fix:**
- `AskOwly.tsx`: lệnh AI đổi thành "dịch TOÀN BỘ câu, từ điển chỉ là GỢI Ý
  tham khảo (không bị giới hạn), dịch hết từng mệnh đề, chọn từ theo ngữ cảnh
  tự nhiên"; header AI khi dịch → "🤖 Cô Owly dịch cả câu:".
- `api/_owly-proxy.js`: SYSTEM_PROMPT luật dịch cùng tinh thần (vd "học tiếng
  Anh rất vui" → "Learning English is very fun").
- `answerer.ts`: translationAnswer thêm độ phủ (matched/total < 0.6 → header
  "🌱 Một số từ trong câu của bé:" thay vì mạo danh bản dịch). Bỏ
  stripLangMarker (nó cắt mất chữ "English" — nội dung dịch thật).
- Từ điển bổ sung: English (tiếng Anh — greedy 2 từ thắng form "anh" đơn lẻ,
  hết khớp nhầm brother), owl (con cú), very, help (giúp đỡ, hỗ trợ), wise
  (thông thái); lessons/core.ts: because thêm form "vì".
**Test:** esbuild 3 câu thật — câu trong ảnh 10/11 từ (study, English, very,
pleased, because, owl, wise, help); 2 câu cũ không đổi/không hồi quy. TSC/lint/build OK.

## N. Bản thương mại: tài khoản + phân quyền + tiến độ theo user (20/10/2026)
**Yêu cầu:** web bán hàng — admin + 5 user; admin quản lý toàn diện user
(tạo/xóa/đặt lại mật khẩu/xem tiến độ); user chỉ đổi MK của mình + đổi tên bé
+ học với tiến độ lưu riêng; khách chưa đăng nhập chỉ thấy tiêu đề, nội dung khóa.
**Kiến trúc:** Supabase mới (Auth + Postgres). Không tự đăng ký public — chỉ admin tạo.
- `supabase/schema.sql`: bảng profiles (id→auth.users, role, kid_name) + progress
  (user_id PK, data JSONB, updated_at); RLS qua hàm is_admin() SECURITY DEFINER
  (tránh đệ quy); admin đọc all, user chỉ của mình.
- `src/lib/auth.ts`: Supabase client (VITE_ env), module-store session/profile,
  signIn/signOut/changeMyPassword/updateMyKidName, adminApi (JWT) + publicApi
  (cho /setup, không JWT). Không env → configured=false, app mở như cũ + banner.
- `src/lib/progressSync.ts`: cloud = bản gốc, local = cache; pull/push
  last-write-wins theo updated_at (debounce 6s); logout → flush rồi reset local.
  progress.ts thêm replaceProgress().
- `api/admin-users.js`: service_role CHỈ ở server. Actions: status (public),
  bootstrap (token OWLY_SETUP_TOKEN + chưa setup lần nào → tạo admin theo
  email/MK user nhập + N user với mật khẩu ngẫu nhiên trả 1 lần),
  list/create/resetPassword/updateUser/deleteUser/progress (JWT admin).
  resetPassword/deleteUser chặn thao tác lên chính mình.
- Routes: /dang-nhap, /setup (tự khóa sau khi xong), /admin (bảng user +
  tạo/xóa/đổi MK/sửa tên bé/xem tiến độ), /tai-khoan (đổi tên bé, đổi MK mình,
  xem tiến độ, đăng xuất). AuthGate trong __root: khách thấy tiêu đề + khóa 🔒;
  /admin chỉ admin. SiteNav: nút đăng nhập/tên bé/🛠️ theo role.
- Mật khẩu: KHÔNG bao giờ qua chat — admin nhập trong form (HTTPS), mật khẩu
  tạm sinh ngẫu nhiên hiện 1 lần trên màn hình setup/admin.
**Test:** TSC/lint/build OK (routeTree regen ở build). E2E cần Supabase thật —
chờ anh chạy SETUP-BAN-HANG.md (7 bước).

## O. Cách ly Owly trong project dùng chung (20/10/2026, free plan)
**Vấn đề:** free plan không tạo project Supabase mới được; project sẵn có là DB
production của QuetDoc (directives, master_orders, packing_ranges, records).
Nguy cơ: auth dùng chung → tài khoản 2 app lẫn nhau; thao tác nhầm chạm dữ liệu xưởng.
**Fix (không cần project mới):**
- Bảng đổi tên có tiền tố: `owly_profiles`, `owly_progress` (schema.sql tự dọn 2
  bảng cũ CHỈ khi trống + đúng cột của Owly; KHÔNG CHẠM 4 bảng QuetDoc).
- AuthGate: session mà không có owly_profiles → trang chặn "Không phải tài khoản
  Owly" + nút đăng xuất (nhân viên quét tem không vào được).
- progressSync: không có profile → bỏ qua push/pull (tránh vi phạm FK).
- Admin API: list/delete/reset chỉ thao tác trên user có dòng trong owly_profiles.
**Test:** TSC/lint/build OK. (Schema mới cần anh Run lại 1 lần trong SQL Editor.)

## P. Sự cố SQL trên DB QuetDoc + khôi phục (20/10/2026)
**Diễn biến:** free plan không tạo project mới → anh dùng project sẵn có = DB
production của **QuetDoc** (cdxoaoemnidwuzentxrc). Project này ĐÃ có bảng
`profiles` (id/username/role của nhân viên quét tem) + function `is_admin()`
của QuetDoc. Lần Run đầu: create-table bị bỏ qua (đã có), `create or replace
is_admin()` GHI ĐÈ function của QuetDoc (cùng logic role='admin' nên phân quyền
không đổi) + thêm policy `profiles_own`, `profiles_admin_all` + 2 index lên
profiles QuetDoc + tạo bảng `progress` (Owly). Lần Run 2 lỗi `2BP01` (không drop
được is_admin vì policies của records/directives/master_orders/packing_ranges
phụ thuộc) → dừng, chưa tạo bảng owly_*.
**Xác minh:** profiles QuetDoc còn nguyên 6 tài khoản (count = 6); không lệnh
DML nào chạm dữ liệu; is_admin bản bị ghi đè có logic HỆT bản gốc (đối chiếu
`quetdoc-Qrcode/docs/supabase-setup.sql` dòng 30).
**Khôi phục (schema.sql bản mới):** tạo lại is_admin đúng nguyên bản (kèm
`stable`); drop 2 policy + 2 index thừa; drop bảng progress CHỈ khi trống +
có cột data (của Owly); tạo `owly_profiles`/`owly_progress` + hàm riêng
`owly_is_admin()` + policy owly_*. Bài học: trước khi chạy DDL trên DB lạ, PHẢI
kiểm kê bảng/function sẵn có — tên generic (profiles/progress/is_admin) rất
dễ trùng app khác.

## Q. Sự cố ENOTFOUND khi đấu nối Admin API Render (20/10/2026)
**Triệu chứng:** service Render `owly-admin-api` gọi Supabase báo
`TypeError: fetch failed`, cause `ENOTFOUND`. Endpoint `/diag` tạm thời cho thấy
env đủ 4 biến, host trông "đúng" — nhưng tra Google DNS-over-HTTPS: tên
`cdxoaoemnidwuzentxc.supabase.co` trả **NXDOMAIN** toàn cục.
**Nguyên nhân gốc:** ref thật của project là `cdxoaoemnidwuzentxrc` (21 ký tự,
có chữ "r" cuối) — bằng chứng: URL Supabase ngay trong code QuetDoc đang chạy
production. Assistant đọc thiếu chữ "r" từ ảnh chụp dashboard rồi đưa URL sai
(`...zentxc`) cho user dán vào env ở cả 3 nơi (Render frontend, Vercel, service
Render). Key hoàn toàn đúng — chỉ sai host. Sửa env thêm "r" → `/diag` 200 cả
hai đường, `status` trả `{ok:true, setupDone:false}`. `/diag` đã gỡ sau khi
thông. **Bài học:** KHÔNG chép ref/host từ ảnh chụp màn hình — luôn đối chiếu
URL trong code đang chạy production hoặc copy trực tiếp từ trang Settings →
Project URL; khi gặp ENOTFOUND, tra DNS-over-HTTPS để phân biệt "host không
tồn tại" với "mạng bị chặn".

## §R — Đấu nối sách gốc Oxford Picture Dictionary (20/10/2026)

**Nguồn:** user cung cấp file `PICTURE_OXFORD.pdf` qua Google Drive (47,5MB,
238 trang, bản scan Image2PDF 2009, KHÔNG có lớp chữ). Sách: *The Oxford
Picture Dictionary*, bản Anh–Việt (Shapiro & Adelson-Goldstein, Oxford
University Press) — 12 units, 128 chủ đề, 3.700+ từ; PDF page = book page + 10.

**Phương pháp:** render đúng độ phân giải gốc 200 DPI (bản scan 200ppi —
render 300 DPI chỉ tốn gấp đôi thời gian, không thêm thông tin) → OCR
Tesseract 5.3.4 `eng+vie`, xuất cả bản chữ (txt) và bản tọa độ (TSV). Hai
parser độc lập (v1 theo dòng, v2 theo từ/ô tọa độ) → hợp nhất, ưu tiên v2,
lọc rác (EN chứa neo thứ hai/dấu Việt, VI dính đuôi). Khung chủ đề lấy từ
Mục lục sách (trang sách + tiêu đề Anh–Việt chuẩn). Chỉ trích DỮ LIỆU TỪ
VỰNG (cặp Anh–Việt + chủ đề + số trang) — không sao chép hình minh hoạ hay
văn bản dài của sách. Script nằm ở `research/oxford-source/` (PDF/ảnh/OCR
KHÔNG đưa lên Git — chỉ giữ ở máy).

**Kết quả:** `src/data/oxfordBook.ts` — **2.245 cặp Anh–Việt, 116/128 chủ
đề**. 12 chủ đề trống đều là trang bản đồ/tranh toàn cảnh (A Classroom,
Geography, The World, The Universe, The Beach...) — chữ in đè lên tranh
nên OCR không tách cặp tin cậy được; thà thiếu còn hơn sai nghĩa cho trẻ.
~1% mục còn lỗi gộp nhẹ của OCR (vd đuôi nghĩa dính từ mục kề). Trang Verb
Guide (170–172) là bảng tham khảo, không phải từ vựng chủ đề — không đưa vào.

**Đấu nối:** `knowledge.ts` thêm 116 chunk `oxford-book-<slug>` (nội dung
"en = vi", keywords chứa mọi từ Anh + Việt, nhãn nguồn có số trang sách).
Kiểm chứng: `tsc` sạch, `npm run build` OK; test truy xuất (esbuild +
retriever thật): "crosswalk nghĩa là gì" → chunk sách #1, "detergent là gì"
→ #1, "hoa trạng nguyên tiếng Anh là gì" → #1, "poinsettia tiếng Việt là
gì" → #4 (vẫn trong cửa sổ top-5 mà AskOwly dùng; các chunk FAQ chung
chiếm hạng đầu vì khớp token "tiếng việt").

**Bổ sung §R (chiều 20/10):** theo yêu cầu user, dữ liệu sách còn được đưa
thẳng lên trang Giáo trình — component `OxfordBookSection`: duyệt 12 units /
116 chủ đề (mỗi thẻ ghi số trang sách), bấm mở xem cặp Anh–Việt + nghe phát
âm từng từ, ô tra cứu toàn từ điển không cần gõ dấu (trần 60 kết quả).

## §S — Phân cấp YLE + ảnh thật cho từ điển Oxford (20/10/2026)

**Phân cấp 116 chủ đề → Starters 36 · Movers 44 · Flyers 36** (`levels.json`,
sinh lại `oxfordBook.ts` bằng `gen_ts.py`; chunk RAG kèm trường `level`):
1. *Neo*: trùng chủ đề với 36 chủ đề Oxford thiếu nhi đã phân cấp
   (`oxfordPicture.ts`) → thừa hưởng (Jobs=Movers, Technology=Flyers...).
2. *Phiếu từ vựng*: mỗi mục từ đối chiếu `yleDictionary` 883 từ Cambridge có
   gắn cấp (khử số nhiều khi khớp) → cấp đa số, yêu cầu độ phủ ≥22%.
3. *Hiệu chỉnh tay* 56 ca (thematic-manual + override-anchor) cho chủ đề ít
   từ YLE hoặc phiếu bị nhiễu bởi từ đơn giản — vd Jobs→Movers,
   Job Search/Government→Flyers, Calendar→Starters, Hospital/Clinics→Movers
   (neo At the Doctor). Mọi ca đều truy vết được cơ sở trong `levels.json`.

**Ảnh minh hoạ — ẢNH CHỤP THẬT 116/116 chủ đề** từ Wikimedia Commons
(Openverse API bị Cloudflare chặn bot nên dùng Commons): tiêu chí chọn =
JPEG ≥1024px, ưu tiên có **EXIF máy ảnh** (104/116 có EXIF; còn lại là ảnh
tư liệu Commons chọn tay theo tiêu đề), loại tranh vẽ/poster/logo bằng bộ
lọc tiêu đề. Toàn bộ 116 ảnh đã được người soát (qua bảng ảnh tổng) rà bằng
mắt 2 vòng: thay ~45 ảnh sai nội dung/không phù hợp trẻ em (vd Family từng
trúng ảnh biểu tình, Studying từng trúng ảnh bảo tàng chiến tranh — đã thay
bằng ảnh gia đình 1972 và bé đọc sách). Mỗi ảnh hiển thị kèm tác giả +
giấy phép (CC/PD) + link trang Commons. Script: `fetch_images.py`
(`research/oxford-source/`, không lên Git cùng PDF/OCR).

**UI**: `OxfordBookSection` thêm bộ lọc Cấp độ (kết hợp bộ lọc Unit), thẻ
chủ đề có ảnh bìa + huy hiệu cấp + ghi nguồn ảnh; kết quả tra cứu cũng hiện
huy hiệu cấp. Kiểm chứng: tsc sạch, build OK, retriever test — "crosswalk"
→ chunk sách #1 (level movers), "từ vựng starters về gia đình" → chunk
Family #2 (level starters).

## §T — Đấu nối Novita AI: chat + giọng đọc AI nam/nữ (22/10/2026)

**Yêu cầu của user:** key Novita dùng cho dịch/tra cứu và QUAN TRỌNG NHẤT là
giọng đọc chuẩn rõ — trên điện thoại giọng máy chỉ có 1 giọng nữ, không có
giọng nam, khó nghe. Kèm file zip Voice-Pro (ABUS) tổng hợp các engine/giọng
TTS để audit + kaizen.

**Audit Voice-Pro (zip 17,8MB):** app Gradio đa engine (Edge-TTS, Azure,
Kokoro, CosyVoice, F5-TTS, RVC) — không nhúng được vào web app, nhưng BỘ
SƯU TẬP GIỌNG của nó là tài sản dùng lại được: `abus_voice_ms.py` liệt kê
giọng MS theo tên + giới tính (en-US 8 nữ/9 nam..., vi-VN HoaiMy nữ /
NamMinh nam), `abus_voice_kokoro.py` tương tự cho Kokoro. Kaizen áp dụng:
danh mục giọng của Owly nay cũng theo chuẩn "tên nhân vật + giới tính +
phong cách" để bé/ba mẹ chọn (xem ttsCloud.ts).

**Kiểm chứng Novita bằng key thật (không lưu key vào code/repo):**
- `GET /openai/v1/models` + `/v3/openai/models` → 200, 96 model (key HỢP LỆ).
- TTS đúng endpoint tài liệu chính thức Novita: `POST /v3/minimax-speech-02-hd`
  (MiniMax Speech-02-HD, đồng bộ, trả hex mp3; 17 giọng hệ thống có cả nam/nữ).
- CẢ TTS lẫn chat đều trả `403 NOT_ENOUGH_BALANCE` — tài khoản $0.0000
  (khớp ảnh console user gửi). Code hoàn thiện sẵn; user nạp credit là chạy.

**Đã đấu nối:**
- Proxy chat: provider `novita` (key `sk_` gạch dưới — phân biệt OpenAI
  `sk-`; đặt trước openai), base `api.novita.ai/openai/v1`, model
  deepseek-v4.1-flash-1017 + fallback glm-5.3-flash. Nhận diện FE khớp 7/7 ca test.
- `api/tts.js` + `api/_tts-core.js` (+ route dev trong vite.config): POST
  {text≤600, voiceId (whitelist 17 giọng), speed, lang en/vi} → audio/mpeg
  32kHz; lỗi balance → HTTP 402 reason "balance". Unit test handler 3/3
  (key sai 400, hết tiền 402, thành công 200 đúng bytes).
- FE: `src/lib/ttsCloud.ts` — 8 giọng tuyển (4 nữ: Cô Emily/Lily/Anna/Mary;
  4 nam: Thầy Ben/Jack/Tom/David), cache blob 30 mục (đỡ tốn credit), tự
  nhận diện câu tiếng Việt → language_boost Vietnamese, trạng thái TTS
  (balance/auth/ok) cho UI. `speech.ts`: speak() ưu tiên giọng AI, lỗi thì
  rơi về giọng máy; karaoke (onBoundary) giữ giọng máy để highlight chuẩn;
  stopSpeaking dừng cả 2 tầng. `VoiceSettings`: chips chọn từng giọng +
  badge "☁️ Giọng AI" + cảnh báo hết credit; AiKeySettings thêm Novita
  (ghi rõ cần credit, đổi tiêu đề mục key cho trung thực).

**Chờ user:** nạp credit Novita (Billing) → dán key vào ⚙️ Hỏi cô Owly →
vào trang Bài học chọn giọng Cô/Thầy và Nghe thử. Key đã lộ qua chat —
khuyến nghị tạo key mới sau khi nạp tiền (key cũ chỉ để test, không nằm
trong repo).

**Bổ sung §T (22/10, sau phản hồi của user):** user mở trang Hỏi cô Owly —
nơi chỉ có thanh giọng dạng compact — và không thấy chỗ chọn giọng (bảng
chọn giọng ban đầu chỉ nằm ở trang Bài học). Kaizen: thanh compact có thêm
nút "🎙️ Chọn giọng" mở bảng chọn giọng ngay tại chỗ (mọi trang), bản đầy
 đủ giữ nguyên. Lưu ý vận hành rút ra từ ảnh user gửi: dialog key ở bản
frontend CŨ nhận diện key Novita thành "DashScope" (chưa có nhánh sk_) —
bản mới đã đúng; validate chỉ gọi /models (miễn phí) nên báo "kết nối
thành công" dù tài khoản $0 — TTS thật vẫn cần credit, UI đã có cảnh báo
riêng khi bấm nghe.

## §U — Fix "điện thoại không có giọng nam" (22/10/2026)

**Chẩn đoán (3 nguyên nhân thật):**
1. Giọng máy lấy từ TTS của chính điện thoại — đa số Android chỉ cài 1
   giọng nữ tiếng Anh → chọn "Thầy" cũng không có giọng nam để phát.
2. Lỗi race trong `speech.ts`: danh sách voice nạp bất đồng bộ; đọc ngay
   khi danh sách còn rỗng → rớt về giọng mặc định (nữ) bất kể đã chọn Thầy.
3. Khi máy không có giọng nam, code cũ chỉ hạ pitch 0.95 → gần như không
   khác giọng nữ.

**Đã thử và LOẠI:** engine Edge TTS miễn phí (đúng engine Voice-Pro dùng).
Bản cài thử bị Bing chặn 403 ngay ở bắt tay WebSocket: Microsoft đã đổi
sang attestation v2 (Sec-MS-GEC v2 + hiệu chỉnh lệch giờ — thư viện
edge-tts 7.3.1) — cơ chế họ chủ động xoay để chống dùng ngoài Edge, quá
mong manh + xám về điều khoản cho app thương mại → không đưa vào
production (đã xóa file thử nghiệm, không commit).

**Fix đã ship:**
- *Giọng máy (chạy ngay, không cần key):* cache danh sách voice toàn cục
  + chờ tối đa 800ms cho danh sách nạp xong mới đọc (hết lỗi race);
  máy không có giọng nam → hạ tông sâu 0.58 + chậm 0.94× cho tiếng Thầy
  trầm hẳn, phân biệt rõ với giọng Cô.
- *Thêm engine Gemini TTS (giọng nam/nữ THẬT, miễn phí theo key Gemini):*
  `api/_tts-gemini-core.js` — POST generateContent của
  gemini-2.5-flash-preview-tts, PCM 24kHz → bọc WAV ngay phía server;
  `/api/tts` tự rẽ nhánh theo loại key (Novita sk_ → MiniMax HD;
  Gemini AIza → Gemini TTS). 8 persona có thêm geminiId (Cô Emily=Zephyr,
  Lily=Aoede, Anna=Kore, Mary=Leda; Thầy Ben=Puck, Jack=Fenrir,
  Tom=Charon, David=Orus); tốc độ Gemini áp bằng playbackRate.
  Unit test handler: WAV đúng header RIFF/24kHz, quota→429, key lạ→400.
- UI: cảnh báo quota cho Gemini; gợi ý chưa có key ghi rõ cả 2 lựa chọn
  key + giải thích cơ chế hạ tông của giọng máy.

**Đường tới giọng nam thật cho user:** (a) nạp credit Novita (key đã lưu
sẵn trong app), hoặc (b) dán key Gemini miễn phí — cả hai đều đã đấu nối
xong; không cần thao tác thêm.
