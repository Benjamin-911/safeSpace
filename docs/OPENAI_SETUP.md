# OpenAI Setup Guide

## ✅ Migration Complete!

The app has been successfully migrated from Gemini to OpenAI, and the local fallback AI has been significantly improved.

## 🚀 Setup Instructions

### Step 1: Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in to your OpenAI account
3. Click "Create new secret key"
4. Copy your API key (you'll only see it once!)
5. Add billing information (required for API access, but you get $5 free credit)

### Step 2: Add API Key to Environment Variables

Open your `.env.local` file and add:

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important:**
- Never commit `.env.local` to git (it's already in `.gitignore`)
- The API key is stored securely on the server side
- Client-side code calls the `/api/chat` route which handles the API key

### Step 3: Restart Your Development Server

After adding the API key, restart your Next.js server:

1. Stop the server (Ctrl+C)
2. Run: `npm run dev`
3. The server will load the new `OPENAI_API_KEY`

### Step 4: Test

1. Register/login to the app
2. Send a message in the chat
3. You should see OpenAI responses (or fallback AI if API key not set)

## 💰 Cost Information

### Free Tier
- **$5 free credit** when you sign up
- Usually lasts weeks/months for small projects
- No credit card required initially (but needed for API access)

### Paid Tier (after free credits)
- **gpt-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- Very affordable for small to medium projects
- For ~100 messages/day: approximately $0.50 - $2.00 per month

### Current Configuration
- Model: `gpt-4o-mini` (cost-effective, good quality)
- Max tokens: 600 per response
- Temperature: 0.8 (balanced creativity)

## 🎯 What Changed

### API Route (`app/api/chat/route.ts`)
- ✅ Now uses OpenAI API instead of Gemini
- ✅ Uses `gpt-4o-mini` model (cost-effective)
- ✅ Same Sierra Leone-specific system instructions
- ✅ Better error handling

### Local Fallback AI (`lib/ai.ts`)
- ✅ **Enhanced with Sierra Leone context**
- ✅ **Crisis detection** - detects suicidal ideation and provides resources
- ✅ **Better intent detection** - recognizes more emotions (lonely, angry, etc.)
- ✅ **More empathetic responses** - culturally appropriate
- ✅ **Context-aware suggestions** - relevant to Sierra Leone

## 🔄 Fallback Behavior

The app will automatically:
1. **Try OpenAI first** (if API key is configured)
2. **Fallback to local AI** if:
   - API key is missing
   - Rate limit exceeded
   - Network error
   - API unavailable

The improved local fallback AI ensures users always get helpful responses!

## 📊 Comparison

| Feature | OpenAI | Local Fallback |
|---------|--------|----------------|
| Intelligence | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Cost | $ (after free tier) | Free |
| Reliability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Sierra Leone Context | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Crisis Detection | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 🛠️ Troubleshooting

### "API key not configured"
- Make sure `OPENAI_API_KEY` is in `.env.local`
- Restart the server after adding the key
- Check the key doesn't have extra spaces

### "Invalid API key"
- Verify the key starts with `sk-`
- Make sure you copied the full key
- Check for any typos

### Rate limits
- OpenAI has much better rate limits than Gemini
- If you hit limits, the app will use fallback AI automatically
- Consider upgrading your OpenAI plan if needed

### Costs too high
- The current model (`gpt-4o-mini`) is very cost-effective
- You can reduce `max_tokens` in the API route if needed
- Monitor usage at https://platform.openai.com/usage

## 🎉 Benefits

✅ **More reliable** - No quota issues like Gemini  
✅ **Better responses** - Higher quality AI  
✅ **Improved fallback** - Enhanced local AI for when API unavailable  
✅ **Sierra Leone specific** - Both OpenAI and fallback have cultural context  
✅ **Crisis support** - Detects and responds to crisis situations  

Enjoy your improved AI counselor! 🚀

