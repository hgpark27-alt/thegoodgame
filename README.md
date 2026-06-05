# Credit Generator Battle

2인용 실시간 경쟁 방치형 클릭 게임. Firebase Realtime Database + GitHub Pages로 구동됩니다.

---

## 1. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/) 접속 → **프로젝트 추가**
2. 프로젝트 생성 후 **Realtime Database** 활성화 (테스트 모드로 시작)
3. 좌측 메뉴 **⚙️ 프로젝트 설정** → **일반** 탭 → **내 앱** 섹션
4. 웹 앱(`</>`) 추가 → 앱 등록 → **firebaseConfig 복사**
5. `firebase-config.js` 파일을 열어 복사한 값으로 교체:

```js
const firebaseConfig = {
  apiKey:            "실제 값으로 교체",
  authDomain:        "...",
  databaseURL:       "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId:         "...",
  storageBucket:     "...",
  messagingSenderId: "...",
  appId:             "..."
};
```

---

## 2. Firebase Realtime Database 규칙

Firebase Console → **Realtime Database** → **규칙** 탭에 붙여넣기:

```json
{
  "rules": {
    "game": {
      ".read": true,
      ".write": true,
      "slots": {
        "$slot": {
          ".validate": "$slot === '0' || $slot === '1'"
        }
      }
    }
  }
}
```

> ⚠️ 공개 배포 시 규칙을 강화하세요.

---

## 3. GitHub Pages 배포

```bash
# 최초 1회
git init
git add .
git commit -m "init"
git remote add origin https://github.com/hgpark27-alt/thegoodgame.git
git branch -M main
git push -u origin main
```

GitHub 저장소 → **Settings** → **Pages** → Source: `Deploy from a branch` → Branch: `main / (root)` → **Save**

잠시 후 `https://hgpark27-alt.github.io/thegoodgame/` 에서 플레이 가능합니다.

---

## 4. 로컬 실행

브라우저에서 `index.html`을 직접 열면 Firebase 연결은 되지만, 일부 브라우저는 `file://` 프로토콜에서 CORS 오류를 냅니다.

간단한 로컬 서버 실행 방법:

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

브라우저에서 `http://localhost:8080` 접속.

---

## 게임 방법

1. 두 개의 슬롯 중 하나의 **참여하기** 클릭
2. 닉네임 입력 후 JOIN
3. **Generator** 버튼을 클릭해 Credit 획득
4. 상점에서 업그레이드 구매
5. 두 플레이어 모두 나가면 게임 초기화

---

## 기술 스택

- Vanilla HTML / CSS / JavaScript
- Firebase Realtime Database (실시간 동기화)
- GitHub Pages (호스팅)
