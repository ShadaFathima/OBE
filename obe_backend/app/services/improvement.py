import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from googlesearch import search
from urllib.parse import urlparse
import os
import logging
import openai  # for AI fallback

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

# --- TF-IDF Keyword Extraction ---
def extract_keywords_tfidf(topic: str, top_k: int = 3) -> list:
    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
    X = vectorizer.fit_transform([topic])
    tfidf_scores = list(zip(vectorizer.get_feature_names_out(), X.toarray()[0]))
    sorted_keywords = sorted(tfidf_scores, key=lambda x: x[1], reverse=True)
    return [kw for kw, _ in sorted_keywords[:top_k]]

# --- Helper: URL Validation ---
def is_valid_url(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme in ('http', 'https') and parsed.netloc

# --- Multi-Site Summary Fetch ---
def get_web_summary(topic: str, source_sites=None) -> dict:
    if source_sites is None:
        source_sites = [
            "geeksforgeeks.org",
            "tutorialspoint.com",
            "programiz.com",
            "w3schools.com"
        ]
    
    for site in source_sites:
        try:
            query = f"{topic} site:{site}"
            urls = list(search(query, num_results=5))

            if not urls:
                keywords = extract_keywords_tfidf(topic)
                for i in range(len(keywords)):
                    for j in range(i + 1, len(keywords)):
                        sub_query = f"{keywords[i]} {keywords[j]} site:{site}"
                        urls = list(search(sub_query, num_results=3))
                        if urls:
                            break
                    if urls:
                        break

            if not urls or not is_valid_url(urls[0]):
                logger.info(f"No valid URLs found on {site} for topic '{topic}'")
                continue

            target_url = urls[0]
            response = requests.get(target_url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")

            paragraphs = soup.select("div.text > p") or soup.select("article > p") or soup.find_all("p")
            extracted = [p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)]

            if extracted:
                summary_text = "\n".join(extracted[:5])
                return {
                    "summary": summary_text,
                    "link": target_url,
                    "source": site
                }

        except Exception as e:
            logger.warning(f"Error fetching from {site}: {e}")
            continue

    # Fallback to AI-generated strategy if no summary found
    ai_summary = generate_ai_summary(topic)
    return {
        "summary": ai_summary,
        "link": None,
        "source": "AI Generated"
    }

# --- YouTube API Fetch ---
def get_youtube_videos(query: str, api_key: str = YOUTUBE_API_KEY) -> list:
    if not api_key:
        logger.error("YouTube API key missing.")
        return [{"error": "YouTube API key missing. Please check your .env file."}]

    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": 5,
        "key": api_key
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        videos = response.json().get("items", [])
        return [
            {
                "title": video["snippet"]["title"],
                "url": f"https://www.youtube.com/watch?v={video['id']['videoId']}"
            }
            for video in videos
        ]
    except Exception as e:
        logger.exception("YouTube fetch error")
        return [{"error": f"Failed to fetch videos: {str(e)}"}]

# --- AI-based fallback strategy generator ---
def generate_ai_summary(topic: str) -> str:
    if not OPENAI_API_KEY:
        logger.error("OpenAI API key missing.")
        return "No summary available, and AI key not configured."

    prompt = f"Provide a concise study summary and improvement strategies for the topic: {topic}."

    try:
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            max_tokens=200,
            temperature=0.7,
            n=1,
            stop=None,
        )
        return response.choices[0].text.strip()
    except Exception as e:
        logger.error(f"OpenAI API call failed: {e}")
        return "No summary available due to an AI error."

# --- Combined Study Material Fetch ---
def get_combined_study_material(topic: str) -> dict:
    web_summary = get_web_summary(topic)
    youtube_videos = get_youtube_videos(topic)
    
    return {
        "topic": topic,
        "summary": web_summary.get("summary"),
        "source": web_summary.get("source"),
        "read_more": web_summary.get("link"),
        "youtube_videos": youtube_videos
    }
def suggest_improvement_strategy(co_code: str) -> dict:
    co_definitions = {
        "CO1": "Understand basic computer fundamentals and terminology.",
        "CO2": "Apply computational thinking in problem solving.",
        "CO3": "Develop flowcharts and algorithms for simple problems.",
        "CO4": "Demonstrate knowledge of basic programming concepts.",
        "CO5": "Analyze and debug simple programs using logical reasoning."
    }

    topic = co_definitions.get(co_code)
    if not topic:
        return {
            "error": "Invalid CO code.",
            "strategy": None
        }
    
    # Fetch combined study materials and improvement strategies
    material = get_combined_study_material(topic)
    
    return {
        "co_code": co_code,
        "topic": topic,
        "summary": material.get("summary"),
        "source": material.get("source"),
        "read_more": material.get("read_more"),
        "youtube_videos": material.get("youtube_videos")
    }
