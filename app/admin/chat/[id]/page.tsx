import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

function renderPart(part: any) {
  if (!part) return null;
  if (part.type === 'text') return part.text as string;
  if (part.type === 'file') return `[file] ${part.filename || part.mediaType || ''}`;
  if (part.type === 'reasoning') return `[reasoning] ${(part.reasoning ?? '').toString()}`;
  try {
    return JSON.stringify(part);
  } catch {
    return String(part);
  }
}

export default async function AdminChatPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const messages = await getMessagesByChatId({ id });

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chat Detail (Admin)</h1>
        <Link
          href={`/chat/${id}`}
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in Chat UI →
        </Link>
      </div>

      <div className="text-sm text-muted-foreground">
        <div><span className="font-medium">ID:</span> {chat.id}</div>
        <div><span className="font-medium">Title:</span> {chat.title}</div>
        <div><span className="font-medium">Visibility:</span> {chat.visibility}</div>
        <div><span className="font-medium">Owner:</span> {chat.userId}</div>
        <div><span className="font-medium">Created:</span> {new Date(chat.createdAt as unknown as string).toLocaleString()}</div>
      </div>

      <div className="space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="border rounded p-3">
            <div className="text-xs text-muted-foreground flex justify-between">
              <span>Role: {m.role}</span>
              <span>{new Date(m.createdAt as unknown as string).toLocaleString()}</span>
            </div>
            <div className="mt-2 whitespace-pre-wrap break-words text-sm">
              {Array.isArray(m.parts)
                ? m.parts.map((p: any, i: number) => (
                    <div key={i}>{renderPart(p)}</div>
                  ))
                : renderPart(m.parts)}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground">No messages.</div>
        )}
      </div>
    </main>
  );
}