# 🏠 자취남부동산 (Jachinam Real Estate)

자취남부동산은 유튜브 채널 '자취남'의 부동산 영상 데이터를 시각화하고 검색할 수 있는 웹 애플리케이션입니다.

---

## ✨ 이 웹사이트로 할 수 있는 것

- 🗺️ 전국 지도에서 원하는 지역의 부동산 정보를 한눈에 볼 수 있습니다
- 🔍 서울, 부산 등 원하는 지역만 선택해서 볼 수 있습니다
- 🏢 원하는 주거 형태(아파트, 원룸 등)를 선택할 수 있습니다
- 💰 보증금, 월세 범위를 설정해서 검색할 수 있습니다
- 📏 평수를 선택해서 원하는 크기의 집을 찾을 수 있습니다
- 📱 모바일에서도 편하게 사용할 수 있습니다

---

## 🛠️ 기술 스택

이 웹사이트는 다음과 같은 최신 기술들을 사용하여 만들어졌습니다:

- [Next.js](https://nextjs.org/) - 웹사이트의 기본 프레임워크
- [React](https://react.dev/) - 사용자 인터페이스 구현
- [Tailwind CSS](https://tailwindcss.com/) - 디자인 스타일링
- [Leaflet](https://leafletjs.com/) - 지도 표시 기능
- [React Select](https://react-select.com/) - 검색 필터 기능
- [Radix UI](https://www.radix-ui.com/) - 사용자 인터페이스 컴포넌트

---

## 📊 데이터 구조

부동산 정보는 다음과 같은 항목들을 포함하고 있습니다:

```json
{
  "title": "영상 제목",
  "notion": "노션 페이지 ID",
  "wide_area": "광역시/도",
  "area": "시/군/구",
  "type": "주거 유형",
  "contract": "계약 유형",
  "size": "평수",
  "deposit": "보증금",
  "rent": "월세",
  "youtube": "유튜브 영상 ID",
  "station": "주변 역",
  "tags": ["태그1", "태그2", ...],
  "area2": "동/읍/면",
  "date": "날짜"
}
```

---

## 🚀 개발 환경 설정

1. 저장소 다운로드
```bash
git clone [repository-url]
cd jachinam
```

2. 필요한 프로그램 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

4. 웹 브라우저에서 확인
```
http://localhost:3101
```

---

## 📝 데이터 업데이트

### 1. 데이터 파일 준비
1. `videosData_YYYYMMDD.json` 파일을 `src/data/` 폴더에 넣습니다
   - 파일 이름의 YYYYMMDD는 데이터 생성 날짜를 의미합니다
   - 예: `videosData_250503.json` (2025년 5월 3일 데이터)

### 2. 데이터 가공하기
1. 파이썬 스크립트 실행
```bash
python parse_title.py
```

2. 가공 과정
   - 영상 제목에서 노션 페이지 ID를 추출합니다
   - 유튜브 URL에서 영상 ID를 추출합니다
   - 불필요한 정보(썸네일 등)를 제거합니다
   - 데이터를 정리된 형태로 재구성합니다

3. 결과 파일
   - 가공된 데이터는 `src/data/videosData_YYYYMMDD_parsed.json` 파일로 저장됩니다
   - 이 파일이 웹사이트에서 사용되는 최종 데이터입니다

### 3. 데이터 형식
입력 파일(`videosData_YYYYMMDD.json`)은 다음과 같은 형식이어야 합니다:
```json
{
  "title": "영상 제목 (https://www.notion.so/노션ID)",
  "url": "https://www.youtube.com/watch?v=영상ID",
  "thumbnail": "썸네일URL",
  "region": "서울",
  "area": "강남구",
  "type": "아파트",
  "contract": "전세",
  "size": "32평",
  "deposit": "5억",
  "rent": "0",
  "station": "강남역",
  "tags": ["태그1", "태그2"]
}
```

### 4. 웹사이트 업데이트
1. 가공된 `videosData_YYYYMMDD_parsed.json` 파일을 `public/data/` 폴더로 복사합니다
2. Vercel에서 재배포합니다

---

## 📋 프로젝트 관리 가이드

### 1. GitHub 저장소 설정
1. [GitHub](https://github.com) 계정 생성
   - GitHub.com에서 회원가입을 합니다
   - 이메일 인증을 완료합니다

2. 새로운 저장소 생성
   - GitHub 대시보드에서 "New repository" 클릭
   - 저장소 이름 입력 (예: `jachinam-real-estate`)
   - "Public" 선택
   - "Create repository" 클릭

3. 소스 코드 업로드
   ```bash
   # 프로젝트 폴더에서
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/[사용자명]/jachinam-real-estate.git
   git push -u origin main
   ```

### 2. Vercel 배포 설정
1. [Vercel](https://vercel.com) 계정 생성
   - Vercel.com에서 회원가입
   - GitHub 계정으로 로그인 권장

2. 프로젝트 배포
   - Vercel 대시보드에서 "New Project" 클릭
   - GitHub 저장소 선택
   - 프로젝트 설정:
     - Framework Preset: Next.js
     - Build Command: `next build`
     - Output Directory: `.next`
     - Install Command: `npm install`
   - "Deploy" 클릭

3. 자동 배포 설정
   - GitHub의 main 브랜치에 코드가 푸시되면 자동으로 배포됩니다
   - 배포 상태는 Vercel 대시보드에서 확인 가능합니다

### 3. 데이터 관리
- 새로운 부동산 데이터가 추가될 때마다 위의 '데이터 업데이트' 섹션의 과정을 따라주세요
- 데이터 형식이 변경되거나 새로운 필드가 필요한 경우 개발자에게 문의해주세요

### 4. 웹사이트 배포
- 웹사이트는 [Vercel](https://vercel.com)을 통해 배포됩니다
- GitHub main 브랜치에 새로운 데이터를 푸시하면 자동으로 재배포됩니다
- 수동으로 재배포가 필요한 경우:
  1. Vercel 대시보드 접속
  2. 프로젝트 선택
  3. "Deployments" 탭에서 "Redeploy" 클릭

### 5. 기술 지원
- 웹사이트 운영 중 문제가 발생하거나 도움이 필요한 경우:
  - 이메일: minarae@gmail.com

### 6. 유지보수
- 정기적인 유지보수와 업데이트를 위해 개발자와 협의해주세요
- 보안 업데이트나 성능 개선이 필요한 경우 별도로 안내드립니다
