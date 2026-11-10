/* ================= Module 4: Automation, Orchestration and Scripting (XK0-006 Domain 4.0, 17%) ================= */
(function(){
const R=(w,...cmds)=>{const s=LX.session(w,"root");cmds.forEach(c=>LX.exec(s,c))};
const A=(w,...cmds)=>{const s=LX.session(w,"admin");cmds.forEach(c=>LX.exec(s,c))};
const node=(w,p)=>LX.lookup(w,p);
const rd=(w,p)=>LX.read(w,p)||"";
const isExec=(w,p)=>{const n=node(w,p);return !!n&&!!(n.mode&0o100)};
const gitId=w=>A(w,"git config --global user.name 'Admin'","git config --global user.email admin@example.lan");
const keys=w=>{A(w,"ssh-keygen -t ed25519 -N '' -f ~/.ssh/id_ed25519 -q");const pub=rd(w,"/home/admin/.ssh/id_ed25519.pub").trim().split(/\s+/)[1];["10.0.0.20","10.0.0.21"].forEach(ip=>{const Rm=LX.remoteHost(w,ip);Rm.keys.admin=[pub]});A(w,"ssh-keyscan 10.0.0.20 10.0.0.21 >> ~/.ssh/known_hosts 2>/dev/null")};
const LABS={
 script:{title:"Shell exercise: your first script",
   scenario:"Write ~/diskcheck.sh. It takes a mount point as its first argument (default /), prints its usage percentage, and exits with status 1 if usage is above a threshold given as the second argument (default 80).",
   tasks:[{t:"Create ~/diskcheck.sh starting with a #!/bin/bash shebang",hint:"vim ~/diskcheck.sh",check:w=>/^#!\s*\/(usr\/)?bin\/(env\s+)?bash/.test(rd(w,"/home/admin/diskcheck.sh"))},
     {t:"Make it executable",hint:"chmod +x ~/diskcheck.sh",check:w=>isExec(w,"/home/admin/diskcheck.sh")},
     {t:"Running ./diskcheck.sh / 90 prints the usage and exits 0",hint:"#!/bin/bash\nmnt=${1:-/}\nmax=${2:-80}\nuse=$(df \"$mnt\" --output=pcent | tail -1 | tr -dc 0-9)\necho \"$mnt is ${use}% full\"\nif (( use > max )); then\n  exit 1\nfi",check:w=>{const s=LX.session(w,"admin");const r=LX.exec(s,"./diskcheck.sh / 90");return r.code===0&&/\b20\b/.test(r.out.map(z=>z[1]).join(""))}},
     {t:"Running ./diskcheck.sh / 10 exits 1 (check with echo $?)",hint:"./diskcheck.sh / 10; echo $?",check:w=>{const s=LX.session(w,"admin");return LX.exec(s,"./diskcheck.sh / 10").code===1}}],
   solution:"printf '#!/bin/bash\\nmnt=${1:-/}\\nmax=${2:-80}\\nuse=$(df \"$mnt\" --output=pcent | tail -1 | tr -dc 0-9)\\necho \"$mnt is ${use}%% full\"\\nif (( use > max )); then\\n  exit 1\\nfi\\n' > ~/diskcheck.sh\nchmod +x ~/diskcheck.sh\n./diskcheck.sh / 90; echo $?\n./diskcheck.sh / 10; echo $?"},
 loop:{title:"Shell exercise: loops over files",
   setup:w=>{A(w,"mkdir -p ~/logs");["web","db","app"].forEach((n,i)=>A(w,`printf 'line\\n%.0s' {1..${(i+1)*3}} > ~/logs/${n}.log`))},
   scenario:"~/logs holds several .log files. Use a for loop to print each file's name and line count, then archive them with today's date in the name.",
   tasks:[{t:"Loop over ~/logs/*.log printing the name and line count",hint:"for f in ~/logs/*.log; do\n  echo \"$f: $(wc -l < \"$f\")\"\ndone",check:(w,sh)=>LX.ran(sh,/for\s+\w+\s+in\s+.*logs.*\*\.log/),sticky:true},
     {t:"Create ~/logs-YYYY-MM-DD.tar.gz using $(date +%F)",hint:"tar -czf ~/logs-$(date +%F).tar.gz -C ~ logs",check:w=>Object.keys(node(w,"/home/admin").k).some(k=>/^logs-\d{4}-\d{2}-\d{2}\.tar\.gz$/.test(k))},
     {t:"Count the .log files with a pipeline",hint:"ls ~/logs/*.log | wc -l",check:(w,sh)=>LX.ran(sh,/(ls|find).*\|\s*wc\s+-l/),sticky:true}],
   solution:"for f in ~/logs/*.log; do echo \"$f: $(wc -l < \"$f\")\"; done\ntar -czf ~/logs-$(date +%F).tar.gz -C ~ logs\nls ~/logs/*.log | wc -l"},
 text:{title:"Shell exercise: who is attacking SSH?",
   setup:w=>{const ips=["203.0.113.77","203.0.113.77","198.51.100.23","203.0.113.77","192.0.2.140","198.51.100.23","203.0.113.77"];ips.forEach((ip,i)=>LX.jlog(w,"sshd",5,`Failed password for ${i%2?"invalid user oracle":"root"} from ${ip} port ${40100+i} ssh2`));LX.jlog(w,"sshd",6,"Accepted publickey for admin from 10.0.0.5 port 51122 ssh2");
     LX.put(w,"/home/admin/access.log",["10.0.0.5 - - [10/Nov/2026:09:01:12] \"GET / HTTP/1.1\" 200 512","10.0.0.6 - - [10/Nov/2026:09:01:13] \"GET /admin HTTP/1.1\" 403 199","10.0.0.5 - - [10/Nov/2026:09:01:15] \"GET /missing HTTP/1.1\" 404 153","10.0.0.7 - - [10/Nov/2026:09:01:20] \"POST /login HTTP/1.1\" 200 87","10.0.0.6 - - [10/Nov/2026:09:01:21] \"GET /admin HTTP/1.1\" 403 199"].join("\n")+"\n",{uid:1000,gid:1000})},
   scenario:"Build pipelines to answer questions from logs. Use grep, awk, sort and uniq.",
   tasks:[{t:"Count failed SSH passwords per source IP, busiest first",hint:"journalctl -u sshd | grep 'Failed password' | grep -oE '([0-9]{1,3}\\.){3}[0-9]{1,3}' | sort | uniq -c | sort -rn",check:(w,sh)=>LX.ran(sh,/Failed.*\|.*sort.*\|\s*uniq\s+-c/),sticky:true},
     {t:"From ~/access.log, print only lines with status 403 using awk on field 6",hint:"awk '$6 == 403' ~/access.log",check:(w,sh)=>LX.ran(sh,/awk\s+.*\$\d+\s*==\s*"?403/),sticky:true},
     {t:"Replace every 10.0.0. address with x.x.x. into ~/anon.log using sed",hint:"sed 's/10\\.0\\.0\\./x.x.x./g' ~/access.log > ~/anon.log",check:w=>{const c=rd(w,"/home/admin/anon.log");return /x\.x\.x\.5/.test(c)&&!/10\.0\.0\./.test(c)}}],
   solution:"journalctl -u sshd | grep 'Failed password' | grep -oE '([0-9]{1,3}\\.){3}[0-9]{1,3}' | sort | uniq -c | sort -rn\nawk '$6 == 403' ~/access.log\nsed 's/10\\.0\\.0\\./x.x.x./g' ~/access.log > ~/anon.log\ncat ~/anon.log"},
 git:{title:"Shell exercise: track a config in Git",world:{pkgs:["git"]},setup:w=>gitId(w),
   scenario:"Put your scripts under version control: create a repository, commit, branch, change, and merge.",
   tasks:[{t:"Create ~/ops as a Git repository on branch main",hint:"mkdir ~/ops && cd ~/ops && git init -b main",check:w=>!!w.repos["/home/admin/ops"]},
     {t:"Add a README.md and commit it",hint:"echo '# Ops scripts' > README.md\ngit add README.md\ngit commit -m 'Add README'",check:w=>/README/.test(LX.q(w,"cd /home/admin/ops && git log --oneline","admin"))},
     {t:"Create and switch to a branch named feature/backup",hint:"git switch -c feature/backup",check:w=>/feature\/backup/.test(LX.q(w,"cd /home/admin/ops && git branch","admin"))},
     {t:"Commit a backup.sh on that branch, then merge it into main",hint:"echo '#!/bin/bash' > backup.sh\ngit add backup.sh\ngit commit -m 'Add backup script'\ngit switch main\ngit merge feature/backup",check:w=>{const l=LX.q(w,"cd /home/admin/ops && git log --oneline main","admin");return /backup/i.test(l)&&/\*\s*main|^main/m.test(LX.q(w,"cd /home/admin/ops && git branch","admin"))}}],
   solution:"mkdir ~/ops && cd ~/ops && git init -b main\necho '# Ops scripts' > README.md\ngit add README.md\ngit commit -m 'Add README'\ngit switch -c feature/backup\necho '#!/bin/bash' > backup.sh\ngit add backup.sh\ngit commit -m 'Add backup script'\ngit switch main\ngit merge feature/backup\ngit log --oneline"},
 ansible:{title:"Shell exercise: Ansible ad hoc commands",world:{pkgs:["ansible-core"]},setup:w=>keys(w),
   scenario:"SSH keys to web01 and web02 are already in place. Write an inventory, test connectivity, and run ad hoc commands.",
   tasks:[{t:"Create ~/inventory.ini with a [web] group holding web01 and web02",hint:"printf '[web]\\nweb01 ansible_host=10.0.0.20\\nweb02 ansible_host=10.0.0.21\\n' > ~/inventory.ini",check:w=>{const c=rd(w,"/home/admin/inventory.ini");return /\[web\]/.test(c)&&/web01/.test(c)&&/web02/.test(c)}},
     {t:"Ping the group with the ping module",hint:"ansible -i inventory.ini web -m ping",check:(w,sh)=>LX.ran(sh,/ansible\s+.*-m\s+(ansible\.builtin\.)?ping/),sticky:true},
     {t:"Run uptime on all web servers with the command module",hint:"ansible -i inventory.ini web -m command -a uptime",check:(w,sh)=>LX.ran(sh,/ansible\s+.*-a\s+['"]?uptime/),sticky:true},
     {t:"Install chrony on them with become (-b) and the dnf module",hint:"ansible -i inventory.ini web -b -m dnf -a 'name=chrony state=present'",check:w=>["web01","web02"].every(h=>(w.remotes[h]?.state?.pkgs||[]).includes("chrony"))}],
   solution:"printf '[web]\\nweb01 ansible_host=10.0.0.20\\nweb02 ansible_host=10.0.0.21\\n' > ~/inventory.ini\nansible -i inventory.ini web -m ping\nansible -i inventory.ini web -m command -a uptime\nansible -i inventory.ini web -b -m dnf -a 'name=chrony state=present'"}
};

const LESSONS=[
{id:"basics",num:"4.1",title:"Shell script fundamentals",html:`
<pre class="term">#!/bin/bash
# backup.sh: archive a directory
src="\${1:?usage: backup.sh DIR}"     <span class="t-n"># first argument, or stop with a message</span>
dest="/backup/$(basename "$src")-$(date +%F).tar.gz"
tar -czf "$dest" "$src" && echo "Saved $dest"</pre>
<ul><li>The <b>shebang</b> line picks the interpreter. Run with <code>./backup.sh</code> after <code>chmod +x</code>, or <code>bash backup.sh</code>. Scripts in a directory on <code>$PATH</code> (like <code>/usr/local/bin</code>) run by name.</li>
<li><b>Variables</b>: <code>name=value</code> with no spaces around <code>=</code>. Use <code>"$name"</code> in double quotes so spaces in values don't split. Single quotes stop all expansion.</li>
<li><b>Arguments</b>: <code>$0</code> script name, <code>$1</code>..<code>$9</code>, <code>$#</code> count, <code>"$@"</code> all (each kept separate), <code>shift</code> drops the first.</li>
<li><b>Command substitution</b> <code>$(cmd)</code> and <b>arithmetic</b> <code>$((a + b))</code>.</li>
<li><b>Exit status</b>: 0 means success, anything else failure. <code>$?</code> holds the last one; <code>exit 3</code> sets the script's. <code>&amp;&amp;</code> runs the next only on success, <code>||</code> only on failure.</li>
<li><b>Parameter expansion</b>: <code>\${v:-default}</code>, <code>\${#v}</code> length, <code>\${f%.*}</code> strip an extension, <code>\${f##*/}</code> strip the directory, <code>\${v^^}</code> upper case, <code>\${v/old/new}</code>.</li>
<li><b>Environment</b>: <code>export VAR</code> passes it to child processes; <code>source file</code> (or <code>. file</code>) runs it in the current shell.</li></ul>
<div class="viz" id="viz-quoting"></div>
<h3>Tests</h3>
<table><tr><th>Test</th><th>True when</th></tr>
<tr><td><code>[[ -f path ]]</code> / <code>-d</code> / <code>-e</code></td><td>Regular file / directory / exists</td></tr>
<tr><td><code>-r</code> <code>-w</code> <code>-x</code> <code>-s</code></td><td>Readable, writable, executable, not empty</td></tr>
<tr><td><code>-z "$s"</code> / <code>-n "$s"</code></td><td>Empty / not empty string</td></tr>
<tr><td><code>"$a" == "$b"</code>, <code>!=</code>, <code>=~ regex</code></td><td>String compare, regex match</td></tr>
<tr><td><code>-eq -ne -lt -le -gt -ge</code> or <code>(( a &gt; b ))</code></td><td>Numbers</td></tr></table>
<p><code>[ ]</code> is the portable POSIX test; <code>[[ ]]</code> is bash's safer version (no word splitting, supports <code>&amp;&amp;</code> and regex).</p>
<div class="viz" id="viz-scriptlab"></div>`},
{id:"flow",num:"4.2",title:"Control flow, functions and robust scripts",html:`
<pre class="term">if [[ $EUID -ne 0 ]]; then
  echo "Run as root" >&2; exit 1
elif [[ -f /etc/redhat-release ]]; then pm=dnf
else pm=apt
fi

case "$1" in
  start|up) systemctl start app ;;
  stop)     systemctl stop app ;;
  *)        echo "usage: $0 {start|stop}"; exit 2 ;;
esac

for host in web01 web02 db01; do ping -c1 -W1 "$host" &>/dev/null && echo "$host up"; done
for ((i=1; i<=5; i++)); do echo "try $i"; done
while IFS=, read -r user group; do useradd -G "$group" "$user"; done < users.csv
until systemctl is-active --quiet app; do sleep 2; done

check_disk() { local mnt=$1; df --output=pcent "$mnt" | tail -1; }
servers=(web01 web02 db01); echo "\${#servers[@]} servers: \${servers[@]}"
declare -A port=([http]=80 [https]=443); echo "\${port[https]}"</pre>
<h3>Write scripts that fail safely</h3>
<ul><li><code>set -euo pipefail</code>: stop on errors (<code>-e</code>), on unset variables (<code>-u</code>), and when any part of a pipeline fails.</li>
<li><code>trap 'rm -f "$tmp"' EXIT</code> cleans up however the script ends; <code>mktemp</code> makes safe temporary files.</li>
<li>Send errors to stderr (<code>&gt;&amp;2</code>), return meaningful exit codes, and log with <code>logger</code>.</li>
<li>Check with <code>bash -n script</code> (syntax), <code>bash -x script</code> (trace each command) and <code>shellcheck</code> (common mistakes).</li>
<li>Read input with <code>read -rp "Name: " name</code>; parse options with <code>getopts</code>.</li>
<li>Make scripts <b>idempotent</b>: running twice should be safe (check before creating).</li></ul>
<div class="viz" id="viz-flowq"></div>
<div class="viz" id="viz-looplab"></div>`},
{id:"text",num:"4.3",title:"Text processing and regular expressions",html:`
<table><tr><th>Tool</th><th>Typical use</th></tr>
<tr><td><code>grep -E 'err|fail' -i -r -n -v -c -o</code></td><td>Find lines (extended regex, ignore case, recursive, line numbers, invert, count, only the match)</td></tr>
<tr><td><code>sed -i 's/old/new/g' file</code></td><td>Substitute in place; <code>sed -n '5,10p'</code> prints lines; <code>sed '/^#/d'</code> deletes comments</td></tr>
<tr><td><code>awk -F: '$3 &gt;= 1000 {print $1}' /etc/passwd</code></td><td>Fields and conditions; <code>NR</code> line number, <code>NF</code> field count, <code>{s+=$2} END {print s}</code> sums</td></tr>
<tr><td><code>cut -d, -f2</code>, <code>sort -k2 -n -r</code>, <code>uniq -c</code>, <code>tr</code>, <code>wc</code>, <code>paste</code>, <code>column -t</code></td><td>Slice, order, count and reshape</td></tr>
<tr><td><code>xargs</code></td><td>Turn input lines into arguments: <code>find . -name '*.tmp' | xargs rm</code></td></tr>
<tr><td><code>tee</code></td><td>Write to a file and keep passing output on</td></tr></table>
<h3>Regular expressions</h3>
<table><tr><th>Pattern</th><th>Matches</th></tr>
<tr><td><code>^</code> <code>$</code></td><td>Start and end of a line</td></tr><tr><td><code>.</code></td><td>Any one character</td></tr>
<tr><td><code>*</code> <code>+</code> <code>?</code> <code>{2,4}</code></td><td>Zero or more, one or more, optional, 2 to 4 times (+ ? {} need <code>-E</code>)</td></tr>
<tr><td><code>[abc]</code> <code>[^0-9]</code> <code>[[:digit:]]</code></td><td>Character classes</td></tr>
<tr><td><code>(a|b)</code></td><td>Alternation and grouping (extended)</td></tr><tr><td><code>\\b</code>, <code>\\s</code>, <code>\\w</code></td><td>Word boundary, whitespace, word character (GNU)</td></tr></table>
<p>Quote patterns in single quotes so the shell doesn't expand <code>*</code> or <code>$</code>. Don't confuse regex with shell <b>globs</b>: in a glob <code>*.log</code> means "anything ending .log"; in a regex <code>.*\\.log$</code> does.</p>
<div class="viz" id="viz-regex"></div>
<div class="viz" id="viz-textlab"></div>`},
{id:"python",num:"4.4",title:"Python for administrators",html:`
<p>Python is installed on almost every Linux system and is what Ansible and many tools are written in. Use it when a task outgrows bash: parsing JSON or YAML, calling REST APIs, or real data structures.</p>
<pre class="term">#!/usr/bin/env python3
import json, subprocess, sys
from pathlib import Path

def disk_usage(mount="/"):
    out = subprocess.run(["df", "--output=pcent", mount], capture_output=True, text=True, check=True)
    return int(out.stdout.splitlines()[-1].strip().rstrip("%"))

servers = {"web01": 80, "db01": 5432}          # a dictionary
for name, port in servers.items():
    print(f"{name} listens on {port}")

config = json.loads(Path("/etc/app/config.json").read_text())
if disk_usage() > config.get("max_disk", 80):
    print("Disk almost full", file=sys.stderr)
    sys.exit(1)</pre>
<ul><li><b>Indentation</b> defines blocks (4 spaces). Types: strings, ints, lists <code>[]</code>, dictionaries <code>{}</code>, tuples, booleans <code>True</code>/<code>False</code>, <code>None</code>.</li>
<li><code>subprocess.run([...], check=True)</code> runs commands (a list, not a shell string, to avoid injection). <code>os</code>, <code>pathlib</code>, <code>shutil</code> handle files; <code>json</code> and <code>yaml</code> (PyYAML) parse data; <code>requests</code> calls web APIs.</li>
<li><code>try:</code> / <code>except FileNotFoundError:</code> handles errors. <code>if __name__ == "__main__":</code> runs code only when executed directly.</li>
<li><b>Virtual environments</b> keep project packages away from system Python: <code>python3 -m venv .venv</code>, <code>source .venv/bin/activate</code>, <code>pip install -r requirements.txt</code>, <code>deactivate</code>. Never <code>sudo pip install</code> into the system Python; distributions now block it ("externally managed environment").</li></ul>
<div class="viz" id="viz-pyread"></div>
<div class="viz" id="viz-pysort"></div>`},
{id:"git",num:"4.5",title:"Version control with Git",html:`
<pre class="term">git config --global user.name "Dana Ops"; git config --global user.email dana@example.lan
git init -b main  /  git clone https://github.com/example-org/webapp.git
git status; git add file; git commit -m "Explain why"
git log --oneline --graph; git diff; git show HEAD
git switch -c feature/x; git switch main; git merge feature/x
git pull (= fetch + merge); git push -u origin main
git restore file (discard changes); git restore --staged file (unstage)
git revert COMMIT (new commit that undoes one, safe for shared history)
git reset --hard COMMIT (moves the branch, discards work, local only)
git stash / git stash pop; git tag v1.2; git rebase main</pre>
<div class="viz" id="viz-gitflow"></div>
<ul><li>The three areas: <b>working tree</b> (your files), <b>staging area</b> (index, what goes in the next commit) and the <b>repository</b> (commits).</li>
<li><b>.gitignore</b> keeps secrets, logs and build output out. Never commit passwords or keys; if one slips in, rotate it, because history keeps it.</li>
<li>A <b>merge conflict</b> marks both versions between <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code> and <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code>. Edit to the right result, <code>git add</code>, <code>git commit</code>.</li>
<li>Team flow: branch, commit, push, open a <b>pull request</b> for review, and let CI test it before merging.</li></ul>
<div class="viz" id="viz-gitlab"></div>`},
{id:"iac",num:"4.6",title:"Ansible, infrastructure as code and orchestration",html:`
<p><b>Infrastructure as code</b> describes servers in version-controlled files instead of manual steps, so builds are repeatable, reviewable and fast. Key ideas: <b>declarative</b> (describe the end state, the tool works out the steps), <b>idempotent</b> (running again changes nothing if already correct), and <b>configuration drift</b> (manual changes that make servers differ).</p>
<h3>Ansible</h3>
<ul><li><b>Agentless</b>: the control node connects over SSH (WinRM for Windows) and needs Python on the targets.</li>
<li><b>Inventory</b> lists hosts and groups (INI or YAML). <b>Modules</b> do the work (dnf, apt, service, copy, template, user, file, lineinfile, firewalld). <b>Playbooks</b> are YAML lists of plays mapping hosts to tasks.</li>
<li><b>Handlers</b> run only when notified by a changed task (restart nginx after its config changes). <b>Variables</b> come from inventory, <code>group_vars/</code>, <code>host_vars/</code> and <code>vars:</code>. <b>Templates</b> use Jinja2 (<code>{{ http_port }}</code>). <b>Roles</b> package tasks, handlers, templates and defaults for reuse; <b>collections</b> and <b>Ansible Galaxy</b> share them.</li>
<li><b>Ansible Vault</b> encrypts secrets: <code>ansible-vault encrypt vars.yml</code>, then <code>--ask-vault-pass</code>.</li></ul>
<pre class="term">---
- name: Configure web servers
  hosts: web
  become: true
  vars:
    http_port: 80
  tasks:
    - name: Install nginx
      ansible.builtin.dnf:
        name: nginx
        state: present
    - name: Deploy config
      ansible.builtin.template:
        src: nginx.conf.j2
        dest: /etc/nginx/nginx.conf
      notify: Restart nginx
    - name: Start and enable nginx
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true
  handlers:
    - name: Restart nginx
      ansible.builtin.service:
        name: nginx
        state: restarted</pre>
<p>Run with <code>ansible-playbook -i inventory.ini site.yml</code>. Test first with <code>--syntax-check</code>, <code>--check</code> (dry run) and <code>--diff</code>; limit with <code>--limit web01</code>. YAML is indentation-sensitive: spaces only, never tabs.</p>
<div class="viz" id="viz-ansiblelab"></div>
<div class="viz" id="viz-yaml"></div>
<h3>Other tools</h3>
<table><tr><th>Tool</th><th>Role</th></tr>
<tr><td><b>Terraform / OpenTofu</b></td><td>Provision infrastructure (VMs, networks, cloud resources) declaratively: <code>init</code>, <code>plan</code>, <code>apply</code>, <code>destroy</code>. Tracks reality in a <b>state</b> file.</td></tr>
<tr><td><b>Puppet, Chef, Salt</b></td><td>Configuration management, usually with agents pulling from a server</td></tr>
<tr><td><b>cloud-init</b></td><td>Configures a cloud VM on first boot from user data (users, keys, packages)</td></tr>
<tr><td><b>CI/CD</b></td><td>Pipelines (GitHub Actions, GitLab CI, Jenkins) lint, test, build and deploy every commit; GitOps applies what's in Git</td></tr>
<tr><td><b>Kubernetes</b></td><td>Orchestrates containers across nodes: pods, deployments (replicas, rolling updates), services, ConfigMaps and Secrets; <code>kubectl apply -f app.yaml</code>, <code>kubectl get pods</code>, <code>kubectl logs</code></td></tr></table>
<div class="viz" id="viz-iacsort"></div>`},
{id:"ai",num:"4.7",title:"Using AI tools responsibly",html:`
<p>XK0-006 expects you to know how AI assistants fit into Linux work. They're good at drafting scripts, explaining unfamiliar commands and error messages, summarizing logs and writing documentation. They also make confident mistakes.</p>
<h3>Best practices</h3>
<ul><li><b>Verify before you run.</b> Read every generated command. Check flags in <code>man</code> pages. Watch for destructive commands (<code>rm -rf</code>, <code>dd</code>, <code>mkfs</code>, <code>chmod -R 777</code>) and invented options or packages that don't exist.</li>
<li><b>Test safely</b>: run in a lab VM or container first, use <code>--check</code>/<code>--dry-run</code>, <code>bash -n</code>, <code>shellcheck</code>, and code review through Git pull requests.</li>
<li><b>Protect data</b>: don't paste secrets, private keys, passwords, customer data or internal hostnames into public AI services. Follow your organization's policy and approved tools; redact logs first.</li>
<li><b>Give context</b> in prompts: distribution and version, what you tried, the exact error, and constraints ("RHEL 9, SELinux enforcing, no internet").</li>
<li><b>Own the result</b>: you're accountable for what runs on your systems. Keep a human in the loop for changes, and document that AI-generated code was reviewed.</li>
<li><b>Watch licensing and provenance</b> of generated code, and supply-chain risk from suggested packages ("slopsquatting": installing a hallucinated package name an attacker registered).</li></ul>
<div class="viz" id="viz-aisort"></div>
<div class="viz" id="viz-aireview"></div>`}
];

const G={
 basics:[["#!/bin/bash","Shebang: selects the interpreter"],["chmod +x script","Makes a script executable"],["$1, $2","Positional arguments"],["$#","Number of arguments"],['"$@"',"All arguments, each kept as one word"],["$0","The script's name"],["$?","Exit status of the last command"],["Exit status 0","Success"],["$(cmd)","Command substitution"],["$((expr))","Arithmetic expansion"],["${v:-default}","Value, or default if unset or empty"],["${v:?msg}","Stop with msg if unset"],["${f%.*}","Strip the shortest suffix matching .*"],["${#v}","Length of a string"],["Double quotes","Expand variables but stop word splitting"],["Single quotes","Literal text, no expansion"],["export VAR","Pass a variable to child processes"],["Variables set in a script disappear after it runs. How do you keep them?","source the file (or . file) so it runs in the current shell"],["[[ -f path ]]","True if a regular file exists"],["-z / -n","String is empty / not empty"],["-eq -lt -gt","Numeric comparisons"],["&& / ||","Run next on success / on failure"]],
 flow:[["if / elif / else / fi","Conditional"],["case ... esac","Match a value against patterns"],["for x in list","Loop over items"],["while read -r line","Loop over lines of input"],["until cond","Loop until a condition is true"],["break / continue","Leave or skip a loop iteration"],["function name() { }","Define a function"],["local","Function-scoped variable"],["Indexed array","arr=(a b c); ${arr[1]}; ${#arr[@]}"],["Associative array","declare -A m; m[key]=value"],["set -e","Exit on any failing command"],["set -u","Error on unset variables"],["set -o pipefail","Pipeline fails if any part fails"],["trap ... EXIT","Run cleanup when the script ends"],["mktemp","Create a safe temporary file"],[">&2","Send output to stderr"],["bash -n","Syntax check only"],["bash -x","Trace each command"],["shellcheck","Lint for common shell mistakes"],["getopts","Parse -a -b style options"],["Idempotent script","Safe to run repeatedly"]],
 text:[["grep -E","Extended regular expressions"],["grep -v","Lines that don't match"],["grep -o","Print only the matching part"],["grep -r","Search recursively"],["sed 's/a/b/g'","Replace all a with b on each line"],["sed -i","Edit a file in place"],["sed -n '5,10p'","Print lines 5 to 10"],["awk -F:","Set the field separator"],["awk '{print $1}'","Print the first field"],["NR / NF","awk: line number / number of fields"],["cut -d, -f2","Second comma-separated field"],["sort -n -r -k2","Numeric, reverse, by the second field"],["uniq -c","Count adjacent duplicates (sort first)"],["xargs","Build arguments from input"],["Write a command's output to a log and still see it on screen","command | tee file.log"],["^ and $","Start and end of a line"],[".*","Any characters"],["[^0-9]","Any character except a digit"],["+ ? {n,m}","Extended regex quantifiers"],["Glob vs regex","*.log is a glob; .*\\.log$ is a regex"]],
 python:[["#!/usr/bin/env python3","Run with the first python3 on PATH"],["Indentation","Defines code blocks in Python"],["List","[1, 2, 3], ordered and changeable"],["Dictionary","{\"key\": \"value\"} lookups by key"],["f-string",'f"{name} is {age}"'],["subprocess.run","Run an external command"],["check=True","Raise an error if the command fails"],["json.loads / dumps","Parse or produce JSON"],["pathlib.Path","Object-oriented file paths"],["try / except","Handle exceptions"],["sys.exit(1)","Exit with a failure status"],['if __name__ == "__main__"',"Run only when executed directly"],["python3 -m venv","Create a virtual environment"],["pip install -r requirements.txt","Install a project's dependencies"],["Externally managed environment","Distros block pip into system Python"]],
 git:[["git init","Create a repository"],["git clone","Copy a remote repository"],["git add","Stage changes"],["git commit -m","Record staged changes"],["git status","Show changed and staged files"],["git log --oneline","Compact history"],["git diff","Unstaged changes"],["Branch","Movable pointer to a line of commits"],["git switch -c","Create and switch to a branch"],["git merge","Combine another branch into the current one"],["Merge conflict","Both sides changed the same lines"],["git pull","Fetch and merge from the remote"],["git push -u origin main","Upload and set upstream"],["git revert","New commit undoing an old one (safe)"],["git reset --hard","Move the branch and discard changes (dangerous)"],["git stash","Shelve uncommitted work"],[".gitignore","Patterns Git won't track"],["Pull request","Proposed change for review before merge"],["git tag","Name a commit, often a release"]],
 iac:[["Infrastructure as code","Servers described in versioned files"],["Declarative","Describe the end state, not the steps"],["Idempotent","Re-running changes nothing if already correct"],["Configuration drift","Manual changes making servers differ"],["Ansible","Agentless configuration management over SSH"],["Inventory","Hosts and groups Ansible manages"],["Module","Unit of work (dnf, service, copy, template)"],["Playbook","YAML file of plays and tasks"],["become: true","Run tasks with sudo"],["Handler","Task run only when notified by a change"],["Jinja2 template","{{ variable }} substitution in files"],["Role","Reusable bundle of tasks, handlers, templates and defaults"],["group_vars / host_vars","Variable files for groups and hosts"],["ansible-vault","Encrypt secrets in Ansible files"],["--check","Ansible dry run"],["Ad hoc command","ansible group -m module -a args"],["Terraform plan / apply","Preview and create infrastructure"],["State file","Terraform's record of real resources"],["Which tool reads user-data to configure a cloud VM on first boot?","cloud-init"],["CI/CD pipeline","Automated test, build and deploy on commit"],["GitOps","Git as the source of truth for deployments"],["Kubernetes deployment","Keeps a set of identical pods running"],["kubectl apply -f","Create or update resources from YAML"]],
 ai:[["Verify AI output","Read and test every generated command before running it"],["Hallucinated option","An AI-invented flag or package that doesn't exist"],["Slopsquatting","Attackers register package names AIs invent"],["Don't paste secrets","Keep keys, passwords and customer data out of AI prompts"],["Prompt context","Distro, version, exact error and constraints"],["Human in the loop","A person approves changes before production"],["Dry run first","--check, --dry-run, bash -n, shellcheck"],["Accountability","You own what you run, whoever wrote it"]]
};
const DECKS=[["basics","Script basics"],["flow","Control flow"],["text","Text and regex"],["python","Python"],["git","Git"],["iac","Ansible and IaC"],["ai","AI best practices"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
 {q:"A script runs with bash script.sh but ./script.sh says Permission denied. Fix?",o:["chmod +x script.sh","Add set -e","Move it to /tmp","Run dos2unix"],a:0,e:"It needs the execute bit."},
 {q:"Which holds the number of arguments passed to a script?",o:["$#","$@","$?","$0"],a:0,e:"$@ holds the arguments themselves."},
 {q:'Why use "$@" instead of $* when passing arguments on?',o:["It keeps each argument intact, even with spaces","It's faster, because the shell skips word splitting","It includes $0","It sorts them"],a:0,e:"Always quote it."},
 {q:"What does $? contain right after a command?",o:["Its exit status","Its PID","The last argument","The number of lines output"],a:0,e:"0 means success."},
 {q:"name = admin in a script gives 'name: command not found'. Why?",o:["Spaces around = aren't allowed in assignments","name is a reserved word in bash, so pick another variable name","It needs export","It needs quotes"],a:0,e:"name=admin."},
 {q:"Which prints the value of HOME, not the literal text?",o:['echo "$HOME"',"echo '$HOME'","echo \\$HOME","echo HOME"],a:0,e:"Single quotes and backslashes stop expansion."},
 {q:"Which test is true if /etc/app.conf exists and is a regular file?",o:["[[ -f /etc/app.conf ]]","[[ -d /etc/app.conf ]]","[[ -z /etc/app.conf ]]","[[ -x /etc/app.conf ]]"],a:0,e:"-d is directory; -z empty string."},
 {q:"Which compares two integers in a [ ] test?",o:["-gt","=","==","=~"],a:0,e:"= and == compare strings."},
 {q:"What does ${file%.log} do to app.log?",o:["Returns app","Returns log","Returns app.log.log","Deletes the file"],a:0,e:"Removes the suffix."},
 {q:"A variable needs to be visible to programs the script starts. What do you do?",o:["export it","Declare it local","Put it in single quotes","source it"],a:0,e:"Exported variables go into the environment."},
 {q:"Which loop reads a file line by line safely?",o:['while IFS= read -r line; do ...; done < file',"for line in $(cat file)","until read file","case file in"],a:0,e:"The for version splits on spaces."},
 {q:"In a case statement, which pattern matches anything not matched before?",o:["*)","else)","default)","?)"],a:0,e:"Put it last."},
 {q:"Which makes a script exit as soon as any command fails?",o:["set -e","set -x","set -u","set -n"],a:0,e:"-x traces."},
 {q:"cmd1 | cmd2 returns 0 even though cmd1 failed. Which option fixes that?",o:["set -o pipefail","set -e","set -u","shopt -s failglob"],a:0,e:"The pipeline returns the last non-zero status."},
 {q:"A script creates /tmp/work.XXXX and must remove it even if it fails midway.",o:["trap 'rm -f \"$tmp\"' EXIT","Put rm at the end","Use set -x","Use nohup"],a:0,e:"EXIT traps run on any exit."},
 {q:"How do you see each command as a script runs, to debug it?",o:["bash -x script.sh","bash -n script.sh","shellcheck -x","set +e"],a:0,e:"-n only checks syntax."},
 {q:"Which declares a variable visible only inside a function?",o:["local","export","readonly","declare -g"],a:0,e:"Prevents clobbering globals."},
 {q:'servers=(web01 web02 db01). What does ${#servers[@]} print?',o:["3","web01","2","0"],a:0,e:"The number of elements."},
 {q:"Which grep finds lines containing error or fail, ignoring case?",o:["grep -Ei 'error|fail'","grep -v error fail","grep 'error' 'fail'","grep -c error|fail"],a:0,e:"-E for alternation, -i for case."},
 {q:"Which removes all comment lines from a file's output?",o:["sed '/^#/d' file","sed 's/#//' file","grep '#' file","awk '{print #}' file"],a:0,e:"d deletes matching lines."},
 {q:"Which changes Port 22 to Port 2222 in sshd_config directly?",o:["sed -i 's/^Port 22$/Port 2222/' /etc/ssh/sshd_config","sed 's/22/2222/' file > file","awk '$1=Port 2222'","tr 22 2222"],a:0,e:"Redirecting to the same file empties it."},
 {q:"Which prints usernames with UID 1000 or above?",o:["awk -F: '$3 >= 1000 {print $1}' /etc/passwd","cut -d: -f3 /etc/passwd","grep 1000 /etc/passwd","sort -t: -k3 /etc/passwd"],a:0,e:"Field 3 is the UID."},
 {q:"Why does uniq -c give wrong counts on unsorted input?",o:["It only merges adjacent duplicates","It counts characters","It needs -i","It skips the first line"],a:0,e:"sort | uniq -c."},
 {q:"In an extended regex, what does ^[0-9]{3}$ match?",o:["Exactly three digits on a line","Three or more digits","Lines starting with 3","Any line with a digit"],a:0,e:"Anchored both ends."},
 {q:"Which passes each found file to rm as arguments?",o:["find . -name '*.tmp' | xargs rm","find . -name '*.tmp' > rm","rm < find","find . | tee rm"],a:0,e:"Or find -delete / -exec."},
 {q:"In Python, what defines the body of an if statement?",o:["Indentation","Curly braces","then ... fi","Semicolons"],a:0,e:"Consistent 4 spaces."},
 {q:"Which Python call runs df safely and fails loudly if it errors?",o:["subprocess.run([\"df\", \"-h\"], check=True)","os.system(\"df -h\") wrapped in a try/except block","eval('df -h')","print(\"df -h\")"],a:0,e:"A list avoids shell injection."},
 {q:"pip install requests fails with 'externally-managed-environment'. Best fix?",o:["Create a venv and install there","Use sudo pip install","Delete the marker file","Use pip --force"],a:0,e:"Or install the distro package."},
 {q:"Which Python type maps names to values, like hostnames to IPs?",o:["Dictionary","List","Tuple","String"],a:0,e:'{"web01": "10.0.0.20"}.'},
 {q:"Which module turns a JSON string into Python objects?",o:["json","os","re","sys"],a:0,e:"json.loads."},
 {q:"Which command stages a file for the next commit?",o:["git add","git commit","git push","git stash"],a:0,e:"Then commit."},
 {q:"You committed a bug to main, which others already pulled. Safest undo?",o:["git revert COMMIT","git reset --hard HEAD~1 and force push","Delete the repository","git stash"],a:0,e:"Don't rewrite shared history."},
 {q:"How do you discard uncommitted changes to one file?",o:["git restore file","git revert file","git rm file","git reset --soft"],a:0,e:"Older: git checkout -- file."},
 {q:"git push is rejected because the remote has new commits. What first?",o:["git pull","git push --force","git init","git clone again"],a:0,e:"Integrate, then push."},
 {q:"A file shows <<<<<<< HEAD after a merge. What happened?",o:["A merge conflict","A corrupted repository","A detached HEAD","A failed push"],a:0,e:"Edit, add, commit."},
 {q:"Which file keeps .env and *.log out of commits?",o:[".gitignore",".gitconfig",".git/config","README.md"],a:0,e:"Already-tracked files need git rm --cached."},
 {q:"Which command creates a new branch and switches to it?",o:["git switch -c name","git branch -d name","git merge name","git tag name"],a:0,e:"Older: git checkout -b."},
 {q:"What does 'agentless' mean for Ansible?",o:["Targets need only SSH and Python, no installed agent","It doesn't need a control node","It only manages Windows","It needs no inventory"],a:0,e:"Puppet and Chef use agents."},
 {q:"Which runs a single module against a group without a playbook?",o:["ansible web -m ping","ansible-playbook web","ansible-galaxy web","ansible-vault web"],a:0,e:"An ad hoc command."},
 {q:"A task restarts nginx on every run even when nothing changed. Better design?",o:["Use a handler notified by the config task","Add ignore_errors: true to the restart task","Use the shell module","Run with -vvv"],a:0,e:"Handlers run only on change."},
 {q:"What does idempotent mean for a playbook?",o:["Running it again makes no changes if the system is already correct","It runs on one host only, so it can't conflict with other runs","It can't fail","It runs in parallel"],a:0,e:"Reports ok, not changed."},
 {q:"How do you preview what a playbook would change?",o:["ansible-playbook site.yml --check --diff","ansible-playbook --syntax-check only","ansible-lint --fix","ansible -m setup"],a:0,e:"--syntax-check only parses."},
 {q:"Where should a database password used by a playbook live?",o:["In a file encrypted with ansible-vault","In plain text in the playbook","In the inventory comments","In /tmp"],a:0,e:"Or an external secrets manager."},
 {q:"A playbook fails with a YAML mapping error on a line indented with a tab. Fix?",o:["Use spaces for indentation","Add quotes around the line","Use --check","Rename to .yaml"],a:0,e:"YAML forbids tabs."},
 {q:"Which variable syntax does Ansible use in templates and tasks?",o:["{{ var }}","$var","%var%","${var}"],a:0,e:"Jinja2."},
 {q:"Which tool would you use to create cloud VMs and networks declaratively?",o:["Terraform","rsync","cron","awk"],a:0,e:"Then Ansible configures them."},
 {q:"What does terraform plan do?",o:["Shows what would change without changing it","Applies changes, then prints a summary of them","Deletes resources","Formats files"],a:0,e:"apply makes the changes."},
 {q:"What configures a new cloud VM's users and SSH keys on first boot?",o:["cloud-init","kickstart only","GRUB","udev"],a:0,e:"Reads user data."},
 {q:"Which Kubernetes object keeps three replicas of a pod running and handles rolling updates?",o:["Deployment","Service","ConfigMap","Namespace"],a:0,e:"A Service gives a stable address."},
 {q:"An AI assistant suggests 'pip install requestz-helper'. What should you do?",o:["Verify the package exists and is legitimate before installing","Install it with sudo pip so it's available to all users","Trust it; AI checked it","Install it in production first"],a:0,e:"Hallucinated names can be malicious."},
 {q:"Which is appropriate to paste into a public AI chatbot?",o:["A generic error message with hostnames and IPs removed","Your SSH private key","The production database password","A customer data export"],a:0,e:"Redact and follow policy."},
 {q:"An AI-generated script contains rm -rf \"$DIR\"/* with DIR never set. Risk?",o:["It could expand to rm -rf /*","None, it's quoted","It deletes only DIR","It will fail safely"],a:0,e:"set -u or ${DIR:?} prevents it."},
 {q:"Before using an AI-written playbook in production you should",o:["Review it, lint it, test it with --check in a lab, then get it reviewed","Run it directly against production with --diff so you can see each change as it happens","Rename it","Translate it to bash"],a:0,e:"Treat it like any untrusted code."}
];

/* ---------- custom diagram: quoting playground ---------- */
function quoting(el){const V={name:"web 01",HOME:"/home/admin"};const EX=[["echo $name","web 01","Unquoted: the value is split into two words (echo puts them back with one space). With file names this breaks commands."],['echo "$name"',"web 01","Double quotes expand the variable and keep it as one argument. Use this almost always."],["echo '$name'","$name","Single quotes: everything is literal."],['echo "Home: $HOME, files: $(ls ~ | wc -l)"',"Home: /home/admin, files: 3","Variables and command substitution both work inside double quotes."],['echo "\\$HOME costs \\$5"',"$HOME costs $5","A backslash escapes one character."],['touch "$name"; ls',"web 01","One file named 'web 01'. Without quotes you'd create two files, web and 01."]];let i=0;
  const draw=()=>{el.innerHTML=`<div class="viz-title">Quoting playground</div><div class="caption">Variable: <code>name="web 01"</code>. Pick a command to see what bash does with it.</div><div class="chips" role="group" aria-label="Commands">${EX.map((e,k)=>`<button class="chip" aria-pressed="${k===i}" data-k="${k}"><span class="mono">${e[0].replace(/</g,"&lt;")}</span></button>`).join("")}</div>
    <pre class="term"><span class="t-n">$</span> ${EX[i][0].replace(/</g,"&lt;")}\n${EX[i][1]}</pre><div class="caption" aria-live="polite">${EX[i][2]}</div>`};
  const seen=new Set([0]);el.addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b)return;i=+b.dataset.k;seen.add(i);if(seen.size===EX.length)award("viz:quoting",15,"Explored shell quoting");draw()});draw()}

registerModule({
  id:"auto",slug:"automation",title:"Automation, Orchestration and Scripting",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]| and /)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,labs:LABS,
  vizKeys:["quoting","scriptlab","flowq","looplab","regex","textlab","pyread","pysort","gitflow","gitlab","ansiblelab","yaml","iacsort","aisort","aireview"],
  viz(){
quoting($("#viz-quoting"));
shellViz($("#viz-scriptlab"),LABS.script,"scriptlab");
quizViz($("#viz-flowq"),{title:"What does this print?",done:"Predicted every script's output",qs:[
  ["for i in 1 2 3; do [[ $i -eq 2 ]] && continue; echo $i; done",["1 and 3 on separate lines","1 2 3","2","Nothing"],0,"continue skips the rest of that pass."],
  ['x=5; if (( x > 3 )); then echo big; else echo small; fi',["big","small","5","An error"],0,"(( )) is arithmetic."],
  ['f() { local v=inner; }; v=outer; f; echo $v',["outer","inner","Nothing","An error"],0,"local keeps the function's v separate."],
  ['set -e; false; echo after',["Nothing; the script exits at false","after","false","0"],0,"set -e stops on the failure."],
  ['case "web01" in db*) echo db;; web*) echo web;; *) echo other;; esac',["web","db","other","web01"],0,"First matching pattern wins."]]});
shellViz($("#viz-looplab"),LABS.loop,"looplab");
sortViz($("#viz-regex"),{title:"Does the regex match?",bins:{yes:"Matches",no:"Doesn't match"},
  items:[["^ERROR against 'ERROR: disk full'","yes","Anchored at the start."],["^ERROR against 'Warning: ERROR later'","no","ERROR isn't at the start."],["[0-9]{3}-[0-9]{4} against 'call 555-1234'","yes","Unanchored, found inside."],["^web[0-9]+$ against 'web01'","yes","web then digits to the end."],["^web[0-9]+$ against 'web01.lan'","no","$ needs the end right after the digits."],["\\.conf$ against 'httpd.conf.bak'","no","It doesn't end in .conf."],["colou?r against 'color'","yes","u is optional."],["^#|^$ against '   # indented comment'","no","The # isn't at the very start; use ^\\s*#."]],done:"Judged every regex"});
shellViz($("#viz-textlab"),LABS.text,"textlab");
quizViz($("#viz-pyread"),{title:"Read the Python",done:"Read every Python snippet",qs:[
  ['ports = [22, 80, 443]\nprint(len(ports), ports[-1])',["3 443","3 22","2 443","An error"],0,"Negative indexes count from the end."],
  ['hosts = {"web01": "10.0.0.20"}\nprint(hosts.get("db01", "unknown"))',["unknown","None","KeyError","db01"],0,".get returns the default."],
  ['for n in range(3):\n    print(n, end=" ")',["0 1 2","1 2 3","0 1 2 3","3"],0,"range stops before 3."],
  ['r = subprocess.run(["false"])\nprint(r.returncode)',["1","0","An exception","false"],0,"Only check=True raises."],
  ['name = "web01"\nprint(f"{name.upper()} ok")',["WEB01 ok","web01 ok","{name.upper()} ok","An error"],0,"f-strings evaluate expressions."]]});
sortViz($("#viz-pysort"),{title:"Bash or Python?",bins:{bash:"A short bash script",py:"Python"},
  items:[["Restart three services and check they're active","bash","Glue around commands."],["Call a REST API, parse nested JSON, and build a report","py","json and requests."],["Rotate a log file nightly","bash","Or logrotate itself."],["Compare two 50,000-row CSV inventories","py","csv module and dictionaries."],["Loop over servers running one ssh command","bash","Simple loop."],["Retry logic with exceptions and unit tests","py","Easier to structure and test."]],done:"Picked the right language"});
stepViz($("#viz-gitflow"),{title:"A change through Git",done:"Followed a change through Git",steps:[
  ["Edit","You change backup.sh. git status shows it modified (working tree)."],["Stage","git add backup.sh copies the change into the staging area."],["Commit","git commit -m 'Rotate 7 days' records a snapshot in the local repository."],["Branch","Work happens on feature/rotate, so main stays stable."],["Push","git push -u origin feature/rotate sends it to the shared remote."],["Review","A pull request lets a teammate review it and CI run tests."],["Merge","After approval it merges into main. Everyone git pulls."]],end:"Commit small changes with messages that explain why."});
shellViz($("#viz-gitlab"),LABS.git,"gitlab");
shellViz($("#viz-ansiblelab"),LABS.ansible,"ansiblelab");
quizViz($("#viz-yaml"),{title:"Spot the YAML problem",done:"Fixed every YAML problem",qs:[
  ["- name: Install\n\tdnf:\n\t  name: nginx",["Tabs are used for indentation","name must be quoted","dnf isn't a module","Missing ---"],0,"Use spaces."],
  ["- name: Start nginx\n  service:\n  name: nginx\n  state: started",["name and state must be indented under service","service needs quotes","state should be running","Nothing is wrong"],0,"Module arguments nest one level deeper."],
  ["vars:\n  msg: Note: run at night",["The second colon needs the value quoted","vars must be a list","msg is reserved","Nothing"],0,'msg: "Note: run at night".'],
  ["enabled: yes",["Valid; YAML reads it as true (true is preferred)","Invalid","Means the string yes always","Needs quotes"],0,"ansible-lint prefers true/false."]]});
sortViz($("#viz-iacsort"),{title:"Which tool fits?",bins:{ansible:"Ansible",tf:"Terraform",k8s:"Kubernetes",cloud:"cloud-init",ci:"CI/CD pipeline"},
  items:[["Create 3 VMs, a VPC and a load balancer in a cloud","tf","Provisioning."],["Install packages and templates on 200 existing servers","ansible","Configuration."],["Keep 5 replicas of a container running with rolling updates","k8s","Orchestration."],["Set the hostname and add SSH keys the first time a VM boots","cloud","User data."],["Lint and test every commit, deploy main automatically","ci","Pipelines."],["Encrypt secrets used in automation","ansible","ansible-vault."]],done:"Matched every tool"});
sortViz($("#viz-aisort"),{title:"Good or risky AI practice?",bins:{good:"Good practice",risk:"Risky"},
  items:[["Pasting a redacted error with your distro version and asking for causes","good","Context without secrets."],["Pasting /etc/shadow to ask why logins fail","risk","Never share hashes or secrets."],["Running an AI's script as root without reading it","risk","Read and test first."],["Asking for a playbook, then running ansible-lint and --check in a lab","good","Verify before production."],["Installing a package the AI named without checking it exists in your repos","risk","Possible slopsquatting."],["Asking AI to explain an unfamiliar awk one-liner, then confirming in man awk","good","Learn and verify."]],done:"Sorted the AI practices"});
quizViz($("#viz-aireview"),{title:"Review the AI's suggestion",done:"Caught every AI mistake",qs:[
  ["Asked to free disk space, the AI suggests: rm -rf /var/log/*",["Destructive; find what's large first and use logrotate or journalctl --vacuum","Safe; logs are optional","Run it with sudo","Add -i"],0,"Logs are evidence and some services need their files."],
  ["Asked to fix SELinux denials, the AI suggests setenforce 0 and SELINUX=disabled",["It removes protection; fix labels, ports or booleans instead","Correct","Only on weekends","Safe in production"],0,"Turning SELinux off is the anti-pattern."],
  ["It suggests 'useradd --create-homedir dana'",["Check the man page: the real option is -m (--create-home)","Correct","Must run as dana","Needs -G"],0,"A plausible but invented option."],
  ["It suggests chmod -R 777 /var/www to fix a 403",["Wrong and dangerous; check ownership, mode 755/644 and SELinux context","Correct","Use 666 instead","Use chattr"],0,"World-writable web roots invite compromise."]]});
  },
  sims:[
    {id:"provision",type:"shell",title:"Bulk-create accounts from a CSV",lab:{world:{files:{"/home/admin/users.csv":{c:"priya,developers\nmarco,developers\nlena,qa\n",owner:"admin:admin"}}},
      scenario:"HR sent ~/users.csv (user,group per line). Write ~/provision.sh that refuses to run unless root, creates any missing group, creates each user with a home directory in that group, and skips users who already exist. Run it twice to prove it's idempotent.",
      tasks:[{t:"Script exists, is executable and starts with a bash shebang",hint:"vim ~/provision.sh\nchmod +x ~/provision.sh",check:w=>isExec(w,"/home/admin/provision.sh")&&/^#!.*bash/.test(rd(w,"/home/admin/provision.sh"))},
        {t:"Running it without sudo prints an error and exits non-zero",hint:"[[ $EUID -eq 0 ]] || { echo 'Run as root' >&2; exit 1; }",check:w=>{if(!isExec(w,"/home/admin/provision.sh")||w.users.priya)return false;const s=LX.session(w,"admin",{cwd:"/home/admin"});const r=LX.exec(s,"./provision.sh");return r.code!==0&&!w.users.priya},sticky:true},
        {t:"sudo ./provision.sh creates priya, marco and lena in the right groups",hint:"while IFS=, read -r user group; do\n  getent group \"$group\" >/dev/null || groupadd \"$group\"\n  id \"$user\" &>/dev/null && { echo \"skip $user\"; continue; }\n  useradd -m -G \"$group\" \"$user\"\ndone < users.csv",check:w=>[["priya","developers"],["marco","developers"],["lena","qa"]].every(([u,g])=>w.users[u]&&w.groups[g]&&w.groups[g].members.includes(u))},
        {t:"Run it a second time without errors",hint:"sudo ./provision.sh; echo $?",check:(w,sh)=>sh.hist.filter(l=>/sudo\s+(bash\s+)?\.?\/?(home\/admin\/)?provision\.sh/.test(l)).length>=2&&!!w.users.lena}],
      solution:"printf '#!/bin/bash\\nset -euo pipefail\\n[[ $EUID -eq 0 ]] || { echo \"Run as root\" >&2; exit 1; }\\nwhile IFS=, read -r user group; do\\n  getent group \"$group\" >/dev/null || groupadd \"$group\"\\n  if id \"$user\" &>/dev/null; then\\n    echo \"skip $user\"\\n  else\\n    useradd -m -G \"$group\" \"$user\" && echo \"created $user\"\\n  fi\\ndone < \"${1:-/home/admin/users.csv}\"\\n' > ~/provision.sh\nchmod +x ~/provision.sh\n./provision.sh\nsudo ./provision.sh\nsudo ./provision.sh\nid lena",
      success:"A root check, an existence check before each change, and quoted variables: that's an idempotent, safe admin script."}},
    {id:"playbook",type:"shell",title:"Configure the web fleet with a playbook",lab:{world:{pkgs:["ansible-core"]},setup:w=>keys(w),
      scenario:"Write ~/inventory.ini with a [web] group (web01 10.0.0.20, web02 10.0.0.21) and ~/site.yml that, with become, installs nginx, starts and enables it, and opens the http service in firewalld. Syntax-check it, dry-run it, apply it, then run it again to see it's idempotent.",
      tasks:[{t:"Inventory with both web servers",hint:"printf '[web]\\nweb01 ansible_host=10.0.0.20\\nweb02 ansible_host=10.0.0.21\\n' > ~/inventory.ini",check:w=>/\[web\][\s\S]*web01[\s\S]*web02|\[web\][\s\S]*web02[\s\S]*web01/.test(rd(w,"/home/admin/inventory.ini"))},
        {t:"site.yml passes --syntax-check",hint:"ansible-playbook -i inventory.ini site.yml --syntax-check",check:w=>{const s=LX.session(w,"admin",{cwd:"/home/admin"});return !!node(w,"/home/admin/site.yml")&&LX.exec(s,"ansible-playbook -i inventory.ini site.yml --syntax-check").code===0}},
        {t:"Dry run with --check",hint:"ansible-playbook -i inventory.ini site.yml --check",check:(w,sh)=>LX.ran(sh,/ansible-playbook.*--check/),sticky:true},
        {t:"Apply it: nginx installed, started and enabled, http allowed on both hosts",hint:"ansible-playbook -i inventory.ini site.yml",check:w=>["web01","web02"].every(h=>{const st=w.remotes[h]?.state;return st&&st.pkgs.includes("nginx")&&st.svcs.nginx?.on&&st.svcs.nginx?.en})},
        {t:"Run it again and see changed=0",hint:"ansible-playbook -i inventory.ini site.yml",check:(w,sh)=>sh.hist.filter(l=>/ansible-playbook/.test(l)&&!/--(check|syntax)/.test(l)).length>=2,sticky:true}],
      solution:"printf '[web]\\nweb01 ansible_host=10.0.0.20\\nweb02 ansible_host=10.0.0.21\\n' > ~/inventory.ini\nprintf -- '---\\n- name: Configure web servers\\n  hosts: web\\n  become: true\\n  tasks:\\n    - name: Install nginx\\n      ansible.builtin.dnf:\\n        name: nginx\\n        state: present\\n    - name: Start and enable nginx\\n      ansible.builtin.service:\\n        name: nginx\\n        state: started\\n        enabled: true\\n    - name: Allow http\\n      ansible.posix.firewalld:\\n        service: http\\n        permanent: true\\n        immediate: true\\n        state: enabled\\n' > ~/site.yml\nansible-playbook -i inventory.ini site.yml --syntax-check\nansible-playbook -i inventory.ini site.yml --check\nansible-playbook -i inventory.ini site.yml\nansible-playbook -i inventory.ini site.yml",
      success:"The second run reports ok instead of changed: Ansible checked each state and found nothing to do. That's idempotence."}},
    {id:"conflict",type:"shell",title:"Resolve a merge conflict",lab:{world:{pkgs:["git"]},setup:w=>{gitId(w);A(w,"mkdir ~/app","cd ~/app && git init -b main -q","cd ~/app && printf 'port=80\\nworkers=2\\n' > app.conf && git add . && git commit -qm 'Initial config'","cd ~/app && git switch -qc tune && printf 'port=80\\nworkers=8\\n' > app.conf && git commit -qam 'More workers'","cd ~/app && git switch -q main && printf 'port=443\\nworkers=2\\n' > app.conf && git commit -qam 'Serve HTTPS'")},
      scenario:"In ~/app, main moved to port 443 while the tune branch raised workers to 8. Merge tune into main, resolve the conflict so the file has port=443 and workers=8, and commit.",
      tasks:[{t:"Merge tune into main and see the conflict",hint:"cd ~/app\ngit merge tune\ngit status",check:(w,sh)=>LX.ran(sh,/git\s+merge\s+tune/),sticky:true},
        {t:"Edit app.conf to exactly port=443 and workers=8 with no conflict markers",hint:"vim app.conf\n(or printf 'port=443\\nworkers=8\\n' > app.conf)",check:w=>{const c=rd(w,"/home/admin/app/app.conf");return /^port=443$/m.test(c)&&/^workers=8$/m.test(c)&&!/<<<<<<<|>>>>>>>|=======/.test(c)}},
        {t:"Mark it resolved and commit",hint:"git add app.conf\ngit commit -m 'Merge tune: 8 workers on HTTPS'",check:w=>{const st=LX.q(w,"cd /home/admin/app && git status","admin");return /nothing to commit|working tree clean/.test(st)&&/workers|tune|merge/i.test(LX.q(w,"cd /home/admin/app && git log --oneline -1","admin"))}}],
      solution:"cd ~/app\ngit merge tune\ngit status\ncat app.conf\nprintf 'port=443\\nworkers=8\\n' > app.conf\ngit add app.conf\ngit commit -m 'Merge tune: 8 workers on HTTPS'\ngit log --oneline",
      success:"Conflicts aren't errors: Git just can't choose for you. Keep both intended changes, remove the markers, add, commit."}},
    {id:"regexmatch",type:"match",title:"Match the one-liner to its job",scenario:"Tap a command, then what it does.",
      items:[["grep -c '^$' f","a"],["sed -n '10,20p' f","b"],["awk '{s+=$5} END {print s}' f","c"],["sort f | uniq -d","d"],["cut -d: -f1,7 /etc/passwd","e"],["grep -rl TODO .","f"],["tr '[:lower:]' '[:upper:]'","g"]],
      slots:[["a","Counts empty lines"],["b","Prints lines 10 to 20"],["c","Sums the fifth column"],["d","Shows only duplicated lines"],["e","Lists users and their shells"],["f","Names files containing TODO"],["g","Converts to upper case"]],success:"Small tools piped together answer most log and data questions."},
    {id:"cicd",type:"order",title:"Order a CI/CD pipeline",scenario:"A developer pushes a change to an Ansible repository. Put the pipeline stages in order.",
      steps:["Commit pushed to a feature branch","Lint: yamllint and ansible-lint","Test: run the playbook against disposable test VMs or containers","Code review approves the pull request","Merge to main","Deploy: run the playbook against production with a limited first batch"],success:"Fast checks first, real tests next, people review, then a careful rollout."},
    {id:"aicall",type:"choice",title:"An AI wrote your backup script",scenario:"You asked an AI assistant for a script that backs up /etc to a remote server nightly. It produced 40 lines of bash.",
      steps:[["What do you do first?",["Read every line and check each command and option against man pages","Run it as root to see if it works","Schedule it in cron right away","Ask the AI if it's safe"],0,"Understand before running."],
        ["The script has scp backup.tgz root@backup01:/ and a hard-coded password with sshpass. Concern?",["Root login and a plain-text password; use a dedicated user with an SSH key","None","Only the slash","scp is too slow"],0,"Least privilege and no secrets in scripts."],
        ["How do you test it?",["bash -n and shellcheck, then run it in a lab VM pointing at a test target","Run it on production at 2 a.m.","Email it to the team","Skip testing"],0,"Safe environment first."],
        ["It works. Before production?",["Commit it to Git, get a review, add logging and exit codes, then schedule","Copy it to every server by hand","Remove error handling to simplify","Disable SELinux for it"],0,"Treat it like any other code."]],success:"AI can draft quickly. You still review, test, secure and own it."}
  ],
  badges:[
    ["reader","AUT","Automation Scholar","Mark all 7 automation lessons studied",c=>c.allStudied()],
    ["lab","DIA","Script Kiddie No More","Complete all 15 diagrams and exercises in this module",c=>c.vizAll()],
    ["provision","CSV","Bulk Provisioner","Pass the CSV account script lab",c=>c.passed("provision")],
    ["playbook","YML","Playbook Author","Configure the fleet with Ansible",c=>c.passed("playbook")],
    ["merge","GIT","Conflict Resolver","Resolve a Git merge conflict",c=>c.passed("conflict")],
    ["regex","/.*/","Regex Wrangler","Finish the regex sort and the one-liner match",c=>c.earned("viz:regex")&&c.passed("regexmatch")],
    ["ai","AI","Trust but Verify","Finish the AI review exercises and scenario",c=>c.earned("viz:aireview")&&c.passed("aicall")],
    ["perfect","100","Idempotent","Score 100% on an automation quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
