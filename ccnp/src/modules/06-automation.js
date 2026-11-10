/* ================= Module 6: Automation and AI (350-401 v1.2 Domain 6.0, 15%) ================= */
(function(){
const LESSONS=[
{id:"python",num:"6.1",title:"Interpreting Python scripts",html:`
<p>ENCOR asks you to <b>read</b> Python and say what a script does, not to write large programs. Know the building blocks.</p>
<h3>Data types</h3>
<table><tr><th>Type</th><th>Example</th><th>Notes</th></tr>
<tr><td>str</td><td><code>"GigabitEthernet1"</code></td><td>Text. f-strings: <code>f"Hello {name}"</code></td></tr>
<tr><td>int / float</td><td><code>1500</code>, <code>99.5</code></td><td></td></tr>
<tr><td>bool</td><td><code>True</code>, <code>False</code></td><td>Capitalized in Python (lowercase in JSON)</td></tr>
<tr><td>list</td><td><code>["R1", "R2", "R3"]</code></td><td>Ordered, indexed from 0, changeable</td></tr>
<tr><td>dict</td><td><code>{"hostname": "R1", "mgmt": "10.0.0.1"}</code></td><td>Key/value pairs; <code>d["hostname"]</code> or <code>d.get("hostname")</code></td></tr>
<tr><td>tuple</td><td><code>("10.0.0.1", 22)</code></td><td>Ordered, unchangeable</td></tr></table>
<h3>Control flow</h3>
<pre class="term">devices = [{"name": "R1", "up": True}, {"name": "R2", "up": False}]
for dev in devices:            # loop over a list
    if dev["up"]:              # indentation defines the block
        print(f"{dev['name']} is reachable")
    else:
        print(f"{dev['name']} is DOWN")

def build_url(host, path="/restconf/data"):   # function with a default argument
    return f"https://{host}{path}"</pre>
<ul><li><b>Indentation</b> (4 spaces) defines blocks; there are no braces.</li>
<li><code>range(3)</code> gives 0, 1, 2. <code>len(x)</code> counts items. <code>x[-1]</code> is the last item.</li>
<li><code>try:</code> / <code>except</code> handles errors, such as a timeout from a device.</li>
<li><code>import</code> brings in libraries: <b>requests</b> (HTTP and REST), <b>json</b> (<code>json.loads</code> text → dict, <code>json.dumps</code> dict → text), <b>ncclient</b> (NETCONF), <b>netmiko</b> (SSH CLI), <b>paramiko</b> (SSH).</li></ul>
<h3>A typical REST script</h3>
<pre class="term">import requests
url = "https://10.10.20.85/restconf/data/ietf-interfaces:interfaces"
headers = {"Accept": "application/yang-data+json"}
resp = requests.get(url, headers=headers, auth=("admin", "C1sco12345"), verify=False)
if resp.status_code == 200:
    for intf in resp.json()["ietf-interfaces:interfaces"]["interface"]:
        print(intf["name"], intf["enabled"])</pre>
<p>Read it as: send an HTTPS GET with Basic authentication (and no certificate check: fine in a lab, not in production), and if it succeeds, turn the JSON body into a dict and print each interface's name and state.</p>
<div class="viz" id="viz-pytypes"></div>
<div class="viz" id="viz-pytrace"></div>
<div class="tip"><b>Exam tip.</b> Lists use [ ], dicts use { } with key: value. resp.json() parses the body. Python's True/False/None become JSON's true/false/null.</div>`},
{id:"json",num:"6.2",title:"Constructing valid JSON",html:`
<p><b>JSON</b> (JavaScript Object Notation) is the most common encoding for REST APIs. It's strict: one wrong character and the whole document is rejected.</p>
<ul><li><b>Objects</b> are in <code>{ }</code> with <code>"key": value</code> pairs separated by commas. Keys are always <b>double-quoted strings</b>.</li>
<li><b>Arrays</b> are in <code>[ ]</code>, values separated by commas.</li>
<li>Values: <b>string</b> (double quotes only), <b>number</b> (no quotes, no leading zeros), <b>true</b>, <b>false</b>, <b>null</b> (all lowercase), object or array.</li>
<li><b>No trailing commas</b>, <b>no comments</b>, no single quotes.</li>
<li>Whitespace doesn't matter.</li></ul>
<pre class="term">{
  "ietf-interfaces:interface": {
    "name": "Loopback100",
    "description": "Managed by automation",
    "type": "iana-if-type:softwareLoopback",
    "enabled": true,
    "ietf-ip:ipv4": {
      "address": [
        { "ip": "10.100.100.1", "netmask": "255.255.255.0" }
      ]
    }
  }
}</pre>
<h3>Same data, other encodings</h3>
<ul><li><b>XML</b>: tags (<code>&lt;name&gt;Loopback100&lt;/name&gt;</code>) and namespaces. NETCONF uses XML.</li>
<li><b>YAML</b>: indentation-based and easy for humans; Ansible playbooks are YAML.</li></ul>
<div class="viz" id="viz-jsonvalid"></div>
<div class="viz" id="viz-encodings"></div>
<div class="tip"><b>Exam tip.</b> Double quotes, lowercase true/false/null, no trailing comma, keys always quoted. A list of items is an array inside an object.</div>`},
{id:"apis",num:"6.3",title:"REST APIs, response codes and the Catalyst Center and SD-WAN Manager APIs",html:`
<h3>REST basics</h3>
<ul><li>A <b>resource</b> is identified by a <b>URI</b>; you act on it with an HTTP <b>method</b>: <b>GET</b> (read), <b>POST</b> (create), <b>PUT</b> (replace), <b>PATCH</b> (update), <b>DELETE</b>.</li>
<li><b>Headers</b> carry metadata: <code>Content-Type</code> (what I'm sending), <code>Accept</code> (what I want back), and authentication (<code>Authorization</code>, <code>X-Auth-Token</code>).</li>
<li>REST is <b>stateless</b>: each request carries everything the server needs.</li></ul>
<h3>Response codes</h3>
<table><tr><th>Code</th><th>Meaning</th></tr>
<tr><td>200 OK</td><td>Success, with a body</td></tr><tr><td>201 Created</td><td>A POST created the resource</td></tr><tr><td>202 Accepted</td><td>Queued for processing (Catalyst Center returns a task ID)</td></tr><tr><td>204 No Content</td><td>Success with no body (common for PUT/PATCH/DELETE)</td></tr>
<tr><td>400 Bad Request</td><td>Malformed request or invalid JSON</td></tr><tr><td>401 Unauthorized</td><td>Not authenticated: missing or expired token</td></tr><tr><td>403 Forbidden</td><td>Authenticated but not allowed</td></tr><tr><td>404 Not Found</td><td>Wrong URI or the resource doesn't exist</td></tr><tr><td>405 Method Not Allowed</td><td>The resource doesn't support that method</td></tr><tr><td>409 Conflict</td><td>Already exists or a state conflict</td></tr><tr><td>415 Unsupported Media Type</td><td>Wrong Content-Type</td></tr><tr><td>429 Too Many Requests</td><td>Rate limited</td></tr>
<tr><td>500 Internal Server Error</td><td>A server bug</td></tr><tr><td>503 Service Unavailable</td><td>Overloaded or down for maintenance</td></tr></table>
<p>2xx = success, 4xx = the client did something wrong, 5xx = the server failed.</p>
<div class="viz" id="viz-codes"></div>
<h3>Catalyst Center Intent API</h3>
<ol><li><b>Authenticate</b>: <code>POST /dna/system/api/v1/auth/token</code> with HTTP Basic credentials. The response is <code>{"Token": "eyJ..."}</code>.</li>
<li><b>Call</b> the Intent API with the header <code>X-Auth-Token: eyJ...</code>, for example <code>GET /dna/intent/api/v1/network-device</code> (inventory), <code>/site</code>, <code>/client-health</code>, <code>/network-health</code>.</li>
<li>Long operations (provisioning, command runner) return <b>202</b> with a <b>taskId</b>; poll <code>/dna/intent/api/v1/task/{taskId}</code> for the result.</li>
<li>Results come in a <code>"response"</code> array. Event notifications can be pushed to you with <b>webhooks</b>.</li></ol>
<h3>SD-WAN Manager (vManage) API</h3>
<ol><li><b>Log in</b>: <code>POST /j_security_check</code> with form fields <code>j_username</code> and <code>j_password</code>. The session cookie <b>JSESSIONID</b> is returned.</li>
<li><b>Get a CSRF token</b>: <code>GET /dataservice/client/token</code>, then send it as <code>X-XSRF-TOKEN</code> on every POST, PUT and DELETE.</li>
<li><b>Call</b> under <code>/dataservice/</code>: <code>/dataservice/device</code> (inventory), <code>/dataservice/device/monitor</code>, <code>/dataservice/template/device</code>, and so on. Results come in a <code>"data"</code> array.</li></ol>
<div class="viz" id="viz-apiflows"></div>
<div class="tip"><b>Exam tip.</b> Catalyst Center: Basic → token → X-Auth-Token. SD-WAN Manager: j_security_check → JSESSIONID cookie + X-XSRF-TOKEN. 401 = authenticate, 403 = permissions, 404 = path.</div>`},
{id:"eem",num:"6.4",title:"Embedded Event Manager applets",html:`
<p><b>EEM</b> is automation that lives on the device: when an <b>event</b> happens, run <b>actions</b>. It works even when the network is down and no controller can reach the box.</p>
<h3>Event detectors</h3>
<ul><li><code>event syslog pattern "REGEX"</code>: a log message matches.</li>
<li><code>event track 1 state down</code>: a track object changes.</li>
<li><code>event cli pattern "REGEX" sync no skip no</code>: someone types a matching command (with <code>skip yes</code>, the command is blocked).</li>
<li><code>event timer cron cron-entry "0 2 * * *"</code> or <code>event timer watchdog time 300</code>: on a schedule.</li>
<li><code>event interface name Gi0/0/0 parameter input_errors ...</code>: a counter crosses a threshold.</li>
<li><code>event none</code>: run manually with <code>event manager run NAME</code>.</li></ul>
<h3>Actions</h3>
<p>Actions run in <b>label order</b> (sorted as strings, so use 1.0, 2.0... or 010, 020). Common ones: <code>cli command "..."</code> (needs <code>cli command "enable"</code> first), <code>syslog msg "..."</code>, <code>mail</code>, <code>wait</code>, <code>puts</code>.</p>
<pre class="term">event manager applet WAN-SELF-HEAL
 event syslog pattern "Interface GigabitEthernet0/0/1, changed state to administratively down"
 action 1.0 cli command "enable"
 action 2.0 cli command "configure terminal"
 action 3.0 cli command "interface g0/0/1"
 action 4.0 cli command "no shutdown"
 action 5.0 syslog msg "EEM re-enabled G0/0/1"</pre>
<ul><li>Verify: <code>show event manager policy registered</code>, <code>show event manager history events</code>, <code>debug event manager action cli</code>.</li>
<li>Beware of applets whose actions trigger themselves (a syslog action that matches its own pattern): that's a loop.</li>
<li>Tcl policies offer more logic than applets; Python on IOS XE (guest shell) goes further still.</li></ul>
<div class="viz" id="viz-eemparts"></div>
<div class="tip"><b>Exam tip.</b> Event + actions, actions in label order, start CLI actions with "enable". event none = run by hand. event cli ... skip yes blocks a command.</div>`},
{id:"orch",num:"6.5",title:"Agent-based and agentless orchestration",html:`
<p>Configuration management tools keep many devices in a known state and make changes repeatable. ENCOR compares <b>agent-based</b> and <b>agentless</b> tools.</p>
<table><tr><th>Tool</th><th>Model</th><th>Language</th><th>Transport</th><th>Push or pull</th></tr>
<tr><td><b>Ansible</b></td><td>Agentless</td><td>YAML playbooks (Python underneath)</td><td>SSH, NETCONF, HTTPS APIs</td><td>Push from a control node</td></tr>
<tr><td><b>Puppet</b></td><td>Agent-based (agentless possible with Bolt or proxy devices)</td><td>Puppet DSL (Ruby-based) manifests</td><td>HTTPS to the Puppet server</td><td>Pull: agents check in (every 30 min by default)</td></tr>
<tr><td><b>Chef</b></td><td>Agent-based</td><td>Ruby recipes and cookbooks</td><td>HTTPS to the Chef server</td><td>Pull</td></tr>
<tr><td><b>SaltStack</b></td><td>Agent-based (minions) or agentless (salt-ssh); proxy minions for network gear</td><td>YAML states (Python)</td><td>ZeroMQ message bus</td><td>Push and pull, event-driven</td></tr></table>
<ul><li><b>Agent-based</b>: software runs on each managed node. Good for continuous enforcement of state on servers. Network devices often can't run agents, so a proxy is used.</li>
<li><b>Agentless</b>: nothing installed; the controller connects over SSH or APIs. Easy to start with and a natural fit for routers and switches.</li>
<li><b>Ansible terms</b>: <b>inventory</b> (devices and groups), <b>playbook</b> (YAML), <b>play</b>, <b>task</b>, <b>module</b> (<code>cisco.ios.ios_config</code>, <code>ios_command</code>), <b>idempotent</b> (running it twice gives the same result).</li>
<li><b>Puppet terms</b>: manifests, modules, Puppet server, agent, facts (Facter). <b>Chef terms</b>: recipes, cookbooks, Chef server, chef-client (agent), knife (CLI). <b>Salt terms</b>: master, minions, grains (facts), pillars (secrets/data), states.</li>
<li><b>Terraform</b> (declarative infrastructure as code with providers and state files) is common for cloud and controllers too.</li></ul>
<pre class="term">- name: Set NTP on all branch routers
  hosts: branch_routers
  gather_facts: no
  tasks:
    - name: Configure NTP server
      cisco.ios.ios_config:
        lines:
          - ntp server 10.0.0.10</pre>
<div class="viz" id="viz-agentsort"></div>
<div class="viz" id="viz-ansible"></div>
<div class="tip"><b>Exam tip.</b> Ansible = agentless, push, YAML, SSH. Puppet and Chef = agent, pull, Ruby-based. Salt = minions over ZeroMQ, or salt-ssh agentless.</div>`},
{id:"ai",num:"6.6",title:"AI and machine learning in network operations",html:`
<p>AI is now built into network platforms. Know the kinds of AI, what they're good at, and how to use them responsibly.</p>
<h3>Kinds of AI</h3>
<ul><li><b>Machine learning (ML)</b> finds patterns in data. <b>Supervised</b> learning trains on labeled examples (traffic labeled as malicious or benign). <b>Unsupervised</b> learning finds structure without labels (clustering, anomaly detection). <b>Reinforcement</b> learning learns by trial and reward.</li>
<li><b>Predictive AI</b> forecasts: link utilization next quarter, an AP about to fail, a likely SLA breach.</li>
<li><b>Generative AI</b> uses large language models (LLMs) to produce text and code: summarize an incident, explain a config, draft a playbook, answer questions in plain language.</li>
<li><b>Agentic AI</b> goes a step further: an AI agent plans steps and calls tools (APIs, CLI, ticketing) to reach a goal, such as gathering diagnostics across devices and proposing a fix.</li></ul>
<h3>Where it's used</h3>
<ul><li><b>AIOps and assurance</b>: dynamic baselines, anomaly detection, event correlation and root cause (Catalyst Center Assurance, ThousandEyes, Meraki).</li>
<li><b>Security</b>: behavioral analytics on NetFlow, encrypted traffic analytics, malware classification.</li>
<li><b>AI assistants</b>: natural language troubleshooting and configuration help in Cisco platforms.</li>
<li><b>Intent-based networking</b>: translating business intent into configuration, then verifying it.</li></ul>
<h3>Using it responsibly</h3>
<ul><li>LLMs can <b>hallucinate</b>: produce confident but wrong commands. <b>Validate</b> generated configs in a lab or with a dry run, and keep a <b>human in the loop</b> for changes to production.</li>
<li><b>Data privacy</b>: don't paste secrets, keys or customer data into public AI tools. Check where prompts and data are sent and stored.</li>
<li><b>Least privilege for agents</b>: give an AI agent read-only access unless a change is approved; log what it does.</li>
<li><b>Quality data</b>: ML is only as good as the telemetry it learns from (accurate time, consistent naming, enough history).</li></ul>
<div class="viz" id="viz-aitypes"></div>
<div class="viz" id="viz-aisafe"></div>
<div class="tip"><b>Exam tip.</b> Predictive = forecast, generative = create text/code, agentic = plan and act through tools. Always validate AI output and keep a human approving production changes.</div>`}
];

const G={
py:[["Python list syntax?","[1, 2, 3]: ordered, changeable."],["Python dict syntax?","{\"key\": value}."],["Get a dict value safely?","d.get(\"key\")."],["First item of a list?","x[0]."],["Last item of a list?","x[-1]."],["What defines a Python block?","Indentation."],["range(3) produces?","0, 1, 2."],["Python booleans?","True and False."],["Python null value?","None."],["Convert a JSON string to a dict?","json.loads()."],["Convert a dict to a JSON string?","json.dumps()."],["Parse a requests response body as JSON?","resp.json()."],["Check the HTTP status in requests?","resp.status_code."],["Library for NETCONF?","ncclient."],["Library for SSH CLI automation?","netmiko (or paramiko)."],["Library for REST calls?","requests."],["verify=False in requests?","Skips TLS certificate validation (lab only)."],["f-string example?","f\"Interface {name} is up\"."],["Handle an exception?","try: ... except ...:"],["Define a function?","def name(args): ..."]],
json:[["JSON object delimiters?","{ }."],["JSON array delimiters?","[ ]."],["JSON key requirement?","Double-quoted strings."],["JSON booleans?","true and false, lowercase."],["JSON null?","null."],["Single quotes in JSON?","Not allowed."],["Trailing commas in JSON?","Not allowed."],["Comments in JSON?","Not allowed."],["Is \"1500\" a number?","No, it's a string. 1500 without quotes is a number."],["Encoding used by NETCONF?","XML."],["Encoding used by Ansible playbooks?","YAML."],["YAML structure?","Indentation, key: value, - for list items."]],
api:[["REST read method?","GET."],["REST create method?","POST."],["REST replace method?","PUT."],["REST partial update method?","PATCH."],["HTTP 200?","OK."],["HTTP 201?","Created."],["HTTP 202?","Accepted (queued, often with a task ID)."],["HTTP 204?","No Content: success without a body."],["HTTP 400?","Bad request: malformed."],["API returns 401 after a token expires. What do you do?","Authenticate again and resend with the new token."],["API returns 403 for a valid token. What's wrong?","The account lacks permission (authorization), not credentials."],["HTTP 404?","Not found."],["HTTP 405?","Method not allowed."],["HTTP 415?","Unsupported media type."],["API returns 429. How should a script react?","Back off: wait (honor Retry-After) and retry."],["HTTP 500?","Internal server error."],["HTTP 503?","Service unavailable."],["Header for what you send?","Content-Type."],["Header for what you want back?","Accept."],["Catalyst Center token endpoint?","POST /dna/system/api/v1/auth/token."],["Catalyst Center auth header?","X-Auth-Token."],["Catalyst Center inventory endpoint?","GET /dna/intent/api/v1/network-device."],["Catalyst Center long tasks return?","202 with a taskId; poll /task/{id}."],["SD-WAN Manager login endpoint?","POST /j_security_check (j_username, j_password)."],["SD-WAN Manager session cookie?","JSESSIONID."],["SD-WAN Manager CSRF header?","X-XSRF-TOKEN from /dataservice/client/token."],["SD-WAN Manager API base path?","/dataservice/."],["Is REST stateful?","No, stateless."]],
eem:[["What is EEM?","On-box automation: events trigger actions."],["EEM syslog event?","event syslog pattern \"regex\"."],["EEM track event?","event track N state down|up."],["EEM manual event?","event none, run with event manager run NAME."],["EEM scheduled event?","event timer cron or watchdog."],["Block a command with EEM?","event cli pattern ... skip yes."],["EEM action order?","By label, sorted as strings."],["First CLI action usually?","cli command \"enable\"."],["Show registered applets?","show event manager policy registered."],["Show EEM history?","show event manager history events."],["Debug EEM CLI actions?","debug event manager action cli."],["EEM loop risk?","An action that generates the event the applet listens for."]],
orch:[["Ansible model?","Agentless, push."],["Ansible language?","YAML playbooks."],["Ansible transport to network devices?","SSH (or NETCONF/HTTPS APIs)."],["Puppet model?","Agent-based, pull."],["Puppet language?","Puppet DSL (Ruby-based) manifests."],["Chef model?","Agent-based, pull."],["Chef language?","Ruby recipes/cookbooks."],["SaltStack transport?","ZeroMQ."],["Salt agentless option?","salt-ssh."],["Salt agents are called?","Minions."],["Salt facts are called?","Grains."],["Puppet facts tool?","Facter."],["Ansible device list?","Inventory."],["What is idempotence?","Running it again gives the same end state with no extra changes."],["Ansible module for IOS config lines?","cisco.ios.ios_config."],["How do agent tools manage network gear that can't run agents?","Proxy agents/minions."]],
ai:[["Supervised learning?","Training on labeled examples."],["Unsupervised learning?","Finding patterns without labels (clustering, anomalies)."],["Predictive AI?","Forecasts future states (capacity, failures)."],["Generative AI?","Creates text or code with LLMs."],["Agentic AI?","Plans steps and calls tools to reach a goal."],["AI hallucination?","Confident but wrong output."],["Safeguard for AI-generated config?","Validate in a lab/dry run; human approval for production."],["AI data privacy rule?","Don't send secrets or customer data to unapproved AI tools."],["Least privilege for AI agents?","Read-only unless changes are approved; log actions."],["AIOps examples?","Dynamic baselines, anomaly detection, event correlation."]]
};
const DECKS=[["py","Python"],["json","JSON and encodings"],["api","REST APIs"],["eem","EEM"],["orch","Orchestration tools"],["ai","AI in operations"]];
const CARDS=[];DECKS.forEach(([k])=>G[k].forEach((c,i)=>CARDS.push({deck:k,id:k+i,q:c[0],a:c[1]})));

const QUIZ=[
{q:"What does this print?<pre class=\"term\">r = [\"R1\", \"R2\", \"R3\"]\nprint(r[1])</pre>",o:["R2","R1","R3","Error"],a:0,e:"Indexes start at 0."},
{q:"What does this print?<pre class=\"term\">d = {\"host\": \"R1\", \"port\": 22}\nprint(d[\"port\"] + 1)</pre>",o:["23","221","Error","port1"],a:0,e:"22 is an int."},
{q:"What does this print?<pre class=\"term\">for i in range(3):\n    print(i, end=\" \")</pre>",o:["0 1 2","1 2 3","0 1 2 3","3"],a:0,e:"range(3) = 0..2."},
{q:"Which converts the JSON text in 'body' into a Python dict?",o:["json.loads(body)","json.dumps(body)","dict(body)","body.json"],a:0,e:"loads = load string."},
{q:"In a requests script, what does resp.status_code == 401 indicate?",o:["Authentication failed or missing","Success with no content returned","Server error","Rate limited"],a:0,e:"Unauthorized."},
{q:"Which library would a script use to make NETCONF calls?",o:["ncclient","requests","netmiko","flask"],a:0,e:"NETCONF client."},
{q:"What does this print?<pre class=\"term\">devs = [{\"n\":\"R1\",\"up\":True},{\"n\":\"R2\",\"up\":False}]\nprint(len([d for d in devs if d[\"up\"]]))</pre>",o:["1","2","0","True"],a:0,e:"Only R1 is up."},
{q:"Which is valid JSON?",o:["{\"enabled\": true}","{'enabled': true}","{\"enabled\": True}","{enabled: true}"],a:0,e:"Double quotes, lowercase true, quoted keys."},
{q:"What's wrong with: {\"vlans\": [10, 20, 30,]}",o:["Trailing comma","Numbers need quotes","Arrays aren't allowed","Nothing"],a:0,e:"No trailing commas."},
{q:"Which JSON value type is \"1500\"?",o:["String","Number","Boolean","Null"],a:0,e:"Quoted."},
{q:"Which encoding does Ansible use for playbooks?",o:["YAML","JSON","XML","CSV"],a:0,e:"YAML."},
{q:"Which HTTP method should create a new resource?",o:["POST","GET","DELETE","HEAD"],a:0,e:"POST creates."},
{q:"A PUT returns 204. What does it mean?",o:["Success with no response body","Not found","Created with a body","Error"],a:0,e:"No Content."},
{q:"An API returns 415. What's the likely cause?",o:["Wrong Content-Type header","Wrong password","Rate limit","Server crash"],a:0,e:"Unsupported media type."},
{q:"An API returns 405 for DELETE on a resource. Why?",o:["That resource doesn't support DELETE","Bad credentials for the DELETE method","Wrong JSON","It was deleted"],a:0,e:"Method not allowed."},
{q:"How does a client authenticate to the Catalyst Center Intent API?",o:["POST Basic credentials to /dna/system/api/v1/auth/token, then send X-Auth-Token","Send an API key in the URL query string with every request to /dna/intent/api","Use j_security_check","Use SNMP"],a:0,e:"Token-based."},
{q:"Which Catalyst Center endpoint lists the device inventory?",o:["GET /dna/intent/api/v1/network-device","GET /dataservice/device","GET /api/v0/devices","POST /dna/inventory"],a:0,e:"/dataservice is SD-WAN Manager."},
{q:"A Catalyst Center call returns 202 and a taskId. What next?",o:["Poll /dna/intent/api/v1/task/{taskId}","Retry the call until it returns 200 OK","It failed","Log in again"],a:0,e:"Asynchronous."},
{q:"How do you log in to the SD-WAN Manager API?",o:["POST j_username and j_password to /j_security_check","POST to /dna/system/api/v1/auth/token","GET /login with Basic auth","OAuth only"],a:0,e:"Returns a JSESSIONID cookie."},
{q:"What must accompany POST requests to SD-WAN Manager after login?",o:["X-XSRF-TOKEN header","X-Auth-Token","API key","No header"],a:0,e:"From /dataservice/client/token."},
{q:"Which status code range means the client made an error?",o:["4xx","2xx","3xx","5xx"],a:0,e:"5xx is the server."},
{q:"Which EEM event runs an applet only when started by hand?",o:["event none","event timer","event syslog","event cli"],a:0,e:"event manager run."},
{q:"EEM actions labeled 1, 2, 10 run in which order?",o:["1, 10, 2","1, 2, 10","10, 2, 1","Random"],a:0,e:"String sort: use 1.0, 2.0 or 010, 020."},
{q:"Why does an EEM applet start its CLI actions with 'cli command \"enable\"'?",o:["Applet CLI sessions start in user EXEC","To enable EEM","To log in","It's optional decoration"],a:0,e:"Privileged mode needed."},
{q:"Which EEM event can block a command from running?",o:["event cli pattern ... skip yes","event syslog pattern ... maxrun 0","event none","event track"],a:0,e:"skip yes."},
{q:"Which tool is agentless and pushes changes over SSH?",o:["Ansible","Puppet","Chef","Salt with minions"],a:0,e:"Agentless."},
{q:"Which tools are agent-based and pull configuration from a server?",o:["Puppet and Chef","Ansible and Terraform","Ansible and Salt-SSH","NETCONF and RESTCONF"],a:0,e:"Agents check in."},
{q:"Which uses Ruby-based recipes and cookbooks?",o:["Chef","Ansible","Salt","Terraform"],a:0,e:"Chef."},
{q:"Which uses a ZeroMQ message bus between master and minions?",o:["SaltStack","Puppet","Ansible","Chef"],a:0,e:"Salt."},
{q:"A playbook runs twice. The second run reports no changes. This property is:",o:["Idempotence","Redundancy","Atomicity","Persistence"],a:0,e:"Same end state."},
{q:"Which kind of AI drafts an incident summary from logs?",o:["Generative AI","Predictive AI","Supervised clustering","Rule-based"],a:0,e:"Creates text."},
{q:"Which kind of AI forecasts when a WAN link will exceed 80% utilization?",o:["Predictive AI","Generative AI","Agentic AI","None"],a:0,e:"Forecasting."},
{q:"An AI agent gathers show commands from 30 switches and opens a ticket with its findings. This is:",o:["Agentic AI","Predictive AI","Supervised learning only","SNMP"],a:0,e:"Plans and uses tools."},
{q:"An LLM proposes a BGP config change. What's the right next step?",o:["Validate it in a lab or dry run and get human approval","Paste it into production","Ask the LLM if it's sure","Ignore all AI output"],a:0,e:"Human in the loop."},
{q:"Which is a responsible practice with public AI tools?",o:["Don't paste secrets or customer data","Share full configs including keys","Disable logging","Give agents full write access"],a:0,e:"Data privacy."},
{q:"Which ML approach detects anomalies without labeled training data?",o:["Unsupervised learning","Supervised learning","Reinforcement only","Static thresholds"],a:0,e:"Clustering/baselines."}
];

/* ---------- custom sims ---------- */
const DEV=[{id:"a1b2-0001",hostname:"c9300-access-01",managementIpAddress:"10.10.20.81",platformId:"C9300-48U",softwareVersion:"17.12.4",reachabilityStatus:"Reachable",role:"ACCESS"},
  {id:"a1b2-0002",hostname:"c9500-core-01",managementIpAddress:"10.10.20.82",platformId:"C9500-40X",softwareVersion:"17.12.4",reachabilityStatus:"Reachable",role:"CORE"},
  {id:"a1b2-0003",hostname:"c8300-wan-01",managementIpAddress:"10.10.20.83",platformId:"C8300-1N1S-6T",softwareVersion:"17.9.5",reachabilityStatus:"Unreachable",role:"BORDER ROUTER"}];
function apiSandbox(host,api,s){
  const T="eyJhbGciOiJSUzI1NiJ9.ccnp-lab-token";const done=new Set();let out=null,code=null;
  const tasks=[["tok","Get a token (POST the auth endpoint with Basic credentials)"],["list","List the device inventory with your token"],["one","Get just the unreachable device by its id"]];
  const resp=(m,p,h)=>{const P=p.replace(/^https?:\/\/[^/]+/,"").replace(/\/+$/,"");
    if(/coffee|teapot|brew/i.test(P))return [418,{error:"I'm a teapot",detail:"This server refuses to brew coffee because it is, permanently, a teapot. (RFC 2324)"}];
    if(P==="/dna/system/api/v1/auth/token"){if(m!=="POST")return [405,{error:"Method Not Allowed",detail:"Use POST to get a token."}];if(!h.basic)return [401,{error:"Unauthorized",detail:"Send HTTP Basic credentials (Authorization: Basic ...)."}];return [200,{Token:T}]}
    if(!P.startsWith("/dna/intent/api/v1/"))return [404,{error:"Not Found",detail:"No such resource. Intent API paths start with /dna/intent/api/v1/."}];
    if(h.token!==T)return [401,{error:"Unauthorized",detail:h.token?"Invalid or expired token.":"Missing X-Auth-Token header."}];
    if(P==="/dna/intent/api/v1/network-device"){if(m!=="GET")return [405,{error:"Method Not Allowed"}];return [200,{response:DEV,version:"1.0"}]}
    const one=/^\/dna\/intent\/api\/v1\/network-device\/([\w-]+)$/.exec(P);if(one){const d=DEV.find(x=>x.id===one[1]);if(!d)return [404,{error:"Not Found",detail:"No device with id "+one[1]}];if(m==="DELETE")return [403,{error:"Forbidden",detail:"Your role (OBSERVER) can't delete devices."}];if(m!=="GET")return [405,{error:"Method Not Allowed"}];return [200,{response:d,version:"1.0"}]}
    if(P==="/dna/intent/api/v1/site")return [200,{response:[{id:"s-01",name:"Chicago",siteNameHierarchy:"Global/US/Chicago"}]}];
    return [404,{error:"Not Found"}]};
  function draw(){host.innerHTML=`${simHead(s,api)}<p class="scenario">You're scripting against a Catalyst Center sandbox at https://sandbox.lab. Build each request, send it, and read the response. Credentials: devnet / Cisco123!</p>
    <ul class="pad-tasks">${tasks.map(([k,t])=>`<li class="${done.has(k)?"done":""}">${t}</li>`).join("")}</ul>
    <div class="pad-row"><label class="s-small" for="ap-m">Method</label><select id="ap-m">${["GET","POST","PUT","PATCH","DELETE"].map(x=>`<option>${x}</option>`).join("")}</select><input id="ap-p" aria-label="Path" value="/dna/system/api/v1/auth/token" spellcheck="false" autocomplete="off"></div>
    <div class="pad-hdrs"><label class="check"><input type="checkbox" id="ap-b"> Authorization: Basic ZGV2bmV0OkNpc2NvMTIzIQ== (devnet:Cisco123!)</label>
    <div class="pad-row"><label class="s-small" for="ap-t">X-Auth-Token</label><input id="ap-t" spellcheck="false" autocomplete="off" placeholder="paste the token here"></div></div>
    <div class="viz-controls"><button class="btn primary" id="ap-go">Send</button></div>
    <div aria-live="polite">${code?`<p>Response <span class="pad-code ${code<300?"ok":"err"}">${code}</span></p><div class="term pad-out">${esc(JSON.stringify(out,null,2))}</div>`:""}</div>`;
    const q=x=>host.querySelector(x);
    q("#ap-go").onclick=()=>{const m=q("#ap-m").value,p=q("#ap-p").value.trim(),h={basic:q("#ap-b").checked,token:q("#ap-t").value.trim()};const keep={m,p,b:h.basic,t:h.token};
      [code,out]=resp(m,p,h);if(code===418&&typeof flag==="function")flag("teapot");
      if(code===200&&out.Token)done.add("tok");if(code===200&&Array.isArray(out.response)&&out.response.length===DEV.length)done.add("list");if(code===200&&out.response&&out.response.id==="a1b2-0003")done.add("one");
      draw();q("#ap-m").value=keep.m;q("#ap-p").value=keep.p;q("#ap-b").checked=keep.b;q("#ap-t").value=keep.t;
      if(done.size===tasks.length&&!api.passed())api.pass()}}
  draw()}

const ZEN="The Zen of Python, by Tim Peters\n\nBeautiful is better than ugly.\nExplicit is better than implicit.\nSimple is better than complex.\nComplex is better than complicated.\nFlat is better than nested.\nSparse is better than dense.\nReadability counts.\nSpecial cases aren't special enough to break the rules.\nAlthough practicality beats purity.\nErrors should never pass silently.\nUnless explicitly silenced.\nIn the face of ambiguity, refuse the temptation to guess.\nThere should be one-- and preferably only one --obvious way to do it.\nAlthough that way may not be obvious at first unless you're Dutch.\nNow is better than never.\nAlthough never is often better than *right* now.\nIf the implementation is hard to explain, it's a bad idea.\nIf the implementation is easy to explain, it may be a good idea.\nNamespaces are one honking great idea -- let's do more of those!";
const SNIPS=[
  ["intfs = [\"Gi1\", \"Gi2\", \"Gi3\"]\nprint(len(intfs), intfs[-1])",["3 Gi3","2 Gi3","3 Gi1","Error"],0],
  ["dev = {\"name\": \"R1\", \"vlans\": [10, 20]}\ndev[\"vlans\"].append(30)\nprint(dev[\"vlans\"])",["[10, 20, 30]","[30, 10, 20]","[10, 20]","Error"],0],
  ["up = 0\nfor s in [\"up\", \"down\", \"up\"]:\n    if s == \"up\":\n        up += 1\nprint(up)",["2","3","1","up up"],0],
  ["import json\ndata = json.loads('{\"enabled\": true}')\nprint(data[\"enabled\"])",["True","true","\"true\"","1"],0],
  ["def mask(bits=24):\n    return bits\nprint(mask(), mask(30))",["24 30","30 30","24 24","Error"],0],
  ["codes = {200: \"OK\", 404: \"Not Found\"}\nprint(codes.get(500, \"Unknown\"))",["Unknown","None","KeyError","500"],0]];
function pyPad(host,api,s){const ans={};let line="",res="";
  const run=src=>{const t=src.trim();if(!t)return "";
    if(/^import\s+this\s*$/.test(t)){if(typeof flag==="function")flag("zen");return ZEN}
    let m=/^print\((["'])(.*)\1\)$/.exec(t);if(m)return m[2];
    if(/^[\d\s+\-*()%]+$/.test(t)&&/\d/.test(t)){try{return String(Function('"use strict";return ('+t.replace(/\*\*/g,"**")+")")())}catch(e){return "SyntaxError: invalid syntax"}}
    m=/^len\((.*)\)$/.exec(t);if(m){try{const v=JSON.parse(m[1].replace(/'/g,'"'));return String(v.length??Object.keys(v).length)}catch(e){return "NameError: name is not defined"}}
    if(/^print\(\s*\)$/.test(t))return "";
    return "This pad only runs tiny one-liners: print(\"text\"), arithmetic, len([...]). Try the snippets above, or a famous one-line import.";};
  function draw(){const right=SNIPS.filter((x,i)=>ans[i]===0).length,all=Object.keys(ans).length===SNIPS.length;
    host.innerHTML=`${simHead(s,api)}<p class="scenario">Predict what each script prints. Get at least 5 of 6 right to pass.</p>
    ${SNIPS.map((x,i)=>`<div class="py-q"><div class="term" style="min-height:0">${esc(x[0])}</div><div class="chips">${x[1].map((o,k)=>`<button class="chip" data-q="${i}" data-k="${k}" ${ans[i]!=null?"disabled":""} aria-pressed="${ans[i]===k}">${esc(o)}</button>`).join("")}</div>${ans[i]!=null?`<p class="s-small">${ans[i]===0?'<span class="status-good">Right.</span>':'<span class="status-bad">Not quite:</span> it prints <b>'+esc(x[1][0])+"</b>."}</p>`:""}</div>`).join("")}
    <div class="caption" aria-live="polite">${all?(right>=5?`<span class="status-good">${right} of 6.</span> You read Python like a network automation engineer.`:`${right} of 6. Reset and try again.`):`${Object.keys(ans).length} of 6 answered.`}</div>
    <div class="viz-controls"><button class="btn" id="py-reset">Reset</button></div>
    <h3>Scratch pad</h3><div class="pad-row"><span class="mono">&gt;&gt;&gt;</span><input id="py-in" aria-label="Python one-liner" spellcheck="false" autocomplete="off" value="${esc(line)}"><button class="btn" id="py-run">Run</button></div>${res?`<div class="term pad-out">${esc(res)}</div>`:""}`;
    const q=x=>host.querySelector(x);
    host.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{ans[+b.dataset.q]=+b.dataset.k;const r=SNIPS.filter((x,i)=>ans[i]===0).length;if(Object.keys(ans).length===SNIPS.length&&r>=5&&!api.passed())api.pass();draw()});
    q("#py-reset").onclick=()=>{for(const k in ans)delete ans[k];draw()};
    const go=()=>{line=q("#py-in").value;res=run(line);draw();q("#py-in").focus()};q("#py-run").onclick=go;q("#py-in").onkeydown=e=>{if(e.key==="Enter")go()}}
  draw()}

const BROKEN=`{
  'ietf-interfaces:interface': {
    "name": "Loopback100",
    "description": "Managed by automation",
    "type": "iana-if-type:softwareLoopback",
    "enabled": True,
    "ietf-ip:ipv4": {
      "address": [
        { "ip": "10.100.100.1", "netmask": "255.255.255.0", }
      ]
    }
  }
}`;
function jsonFix(host,api,s){let txt=BROKEN,msg="";
  function check(t){let o;try{o=JSON.parse(t)}catch(e){return [false,"Invalid JSON: "+e.message.replace(/^JSON\.parse: /,"")]}
    const i=o&&o["ietf-interfaces:interface"];if(!i)return [false,"Valid JSON, but the top-level key must be \"ietf-interfaces:interface\"."];
    if(i.name!=="Loopback100")return [false,"Valid JSON, but name must be \"Loopback100\"."];
    if(i.enabled!==true)return [false,"Valid JSON, but enabled must be the boolean true (no quotes)."];
    const a=i["ietf-ip:ipv4"]?.address;if(!Array.isArray(a)||!a.some(x=>x.ip==="10.100.100.1"&&x.netmask==="255.255.255.0"))return [false,"Valid JSON, but the ipv4 address list must contain 10.100.100.1 / 255.255.255.0."];
    return [true,"Valid JSON and the payload is correct. A RESTCONF PUT of this body to .../interfaces/interface=Loopback100 would return 201 or 204."]}
  function draw(){host.innerHTML=`${simHead(s,api)}<p class="scenario">A teammate's RESTCONF payload keeps getting <b>400 Bad Request</b>. Fix the JSON so it's valid, without changing what it configures.</p>
    <textarea class="pad-area" id="js-t" spellcheck="false" aria-label="JSON payload">${esc(txt)}</textarea>
    <div class="viz-controls"><button class="btn primary" id="js-go">Validate</button><button class="btn" id="js-r">Start over</button></div><div class="caption" aria-live="polite">${msg}</div>`;
    const q=x=>host.querySelector(x);
    q("#js-go").onclick=()=>{txt=q("#js-t").value;const [ok,m]=check(txt);msg=(ok?'<span class="status-good">Fixed.</span> ':'<span class="status-bad">Not yet.</span> ')+esc(m);if(ok&&!api.passed())api.pass();draw()};
    q("#js-r").onclick=()=>{txt=BROKEN;msg="";draw()}}
  draw()}

registerModule({
  id:"auto",slug:"automation",title:"Automation and AI",
  lessons:LESSONS.map(l=>({...l,short:l.title.split(/[:,]/)[0]})),
  decks:DECKS,cards:CARDS,quiz:QUIZ,
  vizKeys:["pytypes","pytrace","jsonvalid","encodings","codes","apiflows","eemparts","agentsort","ansible","aitypes","aisafe"],
  viz(){
revealViz($("#viz-pytypes"),{title:"Python data types for network scripts",cols:3,done:"Explored the Python data types",items:[
  ["str","\"10.0.0.1\"","Text. Methods like .split(\".\"), .upper(), .startswith(\"Gi\")."],
  ["int","1500","Whole numbers: MTU, VLAN IDs, counters."],
  ["bool","True / False","Results of comparisons like status == \"up\"."],
  ["list","[\"R1\", \"R2\"]","An ordered collection. Loop over it with for. Index from 0."],
  ["dict","{\"name\": \"R1\"}","Key/value pairs: exactly how parsed JSON objects look."],
  ["None","None","No value. Becomes null in JSON."]]});

stepViz($("#viz-pytrace"),{title:"Trace a script line by line",done:"Traced the Python script",steps:[
  ["The script","resp = requests.get(url, headers=h, auth=(\"admin\",\"pw\"))\nif resp.status_code == 200:\n    for d in resp.json()[\"response\"]:\n        if d[\"reachabilityStatus\"] != \"Reachable\":\n            print(d[\"hostname\"])"],
  ["Line 1","Sends an HTTPS GET with Basic auth. resp holds the status code, headers and body."],
  ["Line 2","Continue only if the call succeeded (200)."],
  ["Line 3","resp.json() turns the body into a dict; [\"response\"] is the list of devices. The loop visits each device dict."],
  ["Line 4","Checks each device's reachability field."],
  ["Line 5","Prints the hostname of every device that isn't reachable. With the sandbox data, it prints c8300-wan-01."]]});

quizViz($("#viz-jsonvalid"),{title:"Valid JSON or not?",done:"Judged every JSON snippet",qs:[
  ["{\"vlan\": 10, \"name\": \"USERS\"}",["Valid","Invalid: numbers need quotes","Invalid: keys need single quotes","Invalid: needs an array"],0,"Fine as is."],
  ["{\"enabled\": True}",["Invalid: true must be lowercase","Valid","Invalid: enabled needs single quotes","Valid in JSON5 only, so valid"],0,"Python's True isn't JSON."],
  ["{'name': 'R1'}",["Invalid: strings and keys need double quotes","Valid","Valid if escaped","Invalid: missing array"],0,"Single quotes aren't allowed."],
  ["{\"vlans\": [10, 20, 30]}",["Valid","Invalid: arrays need quotes","Invalid: trailing bracket","Invalid: keys can't hold arrays"],0,"An array value."],
  ["{\"mtu\": 1500, }",["Invalid: trailing comma","Valid","Invalid: number","Invalid: braces"],0,"Remove the comma."],
  ["[{\"ip\": \"10.0.0.1\"}, {\"ip\": \"10.0.0.2\"}]",["Valid: an array of objects","Invalid: top level must be an object","Invalid: duplicate keys","Invalid: IPs must be numbers"],0,"Any value can be the top level."]]});

revealViz($("#viz-encodings"),{title:"One interface, three encodings",cols:3,done:"Compared JSON, XML and YAML",items:[
  ["JSON","REST, RESTCONF","{\"interface\": {\"name\": \"Gi1\", \"enabled\": true}}"],
  ["XML","NETCONF","<interface><name>Gi1</name><enabled>true</enabled></interface>"],
  ["YAML","Ansible","interface:\n  name: Gi1\n  enabled: true"]]});

sortViz($("#viz-codes"),{title:"Sort the response codes",bins:{ok:"Success (2xx)",cl:"Client error (4xx)",sv:"Server error (5xx)"},done:"Sorted the HTTP response codes",items:[
  ["200 OK","ok",""],["201 Created","ok",""],["204 No Content","ok",""],["400 Bad Request","cl","Malformed."],["401 Unauthorized","cl","Authenticate."],["403 Forbidden","cl","Not allowed."],["404 Not Found","cl","Wrong path."],["429 Too Many Requests","cl","Back off."],["500 Internal Server Error","sv",""],["503 Service Unavailable","sv",""]]});

stepViz($("#viz-apiflows"),{title:"Two controllers, two login flows",done:"Compared the controller API logins",steps:[
  ["Catalyst Center: get a token","POST https://catc/dna/system/api/v1/auth/token with Authorization: Basic base64(user:pass). Response 200: {\"Token\": \"eyJ...\"}."],
  ["Catalyst Center: call","GET /dna/intent/api/v1/network-device with X-Auth-Token: eyJ... Response: {\"response\": [ ...devices... ], \"version\": \"1.0\"}. The token lasts about an hour."],
  ["SD-WAN Manager: log in","POST https://vmanage/j_security_check with form data j_username=admin&j_password=... The response sets a JSESSIONID cookie."],
  ["SD-WAN Manager: CSRF token","GET /dataservice/client/token (with the cookie) returns a token string. Send it as X-XSRF-TOKEN on POST, PUT and DELETE."],
  ["SD-WAN Manager: call","GET /dataservice/device with the cookie. Response: {\"data\": [ ...devices... ]}."]]});

revealViz($("#viz-eemparts"),{title:"Anatomy of an EEM applet",cols:2,done:"Explored the parts of an EEM applet",items:[
  ["event manager applet NAME","The container","One applet = one event detector + a list of actions."],
  ["event ...","The trigger","syslog pattern, track, cli pattern, timer, interface counter, or none."],
  ["action LABEL ...","The steps","cli command, syslog msg, mail, wait, puts. Run in label (string) order."],
  ["show event manager ...","Verification","policy registered lists applets; history events shows when each ran."]]});

sortViz($("#viz-agentsort"),{title:"Agent-based or agentless?",bins:{ag:"Agent-based",al:"Agentless"},done:"Sorted the orchestration tools",items:[
  ["Ansible","al","Connects over SSH or APIs."],["Puppet","ag","Agents pull catalogs from the Puppet server."],["Chef","ag","chef-client pulls cookbooks."],["SaltStack with minions","ag","ZeroMQ."],["salt-ssh","al","Salt without minions."],["Terraform","al","Calls provider APIs."],["NETCONF script with ncclient","al","Talks to the device's own interface."]]});

stepViz($("#viz-ansible"),{title:"Run an Ansible playbook against 50 routers",done:"Ran an Ansible playbook",steps:[
  ["Inventory","inventory.yml lists branch_routers with their management IPs and ansible_network_os: cisco.ios.ios, ansible_connection: network_cli."],
  ["Playbook","A YAML play targets branch_routers with one task: cisco.ios.ios_config, lines: ntp server 10.0.0.10."],
  ["Run","ansible-playbook ntp.yml. The control node opens SSH sessions in parallel (5 at a time by default, set with forks). Nothing is installed on the routers."],
  ["Results","Routers that lacked the line report 'changed'. Routers that already had it report 'ok'."],
  ["Run it again","Every router reports 'ok' and nothing changes: the module is idempotent."]]});

revealViz($("#viz-aitypes"),{title:"Kinds of AI in network operations",cols:2,done:"Explored the kinds of AI",items:[
  ["Machine learning","Find patterns","Baselines, clustering, anomaly detection on telemetry. Supervised, unsupervised or reinforcement."],
  ["Predictive AI","Forecast","Capacity planning, failure prediction, SLA risk."],
  ["Generative AI","Create","LLMs that explain configs, summarize incidents and draft scripts or playbooks."],
  ["Agentic AI","Act","An agent that plans and calls tools (APIs, CLI, tickets) to reach a goal, ideally with approvals for changes."]]});

sortViz($("#viz-aisafe"),{title:"Responsible AI: good practice or risk?",bins:{g:"Good practice",r:"Risky"},done:"Sorted responsible AI practices",items:[
  ["Test an AI-generated ACL in a lab before production","g",""],["Paste the running config with secrets into a public chatbot","r","Data leak."],["Give an AI agent read-only API access by default","g","Least privilege."],["Let an agent push changes to the core with no approval","r","Human in the loop."],["Log every action an AI agent takes","g","Auditability."],["Trust a generated command because it 'looks right'","r","Hallucinations happen."],["Feed ML models accurate, NTP-synced telemetry","g","Garbage in, garbage out."]]});
  },
  sims:[
    {id:"apisandbox",title:"Catalyst Center API sandbox",mount:apiSandbox},
    {id:"pypad",title:"Python pad: predict the output",mount:pyPad},
    {id:"jsonfix",title:"Fix the RESTCONF payload",mount:jsonFix},
    {id:"eemlab",type:"ios",title:"Self-healing with EEM",lab:{
      scenario:"Someone keeps shutting R1's uplink G0/0/1 by mistake. Write an applet WAN-HEAL that reacts to the 'administratively down' log for G0/0/1 by bringing the interface back up and logging a message. Then test it by shutting the interface.",
      devices:[{name:"R1",kind:"router"},{name:"R2",kind:"router"}],links:[["R1:g0/0/1","R2:g0/0/1"]],
      boot:{R1:["hostname R1","interface g0/0/1","ip address 10.0.12.1 255.255.255.252","no shutdown"],R2:["hostname R2","interface g0/0/1","ip address 10.0.12.2 255.255.255.252","no shutdown"]},
      consoles:["R1"],startMode:"priv",topo:{R1:[180,70],R2:[420,70]},topoH:130,
      tasks:[
        {t:"Applet WAN-HEAL triggers on the G0/0/1 administratively down syslog message",hint:"event manager applet WAN-HEAL\nevent syslog pattern \"Interface GigabitEthernet0/0/1, changed state to administratively down\"",check:(w,D)=>D.R1.eem["WAN-HEAL"]?.ev?.t==="syslog"&&/GigabitEthernet0\/0\/1/.test(D.R1.eem["WAN-HEAL"].ev.pat),sticky:true},
        {t:"Actions: enable, configure terminal, interface g0/0/1, no shutdown, then a syslog message",hint:"action 1.0 cli command \"enable\"\naction 2.0 cli command \"configure terminal\"\naction 3.0 cli command \"interface g0/0/1\"\naction 4.0 cli command \"no shutdown\"\naction 5.0 syslog msg \"EEM re-enabled G0/0/1\"",check:(w,D)=>{const A=D.R1.eem["WAN-HEAL"];return A&&A.acts.some(a=>a.t==="cli"&&/^no shut/i.test(a.cmd))&&A.acts.some(a=>a.t==="syslog")},sticky:true},
        {t:"Test it: shut G0/0/1 and watch the applet bring it back",hint:"interface g0/0/1\nshutdown",check:(w,D,S)=>ranCmd(S,"R1",/^shut/i)&&!D.R1.ifs[IOS.ifName("g0/0/1")].shut&&!!D.R1.eem["WAN-HEAL"],sticky:true},
        {t:"Check the applet's history",hint:"do show event manager history events",check:(w,D,S)=>ranCmd(S,"R1",/sh\S* ev\S* man\S* hist/i)}],
      solution:"configure terminal\nevent manager applet WAN-HEAL\nevent syslog pattern \"Interface GigabitEthernet0/0/1, changed state to administratively down\"\naction 1.0 cli command \"enable\"\naction 2.0 cli command \"configure terminal\"\naction 3.0 cli command \"interface g0/0/1\"\naction 4.0 cli command \"no shutdown\"\naction 5.0 syslog msg \"EEM re-enabled G0/0/1\"\nexit\ninterface g0/0/1\nshutdown\ndo show event manager history events",
      success:"The applet ran on the box itself, with no controller involved. In real life you'd also want it to tell someone why the interface keeps getting shut."}},
    {id:"codematch",type:"match",title:"Match the API response to its meaning",scenario:"Your script talks to a controller and gets these results. Tap each situation, then tap the response code it would produce.",success:"2xx is success, 4xx is your request's fault, 5xx is the server's.",items:[["The POST created the new site","201"],["The token is missing or expired","401"],["Your read-only role tried to delete a device","403"],["The URL has a typo","404"],["The JSON body has a trailing comma","400"],["Your script made 1,000 calls in a minute","429"],["The provisioning job was queued and returned a taskId","202"],["The controller hit an unexpected bug","500"]],
      slots:[["201","201","Created"],["202","202","Accepted"],["400","400","Bad Request"],["401","401","Unauthorized"],["403","403","Forbidden"],["404","404","Not Found"],["429","429","Too Many Requests"],["500","500","Internal Server Error"]]},
    {id:"toolpick",type:"choice",title:"Pick the automation approach",scenario:"Choose the right automation approach for each job.",success:"Agentless for quick pushes, agents for continuous state, EEM on the box, APIs for controllers, and AI with a human check.",steps:[
      ["Push a one-off NTP change to 300 routers today. Nothing can be installed on them.",["Ansible playbook","Puppet agents on each router","Manual CLI","SNMP SET"],0,"Agentless push."],
      ["Linux servers must be continuously kept in a defined state, checking in every 30 minutes.",["Puppet or Chef agents","A one-time Python script","EEM","Syslog"],0,"Agent-based pull."],
      ["A branch router must bring its tunnel back up within seconds of a failure even when the WAN is down.",["EEM applet on the router","Ansible from HQ","Catalyst Center template","Manual"],0,"On-box automation."],
      ["List every device with a software version older than 17.9 across the campus controller's inventory.",["Python with the Catalyst Center Intent API","EEM","SPAN","CDP"],0,"Controller API."],
      ["Summarize 2,000 lines of logs from last night's outage for a manager.",["A generative AI assistant, with the summary checked by an engineer","An EEM applet","SNMP","A static threshold"],0,"Generative AI with review."]]}
  ],
  badges:[
    ["reader","AI","Automation Scholar","Mark all 6 automation lessons studied",c=>c.allStudied()],
    ["lab","API","Integration Engineer","Complete every diagram in this module",c=>c.vizAll()],
    ["api","200","Status 200","Finish the Catalyst Center API sandbox",c=>c.passed("apisandbox")],
    ["py","PY","Pythonista","Pass the Python pad",c=>c.passed("pypad")],
    ["json","{}","Valid JSON","Fix the RESTCONF payload",c=>c.passed("jsonfix")],
    ["eem","EEM","Self-Healer","Pass the EEM lab",c=>c.passed("eemlab")],
    ["codes","4xx","Code Reader","Match every API response code",c=>c.passed("codematch")],
    ["tool","ORC","Orchestrator","Pass the automation approach picker",c=>c.passed("toolpick")],
    ["perfect","AI","Fully Automated","Score 100% on an automation quiz of 15+ questions",c=>c.earned("quiz100")]
  ]
});
})();
