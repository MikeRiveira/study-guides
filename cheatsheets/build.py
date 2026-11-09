"""Build cheatsheets/index.html from src/. Run: python3 cheatsheets/build.py"""
import os
here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, "src")
read = lambda name: open(os.path.join(src, name), encoding="utf-8").read()
scripts = "".join("<script>\n" + read(f) + "\n</script>\n" for f in ("data.js", "app.js")) + "<script>boot();</script>\n"
body = read("shell.html").replace("/*CSS*/", read("style.css")).replace("/*SCRIPTS*/", scripts)
head = ('<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<meta name="description" content="Free printable IT cheat sheets: ports and protocols, subnetting, OSI model, Windows, Linux and Cisco IOS commands, acronyms, Wi-Fi, cables, RAID and attacks.">\n')
out = head + body
open(os.path.join(here, "index.html"), "w", encoding="utf-8").write(out)
print("built", len(out), "bytes")
