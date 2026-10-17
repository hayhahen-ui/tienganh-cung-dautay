import { createFileRoute } from "@tanstack/react-router";
import { AskOwly } from "@/components/AskOwly";

export const Route = createFileRoute("/hoi-dap")({
  head: () => ({
    meta: [
      { title: "Hỏi đáp cô Owly — RAG AI trả lời từ giáo trình Cambridge" },
      {
        name: "description",
        content:
          "Bé gõ câu hỏi tiếng Anh, cô Owly trả lời ngay từ giáo trình — kèm luyện đánh máy và phát âm.",
      },
    ],
  }),
  component: HoiDapPage,
});

function HoiDapPage() {
  return (
    <main className="mx-auto max-w-4xl">
      <AskOwly />
    </main>
  );
}
