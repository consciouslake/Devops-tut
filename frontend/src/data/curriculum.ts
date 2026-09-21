// Curriculum content shown in the app's browser. Mirrors CURRICULUM.md.
// Each chapter fills in as that module is actually studied — see
// PLAN.md/CURRICULUM.md for source of truth on ordering and scope.

export interface Chapter {
  id: string
  title: string
  concept: string
  whyDevops: string
  handsOn: { label: string; code: string }[]
  troubleshooting: string[]
  interview: string[]
  azureConnection: string
}

export interface Module {
  id: string
  number: number
  mono: string
  title: string
  outcome: string
  chapters: Chapter[]
}

export const modules: Module[] = [
  {
    id: 'linux-bash',
    number: 1,
    mono: 'SH',
    title: 'Linux & Bash',
    outcome: 'Operate and troubleshoot a Linux server confidently.',
    chapters: [
      {
        id: 'linux-devops-model',
        title: 'Linux and the DevOps operating model',
        concept:
          "An operating system's job is to sit between hardware and every program that runs on it: it schedules CPU time, hands out memory, and controls access to disks and the network. Linux does this job on the overwhelming majority of servers, cloud VMs, and containers — not because it's the only option, but because it's free, scriptable end-to-end, and every layer of it (kernel, shell, filesystem) is inspectable and automatable via text. A shell (bash, zsh) is a program that reads commands and asks the kernel to execute them; a terminal is just the window you type into — they're often confused but they're not the same thing. The kernel owns hardware access and enforces isolation between processes; everything you run as a normal user lives in 'user space' and can only touch hardware through kernel-mediated system calls.",
        whyDevops:
          "DevOps work is fundamentally about operating systems at scale: every VM, container image, and Kubernetes node is Linux underneath. You cannot debug a failed deployment, write a working Dockerfile, or reason about why a service won't start without a working model of processes, permissions, and the filesystem. This is the one module every other module in this curriculum assumes.",
        handsOn: [
          { label: 'Identify what you\'re on', code: 'uname -a\nwhoami\nhostname\nuptime' },
          { label: 'Where you are', code: 'pwd\necho $SHELL' },
        ],
        troubleshooting: [
          "`command not found` → the binary isn't installed, or isn't on $PATH — don't assume the tool is missing before checking both.",
          "A command hangs with no output → it may be waiting on stdin; Ctrl+C to cancel and check if it needed an argument or a pipe.",
        ],
        interview: [
          'What\'s the difference between a shell and a terminal?',
          'What does the kernel do that user-space programs cannot do themselves?',
          'Why does nearly every cloud VM image default to Linux?',
        ],
        azureConnection:
          'Every Linux VM you create in Azure (including azureops-vm01), every AKS node, and every container base image is running this same kernel/user-space model — Azure just manages the hardware underneath it.',
      },
      {
        id: 'filesystem-navigation',
        title: 'Filesystem navigation and file operations',
        concept:
          "Linux has a single unified filesystem tree starting at `/` — there's no C:\\ or D:\\, everything (disks, USB drives, network mounts) gets attached ('mounted') somewhere under `/`. Key top-level directories: `/home` (user files), `/etc` (system-wide configuration — almost everything you'll edit as a sysadmin lives here), `/var` (variable data — logs, caches, service data), `/tmp` (scratch space, often cleared on reboot). Paths are either absolute (start with `/`, unambiguous from anywhere) or relative (start from your current directory, found with `pwd`). `.` means current directory, `..` means parent.",
        whyDevops:
          "You will spend enormous amounts of time moving through remote filesystems over SSH with no GUI — reading config in /etc, checking logs in /var/log, inspecting a failing deploy's working directory. Fluency here is the difference between debugging in seconds versus minutes.",
        handsOn: [
          { label: 'Navigate and inspect', code: 'pwd\nls -la\ncd /etc\ncd ~\nls -la /var/log' },
          { label: 'Create, copy, move, remove', code: 'mkdir ~/app\ntouch ~/app/notes.txt\ncp notes.txt notes.bak\nmv notes.bak archive.txt\nrm archive.txt' },
          { label: 'Read files without an editor', code: 'cat /etc/os-release\nless /var/log/syslog' },
        ],
        troubleshooting: [
          "`No such file or directory` → check for typos, and whether you're using a relative path from the wrong directory (`pwd` first).",
          "`rm` gives no confirmation and no undo — always `ls` the target pattern before running `rm` on it, especially with wildcards.",
        ],
        interview: [
          'What\'s the difference between an absolute and a relative path?',
          'What lives in /etc vs /var vs /tmp?',
          'How would you find which directory a service writes its data to?',
        ],
        azureConnection:
          'SSH\'d into azureops-vm01, this is exactly the tree you\'re navigating — app.py under /home/azureadmin/app, the systemd unit under /etc/systemd/system, its logs reachable via journalctl rather than a flat file.',
      },
      {
        id: 'users-groups-permissions',
        title: 'Users, groups, permissions',
        concept:
          "Every file has an owner (a user) and a group, plus three permission sets — owner, group, others — each with read (r), write (w), execute (x). `ls -l` shows this as a 10-character string like `-rwxr-xr--`. Numeric ('octal') mode notation sums r=4, w=2, x=1 per set, so `755` means owner=rwx, group=r-x, others=r-x. `chmod` changes permissions, `chown` changes ownership. `sudo` grants temporary elevated (root) privileges to a permitted user for a single command, logged for accountability — it's the controlled alternative to logging in as root directly.",
        whyDevops:
          "Permission errors are one of the most common causes of \"it works on my machine but not in prod\": a deploy script that can't write to a directory, a service account that can't read a secret file, an SSH key with permissions too open for sshd to accept. You need to read a permission string instantly and know what to fix.",
        handsOn: [
          { label: 'Inspect', code: 'id\nls -l ~/app/app.py' },
          { label: 'Change ownership and mode', code: 'chmod 644 ~/app/app.py\nchmod +x ~/app/deploy.sh\nsudo chown azureadmin:azureadmin ~/app/app.py' },
        ],
        troubleshooting: [
          '`Permission denied` running a script → check the execute bit with `ls -l` (`chmod +x`), not just read access.',
          'SSH key rejected with "UNPROTECTED PRIVATE KEY FILE" → private keys need `chmod 600`; sshd refuses anything more permissive.',
        ],
        interview: [
          'What does chmod 750 mean in words?',
          'Why does sudo exist instead of everyone just using the root account?',
          'What permission mode does a private SSH key need, and why does sshd enforce it?',
        ],
        azureConnection:
          'The systemd unit for the Phase 1 Python app runs as the `azureadmin` user (not root) with `User=azureadmin` — least-privilege in practice, the same principle Managed Identity applies at the Azure resource level later in the curriculum.',
      },
      {
        id: 'processes',
        title: 'Processes, jobs, signals, and resource inspection',
        concept:
          "Every running program is a process with a unique PID. Processes can run in the foreground (blocking your shell) or background (`&`), and can be listed as shell jobs (`jobs`). Signals are how you communicate with a running process without touching its code: SIGTERM (15, the polite \"please stop\") vs SIGKILL (9, the kernel forcibly ends it, no cleanup). `ps aux` gives a snapshot of all processes; `top` gives a live, sorted view of CPU/memory usage.",
        whyDevops:
          "Diagnosing \"why is this server slow\" or \"why won't this process die\" starts here. You need to find the offending PID, understand its resource usage, and know that `kill -9` is a last resort that skips graceful shutdown (open files, in-flight writes) — the same distinction systemd relies on when stopping a service.",
        handsOn: [
          { label: 'Inspect', code: 'ps aux | grep python3\ntop' },
          { label: 'Control', code: 'kill <pid>       # SIGTERM, graceful\nkill -9 <pid>    # SIGKILL, forced' },
        ],
        troubleshooting: [
          'A killed process respawns instantly → it\'s managed by systemd with `Restart=always`; stop the service (`systemctl stop`), don\'t just kill the PID.',
          '`top` shows a process pinned at 100% CPU → check if it\'s in an infinite loop or genuinely under load before killing it.',
        ],
        interview: [
          'What\'s the difference between SIGTERM and SIGKILL?',
          'Why might `kill <pid>` appear to do nothing?',
          'How would you find the process listening on port 8000?',
        ],
        azureConnection:
          "This is exactly what you did on azureops-vm01: killed the Python process manually and watched systemd's `Restart=always` bring it back — the same self-healing principle Kubernetes Deployments apply to pods later on.",
      },
      {
        id: 'services-logs',
        title: 'Services with systemd and logs with journalctl',
        concept:
          'systemd is the init system on modern Linux — it starts services at boot, restarts them on failure, and manages dependencies between them. A "unit file" (like `/etc/systemd/system/pyapp.service`) declares how to start a service, what user to run it as, and its restart policy. `systemctl` controls unit state (start/stop/enable/status); `journalctl` reads the structured log systemd collects from every unit\'s stdout/stderr, replacing scattered flat log files for anything managed by systemd.',
        whyDevops:
          'Nearly every production service — Docker daemon, your own app, nginx — is managed by systemd. Being able to check `systemctl status`, tail `journalctl -u <service> -f`, and understand a `Restart=` policy is the baseline skill for "is the service actually running, and why did it stop."',
        handsOn: [
          { label: 'Service lifecycle', code: 'sudo systemctl daemon-reload\nsudo systemctl enable --now pyapp\nsudo systemctl status pyapp\nsudo systemctl restart pyapp' },
          { label: 'Logs', code: 'journalctl -u pyapp -f\njournalctl -u pyapp --since "10 min ago"' },
        ],
        troubleshooting: [
          '`systemctl status` shows "failed" → `journalctl -u <service> -n 50` for the actual error, don\'t guess.',
          'Edited the unit file but nothing changed → `daemon-reload` is required after any unit file edit, then restart the service.',
        ],
        interview: [
          'What does `Restart=always` actually do, and what does it NOT protect against (e.g. a bad config causing an instant crash loop)?',
          'How do you view logs for a service that crashed 20 minutes ago?',
          'What\'s the difference between `enable` and `start`?',
        ],
        azureConnection:
          'The pyapp.service unit from Phase 1 is the minimal version of what Ansible will template out in Phase 6, and what the Docker/ACR pipeline replaces with container restart policies from Module 4 onward.',
      },
      {
        id: 'packages-environment',
        title: 'Packages, environment variables, shell configuration',
        concept:
          "Ubuntu uses `apt` to install software from configured repositories, resolving dependencies automatically (`apt update` refreshes the package index, `apt install` fetches and installs). Environment variables are key-value pairs available to every process in a shell session — `$PATH` is the most important one, a colon-separated list of directories the shell searches for commands. `export VAR=value` sets one for the current session and its children; shell startup files (`.bashrc`, `.profile`) make variables persistent across sessions.",
        whyDevops:
          "Config-via-environment-variables is the standard way apps receive secrets and settings in containers and cloud platforms (the FastAPI backend reads GEMINI_API_KEY this way). Knowing how $PATH resolution and shell startup files work explains a huge fraction of \"works in my terminal, not in the script/cron job/service\" bugs — non-interactive shells don't always source the same files.",
        handsOn: [
          { label: 'Packages', code: 'sudo apt update\nsudo apt install -y python3\napt list --installed | grep python3' },
          { label: 'Environment', code: 'echo $PATH\nexport APP_ENV=dev\nenv | grep APP_ENV' },
        ],
        troubleshooting: [
          'A command works interactively but not in a cron job or systemd unit → those run with a minimal environment; $PATH and variables from `.bashrc` aren\'t automatically inherited.',
          '`apt install` fails with a 404 → run `apt update` first; the local package index is stale.',
        ],
        interview: [
          'Why might a script fail in cron but work fine when you run it by hand?',
          'What is $PATH and how does the shell use it?',
          'Where would you set an environment variable so a systemd service can see it?',
        ],
        azureConnection:
          "backend/.env on this project follows the same pattern — Gemini/Qdrant/Redis config as environment variables, read by pydantic-settings, later replaced by Key Vault references in Module 12 instead of a plaintext file.",
      },
      {
        id: 'bash-scripting',
        title: 'Bash scripting fundamentals',
        concept:
          'Bash scripts automate sequences of commands: variables (`$VAR`), conditionals (`if [ ... ]; then`), loops (`for`/`while`), functions, and exit codes (`$?`, `0` = success, nonzero = failure) are the core vocabulary. Scripts should fail loudly rather than silently continue past an error — `set -euo pipefail` at the top of a script is close to a DevOps standard: exit on error, exit on unset variable, and propagate failure through pipes.',
        whyDevops:
          "Every CI/CD pipeline step, every VM bootstrap, every health-check cron job is a shell script under the hood, even when it's wrapped in YAML. Reading and writing small, defensive bash scripts is a daily skill, not an advanced one.",
        handsOn: [
          {
            label: 'A deploy-check script',
            code:
              '#!/usr/bin/env bash\nset -euo pipefail\n\ncommand -v docker >/dev/null || { echo "docker missing"; exit 1; }\ndf -h / | awk \'NR==2{print $5}\'\ncurl -sf localhost:8000 >/dev/null && echo "app OK" || echo "app DOWN"',
          },
        ],
        troubleshooting: [
          'Script silently does nothing on error → missing `set -e`; add it, or check exit codes explicitly with `$?`.',
          '`Permission denied` running `./script.sh` → forgot `chmod +x`, or missing the `#!/usr/bin/env bash` shebang line.',
        ],
        interview: [
          'What does `set -euo pipefail` do and why put it at the top of scripts?',
          'How do you check if the previous command succeeded?',
          'What\'s the difference between running a script as `./script.sh` vs `bash script.sh`?',
        ],
        azureConnection:
          'A deploy-check script like this is the direct ancestor of the `/health` probe GitHub Actions and the Azure Load Balancer will call automatically from Module 6/7 onward.',
      },
      {
        id: 'ssh-cron-hardening',
        title: 'SSH, remote administration, cron, and basic hardening',
        concept:
          "SSH provides an encrypted channel to a remote shell, authenticated by a public/private key pair rather than a password (far harder to brute-force). The private key stays on your laptop; the public key goes in the server's `~/.ssh/authorized_keys`. `~/.ssh/config` lets you alias hosts instead of retyping IPs. `cron` runs scheduled jobs from a crontab (`* * * * * command`, minute/hour/day/month/weekday). Basic hardening: disable password auth, keep SSH off the default port only as minor noise-reduction (not real security), and — as you already did with azureops-vm01 — prefer not exposing SSH publicly at all once Bastion is available (Module 6).",
        whyDevops:
          'SSH is how you\'ll operate every Linux VM you touch for the rest of this curriculum. Cron is the simplest form of scheduled automation and still runs a large share of real-world maintenance jobs (backups, cleanup, health pings) even in a Kubernetes-heavy world.',
        handsOn: [
          { label: 'Connect', code: 'ssh azureadmin@<public-ip>\nssh-keygen -t ed25519 -C "your_email"' },
          { label: 'Schedule a job', code: 'crontab -e\n# 0 2 * * * /home/azureadmin/backup.sh   <- runs daily at 02:00' },
        ],
        troubleshooting: [
          'SSH hangs on connect → check the NSG/firewall allows port 22 from your IP, and the VM is actually running.',
          '"Host key verification failed" after a VM was recreated with the same IP → remove the stale entry from `~/.ssh/known_hosts`.',
          'A cron job "works when I run it manually" but not on schedule → same environment-variable gap as Chapter 6 — use absolute paths inside cron scripts.',
        ],
        interview: [
          'Why is key-based SSH auth preferred over password auth?',
          'What\'s actually protecting azureadmin@vm — password, key, network path, or all three, and in what order do they matter?',
          'Why do cron jobs often fail with "works manually, not on schedule"?',
        ],
        azureConnection:
          'Today\'s SSH access to azureops-vm01 via a public IP is intentionally temporary — Module 6 replaces it with Azure Bastion so port 22 is never open to the internet at all.',
      },
      {
        id: 'linux-troubleshooting-lab',
        title: 'Linux troubleshooting lab',
        concept:
          "This chapter has no new material — it's deliberate practice applying Chapters 1-8 to broken systems: a service that won't start (check journalctl), a script that fails silently (check exit codes and set -e), a full disk (df -h, du -sh), a port nothing's listening on (ss -tlnp), a permissions error blocking a deploy, and a cron job that works interactively but not on schedule.",
        whyDevops:
          "The skill that actually separates a working DevOps engineer from someone who's read the manual is diagnosis speed under a half-broken system with incomplete information — this lab is where Chapters 1-8 stop being separate facts and become one instinct.",
        handsOn: [
          { label: 'Diagnostic toolkit', code: 'df -h\ndu -sh /var/log/*\nss -tlnp\njournalctl -xe\nsystemctl --failed' },
        ],
        troubleshooting: [
          'No single fix here — the exercise is to reproduce each failure mode deliberately (fill a disk with a dummy file, stop a service\'s dependency, chmod 000 a config file) and practice diagnosing it from the symptoms alone.',
        ],
        interview: [
          'Walk through how you\'d diagnose a service that\'s "up" per systemctl but not responding to requests.',
          'A disk is at 100% — what\'s your diagnostic sequence?',
          'How do you find what\'s listening on a given port, and what process owns it?',
        ],
        azureConnection:
          'This is the exact skill set you needed live in this project already — diagnosing the SkuNotAvailable VM-creation failures and the ₹200-vs-$200 budget bug were both "read the actual error, don\'t guess" troubleshooting under real constraints.',
      },
    ],
  },
]

export const stubModules: { number: number; title: string; outcome: string }[] = [
  { number: 2, title: 'Git & GitHub', outcome: 'Use Git as the control system for infrastructure and application delivery.' },
  { number: 3, title: 'Networking Fundamentals', outcome: 'Understand the traffic path before learning Azure networking.' },
  { number: 4, title: 'Docker', outcome: 'Package, run, debug, and publish applications as containers.' },
  { number: 5, title: 'Azure Fundamentals', outcome: 'Navigate Azure and choose basic services deliberately.' },
  { number: 6, title: 'Azure Networking', outcome: 'Understand how Azure traffic flows from the internet to the application.' },
  { number: 7, title: 'CI/CD with GitHub Actions', outcome: 'Create a repeatable build-test-scan-deploy pipeline.' },
  { number: 8, title: 'Infrastructure as Code with Terraform', outcome: 'Provision and change Azure infrastructure safely through code.' },
  { number: 9, title: 'Kubernetes Fundamentals', outcome: 'Understand the core Kubernetes control model before using AKS.' },
  { number: 10, title: 'Azure Kubernetes Service (AKS)', outcome: 'Deploy and operate a realistic workload on managed Kubernetes.' },
  { number: 11, title: 'Monitoring & Observability', outcome: 'Detect, investigate, and explain production behavior.' },
  { number: 12, title: 'Azure Security & Governance', outcome: 'Secure the application and its delivery pipeline without hard-coded secrets.' },
  { number: 13, title: 'Azure Front Door & Production Edge', outcome: 'Understand when and how Front Door fits into a global Azure application.' },
]
