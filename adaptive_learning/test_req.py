import urllib.request, json, urllib.error
body = json.dumps({'student_id': '3fa85f64-5717-4562-b3fc-2c963f66afa6', 'module': 'math', 'name': 'Test'}).encode('utf-8')
req = urllib.request.Request('http://localhost:8001/session/start', data=body, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print("Success:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('HTTP ERROR', e.code)
    print(e.read().decode('utf-8'))
except Exception as e:
    print('OTHER ERROR', e)
