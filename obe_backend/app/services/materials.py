# import requests
# from bs4 import BeautifulSoup
# from dotenv import load_dotenv
# from sklearn.feature_extraction.text import TfidfVectorizer, ENGLISH_STOP_WORDS
# from googlesearch import search
# from urllib.parse import urlparse
# import os
# import logging

# # Load environment variables
# load_dotenv()

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


# # --- TF-IDF Keyword Extraction ---
# def extract_keywords_tfidf(topic: str, top_k: int = 3) -> list:
#     vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
#     X = vectorizer.fit_transform([topic])
#     tfidf_scores = list(zip(vectorizer.get_feature_names_out(), X.toarray()[0]))
#     sorted_keywords = sorted(tfidf_scores, key=lambda x: x[1], reverse=True)
#     return [kw for kw, _ in sorted_keywords[:top_k]]


# # --- Helper: URL Validation ---
# def is_valid_url(url: str) -> bool:
#     parsed = urlparse(url)
#     return parsed.scheme in ('http', 'https') and parsed.netloc


# # --- GFG or Other Site Summary Fetch ---
# def get_web_summary(topic: str, source_site: str = "geeksforgeeks.org") -> dict:
#     try:
#         query = f"{topic} site:{source_site}"
#         urls = list(search(query, num_results=5))

#         if not urls:
#             # Try with TF-IDF keywords if original query fails
#             keywords = extract_keywords_tfidf(topic)
#             logger.info(f"TF-IDF keywords: {keywords}")
#             for i in range(len(keywords)):
#                 for j in range(i + 1, len(keywords)):
#                     sub_query = f"{keywords[i]} {keywords[j]} site:{source_site}"
#                     logger.info(f"Searching: {sub_query}")
#                     urls = list(search(sub_query, num_results=3))
#                     if urls:
#                         break
#                 if urls:
#                     break

#         if not urls or not is_valid_url(urls[0]):
#             return {
#                 "summary": "No relevant articles found for this topic.",
#                 "link": None
#             }

#         target_url = urls[0]
#         response = requests.get(target_url, timeout=10)
#         response.raise_for_status()
#         soup = BeautifulSoup(response.text, "html.parser")

#         paragraphs = soup.select("div.text > p") or soup.select("article > p") or soup.find_all("p")
#         extracted = [p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)]

#         if not extracted:
#             return {"summary": "Could not extract article content.", "link": target_url}

#         summary_text = "\n".join(extracted[:5])  # First 5 lines
#         return {
#             "summary": summary_text,
#             "link": target_url
#         }

#     except Exception as e:
#         logger.exception("Web summary fetch error")
#         return {
#             "summary": f"Error fetching summary: {str(e)}",
#             "link": None
#         }


# # --- YouTube API Fetch ---
# def get_youtube_videos(query: str, api_key: str = YOUTUBE_API_KEY) -> list:
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
#         response = requests.get(url, params=params)
#         response.raise_for_status()
#         videos = response.json().get("items", [])
#         return [
#             {
#                 "title": video["snippet"]["title"],
#                 "url": f"https://www.youtube.com/watch?v={video['id']['videoId']}"
#             }
#             for video in videos
#         ]
#     except Exception as e:
#         logger.exception("YouTube fetch error")
#         return [{"error": f"Failed to fetch videos: {str(e)}"}]


# # --- Combined Study Material Fetch ---
# def get_combined_study_material(topic: str, youtube_api_key: str = YOUTUBE_API_KEY) -> dict:
#     gfg_result = get_web_summary(topic, source_site="geeksforgeeks.org")
#     return {
#         "topic": topic,
#         "youtube_videos": get_youtube_videos(topic, api_key=youtube_api_key),
#         "gfg_summary": gfg_result["summary"],
#         "read_more": gfg_result["link"]
#     }
