"""Build cysaplus/index.html from src/. Run: python3 cysaplus/build.py"""
import glob, os
here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, "src")
shell = open(os.path.join(src, "shell.html")).read()
css = open(os.path.join(src, "style.css")).read()
parts = [open(os.path.join(src, "engine.js")).read()] + [open(f).read() for f in sorted(glob.glob(os.path.join(src, "modules", "*.js")))]
parts.append(open(os.path.join(here, "..", "shared", "print-export.js"), encoding="utf-8").read())  # shared Print & export page
scripts = "".join("<script>\n" + p + "\n</script>\n" for p in parts) + "<script>boot();</script>\n"
body = shell.replace("/*CSS*/", css).replace("/*SCRIPTS*/", scripts)
head = ('<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<meta name="description" content="Free interactive CompTIA CySA+ (CS0-004) study guide with simulations, flashcards, practice exams and a level-up system.">\n')
out = head + body
open(os.path.join(here, "index.html"), "w", encoding="utf-8").write(out)
print("built", len(out), "bytes")
