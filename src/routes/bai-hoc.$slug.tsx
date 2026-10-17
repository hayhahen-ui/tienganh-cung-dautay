import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { getLesson, lessons, levels } from "@/data/curriculum";
import { VocabCard } from "@/components/VocabCard";
import { VoiceSettings } from "@/components/VoiceSettings";
import { ReadingBlock } from "@/components/ReadingBlock";
import { SpeakButton } from "@/components/SpeakButton";
import { ListenPractice } from "@/components/practice/ListenPractice";
import { SpeakPractice } from "@/components/practice/SpeakPractice";
import { WritePractice } from "@/components/practice/WritePractice";
import { MatchGame } from "@/components/games/MatchGame";
import { SentenceScramble } from "@/components/games/SentenceScramble";
import { FillBlank } from "@/components/games/FillBlank";
import { LessonQuiz } from "@/components/games/LessonQuiz";
import { Celebrate } from "@/components/Celebrate";
import {
  addToSrs,
  addXp,
  completeSection,
  lessonPercent,
  recordQuiz,
  SECTION_IDS,
  useProgress,
  visitLesson,
  XP,
  type SectionId,
} from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bai-hoc/$slug")({
  loader: ({ params }) => {
    const lesson = getLesson(params.slug);
    if (!lesson) throw notFound();
    return lesson;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Bài học tiếng Anh cho bé | Owly English` },
          { name: "description", content: loaderData.summary },
          { property: "og:title", content: `${loaderData.title} (${loaderData.titleVi})` },
          { property: "og:description", content: loaderData.summary },
        ]
      : [],
  }),
  component: LessonPage,
});

const SECTION_LABEL: Record<SectionId, string> = {
  vocab: "Từ vựng",
  video: "Video",
  grammar: "Ngữ pháp",
  reading: "Đọc hiểu",
  listen: "Nghe",
  speak: "Nói",
  write: "Viết",
  games: "Trò chơi",
  quiz: "Quiz",
};

function DoneButton({
  done,
  label,
  onClick,
}: {
  done: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={done}
      onClick={onClick}
      className={cn(
        "mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 font-display font-bold transition-transform",
        done
          ? "bg-success/15 text-success"
          : "bg-primary text-primary-foreground shadow-pop hover:-translate-y-0.5",
      )}
    >
      <Check className="size-4" /> {done ? "Đã hoàn thành" : label}
    </button>
  );
}

function LessonPage() {
  const lesson = Route.useLoaderData();
  const progress = useProgress();
  const lp = progress.lessons[lesson.slug];
  const sections = lp?.sections ?? {};
  const percent = lessonPercent(progress, lesson.slug);
  const idx = lessons.findIndex((l) => l.slug === lesson.slug);
  const next = lessons[idx + 1];
  const level = levels.find((l) => l.id === lesson.level);
  const slugsInLevel = lessons.filter((l) => l.level === lesson.level).map((l) => l.slug);
  const [celebrate, setCelebrate] = useState(0);
  const [games, setGames] = useState({ match: false, scramble: false, blank: false });

  useEffect(() => {
    visitLesson(lesson.slug);
  }, [lesson.slug]);

  const done = (s: SectionId) => Boolean(sections[s]);
  const finish = (s: SectionId) => {
    if (done(s)) return;
    completeSection(lesson.slug, s);
    setCelebrate((c) => c + 1);
  };

  const onGame = (key: keyof typeof games, xp: number) => {
    if (games[key]) return;
    const nextGames = { ...games, [key]: true };
    setGames(nextGames);
    addXp(xp, `game-${key}`);
    if (nextGames.match && nextGames.scramble && nextGames.blank) finish("games");
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Celebrate trigger={celebrate} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to="/bai-hoc" className="text-sm font-bold text-muted-foreground">
          ← Tất cả bài học
        </Link>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold">
          {level?.emoji} {level?.name} · Bài {lesson.order}
        </span>
      </div>
      <h1 className="mt-3 font-display text-4xl font-extrabold">
        <span aria-hidden>{lesson.emoji}</span> {lesson.title}
      </h1>
      <p className="text-lg text-muted-foreground">{lesson.titleVi}</p>
      <p className="mt-2">{lesson.summary}</p>
      {lesson.source && (
        <p className="mt-3 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          📘 Bám giáo trình: {lesson.source}
        </p>
      )}

      {/* Thanh tiến độ bài học */}
      <div className="card-pop mt-5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-lg font-bold">
            Tiến độ bài học: {percent}%{" "}
            {lp?.stars ? <span aria-label={`${lp.stars} sao`}>{"⭐".repeat(lp.stars)}</span> : null}
          </p>
          <p className="text-xs font-semibold text-muted-foreground">
            Mỗi phần xong +{XP.section} XP · Quiz ≥50% hoàn thành bài +{XP.lessonComplete} XP
          </p>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-success transition-all" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SECTION_IDS.map((s) => (
            <a
              key={s}
              href={`#${s}`}
              className={cn(
                "rounded-full border-2 px-2.5 py-0.5 text-xs font-bold",
                done(s)
                  ? "border-success bg-success/15 text-success"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {done(s) ? "✓ " : ""}
              {SECTION_LABEL[s]}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <VoiceSettings />
        <p className="mt-1.5 text-xs text-muted-foreground">
          🔊 Chọn giọng <strong>Cô giáo</strong> (nữ) hoặc <strong>Thầy giáo</strong> (nam) người
          bản địa, tốc độ <strong>Chậm</strong> cho bé mới nghe — áp dụng cho mọi nút loa trong bài.
        </p>
      </div>

      <section id="vocab" className="mt-10 scroll-mt-24">
        <h2 className="font-display text-2xl font-bold">1️⃣ Từ vựng có hình</h2>
        <p className="text-sm text-muted-foreground">
          Bấm vào hình để xem nghĩa, bấm “Đọc” để nghe phát âm chuẩn Anh–Anh. Học xong, từ sẽ được
          thêm vào hộp ôn tập.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          {lesson.vocab.map((v) => (
            <VocabCard key={v.word} item={v} />
          ))}
        </div>
        <DoneButton
          done={done("vocab")}
          label="Tớ đã học xong từ vựng"
          onClick={() => {
            addToSrs(lesson.vocab.map((v) => ({ word: v.word, lessonSlug: lesson.slug })));
            finish("vocab");
          }}
        />
      </section>

      <section id="video" className="mt-12 scroll-mt-24">
        <h2 className="font-display text-2xl font-bold">2️⃣ Video sinh động</h2>
        <div className="card-pop mt-4 overflow-hidden p-2">
          <div className="aspect-video w-full overflow-hidden rounded-xl">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${lesson.video.youtubeId}?rel=0`}
              title={lesson.video.title}
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 p-3">
            <p className="text-sm font-semibold text-muted-foreground">{lesson.video.title}</p>
            <a
              href={`https://www.youtube.com/watch?v=${lesson.video.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-border bg-card px-3 py-1 text-xs font-bold"
            >
              ▶️ Mở trên YouTube
            </a>
          </div>
        </div>

        {lesson.extraVideos?.length ? (
          <div className="mt-4">
            <p className="font-display text-lg font-bold">🎬 Video mở rộng</p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {lesson.extraVideos.map((v) => (
                <li key={v.youtubeId}>
                  <a
                    href={`https://www.youtube.com/watch?v=${v.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-pop block p-3 text-sm transition-transform hover:-translate-y-0.5"
                  >
                    <span className="font-semibold">▶️ {v.title}</span>
                    <span className="block text-xs text-muted-foreground">{v.channel}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <DoneButton done={done("video")} label="Tớ đã xem video" onClick={() => finish("video")} />
      </section>

      <section id="grammar" className="mt-12 scroll-mt-24">
        <h2 className="font-display text-2xl font-bold">3️⃣ Ngữ pháp: {lesson.grammar.title}</h2>
        <div className="card-pop mt-4 p-5">
          <p className="rounded-xl bg-primary/10 p-3 text-center font-display text-lg font-bold text-primary">
            {lesson.grammar.formula}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">💡 {lesson.grammar.note}</p>
          <ul className="mt-4 space-y-2">
            {lesson.grammar.examples.map((e) => (
              <li
                key={e.en}
                className="flex flex-wrap items-center gap-3 rounded-xl bg-muted/60 p-3"
              >
                <span className="font-display text-lg font-semibold">{e.en}</span>
                <span className="text-sm text-muted-foreground">{e.vi}</span>
                <SpeakButton text={e.en} className="ml-auto" />
              </li>
            ))}
          </ul>
        </div>
        <DoneButton
          done={done("grammar")}
          label="Tớ đã hiểu ngữ pháp"
          onClick={() => finish("grammar")}
        />
      </section>

      <section id="reading" className="mt-12 scroll-mt-24">
        <h2 className="font-display text-2xl font-bold">4️⃣ Đoạn văn rõ cấu trúc</h2>
        <div className="mt-4">
          <ReadingBlock
            title={lesson.reading.title}
            chunks={lesson.reading.chunks}
            viTranslation={lesson.reading.viTranslation}
          />
        </div>
        <DoneButton
          done={done("reading")}
          label="Tớ đã đọc và hiểu đoạn văn"
          onClick={() => finish("reading")}
        />
      </section>

      <section id="listen" className="mt-12 scroll-mt-24">
        <h2 className="font-display text-2xl font-bold">5️⃣ 🎧 Thực hành nghe</h2>
        <p className="text-sm text-muted-foreground">
          Chỉ tính lần chọn đầu tiên — nghe kỹ rồi hãy chọn nhé!
        </p>
        <div className="mt-4">
          <ListenPractice
            questions={lesson.listen}
            onAllDone={(correct) => {
              addXp(correct * XP.listenCorrect, "listen");
              finish("listen");
            }}
          />
        </div>
      </section>

      <section id="speak" className="mt-12 scroll-mt-24">
        <h2 className="font-display text-2xl font-bold">6️⃣ 🗣️ Thực hành nói</h2>
        <div className="mt-4">
          <SpeakPractice items={lesson.speak} onAllDone={() => finish("speak")} />
        </div>
      </section>

      <section id="write" className="mt-12 scroll-mt-24">
        <h2 className="font-display text-2xl font-bold">7️⃣ ✍️ Thực hành viết</h2>
        <div className="mt-4">
          <WritePractice
            questions={lesson.write}
            onAllDone={() => {
              addXp(lesson.write.length * XP.writeCorrect, "write");
              finish("write");
            }}
          />
        </div>
      </section>

      <section id="games" className="mt-12 scroll-mt-24">
        <h2 className="font-display text-2xl font-bold">8️⃣ 🎮 Trò chơi củng cố</h2>
        <p className="text-sm text-muted-foreground">
          Hoàn thành cả 3 trò để mở khóa phần Quiz. Mỗi trò +{XP.gameWin} XP.
        </p>
        <div className="mt-4 space-y-5">
          <MatchGame vocab={lesson.vocab} onComplete={() => onGame("match", XP.gameWin)} />
          <FillBlank lesson={lesson} onComplete={() => onGame("blank", XP.gameWin)} />
          <SentenceScramble
            items={lesson.speak}
            onComplete={() => onGame("scramble", XP.gameWin)}
          />
        </div>
      </section>

      <section id="quiz" className="mt-12 scroll-mt-24">
        <h2 className="font-display text-2xl font-bold">9️⃣ 🏁 Quiz cuối bài</h2>
        <p className="text-sm text-muted-foreground">
          10 câu trộn từ vựng – nghe – ngữ pháp. ≥50% hoàn thành bài, ≥90% được 3 sao.
        </p>
        <div className="mt-4">
          {done("games") || done("quiz") ? (
            <LessonQuiz
              lesson={lesson}
              onFinish={(score) => {
                recordQuiz(lesson.slug, score, lesson.level, slugsInLevel);
                if (score >= 50) setCelebrate((c) => c + 1);
              }}
            />
          ) : (
            <div className="card-pop p-6 text-center text-muted-foreground">
              🔒 Hoàn thành 3 trò chơi ở phần 8 để mở Quiz nhé!
            </div>
          )}
        </div>
      </section>

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        <Link
          to="/on-tap"
          className="flex items-center justify-between rounded-2xl border-2 border-border bg-card p-5 font-display text-lg font-bold"
        >
          <span>🧠 Ôn tập từ đã học</span>
          <span aria-hidden>→</span>
        </Link>
        {next && (
          <Link
            to="/bai-hoc/$slug"
            params={{ slug: next.slug }}
            className="flex items-center justify-between rounded-2xl bg-primary p-5 font-display text-lg font-bold text-primary-foreground shadow-pop"
          >
            <span>
              Bài tiếp theo: {next.emoji} {next.title}
            </span>
            <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </main>
  );
}
