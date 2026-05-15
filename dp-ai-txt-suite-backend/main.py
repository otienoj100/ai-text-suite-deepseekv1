# main.py - DeepSeek Version
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import logging
from dotenv import load_dotenv
import requests
import json

load_dotenv()

app = FastAPI(title="AI Text Suite API - DeepSeek Edition")
logger = logging.getLogger(__name__)

# CORS - UPDATE with your frontend URL after deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-frontend.vercel.app",  # Replace with actual URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== DEEPSEEK CONFIGURATION ====================
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

if not DEEPSEEK_API_KEY:
    logger.error("❌ DEEPSEEK_API_KEY not found")
    raise ValueError("DEEPSEEK_API_KEY not found in environment variables")
else:
    logger.info(f"✅ DeepSeek API key loaded (first 5 chars: {DEEPSEEK_API_KEY[:5]}...)")

def call_deepseek(messages, temperature=0.7, max_tokens=1000):
    """Helper function to call DeepSeek API"""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}"
    }
    
    payload = {
        "model": "deepseek-chat",  # Use deepseek-reasoner for R1 model if available
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False
    }
    
    try:
        response = requests.post(
            DEEPSEEK_API_URL,
            headers=headers,
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"]
    except requests.exceptions.RequestException as e:
        logger.error(f"DeepSeek API error: {e}")
        if response.status_code == 401:
            raise Exception("Invalid API key. Please check your DeepSeek API key.")
        elif response.status_code == 429:
            raise Exception("Rate limit exceeded. Please try again later.")
        else:
            raise Exception(f"API request failed: {str(e)}")

# ==================== MODELS ====================

class RedactRequest(BaseModel):
    text: str
    tone: str
    dialect: str

class SummarizeRequest(BaseModel):
    text: str
    length: str
    bullet_points: Optional[bool] = False

class BlogRequest(BaseModel):
    topic: str
    word_count: int = 400
    tone: str = "Professional"
    audience: str = "General"
    advanced_options: Optional[dict] = None

# ==================== API ENDPOINTS ====================

@app.get("/")
async def root():
    return {"message": "AI Text Suite API - DeepSeek Edition", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "api_key_configured": bool(DEEPSEEK_API_KEY),
        "provider": "DeepSeek"
    }

@app.post("/api/redact")
async def redact_text(request: RedactRequest):
    """Rewrite text with specified tone and dialect using DeepSeek"""
    logger.info(f"📝 Redact request - Tone: {request.tone}, Dialect: {request.dialect}")
    
    try:
        prompt = f"""You are a professional text editor. Rewrite the following text in a {request.tone} tone using {request.dialect} English dialect.
Keep the original meaning but adjust the style appropriately.

Text: {request.text}

Rewritten text:"""
        
        messages = [
            {"role": "system", "content": "You are a helpful assistant that rewrites text in different styles."},
            {"role": "user", "content": prompt}
        ]
        
        result = call_deepseek(messages, temperature=0.7, max_tokens=1000)
        
        return {
            "success": True,
            "original": request.text,
            "redacted": result,
            "tone": request.tone,
            "dialect": request.dialect,
            "original_word_count": len(request.text.split()),
            "redacted_word_count": len(result.split())
        }
        
    except Exception as e:
        logger.error(f"❌ Redact error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/summarize")
async def summarize_text(request: SummarizeRequest):
    """Summarize text with length control using DeepSeek"""
    logger.info(f"📝 Summarize request - Length: {request.length}")
    
    try:
        length_map = {
            "Short": "a very concise summary in 4-5 sentences",
            "Medium": "a balanced summary with key points in 5-10 sentences",
            "Detailed": "a comprehensive summary with all important details"
        }
        length_instruction = length_map.get(request.length, "a concise summary")
        
        bullet_instruction = "Format the summary as bullet points." if request.bullet_points else ""
        
        prompt = f"""Summarize the following text into {length_instruction}. {bullet_instruction}

Text: {request.text}

Summary:"""
        
        messages = [
            {"role": "system", "content": "You are a helpful assistant that summarizes text clearly and concisely."},
            {"role": "user", "content": prompt}
        ]
        
        result = call_deepseek(messages, temperature=0.3, max_tokens=500)
        
        original_count = len(request.text.split())
        summary_count = len(result.split())
        compression = (summary_count / original_count) * 100 if original_count > 0 else 0
        
        return {
            "success": True,
            "summary": result,
            "original_word_count": original_count,
            "summary_word_count": summary_count,
            "compression_ratio": f"{compression:.1f}%",
            "bullet_points": request.bullet_points
        }
        
    except Exception as e:
        logger.error(f"❌ Summarize error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/blog")
async def generate_blog(request: BlogRequest):
    """Generate blog post with customization using DeepSeek"""
    logger.info(f"📝 Blog request - Topic: {request.topic}")
    
    if not request.topic or request.topic.strip() == "":
        raise HTTPException(status_code=400, detail="Topic cannot be empty")
    
    try:
        # Build structure instructions
        structure = ""
        if request.advanced_options:
            if request.advanced_options.get("intro"):
                structure += "- Include a compelling introduction\n"
            if request.advanced_options.get("list"):
                structure += "- Include a numbered or bulleted list\n"
            if request.advanced_options.get("conclusion"):
                structure += "- End with a strong conclusion\n"
            if request.advanced_options.get("cta"):
                structure += "- Include a call-to-action at the end\n"
        
        prompt = f"""Write a {request.word_count}-word blog post about "{request.topic}".
Tone: {request.tone}
Target Audience: {request.audience}

Structure requirements:
{structure if structure else "No specific structure requirements."}

Please write an engaging, well-structured blog post with:
1. A catchy title
2. Introduction
3. Main content with clear sections
4. Conclusion

Blog post:"""
        
        messages = [
            {"role": "system", "content": "You are a professional blog writer. Write engaging, well-structured blog posts."},
            {"role": "user", "content": prompt}
        ]
        
        result = call_deepseek(messages, temperature=0.7, max_tokens=2000)
        
        word_count = len(result.split())
        reading_time = max(1, round(word_count / 400))
        
        return {
            "success": True,
            "blog_post": result,
            "word_count": word_count,
            "reading_time": reading_time,
            "topic": request.topic,
            "tone": request.tone,
            "audience": request.audience
        }
        
    except Exception as e:
        logger.error(f"❌ Blog error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)