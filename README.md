# 더하기 게임

간단한 1자리 덧셈 게임으로, 6살 아이를 위한 객관식 문제입니다.

## 기능
- 랜덤 1자리 덧셈 문제
- 6개 선택지 (객관식)
- 정답/오답 피드백
- 자동 다음 문제 진행
- PWA 지원 (모바일 설치 가능)

## PWA 설정
- manifest.json: 앱 메타데이터
- sw.js: 오프라인 캐싱
- 아이콘: icon-192.png, icon-512.png (추가 필요)

## GitHub Pages에 올리기
1. GitHub에 새 저장소 생성
2. 로컬에서 Git 설치 (https://git-scm.com/)
3. 터미널에서:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/yourrepo.git
   git push -u origin main
   ```
4. GitHub 저장소 설정 > Pages > Source: main branch 선택
5. URL에서 게임 플레이 가능

## 모바일에서
- 브라우저에서 열고 "홈 화면에 추가"로 설치