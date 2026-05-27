# OpenAI Integration Guide

## Setup Instructions

### 1. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy your API key (you'll only see it once!)

### 2. Add API Key to Environment Variables

Create a `.env.local` file in the root of your project (if it doesn't exist):

```bash
OPENAI_API_KEY=your_actual_api_key_here
```

**Important:** 
- Never commit `.env.local` to git (it's already in `.gitignore`)
- The API key is stored securely on the server side
- Client-side code calls the `/api/chat` route which handles the API key

### 3. Restart Your Development Server

After adding the API key, restart your Next.js server:

```bash
npm run dev
```

## How It Works

1. **Client Side**: When a user sends a message, the chat page calls `generateCounselorResponse()`
2. **API Route**: The function calls `/api/chat` which runs on the server
3. **OpenAI API**: The server securely calls OpenAI with your API key
4. **Response**: The AI response is sent back to the client
5. **Fallback**: If OpenAI fails, it automatically falls back to the local AI

## Model Configuration

The current setup uses `gpt-4o-mini` which is cost-effective. You can change this in `app/api/chat/route.ts`:

```typescript
model: "gpt-4o-mini"  // Change to "gpt-4", "gpt-3.5-turbo", etc.
```

## Cost Considerations

- `gpt-4o-mini`: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- `gpt-3.5-turbo`: ~$0.50 per 1M input tokens, ~$1.50 per 1M output tokens  
- `gpt-4`: ~$30 per 1M input tokens, ~$60 per 1M output tokens

The current setup limits responses to 200 tokens to keep costs low.

## Testing

1. Start your dev server: `npm run dev`
2. Register/login to the app
3. Send a message in the chat
4. You should see "Counselor is thinking..." while it processes
5. The AI response should appear (or fallback if API key is missing)

## Troubleshooting

**If you see fallback responses:**
- Check that `.env.local` exists and has `OPENAI_API_KEY=...`
- Verify the API key is correct
- Check the browser console for errors
- Check the server terminal for API errors

**If you get rate limit errors:**
- You may have hit OpenAI's rate limit
- Check your OpenAI account usage
- Consider upgrading your plan

**If responses are slow:**
- This is normal - OpenAI API calls take 1-3 seconds
- The "thinking" indicator shows it's processing

