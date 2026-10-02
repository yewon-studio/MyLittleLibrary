"""Create public site data from a private reading list."""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
source = ROOT / "private" / "books.example.json"
if not source.exists():
    raise SystemExit("private/books.example.json이 없습니다. 파일을 확인하세요.")

books = json.loads(source.read_text(encoding="utf-8"))
if not isinstance(books, list):
    raise SystemExit("books.json 최상위 값은 배열이어야 합니다.")
required = ("id", "title", "author", "finished", "genre", "color")
seen = set()
for index, book in enumerate(books, 1):
    if not isinstance(book, dict) or any(not isinstance(book.get(k), str) or not book[k].strip() for k in required):
        raise SystemExit(f"{index}번째 책의 필수 문자열 항목을 확인하세요: {', '.join(required)}")
    if book["id"] in seen:
        raise SystemExit(f"중복된 id: {book['id']}")
    seen.add(book["id"])
    for key in ("impression", "recommendation"):
        if not isinstance(book.get(key), str):
            raise SystemExit(f"{index}번째 책의 {key}는 문자열이어야 합니다.")
    review_file = book.get("review_file", "")
    if review_file:
        if not isinstance(review_file, str) or not review_file.startswith("reviews/") or ".." in Path(review_file).parts or Path(review_file).is_absolute():
            raise SystemExit(f"{index}번째 책의 review_file은 reviews/파일명.txt 형식이어야 합니다.")
        review_path = ROOT / "private" / review_file
        if review_path.suffix.lower() != ".txt" or not review_path.is_file():
            raise SystemExit(f"{index}번째 책의 독후감 파일을 찾을 수 없습니다: {review_file}")
        book["review"] = review_path.read_text(encoding="utf-8").strip()
    elif not isinstance(book.get("review"), str):
        raise SystemExit(f"{index}번째 책에는 review 또는 review_file이 필요합니다.")
    if not (len(book["color"]) == 7 and book["color"][0] == "#" and all(c in "0123456789abcdefABCDEF" for c in book["color"][1:])):
        raise SystemExit(f"{index}번째 책의 color는 #RRGGBB 형식이어야 합니다.")
    cover = book.get("cover", "")
    if cover:
        if not isinstance(cover, str) or not cover.startswith("covers/") or ".." in Path(cover).parts or Path(cover).is_absolute():
            raise SystemExit(f"{index}번째 책의 cover는 covers/파일명 형식이어야 합니다.")
        source_cover = ROOT / "private" / cover
        if not source_cover.is_file() or source_cover.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            raise SystemExit(f"{index}번째 책의 표지 파일이 없거나 지원하지 않는 형식입니다: {cover}")
        target_cover = ROOT / "docs" / cover
        target_cover.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source_cover, target_cover)

output = ROOT / "docs" / "books.json"
output.write_text(json.dumps(books, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
config = json.loads((ROOT / "site-config.json").read_text(encoding="utf-8"))
(ROOT / "docs" / "site-config.json").write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(ROOT / "docs" / "book-data.js").write_text(
    "window.BOOKCASE_DATA = "
    + json.dumps({"books": books, "config": config}, ensure_ascii=True).replace("<", "\\u003c")
    + ";\n", encoding="utf-8"
)
readme = ROOT / "MyLittleLibrary"/ "README.md"
body = readme.read_text(encoding="utf-8")
start, end = "<!-- BOOKS_START -->", "<!-- BOOKS_END -->"
if start not in body or end not in body:
    raise SystemExit("README.md에서 책 목록 표시자를 찾을 수 없습니다.")
rows = ["| 읽은 책 | 작가 | 완독일 |", "| --- | --- | --- |"]
for book in books:
    cells = [str(book.get(key, "")).replace("|", "\\|").replace("\n", " ") for key in ("title", "author", "finished")]
    rows.append("| " + " | ".join(cells) + " |")
body = body[:body.index(start) + len(start)] + "\n" + "\n".join(rows) + "\n" + body[body.index(end):]
readme.write_text(body, encoding="utf-8")
print(f"{source.relative_to(ROOT)}에서 {len(books)}권을 읽어 docs/book-data.js와 docs/books.json을 갱신했습니다.")
print("이제 docs/index.html을 새로 열거나 브라우저에서 Ctrl+F5로 새로고침하세요.")
