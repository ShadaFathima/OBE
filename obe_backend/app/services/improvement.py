from urllib.parse import urlparse
from bs4 import BeautifulSoup
import httpx
import asyncio
import re
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.crud import get_study_material_by_topic, save_study_material_from_suggestion
from fastapi import Depends
from app.services.db import get_db


logger = logging.getLogger(__name__)

preferred_sites = [
    ("geeksforgeeks.org", "https://www.geeksforgeeks.org/?s={}"),
    ("tutorialspoint.com", "https://www.tutorialspoint.com/tutorialslibrary.htm?search={}"),
    ("programiz.com", "https://www.programiz.com/search?q={}"),
    ("w3schools.com", "https://www.w3schools.com/howto/howto_search.asp?q={}"),
]

def is_valid_url(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme in ('http', 'https') and parsed.netloc

async def get_youtube_links(query: str) -> list[str]:
    search_url = f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}"
    video_urls = []
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(search_url, timeout=10)
            response.raise_for_status()
            html = response.text
            video_ids = re.findall(r"watch\?v=([a-zA-Z0-9_-]{11})", html)
            seen = set()
            for vid in video_ids:
                if vid not in seen:
                    seen.add(vid)
                    video_urls.append(f"https://www.youtube.com/watch?v={vid}")
                if len(video_urls) >= 3:
                    break
    except Exception as e:
        logger.warning(f"Failed to fetch YouTube links for '{query}': {e}")
    return video_urls

async def extract_text_from_url(url: str, topic: str = None, source_name: str = None) -> dict:
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(url, timeout=5)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            paragraphs = soup.select("div.text > p") or soup.select("article > p") or soup.find_all("p")
            para_texts = [p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)]
            if topic:
                topic_keywords = [w.lower() for w in re.findall(r'\w+', topic.strip().lower())]
                filtered_paras = []
                for text in para_texts:
                    lower_text = text.lower()
                    matches = sum(1 for k in topic_keywords if k in lower_text)
                    if matches >= 2 or matches >= len(topic_keywords) / 2:
                        if not re.search(r"please enter valid|subscribe|advertisement|cookie", lower_text):
                            filtered_paras.append(text)
                para_texts = filtered_paras
            lines = []
            for para in para_texts:
                lines.extend([line.strip() for line in re.split(r'[.?!]\s+', para) if len(line.strip()) > 30])
            if lines:
                return {
                    "text": lines[0],
                    "source": source_name,
                    "read_more": url
                }
    except Exception as e:
        logger.warning(f"Failed to extract from {url}: {e}")
    return None

async def fetch_and_store_material(topic: str, db: AsyncSession):
    web_summaries = []
    visited_texts = set()
    youtube_videos = await get_youtube_links(topic)
    for domain, search_url in preferred_sites:
        try:
            query_url = search_url.format(topic.replace(" ", "+"))
            async with httpx.AsyncClient(follow_redirects=True) as client:
                response = await client.get(query_url, timeout=10)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, "html.parser")
                links = soup.find_all("a", href=True)
                visited = set()
                for link in links:
                    href = link['href']
                    if domain in href and is_valid_url(href) and href not in visited:
                        visited.add(href)
                        summary = await extract_text_from_url(href, topic, domain.title().split('.')[0])
                        if summary and summary['text'] not in visited_texts:
                            web_summaries.append(summary)
                            visited_texts.add(summary['text'])
                            if len(web_summaries) >= 5:
                                break
        except Exception as e:
            logger.warning(f"Search on {domain} failed: {e}")

    return await save_study_material_from_suggestion(
        db,
        topic,
        suggestion={
            "material": web_summaries,
            "youtube_query": youtube_videos[0] if youtube_videos else ""
        }
    )
async def get_combined_study_material(topic: str, db: AsyncSession):
    if not topic or not topic.strip():
        logger.warning("Empty or null topic received in get_combined_study_material")
        return None

    cached = await get_study_material_by_topic(db, topic.strip().lower())
    if cached:
        youtube_videos = cached.get("youtube_videos", [])
        web_summaries = cached.get("web_summaries", [])
    else:
        saved = await fetch_and_store_material(topic, db)  # returns model instance or None
        if saved:
            # saved is model instance — access attributes, no .get()
            youtube_videos = saved.youtube_videos or []
            web_summaries = saved.web_summaries or []
        else:
            youtube_videos = []
            web_summaries = []

    return {
        "topic": topic,
        "web_summaries": web_summaries,
        "youtube_videos": youtube_videos
    }

async def suggest_improvement_strategy(co: str, co_definition: str = None, db: AsyncSession = None) -> dict:
    topic = co_definition if co_definition else co
    material = await get_combined_study_material(topic, db)
    return {
        "co": co,
        "definition": co_definition,
        "material": material.get("web_summaries", []),
        "youtube_videos": material.get("youtube_videos", [])[0]['url'] if material.get("youtube_videos") else ""
    }

