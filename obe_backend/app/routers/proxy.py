# from fastapi import APIRouter, HTTPException
# import requests

# router = APIRouter()

# @router.post("/proxy/get_key")
# def get_key_proxy():
#     url = "https://extensions.aitopia.ai/extensions/app/get_key"

#     headers = {
#         "Content-Type": "application/json"
#     }

#     payload = {
#         "ai_mode": "local",
#         "lang": "en",
#         "model": "GPT-4o Mini",
#         "settings": {},
#         "v": "5.8.0"
#     }

#     try:
#         response = requests.post(url, json=payload, headers=headers)
#         return response.json()
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
