import Link from 'next/link';
import { getAllChats } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const chats = await getAllChats();

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">All Chats (Admin)</h1>
      <p className="text-sm text-muted-foreground">
        Listing all chats (public & private). Click to inspect messages.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-border rounded">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-2">Created</th>
              <th className="p-2">Title</th>
              <th className="p-2">Visibility</th>
              <th className="p-2">User</th>
              <th className="p-2">Chat ID</th>
              <th className="p-2">Open</th>
            </tr>
          </thead>
          <tbody>
            {chats.map((c) => (
              <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                <td className="p-2 whitespace-nowrap">
                  {new Date(c.createdAt as unknown as string).toLocaleString()}
                </td>
                <td className="p-2 max-w-[260px] truncate">
                  <Link
                    href={`/admin/chat/${c.id}`}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {c.title}
                  </Link>
                </td>
                <td className="p-2">{c.visibility}</td>
                <td className="p-2">{c.userId}</td>
                <td className="p-2 text-xs font-mono">{c.id}</td>
                <td className="p-2">
                  <Link
                    href={`/chat/${c.id}`}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open in Chat UI"
                  >
                    Chat UI →
                  </Link>
                </td>
              </tr>
            ))}
            {chats.length === 0 && (
              <tr>
                <td className="p-4 text-center text-muted-foreground" colSpan={6}>
                  No chats found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
