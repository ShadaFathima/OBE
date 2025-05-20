# import requests
# import openai
# import os
# from urllib.parse import quote

# # Load from environment securely (you need to create a .env file)
# openai.api_key = os.getenv("OPENAI_API_KEY")

# def fetch_youtube_links(query, max_results=3):
#     search_url = f"https://www.youtube.com/results?search_query={quote(query)}+lecture"
#     return [f"{search_url}&page={i+1}" for i in range(max_results)]  # mock links

# def fetch_wikipedia_summary(query):
#     url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(query)}"
#     try:
#         response = requests.get(url)
#         if response.status_code == 200:
#             data = response.json()
#             return data.get("extract", "No summary found.")
#         return "Wikipedia content not found."
#     except Exception as e:
#         return f"Error fetching Wikipedia content: {str(e)}"

# def generate_ai_explanation(topic):
#     try:
#         response = openai.ChatCompletion.create(
#             model="gpt-4",
#             messages=[
#                 {"role": "system", "content": "You are a helpful tutor."},
#                 {"role": "user", "content": f"Explain {topic} to a college student with examples."}
#             ]
#         )
#         return response.choices[0].message.content.strip()
#     except Exception as e:
#         return f"OpenAI error: {str(e)}"

# def get_combined_materials(topic):
#     # Fetch from all sources
#     youtube_links = fetch_youtube_links(topic)
#     wikipedia_summary = fetch_wikipedia_summary(topic)
#     ai_explanation = generate_ai_explanation(topic)

#     # Return de-duplicated and categorized content
#     return {
#         "wikipedia_summary": wikipedia_summary,
#         "youtube_links": youtube_links,
#         "ai_explanation": ai_explanation,
#         "refer_to": {
#             "Wikipedia": f"https://en.wikipedia.org/wiki/{quote(topic)}",
#             "YouTube": f"https://www.youtube.com/results?search_query={quote(topic)}+lecture"
#         }
#     }
