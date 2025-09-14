import { auth } from '@/app/(auth)/auth';
import { getSuggestionsByDocumentId } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/errors';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');

  if (!documentId) {
    return new ChatSDKError(
      'bad_request:api',
      'Parameter documentId is required.',
    ).toResponse();
  }

  const session = await auth();
  const adminToken = (await cookies()).get('admin_session')?.value;
  const isAdmin = verifyAdminToken(adminToken);

  if (!session?.user && !isAdmin) {
    return new ChatSDKError('unauthorized:suggestions').toResponse();
  }

  const suggestions = await getSuggestionsByDocumentId({
    documentId,
  });

  const [suggestion] = suggestions;

  if (!suggestion) {
    return Response.json([], { status: 200 });
  }

  if (!isAdmin) {
    if (!session?.user) {
      return new ChatSDKError('unauthorized:suggestions').toResponse();
    }
    if (suggestion.userId !== session.user.id) {
      return new ChatSDKError('forbidden:api').toResponse();
    }
  }

  return Response.json(suggestions, { status: 200 });
}
