import json
import re


def parse_title(title):
    # URL 패턴 찾기
    url_pattern = r'\(https://www\.notion\.so/([^)]+)\)'
    match = re.search(url_pattern, title)

    if match:
        # URL에서 notion ID 추출
        notion_id = match.group(1)
        # title에서 URL 부분 제거
        clean_title = title.replace(
            f'(https://www.notion.so/{notion_id})', ''
        ).strip()
        return clean_title, notion_id
    return title, None


def parse_youtube_url(url):
    # 유튜브 ID 추출
    match = re.search(r'v=([\w-]+)', url)
    if match:
        return match.group(1)
    return None


def process_json_file(input_file, output_file):
    # JSON 파일 읽기
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 각 항목 처리
    for idx, item in enumerate(data):
        if 'title' in item:
            clean_title, notion_id = parse_title(item['title'])
            # 기존 notion 필드 제거
            if 'notion' in item:
                del item['notion']
            # url -> youtube, thumbnail 삭제, title/노션/나머지 순서로 재정렬
            new_item = {}
            new_item['title'] = clean_title
            if notion_id:
                new_item['notion'] = notion_id
            new_item['region'] = '서울'
            for key in item.keys():
                if key == 'url':
                    youtube_id = parse_youtube_url(item[key])
                    if youtube_id:
                        new_item['youtube'] = youtube_id
                elif key == 'thumbnail':
                    continue  # thumbnail은 삭제
                elif key not in ['title', 'notion', 'youtubeId']:
                    new_item[key] = item[key]
            item.clear()
            item.update(new_item)

    # 결과를 새 파일에 저장
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    input_file = 'src/data/videosData_250526.json'
    output_file = 'src/data/videosData_250526_parsed.json'
    process_json_file(input_file, output_file)