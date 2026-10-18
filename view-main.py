import requests
from user_agent import *
import webbrowser
webbrowser.open("https://t.me/ZariaGnsBot")
link = input('LINK VIDEO => ')
cookies = {
    'token': '8448f07dbe815f16714d23b2d7a1df04',
    'ci_session': '36f5ed4a529b99b778a3da5983a1b0f373e79cc0',
    'cfzs_google-analytics_v4': '%7B%22mHFS_pageviewCounter%22%3A%7B%22v%22%3A%221%22%7D%7D',
    'cfz_google-analytics_v4': '%7B%22mHFS_engagementDuration%22%3A%7B%22v%22%3A%220%22%2C%22e%22%3A1800992819039%7D%2C%22mHFS_engagementStart%22%3A%7B%22v%22%3A1769456822607%2C%22e%22%3A1800992822729%7D%2C%22mHFS_counter%22%3A%7B%22v%22%3A%226%22%2C%22e%22%3A1800992819039%7D%2C%22mHFS_ga4sid%22%3A%7B%22v%22%3A%221702919522%22%2C%22e%22%3A1769458619039%7D%2C%22mHFS_session_counter%22%3A%7B%22v%22%3A%221%22%2C%22e%22%3A1800992819039%7D%2C%22mHFS_ga4%22%3A%7B%22v%22%3A%2294a306e5-c56b-4971-a152-a76c6931057d%22%2C%22e%22%3A1800992819039%7D%2C%22mHFS_let%22%3A%7B%22v%22%3A%221769456819039%22%2C%22e%22%3A1800992819039%7D%7D',
}

headers = {
    'authority': 'leofame.com',
    'accept': '*/*',
    'accept-language': 'ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7',
    'content-type': 'application/x-www-form-urlencoded',
    
    'origin': 'https://leofame.com',
    'referer': 'https://leofame.com/ar/free-tiktok-views',
    'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': str(generate_user_agent()),
}

params = {
    'api': '1',
}

data = {
    'token': '8448f07dbe815f16714d23b2d7a1df04',
    'timezone_offset': 'Asia/Baghdad',
    'free_link': link,
}

response = requests.post('https://leofame.com/ar/free-tiktok-views', params=params, cookies=cookies, headers=headers, data=data).json()

if 'error' in response:
    print('OpawVN.Xyz')

else:
    print('DONE')