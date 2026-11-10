"""Build linuxplus/index.html from src/. Run: python3 linuxplus/build.py"""
import glob, os
here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, "src")
shell = open(os.path.join(src, "shell.html")).read()
css = open(os.path.join(src, "style.css")).read()
files = [os.path.join(src, "engine.js")] + sorted(glob.glob(os.path.join(src, "sh", "*.js"))) + sorted(glob.glob(os.path.join(src, "modules", "*.js")))
parts = [open(f).read() for f in files]
scripts = "".join("<script>\n" + p + "\n</script>\n" for p in parts) + "<script>boot();</script>\n"
body = shell.replace("/*CSS*/", css).replace("/*SCRIPTS*/", scripts)
head = ('<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<meta name="description" content="Free interactive CompTIA Linux+ (XK0-006) study guide with a bash shell simulator, hands-on labs, flashcards, practice exams and a level-up system.">\n')
out = head + body
open(os.path.join(here, "index.html"), "w", encoding="utf-8").write(out)
print("built", len(out), "bytes")
