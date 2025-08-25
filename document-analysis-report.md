# CreateDocument Tool & Chat Streaming Architecture Analysis

## Executive Summary

This report provides a deep analysis of the `createDocument` tool and its integration within the chat streaming system in this Next.js AI chatbot application. The system implements a sophisticated architecture that combines real-time streaming, tool calling, artifact generation, and database persistence with resumable streams.

## Architecture Overview

### 1. Tool Registration & Integration

The `createDocument` tool is integrated into the chat system through the main chat route (`app/(chat)/api/chat/route.ts`):

```typescript path=/Users/kenan/ai-chatbot-new/app/(chat)/api/chat/route.ts start=173
tools: {
  createDocument: createDocument({ session, dataStream }),
  updateDocument: updateDocument({ session, dataStream }),
  googleSearch: {
    ...google.tools.googleSearch({}),
    execute: google.tools.googleSearch({}).execute,
  } as Tool<any, any>,
},
```

The tool is conditionally enabled based on the selected model:
- **Enabled**: For standard chat models
- **Disabled**: For reasoning models (`chat-model-reasoning`)

### 2. CreateDocument Tool Implementation

**Location**: `lib/ai/tools/create-document.ts`

#### Core Functionality:
- **Purpose**: "Create a image generation visualization" (despite the name, currently focused on image generation)
- **Input Schema**: 
  - `title` (string): The title/prompt for document creation
  - `kind` (enum): One of `['text', 'code', 'image', 'sheet']`

#### Execution Flow:

1. **ID Generation**: Creates a unique UUID for the document
2. **Stream Metadata**: Writes metadata to the data stream:
   - `data-kind`: Document type
   - `data-id`: Document ID
   - `data-title`: Document title
   - `data-clear`: Clear previous content
3. **Handler Resolution**: Finds appropriate document handler based on `kind`
4. **Document Generation**: Delegates to specific handler for content creation
5. **Completion**: Writes `data-finish` signal
6. **Return**: Provides confirmation message to the AI model

```typescript path=/Users/kenan/ai-chatbot-new/lib/ai/tools/create-document.ts start=24
execute: async ({ title, kind }) => {
  const id = generateUUID();

  // Stream metadata
  dataStream.write({ type: 'data-kind', data: kind, transient: true });
  dataStream.write({ type: 'data-id', data: id, transient: true });
  dataStream.write({ type: 'data-title', data: title, transient: true });
  dataStream.write({ type: 'data-clear', data: null, transient: true });

  // Find and execute handler
  const documentHandler = documentHandlersByArtifactKind.find(
    (handler) => handler.kind === kind,
  );

  await documentHandler.onCreateDocument({
    id, title, dataStream, session,
  });

  dataStream.write({ type: 'data-finish', data: null, transient: true });
  
  return { id, title, kind, content: 'A document was created and is now visible to the user.' };
},
```

### 3. Artifact Handler System

**Location**: `lib/artifacts/server.ts`

#### Handler Architecture:
- **Abstract Pattern**: `DocumentHandler<T>` interface with generic typing
- **Factory Function**: `createDocumentHandler()` for consistent handler creation
- **Dual Operations**: Both `onCreateDocument` and `onUpdateDocument` methods

#### Currently Active Handlers:
```typescript path=/Users/kenan/ai-chatbot-new/lib/artifacts/server.ts start=93
export const documentHandlersByArtifactKind: Array<DocumentHandler> = [
  // textDocumentHandler,    // Commented out
  // codeDocumentHandler,    // Commented out
  imageDocumentHandler,      // ACTIVE
  // sheetDocumentHandler,   // Commented out
];
```

**Note**: Only the `imageDocumentHandler` is currently enabled, which explains why the tool description mentions "image generation visualization".

#### Image Document Handler Implementation:

**Location**: `artifacts/image/server.ts`

```typescript path=/Users/kenan/ai-chatbot-new/artifacts/image/server.ts start=7
onCreateDocument: async ({ title, dataStream }) => {
  const { image } = await experimental_generateImage({
    model: myProvider.imageModel('image-model'),
    prompt: title,
    n: 1,
  });

  dataStream.write({
    type: 'data-imageDelta',
    data: image.base64,
    transient: true,
  });

  return image.base64;
},
```

**Key Features**:
- Uses AI SDK's `experimental_generateImage` function
- Streams image data as base64 via `data-imageDelta` message type
- Returns base64 content for database storage

### 4. Database Persistence

#### Document Schema:
```typescript path=/Users/kenan/ai-chatbot-new/lib/db/schema.ts start=105
export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),  // Stores base64 for images
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.createdAt] }),
  }),
);
```

#### Persistence Flow:
1. **Handler Execution**: Document handler generates content
2. **Automatic Save**: `createDocumentHandler` automatically calls `saveDocument`
3. **User Association**: Document is linked to authenticated user
4. **Versioning**: Composite primary key allows multiple versions per ID

### 5. Chat Streaming Architecture

#### Main Chat Route (`app/(chat)/api/chat/route.ts`):

**Core Components**:
- **UI Message Stream**: `createUIMessageStream()` for real-time communication
- **Model Integration**: Uses provider's language model with tool support
- **Resumable Streams**: Redis-backed stream resumption capability
- **Tool Integration**: Dynamic tool loading based on model type

#### Streaming Flow:
1. **Request Processing**: Parse and validate incoming chat message
2. **Session Validation**: Authenticate user and check rate limits
3. **Chat Management**: Create or retrieve existing chat
4. **Stream Setup**: Initialize resumable stream with unique ID
5. **AI Processing**: Execute `streamText()` with tools enabled
6. **Tool Execution**: AI can call tools during response generation
7. **Response Streaming**: Stream AI response and tool results to client
8. **Persistence**: Save all messages after completion

```typescript path=/Users/kenan/ai-chatbot-new/app/(chat)/api/chat/route.ts start=154
const stream = createUIMessageStream({
  execute: ({ writer: dataStream }) => {
    const result = streamText({
      model: myProvider.languageModel(selectedChatModel),
      system: systemPrompt({ selectedChatModel, requestHints }),
      messages: convertToModelMessages(uiMessages),
      stopWhen: stepCountIs(5),
      experimental_activeTools: selectedChatModel === 'chat-model-reasoning' 
        ? [] 
        : ['createDocument', 'updateDocument', 'googleSearch'],
      tools: {
        createDocument: createDocument({ session, dataStream }),
        updateDocument: updateDocument({ session, dataStream }),
        // ... other tools
      },
    });

    result.consumeStream();
    dataStream.merge(result.toUIMessageStream({ sendReasoning: true }));
  },
  onFinish: async ({ messages }) => {
    await saveMessages({ messages: /* processed messages */ });
  },
});
```

### 6. Resume Capability

#### Stream Resume Route (`app/(chat)/api/chat/[id]/stream/route.ts`):

**Purpose**: Handle stream resumption when client reconnects

**Key Features**:
- **Stream ID Tracking**: Database tracking of active streams per chat
- **Redis Integration**: Resumable stream context with Redis backend
- **Fallback Logic**: If stream unavailable, restore from database
- **Time-based Logic**: Only restore recent messages (within 15 seconds)

#### Resume Flow:
1. **Validation**: Check chat access permissions
2. **Stream Lookup**: Find most recent stream ID for chat
3. **Resume Attempt**: Try to resume from Redis-backed stream
4. **Fallback**: If unavailable, reconstruct from database
5. **Response**: Stream resumed content or empty response

### 7. Custom Data Types & Messaging

#### Streaming Message Types:
```typescript path=/Users/kenan/ai-chatbot-new/lib/types.ts start=33
export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;     // Base64 image data
  sheetDelta: string;
  codeDelta: string;
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: ArtifactKind;
  clear: null;            // Clear previous content
  finish: null;           // Signal completion
};
```

#### Tool Communication:
- **Transient Messages**: All tool metadata marked as `transient: true`
- **Real-time Updates**: Stream updates as generation progresses
- **Client Synchronization**: Metadata helps client track document state

### 8. UpdateDocument Tool

**Location**: `lib/ai/tools/update-document.ts`

#### Functionality:
- **Document Lookup**: Retrieves existing document by ID
- **Handler Delegation**: Uses same handler system as create
- **Incremental Updates**: Modifies existing document content
- **Version Control**: Creates new database version via composite key

#### Key Differences from Create:
- Requires `documentId` parameter instead of generating new ID
- Fetches existing document before processing
- Uses `onUpdateDocument` handler method
- Error handling for missing documents

## Technical Insights

### 1. Stream Processing Architecture
- **Bi-directional Streaming**: AI can stream responses while tools stream artifacts
- **Transient vs Persistent**: Tool metadata is transient, content is persistent
- **Merge Strategy**: Tool streams merged with AI response stream

### 2. Error Handling
- **Graceful Degradation**: Missing handlers throw descriptive errors
- **Database Errors**: Wrapped in `ChatSDKError` for consistent handling
- **Stream Failures**: Fallback mechanisms for stream interruption

### 3. Security Considerations
- **User Isolation**: Documents tied to authenticated user
- **Chat Privacy**: Visibility controls on chat access
- **Rate Limiting**: Message count limits per user type

### 4. Performance Optimizations
- **Stream Resumption**: Redis-backed resumable streams reduce re-computation
- **Selective Tool Loading**: Tools disabled for reasoning models
- **Chunked Streaming**: Word-level chunking for smooth user experience

## Current State Analysis

### Active Components:
- ✅ **Image Generation**: Fully functional with AI SDK
- ✅ **Database Persistence**: Working with PostgreSQL + Drizzle
- ✅ **Stream Resumption**: Redis-backed resumable streams
- ✅ **User Authentication**: Session-based access control

### Inactive Components:
- ❌ **Text Documents**: Handler commented out
- ❌ **Code Documents**: Handler commented out  
- ❌ **Sheet Documents**: Handler commented out

### Potential Issues:
1. **Limited Functionality**: Only image generation works despite generic naming
2. **Handler Mismatch**: Tool description doesn't match current capabilities
3. **Dead Code**: Inactive handlers still referenced in codebase

## Recommendations

### 1. Immediate Actions:
- Update tool description to accurately reflect image-only functionality
- Enable other document handlers or remove dead code
- Add error handling for unsupported document types

### 2. Architecture Improvements:
- Implement proper type checking for document kinds
- Add validation for supported operations
- Consider handler auto-discovery mechanism

### 3. Feature Enhancements:
- Add document versioning UI
- Implement document sharing capabilities
- Add support for document templates

---

*This analysis was conducted on the ai-chatbot-new codebase and reflects the current state of the implementation.*
