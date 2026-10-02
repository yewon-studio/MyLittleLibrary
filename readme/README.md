# 나의 독서 책장

읽은 책을 책장에 꽂고, 책등을 누르면 독후감을 펼쳐 보는 GitHub Pages 템플릿입니다. 사이트의 제목과 주소는 `site-config.json`에서 자유롭게 바꿀 수 있습니다.

> **[책장 열어보기](docs/index.html)** · GitHub Pages를 설정한 뒤 이 링크를 자신의 Pages 주소로 바꾸면 방문자가 바로 책장으로 이동할 수 있습니다.

## 읽은 책

`python build.py`를 실행하면 이 표가 자동으로 채워집니다.

<!-- BOOKS_START -->
| 읽은 책 | 작가 | 완독일 |
| --- | --- | --- |
| 니체의 가르침, 단독자로 살아라 | 프리드리히 니체 | 2026-09-25 |
<!-- BOOKS_END -->

## 시작하기

1. 이 폴더를 새 GitHub 저장소에 넣습니다. GitHub Pages에서 **Deploy from a branch → main → /docs**를 선택합니다.
2. `site-config.json`의 `title`, `subtitle`, `footer`를 원하는 문구로 바꿉니다. `python build.py`가 사이트용 설정에도 반영합니다.
3. **`private/books.example.json`을 직접 열어** 책 정보와 `review` 독후감을 적습니다. 다른 파일로 복사할 필요가 없습니다.
4. 템플릿 폴더에서 `python build.py`를 실행합니다. 터미널에 `docs/book-data.js와 docs/books.json을 갱신했습니다`라는 문구가 나오는지 확인하세요.
5. `docs/index.html`을 다시 열거나 브라우저에서 `Ctrl+F5`로 새로고침합니다. 공개 저장소에는 `docs/`의 게시 결과와 공개용 README만 올립니다. 책을 고칠 때마다 다시 빌드하고 `docs/book-data.js`, `docs/books.json` 및 새 표지를 게시하세요.

이 버전은 `docs/index.html`을 로컬 브라우저에서 직접 열어도 빌드된 책이 보입니다. **같은 이름의 이전 압축을 풀 때는 전체 파일을 교체**하세요. 특히 `docs/index.html`, `docs/app.js`, `docs/book-data.js`가 같은 버전이어야 합니다.

## 책 추가 형식

`private/books.example.json`은 책 배열입니다. 다음처럼 추가하세요.

```json
[
  {
    "id": "my-first-book",
    "title": "책 제목",
    "author": "지은이",
    "finished": "2026-09-25",
    "genre": "소설",
    "color": "#7d504a",
    "cover": "covers/my-first-book.jpg",
    "impression": "읽고 난 뒤의 느낌을 적습니다.",
    "recommendation": "이런 분께 추천합니다.",
    "review": "review_file에 있는 .txt파일을 불러옵니다.",
    "review_file": "reviews/textname.txt"
  }
]
```

`color`는 책등 색상입니다. `impression`과 `recommendation`은 첫 페이지에 고정되고, `review`는 다음 페이지부터 시작하는 독후감 본문입니다. 세 항목은 빈 문자열도 가능합니다. 실제 책의 문장을 길게 옮기기보다는 자신의 감상을 적어 주세요.

표지 이미지는 `private/covers/my-first-book.jpg`에 넣고 `cover`에 `covers/my-first-book.jpg`를 적으세요. JPG·PNG·WebP를 지원합니다. 이미지가 없으면 `cover`를 빈 문자열로 두면 됩니다. `python build.py`가 이미지를 `docs/covers/`로 복사합니다. **게시용 표지 이미지는 공개됩니다.** 직접 촬영하거나 게시 권한이 있는 이미지를 사용하세요. 표지 아래에 제목·작가·읽은 날짜가 표시되며, 오른쪽 첫 페이지에는 두 항목이 고정되며, 다음 페이지부터 `review`의 긴 글이 페이지 단위로 펼쳐집니다.

## 공개 범위와 편집 권한

`private/books.example.json`은 `.gitignore`로 추적에서 제외됩니다. 반면 `python build.py`가 만든 `docs/books.json`과 그 안의 독후감은 방문자에게 **공개**됩니다. 게시할 내용만 입력하세요. 비공개로 남길 글은 별도의 개인 파일에 보관하세요.

`.gitignore`는 파일 업로드를 막을 뿐, 저장소의 편집 권한을 설정하지 않습니다. 본인만 수정할 수 있게 하려면 GitHub 저장소에 다른 협업자를 추가하지 않고, 브랜치 보호 규칙 등 저장소 권한을 관리해야 합니다. 이미 추적 중인 비공개 원고는 `.gitignore`만 추가해도 숨겨지지 않습니다. 실제 개인 원고나 비밀 정보는 커밋하지 마세요.

첫 화면은 샘플 도서로 미리보기됩니다. `docs/books.json`이 생성되면 샘플 대신 내 책장이 표시됩니다. 상단 제목은 예시 이름에 묶이지 않습니다.
