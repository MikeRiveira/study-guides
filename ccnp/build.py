"""Build ccnp/index.html from src/. Run: python3 ccnp/build.py"""
import glob, os
here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, "src")
shell = open(os.path.join(src, "shell.html")).read()
css = open(os.path.join(src, "style.css")).read()
files = [os.path.join(src, "engine.js")] + sorted(glob.glob(os.path.join(src, "ios", "*.js"))) + sorted(glob.glob(os.path.join(src, "modules", "*.js")))
parts = [open(f).read() for f in files]
scripts = "".join("<script>\n" + p + "\n</script>\n" for p in parts) + "<script>boot();</script>\n"
body = shell.replace("/*CSS*/", css).replace("/*SCRIPTS*/", scripts)
head = ('<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<meta name="description" content="Free interactive Cisco CCNP Enterprise ENCOR (350-401 v1.2) study guide with a Cisco IOS command-line simulator, labs, an API sandbox, flashcards, a practice exam and a level-up system.">\n')
out = head + body
open(os.path.join(here, "index.html"), "w", encoding="utf-8").write(out)
print("built", len(out), "bytes")
