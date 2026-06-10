import requests

# 测试邮箱登录
print("测试邮箱登录...")
try:
    r = requests.post(
        'http://localhost:8000/api/auth/login',
        data={'username': 'admin@creoai.com', 'password': 'admin123'}
    )
    print(f"状态码: {r.status_code}")
    print(f"响应: {r.json()}")
except Exception as e:
    print(f"错误: {e}")

# 测试手机号登录
print("\n测试手机号登录...")
try:
    r = requests.post(
        'http://localhost:8000/api/auth/login',
        data={'username': '13800138000', 'password': 'admin123'}
    )
    print(f"状态码: {r.status_code}")
    print(f"响应: {r.json()}")
except Exception as e:
    print(f"错误: {e}")
