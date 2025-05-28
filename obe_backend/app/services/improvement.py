# import os
# import logging
# from urllib.parse import urlparse
# from bs4 import BeautifulSoup
# from dotenv import load_dotenv
# import httpx

# # Load environment variables
# load_dotenv()

# # Logging setup
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # API keys
# GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
# SEARCH_ENGINE_ID = os.getenv("SEARCH_ENGINE_ID")
# YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# # Runtime flags to avoid repeated failing API calls
# google_api_blocked = False
# youtube_api_blocked = False

# # Preferred sites to search first
# preferred_sites = [
#     "geeksforgeeks.org",
#     "tutorialspoint.com",
#     "programiz.com",
#     "w3schools.com",
#     "javatpoint.com"
# ]

# def is_valid_url(url: str) -> bool:
#     parsed = urlparse(url)
#     return parsed.scheme in ('http', 'https') and parsed.netloc

# async def search_google_custom(query: str, num_results: int = 5):
#     global google_api_blocked
#     if google_api_blocked:
#         logger.warning("Google API call blocked due to previous failure or quota exhaustion.")
#         return []

#     search_url = "https://www.googleapis.com/customsearch/v1"
#     params = {
#         "key": GOOGLE_API_KEY,
#         "cx": SEARCH_ENGINE_ID,
#         "q": query,
#         "num": num_results,
#     }

#     try:
#         async with httpx.AsyncClient() as client:
#             response = await client.get(search_url, params=params)
#             response.raise_for_status()
#             results = response.json()
#             return results.get("items", [])
#     except httpx.HTTPStatusError as e:
#         if e.response.status_code == 403:
#             google_api_blocked = True
#             logger.warning("Google API quota likely exceeded or access forbidden. Blocking further calls.")
#         logger.warning(f"Google search failed: {e}")
#         return []

# async def extract_text_from_url(url: str) -> str:
#     try:
#         async with httpx.AsyncClient() as client:
#             response = await client.get(url, timeout=10)
#             response.raise_for_status()
#             soup = BeautifulSoup(response.text, "html.parser")
#             paragraphs = soup.select("div.text > p") or soup.select("article > p") or soup.find_all("p")
#             extracted = [p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)]
#             return "\n".join(extracted[:5]) if extracted else ""
#     except Exception as e:
#         logger.warning(f"Failed to extract text from {url}: {e}")
#         return ""

# async def scrape_directly(topic: str) -> dict:
#     site_url_patterns = {
#         "geeksforgeeks.org": f"https://www.geeksforgeeks.org/{topic.lower().replace(' ', '-')}/",
#         "tutorialspoint.com": f"https://www.tutorialspoint.com/{topic.lower().replace(' ', '_')}/index.htm",
#         "programiz.com": f"https://www.programiz.com/{topic.lower().replace(' ', '-')}",
#         "w3schools.com": f"https://www.w3schools.com/{topic.lower().replace(' ', '_')}.asp",
#         "javatpoint.com": f"https://www.javatpoint.com/{topic.lower().replace(' ', '-')}",
#     }

#     for domain, url in site_url_patterns.items():
#         if is_valid_url(url):
#             summary = await extract_text_from_url(url)
#             if summary:
#                 return {
#                     "web_summary": summary,
#                     "web_source": domain,
#                     "read_more": url
#                 }
#     return {
#         "web_summary": None,
#         "web_source": None,
#         "read_more": None
#     }

# async def get_web_summary(topic: str) -> dict:
#     for site in preferred_sites:
#         query = f"{topic} site:{site}"
#         results = await search_google_custom(query)
#         for item in results:
#             link = item.get("link")
#             if is_valid_url(link):
#                 summary = await extract_text_from_url(link)
#                 if summary:
#                     return {
#                         "web_summary": summary,
#                         "web_source": urlparse(link).netloc,
#                         "read_more": link,
#                     }

#     # Fallback direct scraping if Google fails or returns nothing
#     fallback_data = await scrape_directly(topic)
#     return fallback_data


# def get_youtube_videos(query: str, api_key: str = YOUTUBE_API_KEY) -> list:
#     global youtube_api_blocked
#     if youtube_api_blocked:
#         logger.warning("YouTube API call blocked due to previous quota error.")
#         return [{"error": "YouTube API calls disabled due to previous failure."}]

#     if not api_key:
#         logger.error("YouTube API key missing.")
#         return [{"error": "YouTube API key missing. Please check your .env file."}]

#     url = "https://www.googleapis.com/youtube/v3/search"
#     params = {
#         "part": "snippet",
#         "q": query,
#         "type": "video",
#         "maxResults": 5,
#         "key": api_key
#     }

#     try:
#         response = httpx.get(url, params=params)
#         response.raise_for_status()
#         videos = response.json().get("items", [])
#         return [
#             {
#                 "title": video["snippet"]["title"],
#                 "url": f"https://www.youtube.com/watch?v={video['id']['videoId']}"
#             }
#             for video in videos
#         ]
#     except httpx.HTTPStatusError as e:
#         if e.response.status_code == 403:
#             youtube_api_blocked = True
#             logger.warning("YouTube API quota exceeded or access forbidden. Blocking further calls.")
#         logger.warning(f"YouTube fetch error: {e}")
#         return [{"error": "Failed to fetch YouTube videos due to quota or access issues."}]
#     except Exception as e:
#         logger.exception("YouTube fetch error")
#         return [{"error": f"Failed to fetch videos: {str(e)}"}]

# async def get_combined_study_material(topic: str) -> dict:
#     web_data = await get_web_summary(topic)
#     youtube_videos = get_youtube_videos(topic)

#     return {
#         "topic": topic,
#         "web_summary": web_data.get("web_summary"),
#         "web_source": web_data.get("web_source"),
#         "read_more": web_data.get("read_more"),
#         "youtube_videos": youtube_videos
#     }

# async def suggest_improvement_strategy(co_code: str, topic: str = None) -> dict:
#     if not topic:
#         topic = co_code

#     material = await get_combined_study_material(topic)

#     return {
#         "co_code": co_code,
#         "topic": topic,
#         "web_summary": material.get("web_summary"),
#         "web_source": material.get("web_source"),
#         "read_more": material.get("read_more"),
#         "youtube_videos": material.get("youtube_videos")
#     }
#     }import logging


from urllib.parse import urlparse
from bs4 import BeautifulSoup
import httpx
from functools import lru_cache
import asyncio
import re
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Logging setup
logging.basicConfig(level=logging.INFO)

# Updated preferred sites with working search URLs
preferred_sites = [
    ("geeksforgeeks.org", "https://www.geeksforgeeks.org/?s={}"),
    ("tutorialspoint.com", "https://www.tutorialspoint.com/tutorialslibrary.htm?search={}"),
    ("programiz.com", "https://www.programiz.com/search?q={}"),
    ("w3schools.com", "https://www.w3schools.com/howto/howto_search.asp?q={}"),
    # Commented out due to DNS issues, you can enable if fixed
    # ("javatpoint.com", "https://www.javatpoint.com/search.asp?word={}")
]

def is_valid_url(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme in ('http', 'https') and parsed.netloc

@lru_cache(maxsize=128)
def cache_key(url: str):
    return url

@lru_cache(maxsize=128)
def cached_youtube_link(query: str):
    return f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}"

async def extract_text_from_url(url: str, topic: str = None, source_name: str = None) -> dict:
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(url, timeout=5)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")

            # Try to get paragraphs from common containers
            paragraphs = soup.select("div.text > p") or soup.select("article > p") or soup.find_all("p")
            para_texts = [p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)]
            
            if topic:
                topic_keywords = [w.lower() for w in re.findall(r'\w+', topic)]
                para_texts = [
                    text for text in para_texts
                    if any(keyword in text.lower() for keyword in topic_keywords)
                ]

            lines = []
            for para in para_texts:
                # Split on sentence endings, keep lines longer than 30 chars
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

@lru_cache(maxsize=128)
def cached_search_key(topic: str):
    return topic.lower().strip()

async def get_web_summary(topic: str) -> dict:
    key = cached_search_key(topic)
    if hasattr(get_web_summary, '_cache') and key in get_web_summary._cache:
        return get_web_summary._cache[key]

    summaries = []
    for domain, search_url in preferred_sites:
        try:
            query_url = search_url.format(topic.replace(" ", "+"))
            async with httpx.AsyncClient(follow_redirects=True) as client:
                search_response = await client.get(query_url, timeout=10)
                search_response.raise_for_status()
                soup = BeautifulSoup(search_response.text, "html.parser")

                links = soup.find_all("a", href=True)
                visited = set()

                for link in links:
                    href = link['href']
                    if domain in href and is_valid_url(href) and href not in visited:
                        visited.add(href)
                        summary = await extract_text_from_url(href, topic=topic, source_name=domain.title().split('.')[0])
                        if summary:
                            summaries.append(summary)
                            if len(summaries) >= 5:
                                break

        except Exception as e:
            logger.warning(f"Search on {domain} failed: {e}")

    if not summaries:
        summaries = [{"text": "No relevant content found.", "source": "N/A"}]

    result = {"web_summaries": summaries}

    if not hasattr(get_web_summary, '_cache'):
        get_web_summary._cache = {}
    get_web_summary._cache[key] = result
    return result

def get_youtube_videos(query: str) -> list:
    return [{
        "title": f"Search on YouTube: {query}",
        "url": cached_youtube_link(query)
    }]

async def get_combined_study_material(topic: str) -> dict:
    web_data = await get_web_summary(topic)
    youtube_videos = get_youtube_videos(topic)

    return {
        "topic": topic,
        "web_summaries": web_data.get("web_summaries", []),
        "youtube_videos": youtube_videos
    }

async def suggest_improvement_strategy(co: str, co_definition: str = None) -> dict:
    topic = co_definition if co_definition else co
    material = await get_combined_study_material(topic)

    return {
        "co": co,
        "definition": co_definition,
        "topic": topic,
        "web_summaries": material.get("web_summaries"),
        "youtube_videos": material.get("youtube_videos")
    }