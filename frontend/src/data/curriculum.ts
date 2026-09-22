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
  diagramId?: string
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
  {
    id: 'git-github',
    number: 2,
    mono: 'GT',
    title: 'Git & GitHub',
    outcome: 'Use Git as the control system for infrastructure and application delivery.',
    chapters: [
      {
        id: 'git-mental-model',
        title: 'Git mental model',
        concept:
          "Git tracks a project as a graph of commits, each a full snapshot (not a diff) linked to its parent(s). Three areas matter: the working directory (files as they are on disk), the staging area / index (what you've marked to go into the next commit with `git add`), and the repository (committed history). This staged-then-committed two-step is what lets you build a commit out of only part of what you've changed. Git is distributed — every clone has the full history, not just a pointer to a central server — which is why commits, branching, and most operations work offline and a 'remote' (like GitHub) is just another repository you sync with, not a required authority.",
        whyDevops:
          "Git is the substrate everything else in this curriculum sits on: application code, Dockerfiles, Terraform, GitHub Actions workflows — all versioned the same way. Misunderstanding staging vs committing is the single most common source of \"I committed the wrong thing\" or \"my commit is empty\" confusion.",
        handsOn: [
          { label: 'See the three areas in action', code: 'git status\ngit diff              # working dir vs staging\ngit diff --staged    # staging vs last commit' },
        ],
        troubleshooting: [
          "`git commit` says \"nothing to commit\" but you definitely changed a file → you edited it but never ran `git add`; changes only move from working directory to staging explicitly.",
        ],
        interview: [
          'What are the three areas Git tracks and how does a change move between them?',
          'Why is Git called "distributed" version control?',
        ],
        azureConnection:
          'Every file in this repo — PLAN.md, the Terraform that comes in Module 8, the GitHub Actions workflow — moves through this same staged-then-committed model regardless of what kind of file it is.',
      },
      {
        id: 'core-workflow',
        title: 'Core workflow',
        concept:
          '`git init` creates a new repository; `git status` shows what\'s changed and where; `git add` stages; `git commit` snapshots the stage with a message; `git log` shows history; `git diff` shows unstaged changes; `git push`/`git pull` sync with a remote. This handful of commands covers the vast majority of day-to-day work.',
        whyDevops:
          'This is the loop you run dozens of times a day. Fluency here isn\'t optional — it\'s the baseline every other Git skill builds on.',
        handsOn: [
          { label: 'The daily loop', code: 'git status\ngit add <file>\ngit commit -m "message"\ngit push\ngit pull' },
          { label: 'Inspect history', code: 'git log --oneline -10\ngit diff HEAD~1' },
        ],
        troubleshooting: [
          '`git push` rejected as non-fast-forward → the remote has commits you don\'t have locally; `git pull` first (or `git fetch` + `git merge`/`rebase` if you want to control how).',
        ],
        interview: [
          'What\'s the difference between `git fetch` and `git pull`?',
          'What does `git log --oneline` show that plain `git log` doesn\'t, and why is that useful?',
        ],
        azureConnection:
          'This is literally the loop used to ship today\'s Phase 1 work: `git add` the VM/systemd/NSG fixes and the curriculum browser, `git commit`, `git push` on `phase1-linux-vm`, then a PR into `main`.',
      },
      {
        id: 'undo-safely',
        title: 'Undo safely',
        concept:
          "`git restore <file>` discards uncommitted changes in the working directory. `git reset --soft <commit>` moves the branch pointer back but keeps changes staged — safe to use on commits that haven't been pushed, since it rewrites local history. `git revert <commit>` creates a *new* commit that undoes a previous one, leaving history intact — the only safe option once a commit has been pushed/shared, because it doesn't rewrite anything others may have already pulled. `git reflog` records every place HEAD has pointed, including commits no longer reachable from any branch — Git's real safety net, usually good for ~90 days by default.",
        whyDevops:
          "Knowing revert-vs-reset-vs-restore, and specifically that reset rewrites history while revert doesn't, is what stops \"undo a mistake\" from becoming \"break everyone else's clone.\" reflog is what turns a panicked \"I lost a commit\" into a two-minute recovery.",
        handsOn: [
          { label: 'Local, unpushed commit → reset', code: 'git log --oneline -3\ngit reset --soft HEAD~1   # keeps changes staged\ngit status' },
          { label: 'Already-pushed commit → revert', code: 'git revert --no-edit HEAD   # creates a new commit undoing the last one' },
          { label: 'The safety net', code: 'git reflog -5   # every place HEAD has pointed, even "deleted" commits\ngit reset --hard <sha-from-reflog>   # recover one' },
        ],
        troubleshooting: [
          "Used `reset --hard` and lost work that wasn't committed → uncommitted changes aren't in the reflog; only commits are recoverable this way.",
          '`git revert` on a merge commit fails asking for `-m` → you need to specify which parent (`-m 1`) is the mainline to revert against.',
        ],
        interview: [
          'Why is `git reset` dangerous on a commit that\'s already been pushed and pulled by someone else, but `git revert` isn\'t?',
          'How would you recover a commit after `git reset --hard` if you no longer see it in `git log`?',
        ],
        azureConnection:
          'Demonstrated live in this project: a throwaway commit was undone with `git revert` (safe, preserves history), then a `git reset --soft` collapsed the revert pair back to a clean state before pushing — with `git reflog` confirming both discarded commits were still recoverable the whole time.',
      },
      {
        id: 'branches-prs',
        title: 'Branches and pull requests',
        concept:
          "A branch is just a movable pointer to a commit — creating one is cheap and instant, which is what makes feature-branch workflows practical. Work happens on a branch isolated from `main`; a pull request proposes merging it back, giving a place for CI to run and for a diff to be reviewed before it lands. A protected `main` branch typically requires passing checks (and often review) before a PR can merge, preventing broken code from landing directly.",
        whyDevops:
          "This is the collaboration and safety model behind every production codebase: nothing reaches the branch that gets deployed without going through review and CI first.",
        handsOn: [
          { label: 'Branch, then propose', code: 'git checkout -b phase2\n# ...make commits...\ngit push -u origin phase2\n# then open a PR on GitHub' },
        ],
        troubleshooting: [
          'PR shows unrelated commits/files → the branch was likely cut from a stale `main`; rebase or merge `main` into it before continuing.',
        ],
        interview: [
          'Why use a PR instead of pushing straight to main, even if you\'re the only contributor?',
          'What does a "protected branch" actually enforce?',
        ],
        azureConnection:
          'The `phase1-linux-vm` → `main` PR merged earlier this session, with 3 checks passing (the `ci.yml` jobs), is exactly this workflow — CI ran automatically on the PR before merge was even possible if checks had been required.',
      },
      {
        id: 'merge-conflicts-rebase',
        title: 'Merge conflicts and rebase',
        concept:
          "A conflict happens when Git can't automatically reconcile two branches' changes to the same lines — it marks the file with `<<<<<<<`/`=======`/`>>>>>>>` markers and pauses, waiting for a human decision. Resolving means editing the file to the correct final state, removing the markers, then `git add` + continue. `git merge` creates a merge commit joining two histories; `git rebase` replays one branch's commits on top of another, producing linear history — powerful but rewrites commits, so it should never be done on a branch others have already pulled.",
        whyDevops:
          "Conflicts are routine, not exceptional, on any team repo — the skill is calm, systematic resolution, not avoidance. Knowing when rebase is safe (your own unpublished branch) vs dangerous (shared history) prevents a whole class of \"why did everyone's history just change\" incidents.",
        handsOn: [
          { label: 'During a conflict', code: 'git status                 # shows conflicted files\n# edit the file, remove <<<<<<< ======= >>>>>>> markers\ngit add <file>\ngit commit                 # (merge) or: git rebase --continue' },
        ],
        troubleshooting: [
          'Rebase gets messy mid-way → `git rebase --abort` returns to the pre-rebase state cleanly, no harm done.',
          'Merged the wrong direction (target vs source branch swapped) → check `git log --graph` before resolving, not after.',
        ],
        interview: [
          'What\'s the practical difference between merge and rebase, and when would you choose each?',
          'Why is rebasing a shared/pushed branch considered dangerous?',
        ],
        azureConnection:
          'Already handled directly in this project — a merge conflict earlier in the session was resolved by hand, and the `d134459` merge commit (visible in `git log`) shows a real merge of `main` into `phase1-linux-vm` mid-session.',
      },
      {
        id: 'repo-hygiene',
        title: 'Repository hygiene',
        concept:
          '`.gitignore` prevents specific files/patterns from ever being tracked (build output, secrets, dependencies). Tags mark specific commits as meaningful points (releases); conventional commit messages (`feat:`, `fix:`, `docs:`) make history scannable and can drive automated changelogs. Secret scanning (gitleaks and similar) inspects every commit for patterns that look like credentials before they can land in history — critical because once a secret is pushed, rotating it is the only real fix; deleting the commit doesn\'t remove it from anyone\'s existing clone or GitHub\'s cache.',
        whyDevops:
          'A leaked API key or cloud credential in Git history is one of the most common real-world security incidents, and it\'s entirely preventable with a five-minute setup. This is cheap insurance every repo should have from day one, not just "important" ones.',
        handsOn: [
          { label: 'Verify a file is actually ignored', code: 'git check-ignore -v backend/.env' },
          { label: 'Secret scanning, pre-commit and CI', code: 'cat .pre-commit-config.yaml\npre-commit run --all-files' },
        ],
        troubleshooting: [
          'A file that should be ignored still shows in `git status` → it was already tracked before being added to `.gitignore`; `.gitignore` only affects untracked files — remove it from tracking with `git rm --cached <file>`.',
        ],
        interview: [
          'If a secret is accidentally committed and pushed, why isn\'t deleting the commit enough to fix it?',
          'What\'s the difference between a file being untracked vs gitignored vs removed?',
        ],
        azureConnection:
          "Set up directly in this project: `.pre-commit-config.yaml` runs gitleaks locally before every commit, and `ci.yml` runs the same check in GitHub Actions — verified by testing it against both a real-looking fake AWS key (blocked, exit code 1) and gitleaks' own allowlisted example key (correctly passed, to avoid flagging docs/tutorials).",
      },
      {
        id: 'github-collaboration',
        title: 'GitHub collaboration',
        concept:
          "Issues track discrete units of work (bugs, features, tasks) with labels, assignees, and comments. Project boards (GitHub Projects) organize issues/PRs into columns like Backlog/In Progress/Done, giving a visual view of what's actually happening across a repo. Milestones group issues toward a shared deadline or release. None of this is Git itself — it's GitHub's layer on top, for the human coordination Git's commit graph doesn't capture.",
        whyDevops:
          "Even solo, a lightweight board separates \"what am I doing right now\" from \"what's the full curriculum\" — PLAN.md and CURRICULUM.md are the source of truth for scope, a board is for active work in flight.",
        handsOn: [
          { label: 'No CLI needed for this one', code: '# GitHub web UI: repo -> Projects -> New project -> Board template\n# Columns: Backlog / In Progress / Done' },
        ],
        troubleshooting: [
          'Board becomes stale/ignored → usually a sign it\'s duplicating something already tracked elsewhere (like this curriculum); keep it to short-lived, active items only.',
        ],
        interview: [
          'What\'s the difference between a GitHub Issue and a Git commit — why do you need both?',
          'How would you decide what belongs on a project board vs in a planning doc?',
        ],
        azureConnection:
          'Set up for this repo to track day-to-day work items across the 13-module roadmap, separate from PLAN.md/CURRICULUM.md which hold the fixed curriculum structure.',
      },
      {
        id: 'github-actions-intro',
        title: 'GitHub Actions introduction',
        concept:
          "A workflow is a YAML file under `.github/workflows/` triggered by events (`push`, `pull_request`, schedule, manual). It runs one or more jobs, each a sequence of steps on a fresh runner VM. Steps either run shell commands directly or invoke reusable 'actions' (like `actions/checkout` to pull the repo, or `gitleaks/gitleaks-action` for scanning). Full CI/CD (build, scan, deploy) is Module 7 — this chapter is just enough to read and reason about a workflow file.",
        whyDevops:
          "You'll be reading and editing workflow YAML constantly from here on — this repo's `ci.yml` already runs on every push and PR.",
        handsOn: [
          { label: 'Read the repo\'s actual workflow', code: 'cat .github/workflows/ci.yml' },
        ],
        troubleshooting: [
          'A workflow doesn\'t trigger at all → check the `on:` triggers match what you did (e.g. it\'s scoped to `pull_request` but you pushed directly to a branch with no open PR).',
        ],
        interview: [
          'What\'s the difference between a workflow, a job, and a step?',
          'Why does each job run on a fresh runner instead of a persistent machine?',
        ],
        azureConnection:
          'This repo\'s `ci.yml` currently has three jobs — `gitleaks`, `backend` (pytest), `frontend` (npm build) — all three ran and passed on the PR merged earlier this session.',
      },
      {
        id: 'git-troubleshooting-lab',
        title: 'Git troubleshooting lab',
        concept:
          "Deliberate practice recovering from common bad states: a merge gone wrong (abort or reset it), a detached HEAD (checkout a branch to reattach), a rejected non-fast-forward push (pull/rebase first), an accidentally committed secret (rotate the credential — history rewriting alone doesn't fully fix a pushed secret), and a branch that's diverged badly enough that starting a fresh branch from a known-good commit is faster than untangling it.",
        whyDevops:
          "Same principle as the Linux troubleshooting lab: the goal is fast, calm diagnosis under a half-broken repo, not memorized facts.",
        handsOn: [
          { label: 'Diagnostic toolkit', code: 'git status\ngit log --oneline --graph --all -10\ngit reflog -10' },
        ],
        troubleshooting: [
          'No single fix — reproduce each scenario deliberately on a throwaway branch and practice recovering, the same way the undo-practice chapter\'s revert/reset/reflog sequence was done live in this project.',
        ],
        interview: [
          'You accidentally pushed a real API key in a commit two pushes ago — what\'s your actual remediation sequence?',
          'What does "detached HEAD" mean and how do you get back to a normal state?',
        ],
        azureConnection:
          'Directly exercised in this project already: the revert -> reset --soft -> reflog sequence in the Undo Safely chapter was real troubleshooting practice, not a hypothetical.',
      },
    ],
  },
  {
    id: 'networking-fundamentals',
    number: 3,
    mono: 'NW',
    title: 'Networking Fundamentals',
    outcome: 'Understand the traffic path before learning Azure networking.',
    chapters: [
      {
        id: 'network-basics',
        title: 'Network basics: IP, MAC, ports, protocols',
        concept:
          "Every device on a network has a MAC address (physical, burned into the network card, only meaningful on the local segment) and can have an IP address (logical, routable across networks). A port is a number (0-65535) that lets one IP address run many independent services at once — an IP address gets you to the machine, a port gets you to the specific process on it. Protocols (TCP, UDP, ICMP) define the rules for how data actually moves: TCP is connection-oriented and guarantees delivery/order (what HTTP, SSH rely on), UDP is fire-and-forget with no guarantees (used where speed matters more than reliability, like DNS queries or video streaming), ICMP carries control/diagnostic messages (what `ping` uses).",
        whyDevops:
          "This vocabulary is the atomic unit everything else in networking is built from. Reading a firewall rule, an NSG rule, or a `netstat` line is meaningless without knowing which of these four things (IP, MAC, port, protocol) each field represents.",
        handsOn: [
          { label: 'See it in your own docker-compose stack', code: 'netstat -ano | grep LISTENING | grep -E ":8000|:6379|:6333|:5173"' },
        ],
        troubleshooting: [
          'Two services conflict on the same port → only one process can bind a given IP:port:protocol combination at a time; the second one fails to start, not silently shares it.',
        ],
        interview: [
          'What\'s the practical difference between an IP address and a MAC address?',
          'Why does TCP guarantee delivery but UDP doesn\'t, and why would you ever want UDP anyway?',
        ],
        azureConnection:
          'The docker-compose stack for this project shows this directly: Redis (6379) and Qdrant (6333) are bound to `127.0.0.1` only — reachable by IP+port from this machine alone — while the frontend (5173/nginx) and backend (8000/FastAPI) bind `0.0.0.0`, reachable from any interface. Same distinction Azure NSGs enforce at the network level in Module 6.',
      },
      {
        id: 'osi-tcpip',
        title: 'OSI and TCP/IP models',
        concept:
          "The OSI model's 7 layers (Physical, Data Link, Network, Transport, Session, Presentation, Application) and TCP/IP's simpler 4-layer version (Link, Internet, Transport, Application) describe the same reality at different granularity. The value isn't memorizing layer names — it's using them as troubleshooting boundaries: is this a cabling issue (L1), a switching issue (L2/MAC), a routing issue (L3/IP), a connection issue (L4/TCP port), or an application issue (L7/HTTP)? Each layer only needs to trust the guarantees of the layer below it, which is what lets the internet be built from swappable, independently-evolving pieces.",
        whyDevops:
          '"Is this a networking problem or an application problem" is one of the most common diagnostic forks in DevOps work, and the OSI layers are the mental checklist for answering it systematically instead of guessing.',
        handsOn: [
          { label: 'Map a real request to layers', code: '# curl https://github.com touches:\n# L3 (IP routing) -> L4 (TCP handshake + port 443) -> L7 (TLS + HTTP request/response)\ncurl -v https://github.com 2>&1 | head -15' },
        ],
        troubleshooting: [
          '`curl` hangs with no response at all → likely L3/L4 (routing or a firewall silently dropping the connection), not an application bug — a 500 error, by contrast, is definitely L7.',
        ],
        interview: [
          'A user reports "the website is down" — walk through which OSI layers you\'d check, in order.',
          'Why does TCP/IP\'s 4-layer model collapse OSI\'s top three layers into one?',
        ],
        azureConnection:
          'An NSG rule operates at L3/L4 (IP + port + protocol) — it has no idea what HTTP method or path is being requested. That\'s exactly why Application Gateway/WAF (L7, Module 6) exists as a separate layer for path-based routing and payload inspection.',
      },
      {
        id: 'ipv4-cidr',
        title: 'IPv4 and CIDR',
        concept:
          "An IPv4 address is 32 bits, written as four decimal octets (e.g. `10.0.1.4`). CIDR notation (`10.0.0.0/16`) specifies how many leading bits are the fixed 'network' portion — the rest are usable for hosts. A `/16` gives 65,536 addresses (2^16), a `/24` gives 256 (2^8), a `/26` gives 64. Private address ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) are reserved for internal networks and never routed on the public internet — this is exactly what a VNet's address space is built from.",
        whyDevops:
          "Every VNet, subnet, and NSG source/destination range you'll write from Module 6 onward is CIDR notation. Being able to look at `10.0.1.0/24` and immediately know it's 256 addresses from `10.0.1.0` to `10.0.1.255` (with the first and last reserved by Azure, plus a few more) is a baseline, not an advanced skill.",
        handsOn: [
          { label: 'Practice the math', code: '# /24 = 256 addresses, /26 = 64, /28 = 16\n# 10.0.1.0/24  -> 10.0.1.0 - 10.0.1.255\n# 10.0.2.0/26  -> 10.0.2.0 - 10.0.2.63   (this was AzureBastionSubnet\'s size in an earlier draft)' },
        ],
        troubleshooting: [
          'A subnet creation fails with an overlapping range error → two subnets\' CIDR blocks intersect; sketch the ranges out numerically before assuming it\'s a permissions issue.',
        ],
        interview: [
          'How many usable addresses are in a /27? How would you calculate that without a tool?',
          'Why are 10.x, 172.16-31.x, and 192.168.x reserved instead of routable on the public internet?',
        ],
        azureConnection:
          "azureops-vm01's default VNet uses a private CIDR range (10.0.0.0/16 in an earlier drafted design) — the same private-range convention Module 6's from-scratch VNet/subnet/NSG lab will use explicitly instead of relying on Azure's auto-created defaults.",
      },
      {
        id: 'dns',
        title: 'DNS and name resolution',
        concept:
          "DNS translates human-readable names (github.com) to IP addresses. A records point a name to an IPv4 address; CNAME records alias one name to another; TXT records hold arbitrary text (often used for domain ownership verification). Resolution is hierarchical: your resolver asks a recursive resolver (often your router or ISP), which — if not cached — queries root servers, then TLD servers (.com), then the domain's authoritative nameserver for the final answer. TTL controls how long a result can be cached before it must be re-checked.",
        whyDevops:
          "DNS misconfiguration or propagation delay is one of the most common causes of \"it works for me but not for you\" — different resolvers/caches see different states during a TTL window. Custom domains (devopspk.online, Module 12's Front Door work) live entirely in this system.",
        handsOn: [
          { label: 'Resolve a real name and see the resolver chain', code: 'nslookup github.com' },
        ],
        troubleshooting: [
          "`nslookup` shows `DNS request timed out` before eventually succeeding → the first resolver(s) it tried didn't answer in time and it fell back; this happened live in this session against `EARTH-4222.bbrouter` before the actual A record came back — normal, but worth noticing if it happens consistently, since it points at a flaky local resolver.",
          'A DNS change "isn\'t working yet" → check the TTL on the old record; it can take up to that long to expire from caches everywhere, not just yours.',
        ],
        interview: [
          'What\'s the difference between a recursive resolver and an authoritative nameserver?',
          'Why might a DNS change appear live for you but not for someone else, immediately after making it?',
        ],
        azureConnection:
          "When devopspk.online's A record eventually points at a VM/LB/Front Door IP (deferred goal, tracked in PLAN.md for Module 12), this is exactly the mechanism that makes it resolve — plus GoDaddy's DNS panel already sitting ready per the Day 0 plan.",
      },
      {
        id: 'http-https-tls',
        title: 'HTTP/HTTPS and TLS',
        concept:
          "HTTP is a request/response protocol: a method (GET, POST, PUT, PATCH, DELETE), headers, and optionally a body, answered with a status code and its own headers/body. Status codes group by meaning: 2xx success, 3xx redirect, 4xx client error (400 bad request, 401 unauthenticated, 403 forbidden/authenticated-but-not-allowed, 404 not found), 5xx server error (500 unhandled exception, 502 bad gateway — an upstream proxy got an invalid response, 503 service unavailable, 504 gateway timeout). TLS wraps the connection in encryption before any HTTP happens: a handshake negotiates a shared key using the server's certificate (issued by a trusted CA) to prove identity, then all HTTP traffic over that connection is encrypted — this is the difference between HTTP and HTTPS.",
        whyDevops:
          "Status codes are the first diagnostic signal in almost every incident — 401 vs 403 vs 404 vs 500 vs 502 each point at a completely different layer of the system being broken, and confusing them wastes debugging time.",
        handsOn: [
          { label: 'Watch the TLS handshake and status code happen', code: 'curl -v https://github.com 2>&1 | head -25' },
          { label: 'Check status only', code: 'curl -I https://github.com' },
        ],
        troubleshooting: [
          '502 vs 503 vs 504, know the difference: 502 means a proxy/gateway got a bad response FROM the backend (backend is reachable but broken), 503 means the service is deliberately not accepting requests (overloaded, in maintenance), 504 means the proxy gave up waiting for a response (backend is slow or hung, not necessarily broken).',
        ],
        interview: [
          'A user reports a 403 on an endpoint that returns 200 for you — what\'s your hypothesis?',
          'Explain what TLS actually protects against, and what it does NOT protect against (e.g. a compromised endpoint).',
        ],
        azureConnection:
          "This session's live curl showed the actual handshake: TCP connect on 443, TLS negotiation (visible as `schannel: renegotiating SSL/TLS connection` on Windows), then the HTTP GET and its 200 response — the same sequence a browser does silently for `https://devopspk.online` once TLS is set up via certbot (Module 6) or Front Door-managed certs (Module 12).",
      },
      {
        id: 'routing-nat',
        title: 'Routing and NAT',
        concept:
          "A default gateway is where a device sends traffic destined outside its own local network — a router that knows (or knows how to find out) the next hop toward the destination. Route tables map destination ranges to next hops; a packet gets forwarded hop by hop, each router only needing to know the next step, not the whole path. NAT (Network Address Translation) lets many private IP addresses share one public IP for outbound traffic — SNAT rewrites the source address on the way out, DNAT rewrites the destination address on the way in (used for port-forwarding a public IP to an internal private one).",
        whyDevops:
          "This is why a VM with only a private IP can still reach the internet outbound (via NAT through the VNet's default routing) while remaining unreachable inbound without an explicit public IP or load balancer — the asymmetry is intentional and is the basis of most secure network designs.",
        handsOn: [
          { label: 'See the hop-by-hop path', code: 'tracert -h 6 github.com' },
        ],
        troubleshooting: [
          'A `*` in traceroute output at one hop, but successful hops before and after → that router is dropping/deprioritizing ICMP, not that the path is broken — this happened live in this session at hop 4 and 6, with successful hops on either side.',
        ],
        interview: [
          'What does a default gateway actually do when a device sends traffic to an address outside its subnet?',
          'What\'s the difference between SNAT and DNAT, and where would you use each?',
        ],
        azureConnection:
          'A live traceroute to github.com in this session showed the real path: home router (private IP 192.168.1.1) -> ISP gateway -> ISP backbone (Delhi) -> Microsoft\'s network -> destination — the same private-to-public transition an Azure VM\'s outbound NAT performs, just visible hop by hop here.',
      },
      {
        id: 'firewalls',
        title: 'Firewalls',
        concept:
          "A host firewall (like Windows Firewall or `ufw` on Linux) filters traffic to/from a single machine; a network firewall filters traffic at a network boundary, affecting everything behind it. Rules are evaluated by priority and typically default-deny: an explicit allow rule is required, everything else is blocked. Stateful filtering (what almost all modern firewalls do) tracks connections — once an outbound connection is allowed, its return traffic is automatically permitted without needing a separate inbound rule, unlike a stateless filter which would need both directions defined explicitly.",
        whyDevops:
          "Azure NSGs are exactly this model: default-deny, priority-ordered, stateful. The default-allow-ssh rule created automatically at priority 1000 and the explicit open-port-8000 rule added later in this project are literal examples of writing default-deny firewall rules.",
        handsOn: [
          { label: 'Read a real NSG ruleset the same way you\'d read a firewall config', code: '# from Phase 1 of this project:\n# priority 900  Allow Tcp 8000 Inbound  (explicit, added later)\n# priority 1000 Allow Tcp 22   Inbound  (default, added at VM creation)\n# priority 65500 Deny *  *     Inbound  (implicit default-deny, always last)' },
        ],
        troubleshooting: [
          'A service works locally on a host but not from outside → check the host firewall AND the network firewall/NSG separately; either one blocking is enough to cause this, and they fail identically from the client\'s perspective.',
        ],
        interview: [
          'What does "stateful" mean in the context of a firewall, and why does it reduce the number of rules you need to write?',
          'Why is default-deny safer than default-allow-with-exceptions, from a security posture standpoint?',
        ],
        azureConnection:
          "This was a real bug in Phase 1: the app worked via `curl localhost:8000` on the VM but failed externally, because the NSG (a stateful, default-deny network firewall) only had port 22 allowed — port 8000 needed an explicit rule before external traffic could reach it, confirmed and fixed with `az vm open-port`.",
      },
      {
        id: 'load-balancing-reverse-proxy',
        title: 'Load balancing and reverse proxy',
        concept:
          "A load balancer distributes incoming traffic across multiple backend instances, usually based on a health probe (only sending traffic to instances that report healthy). L4 load balancing operates on IP/port alone, unaware of HTTP; L7 (a reverse proxy, like nginx or Application Gateway) understands HTTP and can route by path/header/hostname, terminate TLS, and rewrite requests. A reverse proxy sits in front of one or more backend servers and forwards client requests to them, returning the response as if it came from the proxy itself — the client never talks to the backend directly.",
        whyDevops:
          "This is the architectural difference behind Module 6's Load Balancer, Application Gateway, and Front Door — same underlying concept (route and possibly balance traffic), different layer of awareness and different scope (VNet-local vs global edge).",
        handsOn: [
          { label: 'Nginx already doing this in the project', code: 'cat frontend/nginx.conf' },
        ],
        troubleshooting: [
          'One backend instance behind a load balancer is silently getting no traffic → check its health probe response specifically; LBs remove unhealthy targets from rotation without necessarily surfacing why.',
        ],
        interview: [
          'What\'s the practical difference between L4 and L7 load balancing, and when would path-based routing require L7?',
          'What does a reverse proxy do that a plain load balancer doesn\'t?',
        ],
        azureConnection:
          "The frontend container already runs nginx as a reverse proxy in front of the built React app — the same role, at smaller scale, that Azure Load Balancer (Module 2 of the roadmap... i.e. Week 2's original VMSS work, now Module 6) will play in front of multiple VM instances.",
      },
      {
        id: 'troubleshooting-toolkit',
        title: 'Network troubleshooting with ping, traceroute, curl, ss/netstat, nslookup/dig',
        concept:
          "A standard diagnostic sequence for \"can't reach X\": `ping` (is the host reachable at all, L3) -> `tracert`/`traceroute` (where does it break along the path) -> `nslookup`/`dig` (is DNS resolving to the right address) -> `curl -v` (is the TCP/TLS/HTTP layer working, and what's the actual response) -> `netstat`/`ss` (locally: is something actually listening on the port you expect). Running these roughly in this order narrows down which layer is broken fastest.",
        whyDevops:
          "This exact sequence — rather than the tools individually — is the actual skill. Knowing five tools in isolation is much less useful than knowing the order to run them in in order to narrow down a failure fast under pressure.",
        handsOn: [
          { label: 'The full sequence, run for real in this session', code: 'nslookup github.com\ntracert -h 6 github.com\ncurl -v https://github.com\nnetstat -ano | grep LISTENING' },
        ],
        troubleshooting: [
          'All four tools succeed individually but the app "still doesn\'t work" → the issue is likely application-layer (L7) logic, not network — DNS/TCP/TLS all being fine rules out everything below the application itself.',
        ],
        interview: [
          'Someone says "I can\'t reach the app" — what\'s the first command you run, and why that one first?',
          'How do ping and curl differ in what they actually test?',
        ],
        azureConnection:
          "This exact sequence was used live in this project to diagnose the port-8000 issue: `curl localhost:8000` worked (app itself fine) but external `curl http://<public-ip>:8000` failed (network layer broken) — narrowing straight to the NSG without guessing.",
      },
    ],
  },
  {
    id: 'docker',
    number: 4,
    mono: 'DK',
    title: 'Docker',
    outcome: 'Package, run, debug, and publish applications as containers.',
    chapters: [
      {
        id: 'why-containers',
        title: 'Why containers exist',
        concept:
          "A container packages an application with everything it needs to run (dependencies, runtime, config) into one portable unit, isolated from the host using Linux kernel features (namespaces for isolation, cgroups for resource limits) rather than full hardware virtualization. Unlike a VM, containers share the host's kernel, which is why they start in milliseconds and use a fraction of the overhead — but also why a Linux container can't run natively on a different kernel (hence Docker Desktop on Windows/Mac runs a hidden Linux VM underneath).",
        whyDevops:
          '"Works on my machine" is largely a solved problem once the machine\'s entire runtime environment ships as the artifact instead of being separately reproduced by every developer and every server.',
        handsOn: [
          { label: 'See the isolation and speed', code: 'docker run --rm python:3.11-slim python3 --version\ntime docker run --rm alpine echo hi' },
        ],
        troubleshooting: [
          'A container behaves differently than the same app run directly on the host → check base image differences first (Alpine vs Debian have different libc, package availability) before assuming it\'s a Docker-specific bug.',
        ],
        interview: [
          'What\'s the fundamental difference between a container and a VM?',
          'Why can a container start in milliseconds when a VM takes tens of seconds?',
        ],
        azureConnection:
          "This project's whole stack (FastAPI backend, React frontend via nginx, Redis, Qdrant) runs as four containers via one `docker compose up` — the same images later get pushed to Azure Container Registry and run on a VM/VMSS/AKS with zero code changes.",
      },
      {
        id: 'images-layers',
        title: 'Images and layers',
        concept:
          "An image is a read-only template built from a stack of layers, each corresponding to one Dockerfile instruction. Layers are cached and shared — if two images share the same base and early instructions, Docker reuses those layers instead of rebuilding them, which is why instruction *order* in a Dockerfile matters for build speed (put rarely-changing steps like dependency installs before frequently-changing steps like copying source code). A registry (Docker Hub, Azure Container Registry) stores and distributes images by name:tag.",
        whyDevops:
          "Badly-ordered Dockerfiles cause slow CI builds because every code change invalidates and rebuilds every layer after it. This is a five-minute fix with a large payoff once you understand caching.",
        handsOn: [
          { label: 'Inspect layers', code: 'docker history devops-tut-backend\ndocker image ls' },
        ],
        troubleshooting: [
          'Build takes forever even for a one-line code change → dependency install (`pip install`/`npm install`) is probably placed after `COPY . .` instead of before it, invalidating the cached dependency layer on every build.',
        ],
        interview: [
          'Why does instruction order in a Dockerfile affect build speed?',
          'What makes an image layer get invalidated and rebuilt?',
        ],
        azureConnection:
          "`backend/Dockerfile` already orders this correctly: `COPY requirements.txt` + `pip install` happens before `COPY . .`, so editing `main.py` doesn't force a slow dependency reinstall on every build.",
      },
      {
        id: 'dockerfile',
        title: 'Dockerfile',
        concept:
          'FROM sets the base image. COPY brings files from the build context into the image. RUN executes a command at build time (installing packages, creating users). ENV sets environment variables baked into the image. EXPOSE documents (doesn\'t open) a port the container listens on. CMD sets the default command when the container starts (overridable at `docker run`), vs ENTRYPOINT which is harder to override, intended for the container\'s fixed "main" process. Multi-stage builds (`FROM ... AS build`, then a fresh `FROM` that copies only the built artifacts) let you use heavy build tools without shipping them in the final image.',
        whyDevops:
          "Reading someone else's Dockerfile fluently, and writing a minimal, secure one yourself, is a core daily skill — nearly every service in a modern stack ships this way.",
        handsOn: [
          { label: 'Compare the project\'s two real Dockerfiles', code: 'cat backend/Dockerfile    # single-stage, slim Python base\ncat frontend/Dockerfile   # multi-stage: node build -> nginx runtime' },
        ],
        troubleshooting: [
          '`EXPOSE 8000` in the Dockerfile but the port isn\'t reachable → EXPOSE is documentation only, it doesn\'t publish anything; the actual publish happens with `docker run -p` or a compose `ports:` mapping.',
        ],
        interview: [
          'What\'s the difference between CMD and ENTRYPOINT?',
          'Why use a multi-stage build instead of just installing build tools in the final image and not worrying about it?',
        ],
        azureConnection:
          "`frontend/Dockerfile` is a real multi-stage build: stage one (`node:20-alpine`) runs `npm install` + `npm run build`, stage two (`nginx:1.27-alpine`) copies only the compiled `dist/` output — Node, npm, and all dev dependencies never exist in the final image at all.",
      },
      {
        id: 'storage-networking',
        title: 'Storage and networking',
        concept:
          "A volume is Docker-managed persistent storage that survives container restarts/recreation (unlike the container's own writable layer, which is discarded when the container is removed) — Qdrant's data lives in a named volume so re-running `docker compose up` doesn't lose ingested vectors. A bind mount maps a host path directly into the container (useful for local dev hot-reload, not used in this project's images). Docker Compose creates a private bridge network per project by default; containers reach each other by service name as a DNS hostname (e.g. the backend connects to `redis://redis:6379`, not `localhost:6379`) — a container's own `localhost` only refers to itself.",
        whyDevops:
          '"Why can\'t my backend container reach Redis on localhost" is one of the most common early Docker confusions — understanding that each container has its own network namespace resolves it immediately.',
        handsOn: [
          { label: 'See the private network in action', code: 'docker compose exec backend python3 -c "import socket; print(socket.gethostbyname(\'redis\'))"' },
          { label: 'Check the persistent volume', code: 'docker volume ls | grep qdrant' },
        ],
        troubleshooting: [
          'Backend can\'t connect to `redis://redis:6379` → confirm both containers are on the same compose network (`docker network ls`, `docker network inspect`) and that the service name in the connection string matches the compose service name exactly.',
          'Qdrant data disappears after `docker compose down` → `down` alone keeps named volumes; `docker compose down -v` deletes them — the `-v` flag is the actual data-loss trigger, not `down` itself.',
        ],
        interview: [
          'Why does a container reach another container by service name instead of localhost?',
          'What\'s the difference between a volume and a bind mount?',
        ],
        azureConnection:
          '`docker-compose.yml`\'s `QDRANT_HOST: qdrant` and `REDIS_URL: redis://redis:6379/0` environment values are exactly this DNS-by-service-name mechanism — the same pattern Kubernetes Services provide later in Module 8/9, just at a smaller scale.',
      },
      {
        id: 'config-secrets',
        title: 'Configuration',
        concept:
          "Environment variables are the standard way to inject runtime config into a container without baking it into the image — `docker-compose.yml`'s `environment:` and `env_file:` keys both do this. Critically, environment variables and files copied into an image are NOT equivalent from a security standpoint: `env_file` injects values at container *start* time, never touching the image itself, while a file grabbed by `COPY` becomes part of the image's permanent layer history — recoverable by anyone who can pull the image, even after a later layer deletes it.",
        whyDevops:
          'This exact distinction was a real, live bug in this project — worth understanding precisely rather than just "secrets are bad in Dockerfiles" as a vague rule.',
        handsOn: [
          { label: 'Reproduce and verify the fix from this session', code: 'MSYS_NO_PATHCONV=1 docker run --rm devops-tut-backend ls -la /app/\n# should show .env.example only, never .env' },
        ],
        troubleshooting: [
          'A secret ends up inside an image despite never being explicitly referenced → check for a bare `COPY . .` with no `.dockerignore` — it silently includes everything in the build context, including `.env` files, `.git/`, and anything else sitting in the directory.',
        ],
        interview: [
          'Why is baking a secret into an image worse than passing it as a runtime environment variable, even if both end up "in the container" in some sense?',
          'If a secret was accidentally baked into an image layer and then deleted in a later layer, is it actually gone? Why or why not?',
        ],
        azureConnection:
          "Found and fixed live in this session: `backend/Dockerfile`'s `COPY . .` had no `.dockerignore`, so `backend/.env` (real Gemini API key) was verified present inside the built image (`docker run ... ls /app/` showed `.env` literally sitting there). Added `.dockerignore` excluding `.env`/`.git`/caches, rebuilt, and re-verified only `.env.example` remained — the app still worked correctly afterward since `docker-compose.yml` injects the real values via `env_file` at runtime, not via the image.",
      },
      {
        id: 'compose',
        title: 'Compose',
        concept:
          "Docker Compose defines a multi-container application in one YAML file: services, their images/build contexts, networking, volumes, and startup dependencies. `depends_on` controls *start order* but not readiness — a database container starting doesn't mean it's ready to accept connections yet, which is why real health checks (not just depends_on) matter for anything with a startup delay. `docker compose up -d --build` rebuilds changed images and starts everything; individual services can be rebuilt/restarted without touching the rest of the stack.",
        whyDevops:
          "Compose is the local-dev equivalent of what Kubernetes manifests do in production — same underlying concepts (services, networking, dependencies) at a much smaller, single-host scale.",
        handsOn: [
          { label: 'The actual daily commands used in this project', code: 'docker compose up -d --build backend    # rebuild + restart just one service\ndocker compose ps\ndocker compose logs -f backend' },
        ],
        troubleshooting: [
          'Backend container starts before Redis/Qdrant are actually ready to accept connections, crashes → `depends_on` alone only waits for the container process to start, not for the service inside it to be ready; add a proper health check or connection-retry logic in the app itself.',
          'Edited source code but the container still runs old code → compose doesn\'t auto-rebuild; `docker compose up -d --build <service>` is required, exactly what happened when the frontend kept serving a 12-hour-stale build earlier this session.',
        ],
        interview: [
          'What does `depends_on` actually guarantee, and what does it NOT guarantee?',
          'Why might `docker compose restart` not be enough after a code change?',
        ],
        azureConnection:
          "This exact gap caused a real bug earlier in this project: the frontend container kept serving a stale build on port 5173 after source changes, because `docker compose up -d --build frontend` (rebuild) is a different command from `docker compose restart frontend` (just restarts the existing image) — the fix each time was rebuilding, not restarting.",
      },
      {
        id: 'debugging',
        title: 'Container debugging',
        concept:
          '`docker ps` lists running containers; `docker logs <container>` (or `-f` to follow) shows stdout/stderr, the container equivalent of `journalctl`. `docker exec -it <container> sh` opens an interactive shell inside a running container for live inspection. `docker inspect` dumps full container metadata (network settings, mounts, env vars) as JSON. `docker stats` shows live CPU/memory usage per container. Because a container\'s writable layer is ephemeral, changes made via `exec` for debugging are lost on the next rebuild — useful for inspection, never for a permanent fix.',
        whyDevops:
          "This is Module 1's Linux troubleshooting toolkit, translated to the container world — same diagnostic instinct, different commands.",
        handsOn: [
          { label: 'The debugging loop', code: 'docker compose ps\ndocker compose logs -f backend\ndocker compose exec backend sh\ndocker stats --no-stream' },
        ],
        troubleshooting: [
          '`docker exec` fails with "container not running" → the container likely crashed on startup; check `docker logs` first, exec only works on a live container.',
        ],
        interview: [
          'How would you check why a container keeps restarting?',
          'Why can\'t you rely on `docker exec` changes surviving a rebuild?',
        ],
        azureConnection:
          "`docker compose ps` and `docker compose logs -f backend` are the commands actually used in this session to verify the backend restarted cleanly and `{\"status\":\"UP\"}` came back from `/health` after the `.dockerignore` fix.",
      },
      {
        id: 'registry',
        title: 'Registry',
        concept:
          "A registry stores and distributes images by `repository:tag`. Docker Hub is the public default; Azure Container Registry (ACR, Module 6) is a private registry inside your Azure subscription. Tags should be immutable and specific in any real pipeline — `latest` is fine for local dev but dangerous in production because it's a moving target that gives no way to know exactly what's running or roll back precisely; a commit SHA or semantic version tag is unambiguous.",
        whyDevops:
          "This is the handoff point between 'build' and 'deploy' in every CI/CD pipeline — Module 7's GitHub Actions work ends with exactly this: build, tag with the commit SHA, push to ACR.",
        handsOn: [
          { label: 'See current local image tags', code: 'docker image ls | grep devops-tut' },
        ],
        troubleshooting: [
          'A deployed service is running an unexpected version → almost always a `:latest` tag somewhere in the chain; pin to a specific tag to make this class of bug impossible.',
        ],
        interview: [
          'Why is tagging images `:latest` risky in a production pipeline?',
          'What information does an image tag need to carry to make a rollback reliable?',
        ],
        azureConnection:
          "Module 6 pushes `devops-tut-backend`/`devops-tut-frontend` (currently only local `docker compose build` artifacts) to ACR for the first time — the `.dockerignore` fix from this module matters even more once these images leave the local machine.",
      },
      {
        id: 'security',
        title: 'Image security',
        concept:
          "Running as a non-root user inside the container limits the blast radius if the application is compromised — a root process inside a container can still do meaningful damage even though container isolation limits it further. Minimal base images (slim/alpine variants) reduce the attack surface by shipping fewer packages that could carry vulnerabilities. Dependency/image scanning (Trivy, planned for Module 6) checks installed packages against known-CVE databases and can fail a build on critical findings, the container equivalent of gitleaks for secrets.",
        whyDevops:
          "A container running as root with a bloated base image is a much softer target than one running as an unprivileged user on a minimal base — this is cheap to get right from the start and expensive to retrofit later.",
        handsOn: [
          { label: 'Confirm the project already does this correctly', code: 'MSYS_NO_PATHCONV=1 docker run --rm devops-tut-backend whoami\n# should print "appuser", not "root"' },
        ],
        troubleshooting: [
          'A container needs to bind to port 80/443 but runs as non-root → ports below 1024 require root by default on Linux; either use a higher port internally with a proxy in front (what this project does — nginx on 80 in its own container, backend on 8000), or grant the specific `CAP_NET_BIND_SERVICE` capability instead of running as root.',
        ],
        interview: [
          'Why run a container process as a non-root user, given that container isolation already limits what it can touch?',
          'What\'s the difference between scanning source dependencies (like `pip-audit`) and scanning a built container image?',
        ],
        azureConnection:
          '`backend/Dockerfile` already creates and switches to `appuser` (`useradd --system --uid 10001` + `USER appuser`) before the app runs — Trivy scanning in Module 6 adds vulnerability detection on top of this already-correct non-root baseline.',
      },
      {
        id: 'containerize-project',
        title: 'Project — containerize AzureOps Copilot',
        concept:
          'This chapter has no new material — it\'s the synthesis of every chapter above, already done for this project: `backend/Dockerfile` (single-stage, non-root, correctly-ordered layers), `frontend/Dockerfile` (multi-stage, nginx runtime), `docker-compose.yml` (four services: backend, frontend, redis, qdrant, correct network/volume/dependency wiring), and `.dockerignore` on both (added this session after finding the secret-leak bug).',
        whyDevops:
          "Seeing all these concepts working together in one real, running stack — rather than in isolated toy examples — is what makes them stick.",
        handsOn: [
          { label: 'The whole stack, one command', code: 'docker compose up -d --build\ndocker compose ps\ncurl http://localhost:8000/health' },
        ],
        troubleshooting: [
          'No new failure modes here — this chapter is the checkpoint that everything from this module works together, end to end.',
        ],
        interview: [
          'Walk through this project\'s full container architecture: what runs where, how do the pieces reach each other, and what\'s persisted vs ephemeral?',
        ],
        azureConnection:
          'This entire stack — four containers, one compose file — is what gets pushed to ACR and deployed to a VM in Module 6, then potentially to AKS in Module 10, without any of the application code itself changing.',
      },
    ],
  },
  {
    id: 'azure-fundamentals',
    number: 5,
    mono: 'AZ',
    title: 'Azure Fundamentals',
    outcome: 'Navigate Azure and choose basic services deliberately.',
    chapters: [
      {
        id: 'azure-geography',
        title: 'Azure global infrastructure',
        concept:
          "Azure organizes physical infrastructure into regions (a geographic area like Central India or East US, each an independent set of datacenters), and some regions further into Availability Zones (physically separate datacenters within the region, each with independent power/cooling/networking, used for high availability). Region pairs are two regions in the same geography Azure uses for disaster-recovery replication of platform services. Not every service or VM size is available in every region — this is a real constraint you plan around, not just trivia.",
        whyDevops:
          "Region choice affects latency, cost, data-residency compliance, and — as found directly in this project — actual resource availability. Zone-awareness is the entire basis of Module 6/9's high-availability designs.",
        handsOn: [
          { label: 'Real regions this project already touches', code: 'az group list --query "[].{name:name, location:location}" -o table\n# Result: southindia, eastus, centralindia, germanywestcentral — one project, four regions' },
        ],
        troubleshooting: [
          'A resource type/size unavailable in your target region → check `az vm list-skus --location <region>` (or the service\'s own availability listing) before assuming it\'s a quota or permissions problem — this was exactly the root cause chased across Phase 1\'s SkuNotAvailable errors.',
        ],
        interview: [
          'What\'s the difference between a region and an Availability Zone?',
          'Why might a service or VM size be unavailable in a region you otherwise want to use?',
        ],
        azureConnection:
          'This subscription\'s resource groups are already spread across 4 different regions with no consistent reasoning behind it (some inherited from unrelated prior work) — a real example of why deliberate region choice matters, in contrast to `azureops-copilot-rg` which was chosen specifically for `Standard_B2s` zone support back in Day 0.',
      },
      {
        id: 'tenant-subscription-rg',
        title: 'Tenant, subscription, resource group',
        concept:
          "A Microsoft Entra ID tenant is the identity boundary — one organization's directory of users/groups/apps. A subscription is the billing and access-management boundary within a tenant; resources deploy into exactly one subscription. A resource group is a logical container within a subscription — resources in it can span multiple regions, and deleting a resource group deletes everything inside it. These three nest: tenant > subscription > resource group > resource.",
        whyDevops:
          "Nearly every access-control and cost-tracking decision in Azure hangs off this hierarchy — knowing which boundary a given setting (RBAC role, budget, policy) applies at is essential to reasoning about blast radius.",
        handsOn: [
          { label: 'See this subscription\'s actual identifiers', code: 'az account show --query "{name:name, tenantId:tenantId, id:id}" -o json' },
        ],
        troubleshooting: [
          '`az group delete` removes far more than expected → resource groups don\'t protect against accidental deletion by default; this is exactly why `rg-linux-lab` and `bob-test-rg` were fully removable in one command each during Phase 1\'s cleanup — same mechanism, used deliberately there.',
        ],
        interview: [
          'What\'s the practical difference between a subscription boundary and a resource group boundary?',
          'Why can a resource group contain resources from multiple regions?',
        ],
        azureConnection:
          '`azureops-copilot-rg` is this project\'s resource group — every VM, NSG, VNet, storage account, and disk created so far lives inside it, all in `centralindia`\'s sibling region `southindia` for the VM specifically (a resource group\'s own "location" is just metadata, not a constraint on what regions its resources use).',
      },
      {
        id: 'arm-tags-naming',
        title: 'ARM, tags, naming',
        concept:
          "Azure Resource Manager (ARM) is the management layer every `az` command, the Portal, and Terraform ultimately talk to — it's the API that actually creates/reads/updates/deletes resources, all backed by declarative JSON templates under the hood. Every resource has a type (`Microsoft.Compute/virtualMachines`, `Microsoft.Storage/storageAccounts`) identifying which resource provider owns it. Tags are arbitrary key-value metadata attachable to almost any resource, used for cost allocation, ownership tracking, and automated policy enforcement (Module 12).",
        whyDevops:
          "Consistent tagging is what makes a multi-resource, multi-team subscription queryable and cost-attributable at scale — without it, \"which team owns this and why does it cost this much\" becomes archaeology.",
        handsOn: [
          { label: 'See the tag convention already applied', code: 'az resource list --query "[?tags.project==\'azureops-copilot\'].{name:name, type:type}" -o table' },
        ],
        troubleshooting: [
          'A resource is missing an expected tag → tags don\'t inherit automatically from the resource group to resources inside it; each resource needs the tag applied explicitly (or via Azure Policy, Module 12\'s tagging-rule enforcement).',
        ],
        interview: [
          'What is Azure Resource Manager, concretely — what does it sit between?',
          'Why don\'t resource group tags automatically apply to the resources inside the group?',
        ],
        azureConnection:
          'The `project=azureops-copilot` tag has been applied consistently since Day 0 across the resource group, VM, NSG, and storage account — this is what a `Cost Management` filter or an Azure Policy tagging rule (Module 12) would key off of.',
      },
      {
        id: 'cli-cloud-shell',
        title: 'Azure CLI',
        concept:
          "`az` is the command-line interface to Azure Resource Manager — every action available in the Portal has an `az` equivalent (and some ARM/REST capabilities the CLI doesn't wrap yet, reachable via `az rest`). Cloud Shell is a browser-based shell with `az` pre-authenticated, useful when a local CLI isn't available or convenient. `az login` establishes an authenticated session; `az account show`/`az account set` inspect/switch the active subscription when multiple are available.",
        whyDevops:
          "The CLI (or an SDK/Terraform provider built on the same ARM API) is how Azure actually gets automated — the Portal is for humans clicking, everything in a pipeline goes through this layer instead.",
        handsOn: [
          { label: 'The exact pattern used throughout this whole project', code: 'AZ="/c/Program Files/Microsoft SDKs/Azure/CLI2/wbin/az"\n"$AZ" account show -o table' },
        ],
        troubleshooting: [
          '`az <command>` returns "command not found" despite Azure CLI being installed → not on PATH in this shell; use the full binary path (as done throughout this project) or fix PATH once, rather than reinstalling.',
          'An `az` subcommand feels artificially limited (e.g. missing a flag docs mention) → check if the command group is marked `preview`; the underlying REST API is usually more complete and reachable via `az rest` — exactly how the Day 0 budget notifications and the Module 5 budget-currency fix were both done.',
        ],
        interview: [
          'What is Azure CLI actually a client for, under the hood?',
          'When would you reach for `az rest` instead of a normal `az` subcommand?',
        ],
        azureConnection:
          'Every single Azure interaction across this entire project — VM creation, NSG rules, budget fixes, storage account creation — went through this same `$AZ` CLI, including two real cases (`consumption budget create`\'s missing `--notifications` flag, and this Module\'s storage RBAC assignment) where the CLI\'s own limitations or safety guardrails required falling back to `az rest` or stopping to ask a human.',
      },
      {
        id: 'identity-rbac',
        title: 'Identity',
        concept:
          "Microsoft Entra ID (formerly Azure AD) is Azure's identity provider — users, groups, service principals (app identities), and managed identities (automatically-managed app identities tied to a resource, eliminating stored credentials) all live here. RBAC (Role-Based Access Control) assigns roles (Owner, Contributor, Reader, or granular ones like Storage Blob Data Contributor) to a principal at a scope (subscription, resource group, or individual resource). Critically, Azure separates *control-plane* permissions (managing the resource itself — create/delete/configure) from *data-plane* permissions (reading/writing the data inside it) for services like Storage — having Owner doesn't automatically grant blob read/write access via Azure AD auth.",
        whyDevops:
          "Least-privilege access design is a core security responsibility, and the control-plane/data-plane split is a common source of confusing \"but I'm an Owner, why can't I do this\" moments if you don't know it's intentional.",
        handsOn: [
          { label: 'Check what role you actually hold, and at what scope', code: 'az role assignment list --query "[].{role:roleDefinitionName, scope:scope}" -o table' },
        ],
        troubleshooting: [
          '`az storage blob upload --auth-mode login` fails with a permissions error despite being subscription Owner → Owner is a control-plane role; blob data access via Azure AD requires an explicit data-plane role like `Storage Blob Data Contributor` at the storage account (or narrower) scope — this happened for real in this project.',
        ],
        interview: [
          'Why doesn\'t the Owner role automatically grant Storage Blob data access when using Azure AD authentication?',
          'What\'s the security tradeoff between a scoped RBAC role assignment and a storage account key?',
        ],
        azureConnection:
          'Hit directly in this project: `az storage blob upload --auth-mode login` failed despite subscription-level Owner access, because Owner is control-plane only. Assigning a scoped `Storage Blob Data Contributor` role was the correct fix but requires a permission grant — an action deliberately not taken autonomously in this session; account-key auth was used instead for the immediate demo, with the RBAC gap left for a human decision, which is itself the least-privilege lesson in practice.',
      },
      {
        id: 'compute-choices',
        title: 'Compute',
        concept:
          "Azure's compute spectrum trades control for abstraction: a Virtual Machine gives full OS control (you patch, configure, scale it yourself) — most flexible, most operational burden. App Service is a managed platform for web apps (no OS access, built-in scaling/deployment slots, less flexible). Container Apps runs containers with built-in autoscaling (including to zero) without managing the underlying orchestrator. Azure Functions runs event-triggered code with no server management at all, billed per-execution. The right choice depends on how much control you actually need versus how much operational overhead you're willing to own.",
        whyDevops:
          "This project deliberately started at the most manual end (a raw VM) specifically to force Linux/systemd/networking fundamentals hands-on — Module 6 onward moves toward VMSS, and Module 8/9 toward AKS, trading manual control for managed scaling as the fundamentals solidify.",
        handsOn: [
          { label: 'What this project actually uses today', code: '# Only one compute type touched so far:\naz vm list -d -o table   # azureops-vm01, Standard_B2s_v2, southindia' },
        ],
        troubleshooting: [
          'Choosing App Service/Container Apps "because it\'s easier" without understanding what a VM was hiding → this project intentionally did the opposite (VM first) so the underlying Linux/network mechanics are visible, not abstracted away, before evaluating a managed option knowingly.',
        ],
        interview: [
          'When would you choose a VM over App Service, given App Service is less operational overhead?',
          'What does Azure Functions\' "no server management" actually mean at the infrastructure level — where does the code actually run?',
        ],
        azureConnection:
          "AzureOps Copilot's own compute path across this curriculum: raw VM now (Phase 1, deliberately manual) -> VM Scale Set (Module 6, managed scaling) -> optionally AKS (Module 8/9, full container orchestration) — each step trading hand-built control for managed abstraction on top of the same underlying concepts already learned manually.",
      },
      {
        id: 'storage-data',
        title: 'Storage and data',
        concept:
          "Blob Storage holds unstructured data (files, backups, images) in containers, with tiers (Hot/Cool/Archive) trading access latency for cost. Azure Files provides SMB/NFS file shares mountable like a network drive. Managed disks are the persistent storage attached to VMs (what `azureops-vm01`'s OS disk actually is). None of Blob/Files/managed disks are databases — they're storage primitives; actual managed database services (Module 5 Chapter 8) are a separate, higher-level category.",
        whyDevops:
          "Blob Storage specifically is the backbone of the Capstone's backup-and-restore requirement — Qdrant volume snapshots exported to Blob is the planned disaster-recovery mechanism for this project.",
        handsOn: [
          { label: 'Real blob storage created and used this session', code: 'az storage account create --name azureopscopilotstore --resource-group azureops-copilot-rg \\\n  --location centralindia --sku Standard_LRS --kind StorageV2\naz storage container create --account-name azureopscopilotstore --name learning-log-backup --auth-mode login\naz storage blob upload --account-name azureopscopilotstore --container-name learning-log-backup \\\n  --name LEARNING_LOG.md --file LEARNING_LOG.md --auth-mode key' },
        ],
        troubleshooting: [
          'Container creation succeeds via `--auth-mode login` but blob upload fails → container-level management is a control-plane-ish operation the Owner role covers more readily than blob data operations; see the Identity chapter\'s RBAC finding for exactly why.',
        ],
        interview: [
          'What\'s the difference between Blob Storage, Azure Files, and a managed disk — when would you use each?',
          'Why does Hot/Cool/Archive tiering exist instead of one uniform storage tier?',
        ],
        azureConnection:
          'A real `Standard_LRS` storage account (`azureopscopilotstore`) now exists in `azureops-copilot-rg` with `LEARNING_LOG.md` uploaded as a literal backup blob — a small working preview of the Capstone\'s planned Qdrant-volume-to-Blob backup/restore requirement.',
      },
      {
        id: 'databases-managed-services',
        title: 'Databases and managed services overview',
        concept:
          "Azure offers managed database services (Azure SQL, Cosmos DB, Azure Database for PostgreSQL/MySQL, Azure Cache for Redis) that handle patching, backups, and often scaling/HA automatically — trading cost and some flexibility for drastically reduced operational burden versus self-hosting the same database in a VM or container. Not every workload has a managed equivalent; specialized systems (like a vector database such as Qdrant) may need to be self-hosted precisely because no first-party managed offering exists yet.",
        whyDevops:
          "Knowing when a managed service is the obviously right call (Redis — Azure Cache for Redis exists and is mature) versus when self-hosting is the only real option (Qdrant — no native Azure managed offering as of this curriculum) is a real architectural decision, not a default.",
        handsOn: [
          { label: 'This project\'s actual choice, stated explicitly', code: '# Redis and Qdrant both currently run as self-hosted containers (docker-compose.yml)\n# Redis: Azure Cache for Redis exists as a managed alternative for production\n# Qdrant: no native Azure managed offering -> self-hosted 3-node cluster is the plan (Module 8)' },
        ],
        troubleshooting: [
          'Defaulting to "always use the managed service" without checking if one exists for your specific technology → Qdrant is the counterexample in this exact project; the right call there is a deliberately self-hosted, clustered deployment.',
        ],
        interview: [
          'What operational responsibilities does a managed database service take off your plate, specifically?',
          'Why might a team choose to self-host a database despite a managed alternative existing?',
        ],
        azureConnection:
          "This project's Redis could realistically move to Azure Cache for Redis in a production hardening pass; Qdrant cannot, since it has no equivalent — directly shaping Module 8's plan to run it as a real 3-node self-hosted cluster instead of assuming a managed swap-in exists.",
      },
      {
        id: 'monitoring-cost',
        title: 'Monitoring and cost',
        concept:
          "Budgets (Cost Management) track spend against a threshold and can alert at percentage milestones — but critically, a budget's amount is denominated in the subscription's billing currency regardless of what number you type, and its scope (subscription-wide vs resource-group-scoped) determines what spend actually counts against it. Azure Monitor collects metrics and logs platform-wide; Log Analytics is the query workspace for logs specifically (none set up yet in this subscription). Tags (this module's earlier chapter) are what make cost genuinely attributable per-project in a shared subscription.",
        whyDevops:
          "Getting budget currency/scope wrong is invisible until it's a real problem — exactly what happened in this project (a ₹200 budget instead of $200, silently absorbing unrelated spend) and went unnoticed for a full day before being caught by manually checking the Portal.",
        handsOn: [
          { label: 'This project\'s real, corrected budget', code: 'az consumption budget list --query "[].{name:name, amount:amount, spent:currentSpend.amount, unit:currentSpend.unit}" -o table\n# azureops-copilot-monthly | 16600.0 | ~1980 | INR  (~12% spent)' },
        ],
        troubleshooting: [
          "A budget seems to be tracking way more spend than expected → check its scope; a subscription-wide budget (the default with `az rest`'s `Microsoft.Consumption/budgets`) includes every resource group in the subscription, not just the one you're thinking about — this is exactly what happened with `rg-linux-lab`/`bob-test-rg`'s unrelated spend inflating this project's budget before they were cleaned up.",
        ],
        interview: [
          'Why should you always check a budget\'s `currentSpend.unit` rather than assuming the amount you set is in the currency you intended?',
          'What\'s the difference between a subscription-scoped and a resource-group-scoped budget, and when would you want each?',
        ],
        azureConnection:
          "This was a real, caught-in-the-act bug in Phase 1: the budget was created as ₹200/month instead of the intended $200 (silent currency default), subscription-wide (absorbing unrelated `rg-linux-lab`/`bob-test-rg` spend), already ~9.8x over before being noticed via the Portal's Cost Management view and fixed via `az rest` to ₹16,600.",
      },
      {
        id: 'first-azure-environment',
        title: 'First Azure environment',
        concept:
          "This chapter has no new material — it's the checkpoint that Chapters 1-9 already happened for real: a resource group in a deliberately-chosen region, a VM with networking, RBAC understood (including its real limits), tags applied consistently, a budget that actually tracks spend correctly, and now a storage account. The 'build the first environment' exercise most curricula treat as a standalone lab was, in this project, already lived through during Phase 1 and this module — messier and more real than a clean tutorial would have been.",
        whyDevops:
          "Real environments come with real friction (SkuNotAvailable across three regions, a currency bug, an RBAC data-plane gap) — experiencing that friction firsthand, rather than following a script that always works, is the actual preparation for production work.",
        handsOn: [
          { label: 'The full environment as it exists today', code: 'az resource list --query "[?resourceGroup==\'azureops-copilot-rg\'].{name:name, type:type}" -o table' },
        ],
        troubleshooting: [
          'No new failure modes — this chapter is the synthesis checkpoint for the whole module.',
        ],
        interview: [
          'Walk through this project\'s Azure environment end to end: what exists, why each piece is there, and what real problems came up building it.',
        ],
        azureConnection:
          "`azureops-copilot-rg` today: a VM (with its NIC/NSG/VNet/PublicIP/OsDisk), a storage account with a real backup blob, a corrected subscription-wide budget, and a tag convention applied throughout — built through real troubleshooting, not a guided happy path.",
      },
    ],
  },
  {
    id: 'azure-networking',
    number: 6,
    mono: 'VN',
    title: 'Azure Networking',
    outcome: 'Understand how Azure traffic flows from the internet to the application.',
    chapters: [
      {
        id: 'vnet-subnet-nic',
        title: 'VNet and subnet',
        concept:
          "A VNet is a private, isolated network within a region — its address space (CIDR block) is entirely your choice, not assigned by Azure. Subnets partition that address space into smaller ranges, each able to host resources with independent NSGs, route tables, and service associations. A NIC (network interface) is what actually attaches a VM to a subnet and gets an IP; a VM can have multiple NICs on different subnets, though most don't need to. Unlike Phase 1's VM (which used Azure's auto-created default VNet/subnet), this module builds the network first, deliberately, before anything runs on it.",
        whyDevops:
          "Address space design done carelessly early causes real pain later — overlapping ranges block VNet peering, undersized subnets run out of IPs as a fleet grows. Designing it once, correctly, up front (as Module 3's CIDR chapter set up the math for) avoids a re-architecture later.",
        handsOn: [
          { label: 'The VNet actually built this session', code: 'az network vnet create --resource-group azureops-copilot-rg --name azureops-vnet \\\n  --address-prefix 10.10.0.0/16 --subnet-name app-subnet --subnet-prefix 10.10.1.0/24 \\\n  --location centralindia\naz network vnet subnet create --resource-group azureops-copilot-rg --vnet-name azureops-vnet \\\n  --name gateway-subnet --address-prefix 10.10.2.0/24' },
        ],
        troubleshooting: [
          'Two VNets can\'t be peered → their address spaces overlap; peering requires non-overlapping CIDR ranges between the two VNets, checked at peering-creation time.',
        ],
        interview: [
          'Why design a VNet\'s address space deliberately instead of accepting whatever default Azure suggests?',
          'What\'s the practical difference between a VNet and a subnet in terms of what settings attach to each?',
        ],
        azureConnection:
          "`azureops-vnet` (10.10.0.0/16) with `app-subnet` (10.10.1.0/24, for the application) and `gateway-subnet` (10.10.2.0/24, reserved for the Load Balancer/App Gateway chapters coming next) — deliberately separate from Phase 1's auto-created `azureops-vm01VNET`, which stays as-is and untouched.",
      },
      {
        id: 'nsg-detailed',
        title: 'NSG',
        concept:
          "Building on Module 3's firewall concept: an NSG's rules are evaluated in priority order (lowest number first), and the first matching rule wins — an explicit Allow at priority 100 beats a Deny at priority 200 for traffic matching both. Every NSG has three unremovable default rules at priority 65000+ (allow VNet-internal traffic, allow Azure Load Balancer health probes, deny everything else) that apply only if nothing more specific matches first. An NSG can attach to a subnet (affecting everything in it) or a specific NIC (affecting just that one resource) — both can be active simultaneously, and traffic must pass both to get through.",
        whyDevops:
          "Priority-ordering mistakes are a common real bug: a broad allow rule at a low priority number can accidentally short-circuit a more specific deny meant to override it later — reading NSG rules by priority order, not just by name, is the actual skill.",
        handsOn: [
          { label: 'The NSG actually built and attached this session', code: 'az network nsg create --resource-group azureops-copilot-rg --name app-subnet-nsg --location centralindia\naz network nsg rule create ... --name Allow-HTTP-HTTPS --priority 100 --destination-port-ranges 80 443\naz network nsg rule create ... --name Allow-SSH-VNetOnly --priority 110 --source-address-prefixes VirtualNetwork --destination-port-ranges 22\naz network vnet subnet update --resource-group azureops-copilot-rg --vnet-name azureops-vnet --name app-subnet --network-security-group app-subnet-nsg' },
        ],
        troubleshooting: [
          'Traffic unexpectedly blocked despite a rule that should allow it → check for a lower-priority-number rule that matches first and denies; the first match wins, rule order (not just existence) matters.',
          "`az network nic list-effective-nsg` shows a rule you never wrote, from an NSG you didn't create → `az vm create` auto-creates its own NIC-level NSG by default unless told not to, even when the target subnet already has one — both apply simultaneously, and traffic needs to pass both. This happened for real in the Load Balancer chapter: `app-vm1`/`app-vm2` each got an auto-created `app-vmXNSG` (SSH-only) in addition to the intended `app-subnet-nsg`, silently blocking all LB traffic until found via `list-effective-nsg` and removed.",
        ],
        interview: [
          'If a subnet-level NSG allows a port but a NIC-level NSG on the same VM denies it, what happens?',
          'What are the three default rules every NSG has, and why can\'t they be deleted?',
          'How would you discover that a NIC has an NSG you didn\'t know about?',
        ],
        azureConnection:
          '`app-subnet-nsg` now enforces exactly Phase 1\'s NSG pattern but built deliberately from the start rather than starting wide-open and getting fixed reactively: 80/443 open to the internet, SSH restricted to VNet-only — `gateway-subnet` intentionally has no NSG yet, meaning nothing there is reachable at all until a later chapter changes that. The Load Balancer chapter\'s real debugging session is the live version of this chapter\'s own interview question about conflicting NIC/subnet NSGs.',
      },
      {
        id: 'public-private-connectivity',
        title: 'Public/private connectivity',
        concept:
          "A resource with only a private IP is reachable within its VNet (and anything peered/connected to it) but has no direct internet inbound path — outbound still works via the VNet's default routing through NAT. A public IP makes a resource directly internet-reachable, subject to whatever NSG rules apply. The absence of a public IP is not itself a security boundary — anything else on the same VNet with the right NSG rules can still reach it; true isolation requires NSGs (or Private Link, for platform services) doing the actual enforcement.",
        whyDevops:
          "\"It doesn't have a public IP so it's secure\" is a common but incomplete assumption — VNet-internal traffic still needs deliberate NSG rules if you want to restrict it, exactly like `gateway-subnet`'s current state: private, but not yet actually locked down because nothing has defined what should and shouldn't reach it.",
        handsOn: [
          { label: 'Verified this session', code: '# app-subnet: has NSG, will have a public-facing LB later\n# gateway-subnet: no NSG yet, no public IP, nothing deployed -- private by omission, not by design yet\naz network vnet subnet show --resource-group azureops-copilot-rg --vnet-name azureops-vnet --name gateway-subnet --query "{name:name, nsg:networkSecurityGroup}"' },
        ],
        troubleshooting: [
          'A resource with no public IP is still reachable from an unexpected source → check what else shares its VNet (or a peered VNet) — private doesn\'t mean isolated from everything, only from the direct public internet.',
        ],
        interview: [
          'Why isn\'t "no public IP" by itself a sufficient security control?',
          'What actually enforces isolation between two subnets in the same VNet if both are private?',
        ],
        azureConnection:
          'Also created a Private DNS zone (`azureops.internal`) this session, staged for the Private Link chapter later — currently has zero record sets and zero VNet links, i.e. it exists but does nothing yet, deliberately, until Private Link work actually needs it.',
      },
      {
        id: 'route-tables-udr',
        title: 'Route tables',
        concept:
          "Every subnet has system routes by default (VNet-local traffic routes directly, internet-bound traffic routes out via Azure's default gateway) — invisible, automatic, and usually sufficient. A User-Defined Route (UDR) overrides this for specific address ranges, most commonly to force traffic through a network virtual appliance (firewall, proxy) instead of going straight to its normal next hop. A route table is created independently, populated with routes, and then explicitly associated with a subnet — creating one has zero effect until it's attached.",
        whyDevops:
          "UDRs are how traffic gets forced through inspection points (a firewall, a proxy) in more locked-down network designs — and also a classic source of \"why can't this VM reach the internet anymore\" when a 0.0.0.0/0 route points somewhere that isn't actually configured to forward traffic.",
        handsOn: [
          { label: 'Built but deliberately not attached this session', code: 'az network route-table create --resource-group azureops-copilot-rg --name azureops-rt --location centralindia\naz network route-table route create --resource-group azureops-copilot-rg --route-table-name azureops-rt \\\n  --name force-through-appliance --address-prefix 0.0.0.0/0 \\\n  --next-hop-type VirtualAppliance --next-hop-ip-address 10.10.2.10' },
        ],
        troubleshooting: [
          'A VM suddenly loses internet connectivity after a networking change → check for a newly-associated route table with a 0.0.0.0/0 UDR pointing at a next hop that isn\'t actually a working appliance — this is intentionally what the example route in this project would do if attached without a real appliance at 10.10.2.10.',
        ],
        interview: [
          'What does creating a route table alone actually change, before it\'s associated with any subnet?',
          'Why would you route 0.0.0.0/0 through a virtual appliance instead of letting Azure\'s default internet route handle it?',
        ],
        azureConnection:
          "`azureops-rt` exists with a `force-through-appliance` route (0.0.0.0/0 -> 10.10.2.10) but was deliberately left unattached to any subnet — attaching it would break outbound connectivity immediately since no real appliance listens at that IP, a live illustration of a UDR's blast radius kept safely theoretical for now.",
      },
      {
        id: 'azure-load-balancer',
        title: 'Azure Load Balancer',
        concept:
          "A Standard Load Balancer distributes traffic across a backend pool (VMs' NICs) based on a 5-tuple hash (source/dest IP, source/dest port, protocol) by default, so the same client connection usually lands on the same backend, but different connections spread across the pool. A health probe polls each backend on a defined port/path/interval; only backends currently passing the probe receive new traffic. Critically, a Standard LB does NOT perform source NAT on inbound traffic — the original client's public IP reaches the backend VM unchanged, which has real NSG implications (see below). Creating an LB, probe, and rule are three separate steps; nothing routes until all three exist and the backend pool actually has members in it.\n\nManaged vs. software load balancer — a real build-vs-buy decision, not trivia. A managed Load Balancer (what this chapter builds) is Azure's PaaS offering: roughly $0.025/hr plus data processed (~$18-20/month if left running continuously), in exchange for Azure handling high availability, zone-redundancy, and patching automatically. A software load balancer — nginx, HAProxy, or Envoy running as a plain process on a VM you already own — costs nothing extra on top of that VM, but the tradeoff flips completely: a single software LB instance is itself a single point of failure unless you deliberately cluster it (e.g. with keepalived/VRRP for a floating IP), and you own its patching and scaling from then on. The managed option teaches you how to configure a managed service correctly; the software option teaches you how load balancing actually works underneath that abstraction. Both are genuinely standard practice — managed is more common for production Azure workloads by default, software is common in cost-sensitive teams or when custom L7 logic is needed that a managed L4 LB can't express.",
        whyDevops:
          "This chapter is where Module 6 stopped being theoretical — building a working Load Balancer from scratch surfaced two real, non-obvious bugs in one session, both invisible until actually tested end-to-end rather than just configured and assumed correct. It's also where a real cost conversation happened mid-project: is a managed LB worth its ongoing cost for a learning-budget setup, or should it be a software one instead?",
        handsOn: [
          { label: 'The full build, in order', code: 'az network public-ip create --sku Standard --zone 1 2 3 --name azureops-lb-pip ...\naz network lb create --sku Standard --name azureops-lb --frontend-ip-name lb-frontend --backend-pool-name app-backend-pool ...\naz network lb probe create --protocol Http --port 8000 --path /health --interval 5 --threshold 2 ...\naz network lb rule create --frontend-port 80 --backend-port 8000 --probe-name health-probe ...\n# then attach each VM NIC\'s ip-config to the backend pool' },
          { label: 'Verifying it for real (not just "looks configured")', code: 'for i in 1 2 3 4 5 6 7 8; do curl -s http://<lb-public-ip>; done\n# alternated between "Hello from app-vm1" and "Hello from app-vm2" -- real distribution, not assumed' },
        ],
        troubleshooting: [
          "Health probe path silently wrong → Git Bash mangled `--path /health` into a Windows-style path (`C:/Program Files/Git/health`) on creation, visible only by checking `az network lb probe show`'s actual `requestPath` field — both backends were \"unhealthy\" against a path that could never exist, and the LB just dropped all traffic with no error, only a connection timeout. Fixed with `MSYS_NO_PATHCONV=1` prefixed on the `probe update` call.",
          'LB configured correctly, probe passing, backend pool populated — still connection-timeout → check for an NSG blocking the *forwarded client traffic specifically*, not just the health probe: a rule allowing `AzureLoadBalancer` as source only covers probe traffic; real client requests arrive with the original internet source IP preserved (Standard LB doesn\'t SNAT inbound), so `Internet` also needs an explicit allow to the backend port.',
          "An NSG rule you're certain you wrote doesn't appear to apply at all → check `az network nic list-effective-nsg`'s full `value[]` array (not just `value[0]`) for a second, auto-created NIC-level NSG stacking on top of the intended subnet-level one — this is exactly what silently blocked everything in this session until removed.",
        ],
        interview: [
          'Why does a health probe passing not guarantee client traffic will actually reach a backend?',
          'What\'s the practical security implication of a Standard Load Balancer preserving the original client IP instead of doing SNAT?',
          'Walk through how you\'d debug an LB that accepts connections but every request times out.',
        ],
        azureConnection:
          "`azureops-lb` now genuinely load-balances `app-vm1`/`app-vm2` on port 8080 behind a public frontend on port 80 (moved from 8000 in Chapter 7 once the WAF layer went in front), and it took real debugging to get there: a mangled health-probe path (Git Bash path-mangling, the same bug class as Module 4/5), a missing NSG rule for actual client traffic vs. probe traffic, and a redundant auto-created NIC-level NSG stacking on the intended subnet-level one. Failover was verified for real too — stopping `pyapp` on `app-vm1` made all 8 test requests land on `app-vm2` within ~20s, and restarting it brought both back into rotation automatically, no manual re-registration needed.\n\nAfter this chapter, a real cost conversation happened: should this managed LB be replaced with a software one? The decision made was to keep `azureops-lb` running for a few extra days specifically to compare it side-by-side against the cost-conscious choices made in Chapter 7 — worth being precise about what that comparison actually is: Chapter 7's `owasp/modsecurity-crs` containers are a software WAF/reverse-proxy running independently on each VM, not a software load balancer replacing `azureops-lb` — Azure's Load Balancer is still the only thing actually distributing traffic between `app-vm1` and `app-vm2` today. A true managed-vs-software Load Balancer comparison (e.g. HAProxy doing the cross-VM distribution itself) would be a genuine follow-up exercise, not something this session built.\n\n**Update, Module 10 (2026-09-22):** that follow-up exercise happened — once Module 8's k3s cluster proved a real software alternative (Traefik Ingress, verified serving public traffic for Grafana), `azureops-lb` was deliberately decommissioned: its demo backend was redeployed as a load-balanced Kubernetes Deployment, real load balancing was re-verified through the new path, and only then was `azureops-lb`, its public IP, and its NSG rules deleted. This chapter's build and the debugging in it still genuinely happened and are worth knowing — the resource itself just no longer exists in the live subscription.",
      },
      {
        id: 'private-link',
        title: 'Private Link',
        concept:
          "A private endpoint gives an Azure PaaS service (Storage, Key Vault, SQL, etc.) a network interface with a private IP address inside your VNet, so it can be reached without traversing the public internet at all. This requires a private DNS zone with an *exact*, Azure-reserved name per service type (e.g. `privatelink.blob.core.windows.net` for Storage blob) — using an arbitrary custom zone name won't get automatically wired up by Azure's tooling. A DNS zone group then links the private endpoint to that zone, auto-creating the A record that makes the service's normal hostname resolve to the private IP for anything inside the linked VNet, while it still resolves publicly for anything outside.",
        whyDevops:
          "This is how a backend (like this project's FastAPI app talking to Qdrant/Redis, or a future migration to Azure Cache for Redis) reaches a managed Azure service without that traffic ever touching the public internet — reduced attack surface and often lower latency, at the cost of needing correct DNS zone naming to actually work.",
        handsOn: [
          { label: 'Built and verified this session, using the real storage account from Module 5', code: 'az network private-dns zone create --name privatelink.blob.core.windows.net\naz network private-dns link vnet create --zone-name privatelink.blob.core.windows.net --virtual-network azureops-vnet --registration-enabled false\naz network private-endpoint create --vnet-name azureops-vnet --subnet gateway-subnet \\\n  --private-connection-resource-id $SA_ID --group-id blob --connection-name azureopscopilotstore-blob-connection\naz network private-endpoint dns-zone-group create --endpoint-name azureopscopilotstore-blob-pe --private-dns-zone privatelink.blob.core.windows.net --zone-name blob' },
        ],
        troubleshooting: [
          "A private endpoint's resource ID argument gets mangled → same Git Bash path-conversion bug as everywhere else in this project (`/subscriptions/...` → a Windows path) — this time inside a `$(...)` command substitution result, not a literal argument, which is easy to miss; `MSYS_NO_PATHCONV=1` on the consuming command fixes it regardless of where the value came from.",
          "Using a custom/arbitrary private DNS zone name instead of the exact reserved one (`privatelink.<service>.<suffix>`) → Azure's automatic DNS integration won't connect it correctly; the zone name is not just a label, it's part of the contract.",
          '"Disabled" public network access still returns a real HTTP response instead of a connection timeout when hit externally → this is expected, not a misconfiguration: Azure Storage rejects at its own service layer (a 403 in this project\'s real test) rather than removing its public DNS presence or blackholing the connection — "disabled" means "rejected by the service," not "network-invisible."',
        ],
        interview: [
          'Why does the private DNS zone need an exact, reserved name instead of any name you choose?',
          'If a storage account has public network access disabled, why might an external request still get an HTTP response instead of a connection timeout?',
          'What\'s the difference between what a private endpoint provides and what disabling public network access provides — why use both together?',
        ],
        azureConnection:
          'Built directly on Module 5\'s real storage account (`azureopscopilotstore`): a private endpoint (`azureopscopilotstore-blob-pe`, IP `10.10.2.4` in `gateway-subnet`) now makes `azureopscopilotstore.blob.core.windows.net` resolve privately from inside `azureops-vnet` — confirmed via `az vm run-command` from `app-vm1`. Public network access was then disabled on the account entirely; a request from inside the VNet still reached the service (HTTP 409, real rejection reason, not a network failure) while a request from the laptop over the public internet got HTTP 403 — both prove the request reached Azure\'s service layer, contradicting the naive assumption that "disabled" means invisible from outside.',
      },
      {
        id: 'application-gateway-waf',
        title: 'Application Gateway and WAF concepts',
        concept:
          "Application Gateway is Azure's managed Layer 7 reverse proxy: unlike the Load Balancer (Chapter 5, L4 — IP/port only), it terminates HTTP(S) and can route by URL path/hostname, and its WAF SKU inspects request content against the OWASP Core Rule Set (SQLi, XSS, path traversal, etc.) before traffic reaches a backend. The same capability exists as self-hosted software: nginx (or Apache) plus the ModSecurity engine, running the identical OWASP Core Rule Set. The functional difference is who runs and pays for the reverse proxy layer, not what it protects against — a managed WAF costs real money continuously (~$0.25-0.45/hr) in exchange for zero maintenance burden and Azure-native integration (autoscaling, diagnostics, Front Door integration); a software WAF costs nothing extra beyond compute you already own, in exchange for you owning its patching, scaling, and HA design.",
        whyDevops:
          "This is a real, recurring build-vs-buy decision in DevOps work, not just an Azure trivia point — knowing both the managed and self-hosted paths, and being able to reason about the cost/ownership tradeoff for a given team's constraints, is more valuable than only knowing how to click through one option.",
        handsOn: [
          {
            label: 'Built this session: software WAF (nginx + ModSecurity + OWASP CRS) on existing VMs instead of Application Gateway',
            code: "sudo docker run -d --name waf-proxy --network host --restart unless-stopped \\\n  -e BACKEND=http://localhost:8000 -e PARANOIA=1 -e PORT=8080 \\\n  owasp/modsecurity-crs:nginx\n# repeated on app-vm1 AND app-vm2 -- zero extra Azure cost, reuses existing VM compute\n# then re-pointed azureops-lb's probe + rule from port 8000 -> 8080 so ALL\n# traffic passes through the WAF layer, not just some of it",
          },
        ],
        troubleshooting: [
          "The WAF container crash-loops immediately after `docker run` → the `owasp/modsecurity-crs` nginx image deliberately runs as an unprivileged user and cannot bind ports below 1024; use the default `PORT=8080` (or another port >1024) rather than `PORT=80`, and point your load balancer's backend port there instead — hit exactly this in this session.",
          "A backend port gets changed (e.g., 8000 -> 8080 to route through a new WAF layer) but the OLD port's NSG rules are left in place → not a live vulnerability by itself if the VM has no public IP, but it's a dangling rule that misrepresents the actual traffic path and should be cleaned up — exactly the state this project is in right now (`Allow-Internet-8000`/`Allow-LB-Probe-8000` are vestigial after moving to 8080).",
          "Only SOME paths to a backend go through the WAF (e.g., a leftover LB rule or open NSG port bypassing it) → the WAF only protects what it's actually placed in front of; an attacker will simply target whatever path skips it. This is exactly why the LB's rule/probe were repointed from 8000 to 8080 instead of adding 8080 as a second, parallel path.",
        ],
        interview: [
          'What specific capability does Application Gateway/WAF add on top of what the Load Balancer from Chapter 5 already does?',
          'Walk through the cost/ownership tradeoff between Azure Application Gateway+WAF and a self-hosted nginx+ModSecurity setup on existing VMs.',
          'If a WAF is in place but an attacker\'s request still reaches the backend unfiltered, what\'s the most likely explanation?',
        ],
        azureConnection:
          "This project deliberately built the self-hosted path instead of Azure Application Gateway, as a direct cost-conscious decision made mid-session: `app-vm1`/`app-vm2` each run an `owasp/modsecurity-crs:nginx` container proxying to the local app, with `azureops-lb`'s health probe and load-balancing rule re-pointed to port 8080 so every request now passes through WAF inspection. Verified end-to-end through the full real path (internet -> Load Balancer -> WAF -> app): a normal request returned `Hello from app-vm1`, and a SQL-injection-style payload (`?id=1' OR '1'='1`) was blocked with HTTP 403 before ever reaching the Python app — the same protection Application Gateway's WAF SKU would provide, at zero additional Azure cost.\n\n**Update, Module 10 (2026-09-22):** `azureops-lb` and this `waf-proxy` container were both retired once the k3s cluster's Traefik Ingress was proven as a working replacement for the load-balancing half of this path — see Module 10's closing chapter. The WAF-layer concept and its real 403-block test remain valid, self-hosted-vs-managed reasoning; the specific containers described here are no longer running.",
      },
      {
        id: 'azure-dns',
        title: 'Azure DNS',
        concept:
          "Azure DNS hosts DNS zones — public (resolvable by anyone on the internet, once delegated) or private (Chapters 3/6, resolvable only inside linked VNets). A public zone by itself does nothing until the domain's registrar NS records point at Azure's assigned nameservers ('delegation') — creating the zone and adding records is completely safe and has zero effect on a live domain until that delegation step happens, since nothing on the internet will query Azure for that domain's records until the registrar says to. Once delegated, Azure's 4 assigned nameservers (spread across different top-level domains — .com/.net/.org/.info — for resilience against any single TLD having an outage) answer queries for every record in the zone.",
        whyDevops:
          "Understanding that zone creation and delegation are two separate, independently-safe steps is what makes it possible to build and test real DNS infrastructure without any risk to a live production domain — exactly the approach used here to avoid touching `devopspk.online` before Module 12's Front Door work is actually ready for it.",
        handsOn: [
          { label: 'A real public zone, with real records, on a throwaway test domain (not devopspk.online)', code: 'az network dns zone create --name azureops-lab.test --resource-group azureops-copilot-rg\naz network dns record-set a add-record --zone-name azureops-lab.test --record-set-name app --ipv4-address <lb-ip>\naz network dns record-set cname set-record --zone-name azureops-lab.test --record-set-name www --cname app.azureops-lab.test\naz network dns record-set txt add-record --zone-name azureops-lab.test --record-set-name @ --value "verification-string"' },
          { label: 'Proving it resolves, WITHOUT registrar delegation', code: 'nslookup app.azureops-lab.test ns1-08.azure-dns.com\n# queries Azure\'s nameserver directly, bypassing normal DNS resolution entirely -- proves the zone works before any registrar change' },
        ],
        troubleshooting: [
          'A newly created zone/record "doesn\'t resolve" when queried normally (e.g. via `nslookup <name>` with no nameserver specified) → this is expected before delegation; querying Azure\'s assigned nameservers directly (`nslookup <name> <azure-nameserver>`) proves the zone itself works, independent of whether the registrar has been updated yet.',
          'Using `.test` as this chapter\'s zone name is deliberate, not arbitrary → it\'s an IANA-reserved TLD specifically meant for testing and documentation, guaranteed to never be a real, registrable domain — eliminates any chance of confusion with real infrastructure.',
        ],
        interview: [
          'Why is creating a public DNS zone and adding records to it completely safe for a live domain, before any registrar change?',
          'Why does Azure DNS assign nameservers across 4 different top-level domains instead of 4 azure-dns.com servers?',
          'How would you prove a DNS zone\'s records are correct before touching a production domain\'s delegation?',
        ],
        azureConnection:
          "A real public zone (`azureops-lab.test`) was built with A/CNAME/TXT records and verified by querying Azure's own nameserver directly — `app.azureops-lab.test` resolved to `azureops-lb`'s real public IP. This is deliberately decoupled from `devopspk.online`, which stays untouched until Module 12's Front Door work is ready to actually delegate it — the same zone-creation pattern would apply then, just with the real domain and Front Door's endpoint as the target instead of a throwaway test zone and the Load Balancer's IP.",
      },
      {
        id: 'azure-front-door-concepts',
        title: 'Azure Front Door concepts',
        concept:
          "Front Door is Azure's global edge network: anycast entry points on every continent, terminating TLS and routing L7 traffic to the nearest healthy *origin* (a region, an App Service, a Load Balancer's public IP, a storage static site, etc.), with built-in WAF, caching, and automatic failover between multiple origins in an origin group. Its entire value proposition assumes you have origins in more than one place worth routing between and users spread out geographically enough that edge proximity actually matters. A profile has endpoints (public hostnames), routes (path/domain -> origin group mapping), origin groups (the failover unit — Front Door health-probes each origin and stops sending traffic to unhealthy ones), and optionally a WAF policy attached at the edge, before traffic even reaches Azure's regional network.",
        whyDevops:
          "Recognizing when you DON'T need a piece of infrastructure yet is as important a DevOps skill as knowing how to build it. This project is genuinely single-region today (`azureops-vnet` only exists in `centralindia`) — Front Door's core value (multi-region failover, global edge proximity) doesn't apply until that changes, which is exactly why no real Front Door resource was built this chapter.",
        handsOn: [
          { label: 'No resource built this chapter — deliberately', code: '# Front Door needs a domain to be meaningful, and the only real domain\n# this project has (devopspk.online) is intentionally reserved for\n# Module 12, once there\'s an actual multi-region origin setup to route\n# between. Building it now would mean either touching that domain early\n# or building throwaway infrastructure that teaches configuration syntax\n# without the real failover scenario Front Door exists for.' },
        ],
        troubleshooting: [
          'Reaching for Front Door "because it\'s the production-grade option" without a second region → if there\'s only one origin, Front Door adds cost and complexity for the same effective routing a regional Load Balancer/Application Gateway already provides; its differentiator is multi-origin failover and global edge presence, neither of which exists with a single origin.',
        ],
        interview: [
          'What does Front Door provide that a regional Application Gateway does not?',
          'Why would deploying Front Door in front of a single-region application not deliver its main value proposition?',
          'What has to exist (architecturally) before Front Door is actually worth its cost?',
        ],
        azureConnection:
          'Deliberately not built for this project yet — `devopspk.online` remains untouched, reserved for Module 12 once a genuine multi-region origin setup exists for Front Door to actually add value in front of, rather than being configured prematurely against a single origin.',
      },
      {
        id: 'edge-alternatives-comparison',
        title: 'Edge/CDN alternatives — cost-conscious comparison',
        concept:
          "Front Door isn't the only way to get edge/CDN/WAF capability, and it's rarely the first thing cost-conscious teams reach for. Four real options, in order of increasing cost and capability: (1) skip it entirely — if you're single-region, your regional Load Balancer/Application Gateway already serves every user, and an edge layer solves a problem you don't have; this is the correct default for most small/early-stage projects, not a compromise. (2) Cloudflare's free tier — CDN, basic WAF, DDoS protection, and DNS management, pointed at your existing origin via a CNAME/A record, at zero cost; extremely common in real startups specifically to avoid paying a cloud provider's own edge product before it's justified. (3) Azure Traffic Manager — DNS-level failover across regions only (no L7 proxying, no WAF, no caching), priced per DNS query with no fixed monthly base, genuinely cheaper than Front Door as a stepping stone once you ARE multi-region but don't need Front Door's full feature set. (4) Azure Front Door — full global edge, once you're actually serving geographically distributed users across multiple regional origins and need automatic failover between them.",
        whyDevops:
          "This is a real, recurring build-vs-buy-vs-skip decision, and 'skip it, you don't need it yet' is a legitimate, common answer that a lot of infrastructure guidance skips over in favor of always recommending the most feature-complete (and expensive) option.",
        handsOn: [
          { label: 'Real cost figures gathered this session (approximate, check the pricing calculator for current numbers)', code: 'Azure Load Balancer (Standard):     ~$0.03/hr combined with its public IP   (~$21-22/mo continuous)\nSoftware WAF (Chapter 7):           $0 extra -- reuses existing VM compute\nAzure Public DNS zone (Chapter 8):  ~$0.50/mo base + per-query, negligible at this volume\nCloudflare free tier:               $0\nAzure Traffic Manager:              ~$0.54/million DNS queries, no fixed base\nAzure Front Door (Standard):        ~$35/mo base + ~$0.09/GB + per-request\nAzure Front Door (Premium):         ~$330/mo base + usage' },
        ],
        troubleshooting: [
          "Assuming the cloud provider's own product is always the 'proper' or 'production-grade' choice → real production systems, including well-known ones, commonly run Cloudflare (or similar third-party edge providers) in front of AWS/Azure/GCP origins specifically for cost reasons; this is standard practice, not a shortcut.",
        ],
        interview: [
          'Walk through the decision tree you\'d use to choose between no edge layer, Cloudflare free tier, Traffic Manager, and Front Door for a given project.',
          'Why might a cost-conscious team choose a third-party CDN/WAF over their cloud provider\'s native offering?',
        ],
        azureConnection:
          "This project's own decision history is the real example: Chapter 5 evaluated managed vs. software load balancing and chose to keep the managed option for comparison; Chapter 7 evaluated managed vs. software WAF and chose software (zero extra cost, reused existing VMs); this chapter evaluated Front Door vs. its alternatives and chose to build nothing yet, since the project doesn't have the multi-region architecture that would justify it — three different real cost/architecture decisions, three different honest outcomes, all logged rather than defaulting to \"use the managed Azure product\" every time.",
      },
      {
        id: 'network-architecture-lab',
        title: 'Design and troubleshoot the AzureOps network',
        concept:
          "The complete real network built across this module: `azureops-vnet` (10.10.0.0/16) with two subnets — `app-subnet` (10.10.1.0/24, holding `app-vm1`/`app-vm2`, protected by `app-subnet-nsg`) and `gateway-subnet` (10.10.2.0/24, intentionally NSG-less, holding the Private Link endpoint to `azureopscopilotstore`). Traffic path for a real request: internet -> `azureops-lb` (public IP, health-probes port 8080) -> NSG on `app-subnet` (must allow both the probe from `AzureLoadBalancer` AND real traffic from `Internet`, two separate rules) -> the WAF container (`owasp/modsecurity-crs`, ModSecurity inspection) -> the Python app on `localhost:8000`. A separate, unattached route table (`azureops-rt`) and a public DNS zone (`azureops-lab.test`) exist alongside this, deliberately decoupled from the live traffic path and the real `devopspk.online` domain respectively.",
        whyDevops:
          "Being able to describe a network's complete traffic path from memory, and diagnose a live failure within it methodically, is the actual skill this whole module built toward — everything before this chapter was building the pieces; this chapter is proving they're understood as a system.",
        handsOn: [
          {
            label: 'A real, live troubleshooting lab run in this session — not hypothetical',
            code: "# broke it deliberately:\naz network nsg rule update --nsg-name app-subnet-nsg --name Allow-Internet-8080 --access Deny\n\n# diagnosed step by step, cheapest/most-isolating test first:\n# 1. is the app itself healthy? (bypasses ALL network layers)\naz vm run-command invoke -n app-vm1 --scripts \"curl -s -o /dev/null -w 'HTTP %{http_code}\\n' http://localhost:8080\"\n# -> HTTP 200 -- app is fine, problem is somewhere in the network path\n\n# 2. check the NSG rules for anything unexpected\naz network nsg rule list --nsg-name app-subnet-nsg --query \"sort_by([], &priority)\" -o table\n# -> Allow-Internet-8080 showed Deny -- found it\n\n# fixed it and confirmed recovery:\naz network nsg rule update --nsg-name app-subnet-nsg --name Allow-Internet-8080 --access Allow",
          },
        ],
        troubleshooting: [
          'The Load Balancer never reported the backend as unhealthy despite real traffic being completely blocked → because `Allow-LB-Probe-8080` (source `AzureLoadBalancer`) was untouched, only `Allow-Internet-8080` (source `Internet`) was broken — the probe and real client traffic are genuinely independent paths through the NSG, so a healthy probe status tells you nothing about whether real users can actually reach the backend.',
          'General lab methodology used here, worth internalizing as a default sequence: test the narrowest, most isolated thing first (app health, bypassing network entirely) before widening scope (NSG, then LB, then DNS) — this rules out entire categories of cause in one cheap step instead of guessing broadly.',
        ],
        interview: [
          'Describe this network\'s complete request path from the public internet to the application, including every point traffic could be silently dropped.',
          'Why did the Load Balancer keep sending traffic to a backend that was actually unreachable to real users?',
          'What\'s your first diagnostic step when "the app is down," and why that one first?',
        ],
        azureConnection:
          'A real deliberate failure was injected into `app-subnet-nsg` this session (`Allow-Internet-8080` flipped to Deny), confirmed via the browser (`ERR_TIMED_OUT`) and `curl`, diagnosed correctly in two steps (app-health check ruled out the application layer, NSG rule listing found the actual cause), fixed, and recovery confirmed with a real request returning `Hello from app-vm2` through the full WAF-protected path again — the complete lifecycle of a real incident, run end-to-end in a safe, reversible environment.\n\n**Update, Module 10 (2026-09-22):** this exact traffic path (`azureops-lb` -> NSG -> WAF -> app) no longer exists as described — `azureops-lb`, the WAF container, and their NSG rules were all decommissioned once the k3s cluster + Traefik Ingress proved a working, $0-marginal-cost replacement. The troubleshooting methodology here (narrowest test first, widen scope systematically) remains the durable lesson.',
      },
    ],
  },
  {
    id: 'cicd-github-actions',
    number: 7,
    mono: 'CI',
    title: 'CI/CD with GitHub Actions',
    outcome: 'Create a repeatable build-test-scan-deploy pipeline.',
    chapters: [
      {
        id: 'ci-vs-cd',
        title: 'CI vs CD and deployment lifecycle',
        concept:
          "Continuous Integration (CI) is the practice of automatically building and testing every change as soon as it's pushed — catching breakage within minutes instead of at release time. Continuous Delivery/Deployment (CD) extends that pipeline to actually ship the change: Delivery means it's automatically packaged and ready to deploy with a manual approval gate; Deployment means it goes live with no human in the loop at all. The full lifecycle: commit -> build -> test -> scan -> package -> (approve) -> deploy -> verify -> (rollback if needed). Every stage exists to catch a different class of problem before it reaches production.",
        whyDevops:
          "This vocabulary distinction matters in interviews and in practice — \"we do CI/CD\" often actually means \"we do CI\" (tests run automatically) without real CD (deploys still require someone to manually SSH in and run a script), which is exactly this project's state before this module: real tests, zero automated deployment.",
        handsOn: [
          { label: 'This project\'s current lifecycle stage, honestly assessed', code: '# CI: yes -- .github/workflows/ci.yml runs gitleaks + pytest + frontend build on every push\n# CD: no -- every deployment so far (Phase 1 VM, app-vm1/app-vm2) was done by hand, live in a terminal' },
        ],
        troubleshooting: [
          'Calling a pipeline "CI/CD" when it only runs tests → be precise: that\'s CI alone. CD specifically requires an automated path to a running deployment, which this project doesn\'t have yet.',
        ],
        interview: [
          'What\'s the practical difference between Continuous Delivery and Continuous Deployment?',
          'Why might a team deliberately choose Continuous Delivery (manual approval) over full Continuous Deployment even with a mature test suite?',
        ],
        azureConnection:
          'This module\'s job is to take this project from "CI only" to a real, automated path to Azure — building and scanning a Docker image, pushing it to a registry, and deploying it, authenticated without a single stored password.',
      },
      {
        id: 'workflow-syntax',
        title: 'GitHub Actions workflow syntax',
        concept:
          "A workflow is a YAML file in `.github/workflows/`. `on:` defines triggers (push, pull_request, schedule, manual dispatch). `jobs:` contains one or more named jobs, each running on a fresh `runs-on:` VM. `steps:` within a job run sequentially — either `uses:` (a reusable action, like `actions/checkout@v4`) or `run:` (a raw shell command). `defaults.run.working-directory` sets a default folder for all `run:` steps in a job, avoiding repetitive `cd` commands.",
        whyDevops:
          "Reading and writing this syntax fluently is a daily skill from here on — every chapter in this module extends the same real file rather than introducing a new toy example.",
        handsOn: [
          { label: 'The real, current ci.yml', code: 'cat .github/workflows/ci.yml' },
        ],
        troubleshooting: [
          'A step fails with "command not found" for a tool assumed to be pre-installed → GitHub-hosted runners have a specific, documented toolset per OS image; anything else needs an explicit setup action (like `actions/setup-python`) or install step.',
        ],
        interview: [
          'What\'s the difference between `uses:` and `run:` in a workflow step?',
          'Why does each job get its own fresh runner instead of jobs sharing one machine?',
        ],
        azureConnection:
          "This project's `backend` job uses exactly this pattern: `defaults.run.working-directory: backend`, then `actions/setup-python@v5`, then plain `run:` steps for `pip install` and `pytest` — no magic, just sequential steps on a fresh Ubuntu VM.",
      },
      {
        id: 'runners-jobs-steps-actions',
        title: 'Runners, jobs, steps, actions',
        concept:
          "A runner is the actual VM (or container) executing a job — GitHub-hosted runners are free (within limits) and ephemeral, torn down after each run; self-hosted runners are your own machines, useful for private network access or specialized hardware. Jobs in the same workflow run in parallel by default unless one explicitly `needs:` another — this project's `gitleaks`, `backend`, and `frontend` jobs all run simultaneously, independent of each other, which is why the whole pipeline finishes in roughly the time of the slowest single job, not the sum of all three.",
        whyDevops:
          "Understanding parallel-by-default is what lets you design fast pipelines — serializing jobs that don't actually depend on each other is a common, easy-to-fix source of slow CI.",
        handsOn: [
          { label: 'This project\'s three jobs — no needs: between them, so they run in parallel', code: 'grep -A1 "^  [a-z]*:" .github/workflows/ci.yml | grep -v "^--"' },
        ],
        troubleshooting: [
          'A job that should wait for another finishes (or fails) before that dependency is ready → missing `needs: [other-job-name]`; without it, GitHub Actions assumes independence and runs everything it can in parallel.',
        ],
        interview: [
          'Why do gitleaks/backend/frontend all finish around the same time in this project\'s CI, rather than one after another?',
          'When would you choose a self-hosted runner over a GitHub-hosted one?',
        ],
        azureConnection:
          "Once a `deploy` job is added later in this module, it will need `needs: [backend, frontend, docker-build]` — deployment should only happen after everything upstream has actually passed, unlike the current three jobs which are intentionally independent.",
      },
      {
        id: 'artifacts-caching-matrices',
        title: 'Artifacts, caching, matrices',
        concept:
          "An artifact is a file (or set of files) produced by one job and made available to download or pass to another job — e.g. a built frontend `dist/` folder, or a compiled binary. Caching (like `actions/setup-python`'s built-in pip cache, or `actions/cache` generally) persists dependency downloads between runs so `pip install`/`npm install` don't re-download everything from scratch every single time — a major speed win once a project's dependency list grows. A matrix runs the same job multiple times with different parameter combinations (e.g. Python 3.10/3.11/3.12) in parallel, catching version-specific breakage without writing the job three times.",
        whyDevops:
          "None of this project's current CI uses caching or matrices yet — a real, honest gap worth naming rather than pretending it's optimized. Small now (fast installs, one Python version), but the exact kind of thing that becomes a real cost/speed problem as a project grows and gets ignored because it \"works fine.\"",
        handsOn: [
          { label: 'What adding pip caching would look like (not yet done)', code: "- uses: actions/setup-python@v5\n  with:\n    python-version: '3.11'\n    cache: 'pip'   # <- not currently in this project's ci.yml" },
        ],
        troubleshooting: [
          'CI feels slow and nobody knows why → check whether dependency installation is being cached at all; re-downloading the same packages on every single run is a common, invisible source of wasted minutes.',
        ],
        interview: [
          'What\'s the difference between an artifact and a cache in GitHub Actions?',
          'When would a build matrix be worth the added complexity?',
        ],
        azureConnection:
          "A Docker image (Chapter 7) is conceptually an artifact too — the thing one job (build) produces that a later job (push/deploy) consumes, just using a container registry instead of GitHub's own artifact storage.",
      },
      {
        id: 'secrets-environments',
        title: 'Secrets and environments',
        concept:
          "GitHub Secrets (repo or organization-level) are encrypted values injected as environment variables at runtime, never visible in logs (GitHub automatically masks a secret's value if it ever appears in output) and never readable back through the API once set. GitHub Environments add a named deployment target (e.g. \"production\") with optional protection rules — required reviewers, wait timers, or restricting which branches can deploy to it — giving a real approval gate without a separate tool.",
        whyDevops:
          "This is the mechanism Chapter 10's OIDC setup replaces entirely for Azure auth specifically (no stored secret needed at all), but Secrets/Environments remain the right tool for anything that genuinely needs one (a third-party API key, for instance).",
        handsOn: [
          { label: 'Already used once in this project', code: "env:\n  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}   # gitleaks job, ci.yml -- GITHUB_TOKEN is auto-provided, no manual setup needed" },
        ],
        troubleshooting: [
          'A secret value shows up in workflow logs unmasked → GitHub only masks exact matches of the registered secret value; if a step transforms/encodes it first (base64, etc.) before printing, the transformed version won\'t be masked — avoid ever deliberately printing a secret, transformed or not.',
        ],
        interview: [
          'How does GitHub prevent a secret from leaking into build logs?',
          'What does a required reviewer on a GitHub Environment actually gate?',
        ],
        azureConnection:
          "The eventual `deploy` job will use a GitHub Environment (e.g. `production`) so deployment to Azure requires the same kind of deliberate gate this project already applies to Azure IAM changes (declining to self-assign roles autonomously, back in Module 5) — a human in the loop for anything that changes what's actually running.",
      },
      {
        id: 'build-test-fastapi',
        title: 'Build and test Python/FastAPI',
        concept:
          "This chapter has no new material — `ci.yml`'s `backend` job already does exactly this: checkout, set up Python 3.11, `pip install -r requirements.txt`, `pytest`. It runs on every push and pull request, so a broken backend test fails visibly before merge, not after.",
        whyDevops:
          "Confirming something already works, with evidence, is still real verification — not everything in a curriculum needs a new build to be worth checking.",
        handsOn: [
          { label: 'Run the same thing locally that CI runs', code: 'cd backend\npip install -r requirements.txt\npytest' },
        ],
        troubleshooting: [
          'Tests pass locally but fail in CI → almost always an environment difference (a missing env var CI doesn\'t have, a dependency version pinned differently, or a test that accidentally depends on local state/files that don\'t exist on a fresh runner).',
        ],
        interview: [
          'Why run the exact same test command in CI as you would locally, rather than a CI-specific test invocation?',
        ],
        azureConnection:
          "This job is the first gate in what will become the full pipeline: backend tests -> Docker build+scan -> push to ACR -> deploy — nothing downstream should run if this fails, which is why the eventual `docker-build` job will declare `needs: [backend, frontend]`.",
      },
      {
        id: 'build-scan-docker-images',
        title: 'Build and scan Docker images',
        concept:
          "A `docker-build-scan` job builds both images (using `needs: [backend, frontend]` so it only runs after tests pass), then scans each with Trivy — `exit-code: 1` means the CI run genuinely fails if a matching-severity vulnerability is found, not just logs a warning. Trivy scans two different things at once: the application's own dependencies (Python packages, npm packages baked into the image) and the base image's OS packages (Alpine/Debian packages from `FROM python:3.11-slim` or `FROM nginx:1.29-alpine`) — a finding in either category blocks the build the same way.",
        whyDevops:
          "A security scanner that's configured but never actually tested against a real vulnerability teaches nothing — this chapter's real value came from the scan genuinely failing on real findings and having to fix them properly, not from writing YAML that happened to pass on the first try.",
        handsOn: [
          { label: 'The real job, added this session', code: 'docker-build-scan:\n  runs-on: ubuntu-latest\n  needs: [backend, frontend]\n  steps:\n    - uses: actions/checkout@v4\n    - run: docker build -t azureops-backend:${{ github.sha }} ./backend\n    - run: docker build -t azureops-frontend:${{ github.sha }} ./frontend\n    - uses: aquasecurity/trivy-action@0.28.0\n      with:\n        image-ref: azureops-backend:${{ github.sha }}\n        severity: CRITICAL,HIGH\n        exit-code: \'1\'\n        trivyignores: backend/.trivyignore' },
        ],
        troubleshooting: [
          "A locally-run Trivy scan (via `docker run aquasec/trivy ... image <name>`) fails to find the image → on Windows/Git Bash, mounting the Docker socket (`-v /var/run/docker.sock:/var/run/docker.sock`) needs `MSYS_NO_PATHCONV=1` prefixed, the same path-mangling issue hit throughout this project — without it, the socket path gets corrupted into a Windows path and Trivy can't reach the Docker daemon at all.",
          'A `docker run --rm ... image <name> | tail -N` scan output looks clean, but re-running without truncation shows dozens more findings → always check the actual finding count (or use `--format json` and count entries) before trusting a scan result glanced at through `tail` — this happened for real in this session: a frontend scan looked like only 3-4 findings until the full, untruncated output showed 37.',
        ],
        interview: [
          'Why scan both the application dependencies and the base OS image, rather than just one?',
          'What does `exit-code: 1` actually change about how a scan step behaves in CI?',
        ],
        azureConnection:
          "The backend scan initially found a real CRITICAL CVE (`python-jose` 3.3.0) and several HIGH ones (`starlette` via an outdated `fastapi` pin) — both genuinely fixed by loosening the `fastapi` version pin so pip could resolve patched versions, verified by rebuilding and rescanning until clean. The frontend scan found 37 HIGH findings, all Alpine OS packages in the `nginx:1.27-alpine` base image — partially reduced by bumping to `nginx:1.29-alpine`, with the rest deliberately left as HIGH-not-CRITICAL and out of this build's gate (see the next chapter).",
      },
      {
        id: 'scan-triage-policy',
        title: 'Scan triage: what to fix vs. what to accept (and document)',
        concept:
          "Not every vulnerability finding deserves the same response. A CVE in a dependency you directly control, with a fix available, should be fixed immediately — that's what happened with the backend's `python-jose`/`starlette`. A CVE in a transitive dependency with NO available compatible fix (this session's `pyasn1`, capped by `python-jose` itself) needs a documented, reasoned exception — not silence, and not blocking forever on something you can't actually fix without a bigger change. A CVE in base-image OS packages that aren't exercised by how the container actually runs is a different category again — usually best handled by a different severity bar and a periodic base-image-refresh habit, not a per-CVE ignore list, especially once the count gets large (37 findings for one frontend image, in this project's real case).",
        whyDevops:
          "Blindly either \"fix everything\" or \"ignore everything\" both fail in practice — the first is often literally impossible (unfixable transitive pins, base-image churn), the second defeats the point of scanning at all. Real teams triage, and the triage decisions themselves need to be visible (a `.trivyignore` with reasons, a differentiated severity policy with a comment explaining why) rather than buried in someone's memory.",
        handsOn: [
          { label: 'The three real outcomes from this session, side by side', code: '# 1. FIXED: python-jose 3.3.0 -> 3.4.0, fastapi pin loosened to allow patched starlette\n# 2. ACCEPTED + DOCUMENTED (backend/.trivyignore): pyasn1 CVEs -- python-jose itself\n#    caps pyasn1<0.5.0, no newer python-jose relaxes it; real fix is replacing\n#    python-jose with pyjwt, tracked as a follow-up, not done here\n# 3. POLICY DIFFERENTIATED (frontend Trivy step): severity lowered to CRITICAL-only\n#    for the nginx/Alpine base image -- 37 HIGH findings, all OS packages, none\n#    reachable through this app\'s actual usage; cleared via periodic base-image bumps' },
        ],
        troubleshooting: [
          'A `.trivyignore` entry has no comment explaining why → this is a real problem, not just style: six months later nobody (including future-you) can tell if it\'s still a valid exception or stale risk being carried forward blindly. Every entry in this project\'s `.trivyignore` files has a reason attached.',
          'Tempted to just disable the scan (or set `exit-code: 0`) because triage feels like extra work → this defeats the entire purpose of scanning; the friction of triage is the point — it forces a decision instead of silent risk accumulation.',
        ],
        interview: [
          'Walk through how you\'d decide whether to fix, formally accept, or adjust policy for a given vulnerability finding.',
          'Why is an undocumented `.trivyignore` entry arguably worse than no ignore file at all?',
        ],
        azureConnection:
          "This triage judgment is exactly what a human still needs to bring to CI/CD even with everything automated — the pipeline can find and block on issues, but deciding whether a given finding is fix-now, accept-with-reason, or policy-adjust is not (yet) something to automate away, the same principle behind this project declining to auto-assign IAM roles back in Module 5.",
      },
      {
        id: 'push-container-registry',
        title: 'Push to a container registry — Azure Container Registry vs. GitHub Container Registry',
        concept:
          "A container registry stores built images by `repository:tag`, so a deployment target can `docker pull` a specific version rather than needing the source code and a build environment. Azure Container Registry (ACR) is Azure's managed option (~$5/month Basic tier); GitHub Container Registry (`ghcr.io`), part of GitHub Packages, is free for the volumes a small project needs and authenticates in CI with the built-in `GITHUB_TOKEN` — no separate credential or OIDC setup required just to push. ACR's real, genuine advantages are Private Endpoint support (images pulled entirely inside a VNet, no internet egress) and native Managed Identity integration for passwordless pulls — both particularly strong once running on AKS. Neither advantage is in use yet: this project's VMs already pull images over the public internet regardless (that's how the Module 6 WAF containers came from Docker Hub), so ACR's private-pull benefit isn't being exercised today.",
        whyDevops:
          "This is a real, recurring build-vs-buy decision, same shape as Chapter 5's Load Balancer and Chapter 7's WAF choices from Module 6 — the cloud-native managed option isn't automatically correct just because it's cloud-native; it's correct once its specific advantages are actually needed.",
        handsOn: [
          { label: 'The real job, publishing only on merges to main (not every PR)', code: "docker-build-scan:\n  permissions:\n    packages: write   # <- grants GITHUB_TOKEN push access, no separate secret\n  env:\n    BACKEND_IMAGE: ghcr.io/${{ github.repository_owner }}/azureops-backend\n  steps:\n    - uses: docker/login-action@v3\n      if: github.event_name == 'push' && github.ref == 'refs/heads/main'\n      with:\n        registry: ghcr.io\n        username: ${{ github.actor }}\n        password: ${{ secrets.GITHUB_TOKEN }}\n    - run: docker push ${{ env.BACKEND_IMAGE }}:${{ github.sha }}\n      if: github.event_name == 'push' && github.ref == 'refs/heads/main'" },
        ],
        troubleshooting: [
          "Image push fails with a 403/denied error → check the job's `permissions: packages: write` is actually set; without it, the default `GITHUB_TOKEN` only has read access to packages, and login will appear to succeed while push fails.",
          'A pull request run tries to push an image → the `if: github.event_name == \'push\' && github.ref == \'refs/heads/main\'` guard on every publish-related step is what prevents this; PRs still get full build+scan validation, just never a real publish — the same "validate everything, publish only from main" distinction this project has now applied consistently since Chapter 1\'s CI-vs-CD framing.',
        ],
        interview: [
          'What are ACR\'s actual, specific advantages over ghcr.io — not just "it\'s the Azure one"?',
          'Why guard image-push steps on both event type AND branch, rather than branch alone?',
          'How does GITHUB_TOKEN authenticate to ghcr.io without a separately configured secret?',
        ],
        azureConnection:
          'A real cost-conscious decision made this session: asked directly why pay for ACR when GitHub already hosts the code, worked through the actual tradeoff (Private Endpoint + Managed Identity integration vs. $0 cost and simpler auth), and chose `ghcr.io` since neither of ACR\'s real advantages apply to this project\'s architecture yet. Tracked as a revisit point for when Module 9 (AKS) actually needs private-network image pulls — the same "defer until the architecture justifies it" pattern as the Load Balancer and Front Door decisions in Module 6.',
      },
      {
        id: 'oidc-federation',
        title: 'OIDC federation and passwordless Azure authentication',
        concept:
          "A traditional Azure service principal secret is a long-lived password: stored in GitHub Secrets, valid until manually rotated, and a real liability if it ever leaks. OpenID Connect (OIDC) federation replaces it entirely: GitHub's own OIDC provider issues a short-lived token for each workflow run, and a Federated Identity Credential on an Azure AD App Registration is configured to trust tokens matching a specific `subject` — e.g. `repo:owner/repo:ref:refs/heads/main`. At runtime, GitHub's token gets exchanged for a real Azure AD access token, scoped to exactly that repo and branch, valid only for the run's duration. No secret exists anywhere at rest. Three pieces are required: the App Registration + Service Principal (the identity), the Federated Credential (the trust relationship — which GitHub workflows are allowed to authenticate as this identity), and an RBAC role assignment (what that identity is actually allowed to do once authenticated) — identity, trust, and permission are three separate, independently-configured layers.",
        whyDevops:
          "Eliminating stored secrets removes an entire class of incident (a leaked CI/CD credential with standing access) and removes the operational burden of rotation — this is genuinely standard practice for modern CI/CD to Azure/AWS/GCP now, not an advanced technique.",
        handsOn: [
          { label: 'The three real pieces, built this session', code: 'az ad app create --display-name "azureops-copilot-github-oidc"\naz ad sp create --id <appId>\naz ad app federated-credential create --id <appObjectId> --parameters \'{\n  "name": "github-actions-main-branch",\n  "issuer": "https://token.actions.githubusercontent.com",\n  "subject": "repo:consciouslake/Devops-tut:ref:refs/heads/main",\n  "audiences": ["api://AzureADTokenExchange"]\n}\'\n# role assignment (the permission layer) -- see below, deliberately not run autonomously' },
          { label: 'The workflow side', code: "permissions:\n  id-token: write   # <- required, lets the job request an OIDC token at all\n  contents: read\nsteps:\n  - uses: azure/login@v3\n    with:\n      client-id: ${{ secrets.AZURE_CLIENT_ID }}\n      tenant-id: ${{ secrets.AZURE_TENANT_ID }}\n      subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}\n      # note: no client-secret input at all -- that's the whole point" },
        ],
        troubleshooting: [
          "`azure/login` fails with a federation/subject-mismatch error → the Federated Credential's `subject` must exactly match the workflow's actual trigger context; `repo:owner/repo:ref:refs/heads/main` only matches pushes to `main` specifically — a PR-triggered run has a different subject format (`repo:owner/repo:pull_request`) and needs its own separate federated credential if it also needs to authenticate.",
          'A job with `azure/login` succeeds but a subsequent `az` command fails with an authorization error → login proving identity and RBAC granting permission are separate layers; a successful login only proves the trust relationship works, not that the identity can actually do anything yet.',
          'Missing `permissions: id-token: write` on the job → without it, the job has no ability to request an OIDC token from GitHub at all, and `azure/login` fails immediately, before ever reaching Azure.',
        ],
        interview: [
          'Walk through what actually happens, step by step, when a workflow using OIDC federation authenticates to Azure.',
          'Why are identity (App Registration), trust (Federated Credential), and permission (role assignment) deliberately three separate configuration steps rather than one?',
          'What would happen if the Federated Credential\'s subject were set to match any branch, not just main?',
        ],
        azureConnection:
          'Built for real this session: `azureops-copilot-github-oidc` (App Registration + Service Principal), a Federated Credential trusting only `repo:consciouslake/Devops-tut:ref:refs/heads/main` (so forks or other branches cannot authenticate as this identity), and a `Contributor` role assignment scoped to `azureops-copilot-rg` only (not the whole subscription) — the role assignment itself was correctly declined when attempted autonomously, run by the user directly, the same pattern as Module 5\'s storage RBAC moment. Hit the same Git Bash path-mangling bug on the role assignment\'s `--scope` argument as every previous `/subscriptions/...` argument this project has passed — `MSYS_NO_PATHCONV=1` fixed it again.',
      },
      {
        id: 'deploy-to-azure',
        title: 'Deploy to Azure — scoped deliberately to proving the auth, not a full deployment',
        concept:
          "The `deploy` job runs `azure/login` (OIDC, no secret) then a real, verifiable Azure action — reading resources in `azureops-copilot-rg` — to prove the whole chain (Federated Credential -> token exchange -> RBAC-granted access) actually works end to end, not just that the YAML is syntactically plausible. A full production deployment (rolling out the newly-built images to a running VM/VMSS/AKS target) is deliberately NOT built in this chapter — it would need secrets management for the real app (`GEMINI_API_KEY` etc., which Module 11's Key Vault work hasn't happened yet) and a real target VM kept running (cost), neither of which this project has in place yet.",
        whyDevops:
          "Scoping a chapter's real, working example to what can be *honestly and completely* verified — rather than stubbing out a bigger deployment that can't actually be tested end to end yet — is itself the right instinct: a half-working deploy step that silently can't handle secrets is worse than an honestly-scoped one that fully works.",
        handsOn: [
          { label: 'What actually gets verified, for real, on every merge to main', code: 'az account show --query "{subscription:name, user:user.name, authType:user.type}"\naz resource list --resource-group azureops-copilot-rg --query "sort_by([], &name)[].{name:name, type:type}" -o table' },
        ],
        troubleshooting: [
          'Tempted to consider this chapter "not really CD" since it doesn\'t deploy the app → it\'s an honest, scoped CD step (Azure resource state genuinely gets read using a live, workflow-issued credential) building toward a real deployment once the prerequisites (Module 11 Key Vault, a deliberately-chosen always-on target) exist — better than a deploy step that appears to work but can\'t actually handle secrets safely yet.',
        ],
        interview: [
          'Why might a team deliberately scope a "deploy" pipeline step to verification only, before building the full deployment?',
          'What still needs to exist before this project\'s `deploy` job could safely roll out the real application to a VM?',
        ],
        azureConnection:
          "This closes the loop on Module 7's stated goal — a repeatable build-test-scan-publish-verify pipeline — while honestly flagging what's still needed for a full rollout: Key Vault-backed secrets (Module 11) and a deliberate choice of always-on deployment target, both explicitly deferred rather than faked.",
      },
      {
        id: 'rollback-approvals',
        title: 'Rollback, approvals, and deployment strategies',
        concept:
          "A GitHub Environment adds a named deployment target (e.g. `production`) that a job can require via `environment: production` — and, critically, protection rules attached to that environment (Required reviewers, wait timers) block the job from running at all until satisfied, regardless of what upstream jobs already passed. This is the concrete mechanism behind Continuous *Delivery* (automated up to a human decision point) versus Continuous *Deployment* (fully automated, no gate) — the distinction Chapter 1 introduced conceptually, now real. Rollback strategy, separately: because this project already tags every published image with both the immutable commit SHA and the mutable `latest` (Chapter 9), rolling back means redeploying a previous, known-good SHA-tagged image — `latest` alone can't express \"go back,\" only \"whatever's newest.\"",
        whyDevops:
          "An approval gate that silently doesn't gate anything is arguably worse than no gate at all — it creates false confidence. This chapter's real value came from discovering exactly that gap live (the environment existed, but `Required reviewers` was unchecked) rather than assuming a `environment:` reference alone was sufficient.",
        handsOn: [
          { label: 'What actually happened, in order', code: '# 1. Added `environment: production` to the deploy job -- ran, no approval prompt appeared\n# 2. Checked GitHub Settings -> Environments -> production directly\n#    -> "Required reviewers" checkbox was UNCHECKED -- environment existed,\n#       but had zero protection rules attached\n# 3. Checked it, added a reviewer, saved\n# 4. Re-ran -- this time: "consciouslake requested your review to deploy to\n#    production", deploy job sat at "waiting for review" for real\n# 5. Approved via the Review deployments button -- deploy then ran and succeeded' },
        ],
        troubleshooting: [
          '`environment: production` is set on a job but no approval prompt ever appears → the environment may have been auto-created by GitHub the first time the workflow referenced it, with zero protection rules attached by default. Always verify directly in Settings -> Environments that `Required reviewers` is actually checked, rather than assuming the `environment:` key alone enforces anything.',
          "Adding `environment:` to a job that already uses OIDC federation breaks `azure/login` with a new `AADSTS700213` subject-mismatch error → GitHub's OIDC subject claim format changes based on job context: without an environment it's `repo:owner/repo:ref:refs/heads/BRANCH`, but with one it becomes `repo:owner/repo:environment:NAME` instead — a second Federated Credential is needed for the environment-based subject; the ref-based one alone won't match anymore for that job.",
        ],
        interview: [
          'What specifically enforces an approval gate in GitHub Actions — is it the `environment:` key alone, or something else?',
          'Why does adding a GitHub Environment to a job change its OIDC subject claim format?',
          'Why is tagging images with both a commit SHA and `latest` necessary for a real rollback strategy, when `latest` alone would be simpler?',
        ],
        azureConnection:
          'Built and verified as a real, live sequence in this session: the `production` environment was created but initially had no protection rules (confirmed via the GitHub UI, not assumed), fixed by enabling Required reviewers, which then genuinely broke OIDC auth with a new subject-format mismatch (`...{:environment:production}` vs. the existing `...{:ref:refs/heads/main}` credential) — fixed with a second Federated Credential rather than replacing the first, so both job shapes keep working. The final real run showed a genuine pause (`waiting for review`), a real approval click, and `deploy` succeeding only after that human decision — the complete CD-with-a-gate loop, not just the YAML for one.',
      },
    ],
  },
  {
    id: 'kubernetes-fundamentals',
    number: 8,
    mono: 'K8',
    title: 'Kubernetes Fundamentals',
    outcome: 'Understand the core Kubernetes control model before using AKS.',
    chapters: [
      {
        id: 'why-orchestration',
        title: 'Why orchestration',
        concept:
          "Running one container on one VM (Phase 1, and app-vm1/app-vm2 through Module 6) works until you need more than a handful of them: which node has capacity for a new container, what happens when a node dies, how do containers find each other as they get rescheduled onto different IPs, how do you roll out a new version without downtime. An orchestrator's job is answering all of that continuously and automatically instead of by hand. Kubernetes specifically: you declare *desired state* (\"3 replicas of this image, spread across nodes\"), and its control loop continuously reconciles actual state toward it — if a node dies, it doesn't alert you and wait, it just reschedules the missing replicas elsewhere, unprompted.",
        whyDevops:
          "Everything from Module 1 through Module 7 was fundamentally manual capacity/placement decisions (which VM, which port, restart it yourself if it dies) — Kubernetes is the first tool in this curriculum whose entire job is making those decisions continuously instead.",
        handsOn: [
          { label: 'The declarative model, proven live this session', code: "kubectl scale deployment hello-k3s --replicas=4\n# no instruction on WHICH node -- the scheduler decided, and it kept\n# deciding correctly even with one of three nodes down" },
        ],
        troubleshooting: [
          'Expecting instant failover when a node dies → Kubernetes uses a grace period (node considered NotReady after ~40s of missed heartbeats, pods on it aren\'t rescheduled for several more minutes by default) rather than reacting instantly — this is deliberate, to avoid mass-rescheduling storms from a brief network blip, not a bug. Confirmed directly this session: pods already running on a stopped node kept showing "Running" in `kubectl get pods` for the first couple minutes after the node went `NotReady`.',
        ],
        interview: [
          'What does "declarative" mean in the context of Kubernetes, contrasted with the manual VM-management work from earlier modules?',
          'Why doesn\'t Kubernetes reschedule a failed node\'s pods instantly?',
        ],
        azureConnection:
          "This project's own real cluster: `app-vm1`, `app-vm2`, and `azureops-vm01` (the original Phase 1 VM, reactivated) — three VMs already paid for from earlier modules, now running a genuine self-managed Kubernetes cluster instead of paying separately for Azure Kubernetes Service.",
      },
      {
        id: 'kubernetes-architecture',
        title: 'Kubernetes architecture',
        concept:
          "The control plane (API server, scheduler, controller-manager, etcd) makes cluster-wide decisions; each node runs a kubelet (executes the control plane's instructions locally) and a container runtime (containerd, same one Docker itself uses under the hood). etcd is the cluster's entire state, stored as a distributed key-value store using the Raft consensus algorithm — this is why it wants an odd number of members (1, 3, 5): a majority (quorum) must agree before any write is considered committed, and an odd count avoids a tie during a network split. A 3-node etcd cluster tolerates exactly 1 node failure and keeps working; losing 2 of 3 loses quorum and the cluster stops accepting writes (though existing pods keep running).",
        whyDevops:
          "Managed Kubernetes (AKS) hides literally everything in this chapter — the control plane is someone else's problem. Building it yourself is what makes 'the control plane needs 3 nodes for HA' something you've actually configured and tested, not a fact you memorized.",
        handsOn: [
          { label: 'This project\'s real, self-managed control plane', code: 'curl -sfL https://get.k3s.io | sh -s - server --cluster-init --node-ip=10.10.1.4 --advertise-address=10.10.1.4\n# k3s bundles the control plane + kubelet + containerd + CNI (Flannel) +\n# a CNI-compliant local storage provisioner + Traefik ingress, all in one\n# binary -- vanilla kubeadm would have you install and wire up each piece separately' },
          { label: 'Proof all 3 are genuine etcd members, not just workers', code: 'kubectl get nodes\n# app-vm1, app-vm2, azureops-vm01 -- ROLES column shows "control-plane,etcd" on all three' },
        ],
        troubleshooting: [
          'Considered using kubeadm instead of k3s for this build → chose k3s deliberately: it\'s genuinely production-grade (not a toy), but bundles CNI/storage/ingress that kubeadm leaves you to wire up separately — the right tradeoff for modest `Standard_B2s_v2` nodes and limited session time, while still being real, unmodified upstream Kubernetes underneath.',
          "Cross-region cluster (centralindia + southindia) raised a real question: would ~17ms inter-node latency break etcd consensus? → tested directly rather than assumed — `ping` between nodes confirmed ~17-18ms round-trip, well within etcd's tolerance (its default heartbeat/election timeouts are measured in hundreds of milliseconds to seconds), and the cluster came up healthy.",
        ],
        interview: [
          'Why does etcd need an odd number of members, and what specifically happens if a 3-node cluster loses 2 nodes?',
          'What runs on every node regardless of whether it\'s also control-plane, and why?',
          'What does k3s bundle that vanilla kubeadm doesn\'t, and why does that matter for resource-constrained nodes?',
        ],
        azureConnection:
          "This cluster's control plane spans two Azure regions over a real VNet peering link (`azureops-vnet` <-> `azureops-vm01VNET`, centralindia <-> southindia, established this session specifically to reuse the dormant Phase 1 VM instead of hitting this subscription's 4-vCPU regional quota limit by creating a new one) — real infrastructure reuse driven by a real Azure constraint, not a clean textbook setup.",
      },
      {
        id: 'pods-containers',
        title: 'Pods and containers',
        concept:
          "A Pod is Kubernetes' smallest deployable unit — one or more containers that always schedule together, on the same node, sharing a network namespace (same IP, can reach each other via `localhost`) and optionally storage. Almost always one container per pod in practice; multi-container pods are for tightly-coupled helper patterns (a sidecar proxy, a log shipper) — not \"how to run more than one app,\" which is what separate pods (or Deployments managing many pod replicas) are for. Every pod gets its own IP from the CNI's pod network (Flannel here, `10.42.0.0/16`) — a genuinely separate address space from the node's own VNet IP.",
        whyDevops:
          "The pod-gets-its-own-IP model is what makes 'just talk to the app by name' possible cluster-wide regardless of which physical node it lands on — the conceptual leap from Module 4's Docker networking (one host, containers share that host's namespace tricks) to a multi-node model.",
        handsOn: [
          { label: 'Real pod IPs, one per replica, across 3 different nodes', code: 'kubectl get pods -o wide\n# hello-k3s-...-bqqfc  10.42.1.3  app-vm2\n# hello-k3s-...-xqmvd  10.42.3.3  azureops-vm01\n# hello-k3s-...-zbqrc  10.42.0.9  app-vm1\n# three different /24-ish ranges -- one per node -- routed transparently by Flannel' },
        ],
        troubleshooting: [
          'Expecting a pod IP to still work after the pod restarts → pod IPs are ephemeral, reassigned on every restart/reschedule; anything that needs a stable address talks to a Service (next chapter), never a pod IP directly.',
        ],
        interview: [
          'Why would you ever put two containers in the same pod instead of two separate pods?',
          'What do containers in the same pod share that containers in different pods don\'t?',
        ],
        azureConnection:
          'Verified directly this session: `kubectl create deployment hello-k3s --replicas=3` produced one pod per node automatically, each with a distinct `10.42.x.x` IP, and scaling to 4 replicas mid-node-outage added a new pod on a healthy node without any manual placement decision.',
      },
      {
        id: 'deployments-replicasets',
        title: 'Deployments and ReplicaSets',
        concept:
          "A Deployment declares desired state (\"this image, this many replicas\") and manages a ReplicaSet underneath, which is the thing actually responsible for keeping that many pod replicas running at all times — the Deployment layer on top adds rollout history and rolling-update behavior. If a replica's pod dies, the ReplicaSet's controller notices (via the control loop from Chapter 1) and creates a replacement — no restart script, no systemd `Restart=always` needed, because the reconciliation happens at the cluster level instead of the single-VM level.",
        whyDevops:
          "This is the direct, one-level-up successor to Module 1's `Restart=always` systemd unit and Module 6's Load Balancer health-probe-driven failover — same underlying goal (keep N healthy replicas running), now handled by the orchestrator instead of by a single VM's init system or an external LB.",
        handsOn: [
          { label: 'The real deployment used to prove the cluster works', code: 'kubectl create deployment hello-k3s --image=nginx:alpine --replicas=3\nkubectl scale deployment hello-k3s --replicas=4   # worked even with 1/3 nodes down\nkubectl delete deployment hello-k3s               # cleanup' },
        ],
        troubleshooting: [
          'A Deployment shows the right replica count but pods keep restarting → check `kubectl describe pod <name>` for the actual failure reason (crash loop, failed image pull, resource limits) — the Deployment layer will keep replacing crashing pods forever without fixing the underlying cause, so the replica count alone can look healthy while the app is actually broken.',
        ],
        interview: [
          'What\'s the actual relationship between a Deployment and a ReplicaSet — which one does the day-to-day replica-count enforcement?',
          'How does a Deployment\'s self-healing differ from systemd\'s `Restart=always` in scope?',
        ],
        azureConnection:
          'The exact object used to verify this cluster works for real, not just that `kubectl get nodes` looks healthy — three real replicas scheduled automatically, one per node, surviving a real node failure and still accepting a scale-up request afterward.\n\n**Update, post-go-live (2026-09-22):** this stopped being a throwaway demo — the real production `backend` and `frontend` Deployments were scaled from 1 to 2 replicas each, specifically to check this exact load-balancing behavior on genuine live traffic, not just a disposable test object. Real, non-obvious finding: `backend`\'s `nodeSelector: kubernetes.io/hostname: app-vm1` (needed for its Key Vault Managed Identity access, Module 11) means **both** its replicas land on the same node — real pod-crash resilience, but *not* node-failure resilience, since there\'s nowhere else for the Deployment to schedule them. `frontend` has no such constraint and genuinely spread across two different nodes (`app-vm1` and `azureops-vm01`) on its own. Verified real load balancing by sending a live burst of requests to `https://devopspk.online/health` and checking both backend pods\' logs within the same 20-second window — both received real traffic, confirming the Kubernetes Service (not just Traefik) is doing genuine round-robin distribution across replicas on real production traffic.',
      },
      {
        id: 'services-service-discovery',
        title: 'Services and service discovery',
        concept:
          "A Service gives a stable virtual IP and DNS name (via CoreDNS, already running in this cluster's `kube-system` namespace) to a group of pods selected by label — so callers never need to know individual pod IPs, which are ephemeral by design (Chapter 3). `ClusterIP` (default) is reachable only inside the cluster; `NodePort` opens a port on every node's own IP; `LoadBalancer` asks the cloud provider for an external load balancer — a feature that requires cloud integration AKS has and this self-managed cluster does not, which is exactly why k3s ships Traefik as a bundled Ingress controller instead (visible in this cluster as the `svclb-traefik` pods running on every node).",
        whyDevops:
          "This is the piece that replaces \"which port is this backend service actually listening on\" — a recurring theme since Module 4's Docker Compose service-name DNS, now at cluster scale instead of single-host scale.",
        handsOn: [
          { label: 'What\'s already running as a Service in this cluster', code: 'kubectl get svc -A\n# kube-system\'s coredns, and traefik\'s Service (backed by the svclb-traefik\n# daemonset pods visible in `kubectl get pods -A` on every node)' },
        ],
        troubleshooting: [
          '`Service: type=LoadBalancer` stays stuck in `<pending>` forever on a self-managed cluster → this is expected without a cloud-controller-manager to actually provision a load balancer; k3s\'s bundled ServiceLB (the `svclb-*` pods) is its lightweight substitute, or use NodePort/Ingress directly.',
        ],
        interview: [
          'Why does a Service exist at all, given pods already have their own IPs?',
          'Why does `type=LoadBalancer` not work out of the box on a self-managed cluster the way it does on AKS?',
        ],
        azureConnection:
          "This project's planned Ingress work (a later chapter) will front the cluster the same way `azureops-lb` + the ModSecurity WAF fronted `app-vm1`/`app-vm2` in Module 6 — conceptually the same job (get external traffic to the right backend), now handled by Kubernetes-native primitives (Service + Ingress) instead of an external Load Balancer.",
      },
      {
        id: 'configmaps-secrets',
        title: 'ConfigMaps and Secrets',
        concept:
          "A ConfigMap holds non-sensitive configuration (key-value pairs); a Secret holds sensitive values, structurally identical but stored base64-encoded rather than plaintext — a critical distinction: base64 is an *encoding*, not encryption, and is trivially reversible by anyone with read access to the Secret object. Both can be injected into a pod as environment variables (`envFrom`) or mounted as files (a volume) — env vars are simpler but get baked into the process at startup only; mounted files can update live if the ConfigMap/Secret changes (with a short propagation delay), which env vars never do.",
        whyDevops:
          "This is the direct successor to Module 4/5's `backend/.env` and Module 5's Key Vault-bound plan — same underlying need (get config and secrets into a running process without hardcoding them), now expressed as first-class Kubernetes objects instead of a mounted file or an Azure-specific service.",
        handsOn: [
          { label: 'Verified live this session', code: "kubectl create configmap app-config --from-literal=APP_ENV=production --from-literal=LOG_LEVEL=info\nkubectl create secret generic app-secrets --from-literal=API_KEY=demo-fake-key\n# pod with envFrom: [configMapRef, secretRef] -- both landed correctly as env vars\nkubectl get secret app-secrets -o jsonpath='{.data.API_KEY}'\n# -> base64 string, decodable with: echo '<value>' | base64 -d" },
        ],
        troubleshooting: [
          'Assuming a Secret is "secure" because `kubectl get secret -o yaml` shows gibberish → it\'s base64, not encryption; anyone with RBAC read access to that Secret object can trivially decode it. Real protection comes from RBAC restricting who can read Secrets at all, plus (for genuinely sensitive production secrets) encryption-at-rest on etcd itself or an external secrets manager — not the base64 encoding.',
        ],
        interview: [
          'Why is a Kubernetes Secret only "sensitive by convention," not by actual encryption, by default?',
          'When would you mount a ConfigMap as a file instead of injecting it as environment variables?',
        ],
        azureConnection:
          "This project's `backend/.env` (Gemini API key, Qdrant/Redis config) is the natural candidate to become a Kubernetes Secret if/when the app itself gets deployed into this cluster — though Module 11's planned Key Vault integration would be the more production-appropriate real secret store, with Kubernetes Secrets at most holding a reference or being synced from it, not the primary store for something this sensitive.",
      },
      {
        id: 'namespaces-rbac',
        title: 'Namespaces and RBAC',
        concept:
          "A Namespace partitions a cluster into isolated logical sections — most object types (Pods, Services, ConfigMaps, Roles) exist within exactly one namespace, and by default nothing in one namespace can see into another by name. RBAC (Role-Based Access Control) — the same model Module 5 covered for Azure IAM — works almost identically here: a Role defines a set of allowed verbs (get/list/watch/create/delete) on specific resource types, scoped to one namespace; a RoleBinding grants that Role to a subject (a ServiceAccount, User, or Group). A ClusterRole/ClusterRoleBinding does the same but cluster-wide, spanning all namespaces.",
        whyDevops:
          "This is the exact same least-privilege discipline this project has applied to every Azure RBAC decision since Module 5 (scoped role assignments, never subscription-wide when avoidable) — now applied inside the cluster instead of at the Azure resource level.",
        handsOn: [
          { label: 'Verified live this session — the actual permission boundary, not just the YAML', code: "kubectl create namespace demo-ns\nkubectl create serviceaccount restricted-sa -n demo-ns\n# Role: get/list/watch on pods only, scoped to demo-ns; RoleBinding to restricted-sa\n\nkubectl auth can-i list pods --as=system:serviceaccount:demo-ns:restricted-sa -n demo-ns\n# -> yes\nkubectl auth can-i delete pods --as=system:serviceaccount:demo-ns:restricted-sa -n demo-ns\n# -> no (verb not granted)\nkubectl auth can-i list pods --as=system:serviceaccount:demo-ns:restricted-sa -n default\n# -> no (Role is namespace-scoped; RoleBinding only applies within demo-ns)" },
        ],
        troubleshooting: [
          'A ServiceAccount can perform an action in one namespace but not another, despite "having the role" → confirm whether a Role (namespace-scoped) or ClusterRole (cluster-wide) was actually bound — a RoleBinding referencing even a ClusterRole only grants access within the RoleBinding\'s own namespace, a common point of confusion.',
        ],
        interview: [
          'What\'s the practical difference between a Role+RoleBinding and a ClusterRole+ClusterRoleBinding?',
          '`kubectl auth can-i` returned "no" for an action you expected to be allowed — what would you check first?',
        ],
        azureConnection:
          'Directly parallel to Module 5\'s real RBAC finding (subscription Owner not granting Storage blob data access) — here, verified the inverse case for real: a deliberately narrow Role correctly allowed exactly what it granted and nothing more, tested with `kubectl auth can-i` rather than assumed from the YAML alone.',
      },
      {
        id: 'health-probes-resources',
        title: 'Health probes and resource requests/limits',
        concept:
          "A liveness probe answers \"should this container be restarted\" (repeated failures trigger a kubelet-initiated restart); a readiness probe answers \"should this pod receive traffic right now\" (failing removes it from Service endpoints without restarting it) — conflating the two is a common real mistake. `resources.requests` is what the scheduler reserves capacity for when placing a pod; `resources.limits` is a hard ceiling enforced by the kernel cgroup — exceeding a CPU limit throttles the process, but exceeding a memory limit gets the container killed outright (OOMKilled), because memory can't be throttled the way CPU can.",
        whyDevops:
          "Every VM/systemd health check and NSG/LB probe from Modules 1-6 had a direct manual analog to this chapter's Kubernetes-native version — the pattern is identical (define health, define what happens when it fails), just expressed differently at each layer of the stack.",
        handsOn: [
          { label: 'A real, verified liveness-probe restart', code: "livenessProbe:\n  exec:\n    command: [\"cat\", \"/tmp/healthy\"]\n  periodSeconds: 5\n  failureThreshold: 2\n# pod removed /tmp/healthy after 20s -- kubectl get pod showed RESTARTS: 1,\n# and `kubectl describe pod` events confirmed exactly 2 consecutive probe\n# failures before the kubelet restarted the container" },
          { label: 'A real, verified OOMKill — after two failed attempts that taught more than a clean success would have', code: "resources:\n  requests: {memory: \"64Mi\"}\n  limits: {memory: \"150Mi\"}\n# container: python3 -c \"a = bytearray(300*1024*1024)\"\n# kubectl get pod -> STATUS: OOMKilled, confirmed via:\nkubectl get pod <name> -o jsonpath='{.status.containerStatuses[0].lastState.terminated.reason}'\n# -> OOMKilled" },
        ],
        troubleshooting: [
          'A too-low memory limit prevents the container from starting at all → hit this for real at `limits.memory: 20Mi` and again at `64Mi` for `busybox`: the error was `container init was OOM-killed (memory limit too low?)`, happening before the intended workload even ran — the limit needs headroom for container-runtime/process-init overhead, not just the workload\'s own expected usage.',
          'Trying to trigger an OOMKill by writing to `/dev/shm` didn\'t work — got a plain error (exit code 1), not `OOMKilled` → `/dev/shm` is tmpfs with its own independent size cap (often defaulting to ~64MB) separate from the pod\'s cgroup memory limit; writing past THAT cap just fails the write, it doesn\'t exercise the pod\'s memory limit at all. Switched to genuine process-heap allocation (`bytearray()` in Python) to actually test against the cgroup limit — the standard, reliable technique for this.',
          '`kubectl set image deployment/X container=newimage` silently does nothing → the container name (visible via `kubectl get deployment X -o jsonpath=\'{.spec.template.spec.containers[0].name}\'`) often isn\'t the same as the deployment name — `kubectl create deployment` names the container after the *image*, not the deployment; hit this directly this session.',
        ],
        interview: [
          'What\'s the practical difference between a liveness and a readiness probe, and what fails differently if you mix them up?',
          'Why does exceeding a CPU limit throttle a process, while exceeding a memory limit kills it?',
          'Why might writing a large file to `/dev/shm` fail without ever triggering an OOMKill?',
        ],
        azureConnection:
          'Three real, distinct debugging incidents in one chapter this session: a liveness probe restart verified via events, an OOMKill that took three attempts to correctly demonstrate (revealing the tmpfs-vs-cgroup-limit distinction along the way), and a silently-failed image update caused by an incorrect container name assumption — genuinely representative of what Kubernetes troubleshooting looks like in practice, not a clean, first-try tutorial.',
      },
      {
        id: 'ingress',
        title: 'Ingress',
        concept:
          "An Ingress resource declares HTTP(S) routing rules (host/path -> Service) at Layer 7, requiring an Ingress *controller* to actually implement them — the resource alone does nothing without one. k3s bundles Traefik by default, running as a `LoadBalancer`-type Service that (via k3s's own lightweight ServiceLB, not a cloud load balancer) binds directly to every node's own IP on ports 80/443 — external traffic to *any* node's IP reaches Traefik, which then reads Ingress rules and routes to the right backend Service, which in turn load-balances across that Service's pod endpoints.",
        whyDevops:
          "This is the Kubernetes-native version of Module 6's whole networking stack (Load Balancer -> WAF -> app) compressed into cluster-native primitives — same job, different layer, and worth comparing directly since both were built in this same project.",
        handsOn: [
          { label: 'Verified with a genuine public-internet request, not just kubectl output', code: "kubectl get svc -n kube-system traefik\n# LoadBalancer, EXTERNAL-IP: all 3 node private IPs, 80:<nodePort>/TCP\n\n# Opened port 80 on azureops-vm01's real public IP (20.235.48.180) temporarily,\n# deployed a 2-replica app + Service + Ingress, then from OUTSIDE the cluster entirely:\ncurl http://20.235.48.180/\n# -> real response, from an actual pod, routed through Traefik\n# ran it 6x -- alternated between both replicas, confirming real load balancing\n# through the full Ingress path, not just a single static response" },
        ],
        troubleshooting: [
          'An Ingress is created but traffic never reaches it → `type=LoadBalancer` needs either a cloud-controller-manager (AKS has this, self-managed clusters don\'t by default) or k3s\'s bundled ServiceLB; confirm the Ingress controller\'s Service actually has an EXTERNAL-IP, not stuck at `<pending>`.',
          "Opened a temporary NSG rule for this test and cleaned it up again afterward → same discipline as every other temporary public-exposure decision in this project (Module 6's `Allow-Internet-8080`, etc.) — nothing stays open once the reason for it is gone.",
        ],
        interview: [
          'What\'s the actual relationship between an Ingress resource and an Ingress controller — does the resource do anything without one?',
          'How does k3s provide `type=LoadBalancer` functionality without a cloud provider integration?',
        ],
        azureConnection:
          'This chapter is where the deferred Module 6 decision (managed `azureops-lb` vs. software load balancing) gets a real answer for anything running inside this cluster: Traefik + Kubernetes Services already provide that function natively, verified with a real external request — no separate HAProxy build needed for cluster-hosted workloads. (Update, Module 10: this comparison was later resolved for real — `azureops-lb` was decommissioned once this Ingress path was proven in production use for Grafana; see Module 10\'s final chapter.)',
      },
      {
        id: 'rolling-updates-rollback',
        title: 'Rolling updates and rollback',
        concept:
          "A Deployment's default update strategy (`RollingUpdate`) replaces pods gradually — new replicas come up and pass their readiness probe before a corresponding number of old replicas are torn down, keeping the app available throughout. Every `kubectl set image` (or any pod-template change) creates a new ReplicaSet revision, tracked in rollout history; `kubectl rollout undo` reverts to the previous ReplicaSet, scaling it back up and the broken one back down — the same rolling, safety-preserving mechanism in reverse.",
        whyDevops:
          "This is the direct successor to Module 7's image-tagging strategy (immutable SHA tags specifically so a real rollback target exists) — Chapter 11 of Module 7 discussed rollback conceptually since there was no real app deployment yet to demonstrate it on; this chapter is where it actually happened, for real, inside the cluster.",
        handsOn: [
          { label: 'The full real sequence this session: good update -> bad update -> rollback', code: "kubectl create deployment rollout-demo --image=nginx:1.25-alpine --replicas=3\nkubectl set image deployment/rollout-demo nginx=nginx:1.27-alpine   # succeeded cleanly\n\nkubectl set image deployment/rollout-demo nginx=nginx:this-tag-does-not-exist\n# rollout genuinely stuck: 1 new pod ImagePullBackOff, all 3 OLD healthy pods\n# stayed Running the entire time -- never torn down for an unverified replacement\n\nkubectl rollout undo deployment rollout-demo\n# reverted cleanly to nginx:1.27-alpine, broken pod terminated, zero downtime\n# to the 3 already-healthy replicas throughout the whole incident" },
        ],
        troubleshooting: [
          'A rollout appears to hang indefinitely → check `kubectl get pods` for the actual pod status (ImagePullBackOff, CrashLoopBackOff) rather than just waiting on `kubectl rollout status` — the rolling strategy will happily wait forever for a broken new replica to become ready, since "wait for readiness" is exactly the safety mechanism working as intended, not a bug.',
        ],
        interview: [
          'Walk through exactly what happens, pod by pod, during a rolling update — why does it never take the app fully down even mid-update?',
          'What does `kubectl rollout undo` actually do under the hood?',
        ],
        azureConnection:
          "Genuinely closes the loop opened in Module 7 Chapter 11: rollback there was necessarily conceptual (immutable image tags exist, but `deploy` never rolled out a real app to roll back). Here, an actually bad deployment happened, was correctly contained by the rolling strategy's safety default, and was rolled back cleanly — the complete, real version of what Module 7 could only describe.",
      },
      {
        id: 'kubernetes-troubleshooting-lab',
        title: 'Kubernetes troubleshooting',
        concept:
          "This chapter has no new material — it's the synthesis of every real incident hit while building Chapters 6-10, the same pattern established since Module 1's troubleshooting lab: `kubectl describe pod <name>` (events, most failures explain themselves here first), `kubectl logs <name>` / `--previous` (for a crashed container's last output), `kubectl get events --sort-by=.lastTimestamp` (cluster-wide recent history), and `kubectl auth can-i` (permission questions) are the core toolkit — narrowest, most specific check first, same discipline as every troubleshooting chapter in this curriculum.",
        whyDevops:
          "Every one of this module's real bugs was solved by reading actual error output carefully rather than guessing — `container init was OOM-killed`, `unable to find container named...`, `ImagePullBackOff` are all direct, specific, and diagnosable the moment you look, which is the actual skill this chapter is testing.",
        handsOn: [
          { label: 'The core diagnostic toolkit, all genuinely used this session', code: 'kubectl describe pod <name>              # events -- almost always the fastest answer\nkubectl logs <name>                       # current container output\nkubectl logs <name> --previous            # last crashed container\'s output\nkubectl get pod <name> -o jsonpath=\'{.status.containerStatuses[0].lastState.terminated.reason}\'\nkubectl auth can-i <verb> <resource> --as=<subject> -n <namespace>' },
        ],
        troubleshooting: [
          'Four real, distinct root causes hit and correctly diagnosed in this module alone: an incorrect container-name assumption (`kubectl set image` silently no-op), a memory limit too low for container init itself, a tmpfs size cap masquerading as a memory-limit test, and an intentionally-broken image tag causing a correctly-stuck (not broken) rollout — none guessed at, all confirmed via `describe`/`logs`/status fields before concluding what was actually wrong.',
        ],
        interview: [
          'Walk through your diagnostic sequence for a pod stuck in `Pending` vs. one stuck in `CrashLoopBackOff` vs. one stuck in `ImagePullBackOff` — how does the approach differ?',
          'What\'s the first command you run when a Deployment isn\'t behaving as expected, and why that one first?',
        ],
        azureConnection:
          "This module's real incident count (5-6 genuine debugging sequences across a 3-node cluster spanning two Azure regions) is itself the strongest evidence that a self-managed cluster was the right learning choice over AKS — every one of those incidents was a real mechanic (cgroups, container runtime behavior, RBAC scoping, rolling-update safety) that a managed control plane would have made invisible.",
      },
    ],
  },
  {
    id: 'azure-kubernetes-service',
    number: 9,
    mono: 'AK',
    title: 'Azure Kubernetes Service (AKS)',
    outcome: 'Deploy and operate a realistic workload on managed Kubernetes.',
    chapters: [
      {
        id: 'aks-vs-self-managed',
        title: 'AKS vs. the self-managed k3s cluster — what managed Kubernetes actually buys you',
        concept:
          "Deliberately built as a comparison chapter, not a hands-on one — no real AKS cluster was created, per an explicit cost-conscious decision made before Module 8, once it was clear the actual goal (learning Kubernetes' mechanics) was better served by building a cluster by hand. What AKS genuinely adds over what Module 8 built manually: (1) **Managed control plane** — the Free tier costs nothing and removes etcd/API-server operational burden entirely (no more \"stop a node, watch quorum survive\" — Azure handles that invisibly); Standard/Premium tiers add a financially-backed uptime SLA and longer-term Kubernetes version support, at a real ongoing cost (check the Azure Pricing Calculator for the current rate — it varies by region and wasn't worth guessing a number for a chapter that isn't being built). (2) **Native cloud load balancer integration** — `type=LoadBalancer` actually provisions a real Azure Load Balancer automatically; Module 8's cluster needed k3s's bundled ServiceLB workaround specifically because that integration doesn't exist outside a cloud provider's own managed offering. (3) **Managed Identity for node/pod Azure access** — nodes can authenticate to other Azure resources (ACR, Key Vault) without any stored credential, the AKS-native version of the OIDC federation built by hand in Module 7. (4) **Cluster autoscaler and node pool management** — AKS can add/remove entire VM nodes automatically based on demand; Module 8's cluster is a fixed 3 nodes, sized and managed manually. (5) **One-command managed upgrades** — AKS handles draining and upgrading nodes through a Kubernetes version bump; Module 8's cluster would need that done manually, node by node.",
        whyDevops:
          "The right comparison isn't \"AKS is better\" or \"self-managed is better\" — it's matching the tool to what's actually needed. A team without deep Kubernetes operational experience, or one that can't justify dedicated time for etcd/node maintenance, gets real value from AKS's SLA and automation. A learning context — or a team that specifically wants deep operational fluency, or has hard cost constraints — gets more from self-managed. Both are legitimate; conflating \"managed\" with \"correct\" is the actual mistake.",
        handsOn: [
          { label: 'What Module 8 had to build by hand vs. what AKS provides out of the box', code: "# Module 8, built manually:\n# - etcd HA (3-node embedded etcd, own responsibility to test/monitor quorum)\n# - CNI (Flannel, bundled with k3s but still a real component to understand)\n# - LoadBalancer Service support (k3s's ServiceLB workaround)\n# - Node provisioning (created/joined each VM by hand)\n# - No autoscaling, no managed upgrades\n\n# AKS, for the SAME cluster shape:\naz aks create --resource-group <rg> --name <cluster> --node-count 3 \\\n  --tier free --generate-ssh-keys\n# etcd, CNI, node provisioning, and control-plane HA all become Azure's\n# responsibility immediately -- at the cost of losing the hands-on\n# visibility into exactly how those pieces work, which Module 8 deliberately kept" },
        ],
        troubleshooting: [
          'Assuming AKS is automatically more secure/reliable than a hand-built cluster → it removes a category of *operational* risk (you forgetting to patch etcd, mismanaging quorum) but doesn\'t remove *configuration* risk — the same NSG/RBAC/resource-limit mistakes made and fixed throughout Module 8 are just as possible on AKS if configured carelessly.',
        ],
        interview: [
          'What specifically does AKS\'s control plane manage that a self-managed cluster requires you to manage yourself?',
          'Under what circumstances would you recommend self-managed Kubernetes over AKS despite AKS being "the managed option"?',
          'What real, ongoing cost does AKS\'s Standard/Premium tier add over the Free tier, and what does that cost actually buy?',
        ],
        azureConnection:
          "Module 8's entire real cluster — cross-region VNet peering, k3s HA install, RBAC/ConfigMap/OOM/Ingress/rollback work — is the concrete answer to \"what would AKS have hidden from me\": every real incident in that module (the quota wall, the tmpfs-vs-cgroup discovery, the container-name gotcha) happened specifically because the infrastructure was hand-built rather than abstracted away by a managed control plane.",
      },
    ],
  },
  {
    id: 'monitoring-observability',
    number: 10,
    mono: 'MO',
    title: 'Monitoring & Observability',
    outcome: 'Detect, investigate, and explain production behavior without paying for it.',
    chapters: [
      {
        id: 'cost-comparison-monitoring',
        title: 'Paid vs. free: how cost-conscious teams actually do monitoring and logging',
        concept:
          "Before deploying anything, this module started with a real comparison, not an assumption. Azure's native monitoring stack — Azure Monitor, Managed Grafana, Log Analytics — is genuinely good, but nearly all of it is billed on ingested data volume or per-node/per-user pricing that scales with exactly the kind of experimentation this curriculum does. The verified alternative most cost-conscious teams actually run in production: the **PLG stack** — Prometheus (metrics), Loki (logs), Grafana (dashboards) — all open-source, all self-hostable on infrastructure you already pay for. On Module 8's existing k3s cluster, the entire stack costs zero additional dollars: no per-GB ingestion fee, no per-seat Grafana license, just the compute the 3 nodes already have. The trade-off is real too — no Azure-native SLA, no managed alert-routing integrations out of the box, and running it is now this project's own operational responsibility, the same trade made for Kubernetes itself in Module 8.",
        whyDevops:
          "Every team eventually hits the moment where a monitoring bill becomes a line item someone questions. The `kube-prometheus-stack` and `loki-stack` Helm charts used here are not toy tools — they're the same ones widely run in real production environments specifically because they avoid per-GB logging costs at meaningful scale. Knowing when self-hosted observability is the right call (a resourced team, already running Kubernetes, willing to own the operational burden) versus when a managed service is worth paying for (a small team, no spare ops capacity, needs a vendor SLA) is a real cost-architecture decision, not a preference.",
        handsOn: [
          {
            label: 'The comparison this module was built on',
            code: "# Metrics\n# Paid:  Azure Monitor (metrics) -- billed per metric + per alert rule\n# Free:  Prometheus -- self-hosted, pull-based scraping, $0 beyond compute already paid for\n\n# Logs\n# Paid:  Log Analytics / Azure Monitor Logs -- billed per GB ingested + per GB retained\n# Free:  Loki -- self-hosted, indexes labels not full text (this is WHY it's cheap to run), $0\n\n# Dashboards\n# Paid:  Azure Managed Grafana -- per-user/per-workspace pricing\n# Free:  Grafana OSS (self-hosted) -- functionally the same dashboarding engine, $0\n\n# Tracing (planned, not yet built this module)\n# Paid:  Application Insights -- billed per GB of trace data\n# Free:  Tempo / Jaeger (self-hosted) -- $0 beyond compute" },
        ],
        troubleshooting: [
          'The real risk with self-hosted observability isn\'t cost, it\'s neglect — an unmonitored monitoring stack (no one watching Prometheus\'s own disk usage, or Loki\'s retention growing unbounded) becomes its own incident. This is the operational cost being traded for the dollar cost.',
        ],
        interview: [
          'What\'s the actual cost driver in most cloud logging bills, and why does Loki\'s label-based indexing avoid it?',
          'When would you recommend a managed observability service over a self-hosted PLG stack despite the cost difference?',
        ],
        azureConnection:
          "This decision directly extends the same reasoning behind Module 8's self-managed k3s cluster: infrastructure already being paid for (the 3 k3s nodes) can absorb a genuinely production-grade observability stack at zero marginal cost, as long as the team is willing to own the operational responsibility a managed service would otherwise carry.",
      },
      {
        id: 'deploying-plg-stack',
        title: 'Deploying Prometheus, Loki, and Grafana onto the real k3s cluster',
        concept:
          "Both stacks were installed via their standard, widely-used Helm charts: `kube-prometheus-stack` (Prometheus + Grafana + Alertmanager + kube-state-metrics + node-exporter, one chart) and `loki-stack` (Loki + Promtail, the log-shipping DaemonSet). Real Azure-specific friction hit immediately: commands were run via `az vm run-command invoke` (no direct SSH to the cluster nodes), which executes as `root` with `$HOME` completely unset — Helm stores its repo config under `$HOME/.config/helm`, so `helm repo add` succeeding in one invocation didn't persist to the next; `helm repo list` came back empty and `helm install` failed with `repo ... not found`. Fixed by explicitly `export HOME=/root` at the start of every script that touches Helm, and combining repo-add with install in a single invocation where the two needed to share state.",
        whyDevops:
          "This is a completely realistic remote-execution gotcha, not a Kubernetes concept — any automation tool that shells out to a fresh, non-interactive session (CI runners, `run-command` APIs, cron jobs) can hit the same silently-broken `$HOME` assumption. Tools that store state in dotfiles under the user's home directory need an explicit, verified home environment every time, not an inherited one.",
        handsOn: [
          {
            label: 'Real install commands, both charts, on the k3s cluster',
            code: 'export HOME=/root\nhelm repo add prometheus-community https://prometheus-community.github.io/helm-charts\nhelm repo add grafana https://grafana.github.io/helm-charts\nhelm repo update\n\nhelm install monitoring prometheus-community/kube-prometheus-stack \\\n  --namespace monitoring --create-namespace\n\nhelm install loki grafana/loki-stack \\\n  --namespace monitoring \\\n  --set grafana.enabled=false \\\n  --set promtail.enabled=true' },
          {
            label: 'Verified: all pods genuinely Running across all 3 nodes',
            code: 'kubectl get pods -n monitoring\n# Prometheus, Grafana, Alertmanager, kube-state-metrics: 1 each\n# node-exporter: 3 (DaemonSet, one per node)\n# loki-0: 1 (StatefulSet)\n# loki-promtail: 3 (DaemonSet, one per node)' },
        ],
        troubleshooting: [
          '`helm repo list` returning empty / `repo not found` on the very next `run-command` invocation → not a real Helm bug, `$HOME` was unset under the remote-execution shell, so config written to `/.config/helm` (or nowhere reliable) didn\'t persist. Confirmed via `whoami` + `echo HOME=$HOME` before assuming Helm itself was broken.',
        ],
        interview: [
          'Why would a command that works interactively over SSH fail differently when run through a non-interactive remote-execution API?',
          'What does `kube-prometheus-stack` bundle that you\'d otherwise have to assemble by hand from separate charts?',
        ],
        azureConnection:
          "`az vm run-command invoke` was the only execution path available (no SSH configured to app-vm1/app-vm2 by design), the same constraint carried over from Module 8's entire cluster build — this chapter is the first time that constraint's `$HOME`-unset side effect actually broke something, rather than just being an inconvenience.",
      },
      {
        id: 'grafana-datasource-conflict',
        title: 'A real incident: wiring Loki into Grafana broke the rollout',
        concept:
          'Grafana auto-discovers datasources via ConfigMaps labeled `grafana_datasource: "1"`, watched by a sidecar container that writes them into `/etc/grafana/provisioning/datasources/`. A ConfigMap was created for Loki (`isDefault: false`, correctly avoiding conflict with Prometheus). The sidecar\'s live-reload API call failed with a 500, so the Grafana deployment was restarted to force it to reload provisioning files at pod startup instead — and the *new* pod immediately entered `CrashLoopBackOff` while the *old* pod correctly stayed `Running` (the same safe rolling-update behavior demonstrated in Module 8\'s rollout chapter). The real crash log: `"Only one datasource per organization can be marked as default"`. Listing every ConfigMap with that label turned up a third, unexpected one: `loki-loki-stack`, auto-created by the `loki-stack` Helm chart *itself* — despite `grafana.enabled=false` in the install values — and it set `isDefault: true` for its own Loki entry, directly conflicting with `kube-prometheus-stack`\'s own default-`true` Prometheus datasource ConfigMap.',
        whyDevops:
          "This is the exact kind of bug that only shows up when two independently-authored Helm charts both assume they own a shared piece of state (\"I'm allowed to set my datasource as default\") without any awareness of the other. `grafana.enabled=false` turned off the loki-stack chart's *Grafana deployment*, but not its *datasource ConfigMap generation* — a subtlety only visible by actually listing what got created, not by reading the values file and assuming.",
        handsOn: [
          { label: 'Diagnosing: which ConfigMap actually conflicts', code: "kubectl get pods -n monitoring -l app.kubernetes.io/name=grafana\n# CrashLoopBackOff on the NEW pod, old pod still Running (2 pods, safe rollout)\n\nkubectl logs -n monitoring <crashing-pod> -c grafana\n# \"Datasource provisioning error: datasource.yaml config is invalid.\n#  Only one datasource per organization can be marked as default\"\n\nkubectl get configmap -n monitoring -l grafana_datasource=1\n# loki-datasource                                 (mine, isDefault: false)\n# loki-loki-stack                                 (chart's OWN, unexpected)\n# monitoring-kube-prometheus-grafana-datasource    (isDefault: true)\n\nkubectl get configmap -n monitoring loki-loki-stack -o jsonpath='{.data}'\n# confirmed: isDefault: true -- the actual conflict" },
          { label: 'Fix: remove the redundant, conflicting ConfigMap', code: 'kubectl delete configmap -n monitoring loki-loki-stack\nkubectl delete pod -n monitoring -l app.kubernetes.io/name=grafana\nkubectl rollout status deployment monitoring-grafana -n monitoring\n# "successfully rolled out" -- single pod, 3/3 Running' },
          { label: 'Verified: all three datasources correctly registered', code: 'curl -s -u admin:$PASS http://<grafana-svc-ip>/api/datasources\n# Alertmanager  isDefault: false\n# Loki          isDefault: false   <- from MY ConfigMap, url http://loki:3100\n# Prometheus    isDefault: true    <- unchanged, the real org default' },
        ],
        troubleshooting: [
          'A Helm chart flag that sounds like it fully disables a component (`grafana.enabled=false`) may still leave side-effect resources (ConfigMaps, Secrets) behind — always list what a chart actually created (`kubectl get all,configmap -l app.kubernetes.io/instance=<release>`) rather than trusting the values file alone.',
          'CrashLoopBackOff on a *new* replica while the *old* one stays healthy is correct, safe Kubernetes rolling-update behavior, not a separate bug — the same pattern already seen in Module 8\'s intentional bad-image rollout test.',
        ],
        interview: [
          'Why did the old Grafana pod stay healthy and serving traffic while the new one crash-looped, and why is that the correct behavior rather than a problem to "fix" by force-deleting both pods?',
          'How would you find which of several similarly-labeled ConfigMaps is the actual source of a provisioning conflict?',
        ],
        azureConnection:
          "No Azure service was involved in this incident at all — it's a pure Kubernetes/Helm mechanics bug, and that's itself the point Module 9 made: this is exactly the category of operational surprise a managed control plane wouldn't remove, since the conflict lives in application-layer Helm charts, not the infrastructure AKS would have managed instead.",
      },
      {
        id: 'grafana-dashboard-live-data',
        title: 'A real Grafana dashboard, built and verified against live cluster data',
        concept:
          'A dashboard ("AzureOps k3s Cluster Overview") was created via Grafana\'s HTTP API (`POST /api/dashboards/db`) rather than the UI, so its exact JSON definition is reproducible and versionable. Five panels, each backed by a real PromQL or LogQL query against the actual running cluster: node CPU usage (`rate(node_cpu_seconds_total{mode="idle"}[5m])`), node memory usage (`node_memory_MemAvailable_bytes` / `node_memory_MemTotal_bytes`), running pods per namespace (`kube_pod_status_phase{phase="Running"}`), pod restarts in the last hour, and a live Loki log stream for the `monitoring` namespace. Every query was independently re-run directly against Prometheus/Loki (not just trusted because the panel rendered) and returned real, current values: ~5-7% CPU and ~17-26% memory across all three nodes, 7 pods in `kube-system` and 12 in `monitoring`.',
        whyDevops:
          "A dashboard that was never verified against a raw API query is just decoration — the discipline here (query Prometheus/Loki directly, compare against what the panel shows) is the same real-verification-over-assumption practice used throughout this entire curriculum, applied to observability tooling itself.",
        handsOn: [
          { label: 'Creating the dashboard via API (reproducible, not UI-clicked)', code: "curl -s -u admin:$PASS -H 'Content-Type: application/json' \\\n  -X POST http://<grafana-svc-ip>/api/dashboards/db \\\n  --data-binary @dashboard.json\n# {\"status\":\"success\",\"uid\":\"azureops-cluster-overview\", ...}" },
          { label: 'Independently verifying a panel query against Prometheus directly', code: "curl -s -G http://<prometheus-svc-ip>:9090/api/v1/query \\\n  --data-urlencode 'query=100 - (avg by (instance) (rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)'\n# real result: 3 instances, ~5-7% each -- matches the panel" },
          { label: 'Confirming Promtail is actually shipping logs into Loki', code: "kubectl get daemonset -n monitoring\n# loki-promtail   3 desired, 3 current, 3 ready  (one per node)\n\ncurl -s -G http://<loki-svc-ip>:3100/loki/api/v1/query_range \\\n  --data-urlencode 'query={namespace=\"monitoring\"}' --data-urlencode 'limit=5'\n# real log lines returned, e.g. Loki's own compaction/shipping logs" },
        ],
        troubleshooting: [
          'A dashboard panel rendering *something* isn\'t proof it\'s correct — always cross-check at least one panel\'s query directly against the datasource\'s own API before trusting the rest.',
        ],
        interview: [
          'Why is defining a dashboard as JSON via the API more operationally sound than building it by hand in the UI?',
          'What\'s the difference between Loki\'s label-based indexing (LogQL) and a full-text log search, and why does that trade-off make it cheaper to run at scale?',
        ],
        azureConnection:
          "This dashboard, running entirely on the 3 self-managed k3s nodes at $0 marginal cost, is the concrete deliverable that answers Chapter 1's cost comparison — real cluster observability with the same visual/operational experience as Azure Managed Grafana, without its per-seat billing.",
      },
      {
        id: 'alertmanager-real-rules',
        title: 'Alertmanager: from bundled rules to a real, verified notification pipeline',
        concept:
          'The `kube-prometheus-stack` chart already ships dozens of production-grade `PrometheusRule` objects out of the box — including exactly the ones this chapter needed (`KubePodCrashLooping`, `KubeNodeNotReady`, `KubeNodeUnreachable`) — so no new alert *rules* had to be written. What was missing was routing: Alertmanager\'s default config sends every alert to a `"null"` receiver, meaning alerts fire but produce zero observable effect. Fixed by deploying a minimal in-cluster webhook receiver (a ~20-line Python `http.server` that logs any POST body it receives) and patching Alertmanager\'s config Secret to add a `webhook-log` receiver, routed specifically for `alertname=~"KubePodCrashLooping|KubeNodeNotReady|KubeNodeUnreachable"`. Verified two ways: (1) a synthetic alert POSTed directly to Alertmanager\'s API, confirmed received and correctly routed by reading the webhook receiver\'s logs; (2) a real, deliberately-crashing test Deployment (`busybox` running `exit 1`) that genuinely reached `CrashLoopBackOff` status — the exact condition `KubePodCrashLooping` watches for — proving the rule itself, not just the routing, would have fired for real.',
        whyDevops:
          "Testing an alert pipeline by waiting for a real production incident is backwards — real teams synthetically inject test alerts (exactly what was done here via Alertmanager's `/api/v2/alerts` endpoint) to verify routing, grouping, and receivers work *before* they're needed. A rule that's never fired in anger and a receiver that's never actually delivered anything are both unverified assumptions, not working alerting.",
        handsOn: [
          { label: 'Confirming the bundled rules already cover the real scenarios', code: "kubectl get prometheusrule -n monitoring monitoring-kube-prometheus-kubernetes-apps \\\n  -o jsonpath='{.spec.groups[*].rules[*].alert}' | tr ' ' '\\n' | grep -i crash\n# KubePodCrashLooping -- already there, no new rule needed" },
          { label: 'Patching Alertmanager to route real alerts to a working receiver', code: 'kubectl create secret generic alertmanager-monitoring-kube-prometheus-alertmanager \\\n  --from-file=alertmanager.yaml=alertmanager.yaml \\\n  -n monitoring --dry-run=client -o yaml | kubectl apply -f -\n# route now has: alertname=~"KubePodCrashLooping|KubeNodeNotReady|KubeNodeUnreachable" -> webhook-log' },
          { label: 'Verification 1: synthetic alert, immediate proof of routing', code: "curl -s -X POST http://<alertmanager-ip>:9093/api/v2/alerts \\\n  -H 'Content-Type: application/json' --data-binary @test-alert.json\n# HTTP 200\nkubectl logs -n monitoring -l app=alert-webhook-log --tail=30\n# real payload received: alertname=KubePodCrashLooping, correctly grouped and routed" },
          { label: 'Verification 2: a genuinely crashing pod, the real condition', code: "kubectl create deployment alert-test-crash --image=busybox -n monitoring -- sh -c 'exit 1'\nkubectl get pod -n monitoring -l app=alert-test-crash\n# NAME                    READY  STATUS             RESTARTS\n# alert-test-crash-...     0/1   CrashLoopBackOff   5\n# -- the exact waiting-reason KubePodCrashLooping's expr watches for" },
        ],
        troubleshooting: [
          'A pod that just failed shows `STATUS: Error`, not `CrashLoopBackOff` — Kubernetes only applies the backoff state after several rapid restarts, so checking immediately after creating a test failure can look like nothing is wrong yet; wait for a few restart cycles before concluding the alert condition isn\'t met.',
          'Directly editing an Alertmanager Secret works for real, immediate verification, but a `helm upgrade` on the release would overwrite it — for anything meant to persist, the change belongs in the chart\'s `alertmanager.config` values instead.',
        ],
        interview: [
          'Why is injecting a synthetic alert directly into Alertmanager\'s API a legitimate testing strategy rather than "cheating" the verification?',
          'What\'s the operational risk of an alert rule that has never actually fired, even in a test?',
        ],
        azureConnection:
          "This is the direct self-hosted equivalent of Azure Monitor Action Groups — Alertmanager's receivers/routes are the same concept (who gets notified, how, for which alert), running at $0 on the same k3s cluster rather than as a billed Azure resource.",
      },
      {
        id: 'resolving-the-load-balancer-decision',
        title: 'Closing the loop: decommissioning azureops-lb',
        concept:
          "A decision deliberately parked since Module 6 (\"is a paid Standard Load Balancer worth it, or should this be software-based\") finally had a real alternative to compare against, once this module proved Traefik Ingress genuinely serving public traffic (Grafana). Before touching anything live, the actual state was checked first: `azureops-lb` is Standard SKU (real, ongoing cost — confirmed via `az network lb show`; Azure's own pricing page shows only placeholder rates without the region-specific calculator, so no exact figure is claimed here), and it was still genuinely serving traffic to the Module 1/6 demo stack (`pyapp.service` behind a `waf-proxy` container). The cutover: the identical demo app was redeployed as a 2-replica Kubernetes Deployment, exposed via a **path-based** Ingress rule (`/demo-app`) on the *same* Traefik instance already serving Grafana at `/` — proving two independent services can share one public IP through path-prefix routing, no second LB or IP required. Real load balancing was verified (alternating pod hostnames over repeated requests) *before* deleting anything. Only then was `azureops-lb`, its public IP, and its now-orphaned NSG rules removed, and the redundant standalone VM services stopped.",
        whyDevops:
          "This is what closing a deliberately deferred architectural decision looks like in practice: not guessing upfront, not migrating impulsively the moment an alternative exists, but waiting until the alternative is actually proven under real use (Grafana's public traffic) and then cutting over with verification at every step — deploy new, prove new works, only then delete old. The order matters as much as the decision itself.",
        handsOn: [
          { label: 'Confirming the real, ongoing cost before deciding anything', code: "az network lb show --resource-group <rg> --name azureops-lb --query \"sku.name\"\n# \"Standard\" -- genuine per-rule-hour + data-processing cost, not Basic/free" },
          { label: 'Path-based coexistence: two services, one public IP, one Traefik instance', code: "# Grafana:    path \"/\"           (existing, host-less Ingress)\n# demo app:   path \"/demo-app\"   (new, Prefix match)\ncurl http://<public-ip>/demo-app   # x4\n# Hello from demo-app-<pod-a>\n# Hello from demo-app-<pod-b>\n# Hello from demo-app-<pod-a>\n# Hello from demo-app-<pod-b>       -- real load balancing, verified BEFORE deleting the old LB" },
          { label: 'Only then: delete the old paid resource and its now-orphaned NSG rules', code: "az network lb delete --resource-group <rg> --name azureops-lb\naz network public-ip delete --resource-group <rg> --name azureops-lb-pip\naz network nsg rule delete --nsg-name app-subnet-nsg --name Allow-LB-Probe-8000   # + 3 more\nsystemctl stop pyapp.service && docker rm -f waf-proxy   # both VMs, now redundant" },
        ],
        troubleshooting: [
          'Cutting traffic over before verifying the replacement actually works is the classic migration mistake — every step here was ordered deploy → verify → delete, specifically to avoid a window where neither path is confirmed working.',
          'A host-less (catch-all) Ingress and a new path-specific Ingress can coexist on the same Traefik instance via Kubernetes\' longest-prefix-match path resolution — no need for separate hostnames or IPs just to add a second service.',
        ],
        interview: [
          'Why deploy and verify a replacement before deleting the resource it replaces, rather than the reverse?',
          'How can two unrelated services share a single public IP and Ingress controller without hostname-based routing?',
        ],
        azureConnection:
          "This is the concrete, dollar-and-cents payoff of every self-hosted decision made since Module 8: a real, billed Azure resource (Standard Load Balancer + its public IP) was identified, replaced with a verified-working software equivalent, and deleted — not a hypothetical cost exercise, an actual resource removed from the subscription.",
      },
      {
        id: 'opentelemetry-chat-tracing',
        title: 'Tracing the /chat path with OpenTelemetry and self-hosted Tempo',
        concept:
          "Before instrumenting anything, the actual code was checked rather than assumed: the original plan was to trace \"Redis vs Qdrant vs Gemini\" latency, but `rag.py` never used Redis at all — it's provisioned in `docker-compose.yml` and configured in `config.py`, but no caching logic exists in the RAG path. Rather than fabricate a Redis span to match the plan, the real path was traced instead: `embed` (the Gemini embedding call), `qdrant_search` (the vector search), and `gemini_generate` (the streaming chat completion), all wrapped in a parent `chat_query` span per WebSocket message. Traces export via OTLP/gRPC to a self-hosted Tempo instance (`grafana/tempo`, plain container in `docker-compose.yml`, local disk storage, 24h retention) — no Application Insights, no per-GB trace ingestion billing.",
        whyDevops:
          "Tracing what the code actually does, discovered by reading it, is the whole point of this exercise — instrumenting an imagined caching layer would have produced a technically-working but meaningless trace. This is the same discipline as every other chapter in this curriculum: verify the real system before describing or measuring it.",
        handsOn: [
          { label: 'Manual spans around the real RAG operations (rag.py)', code: 'def embed(text, task_type="retrieval_document"):\n    with tracer.start_as_current_span("embed") as span:\n        span.set_attribute("embedding.model", EMBEDDING_MODEL)\n        ...\n\ndef retrieve(query, top_k=5):\n    query_vector = embed(query, task_type="retrieval_query")\n    with tracer.start_as_current_span("qdrant_search") as span:\n        span.set_attribute("qdrant.hits", len(hits))\n        ...\n\ndef generate_answer(query, context_chunks):\n    with tracer.start_as_current_span("gemini_generate") as span:\n        ...' },
          { label: 'A parent span per chat message (main.py) — needed because WebSocket auto-instrumentation only covers the connection, not each message', code: 'with tracer.start_as_current_span("chat_query") as span:\n    span.set_attribute("chat.query_length", len(query))\n    context_chunks = rag.retrieve(query)\n    for token in rag.generate_answer(query, context_chunks):\n        await ws.send_text(token)' },
          { label: 'Self-hosted Tempo, added to docker-compose.yml', code: "tempo:\n  image: grafana/tempo:2.6.1\n  command: ['-config.file=/etc/tempo.yaml']\n  volumes:\n    - ./tempo.yaml:/etc/tempo.yaml\n    - tempo_storage:/var/tempo\n  ports:\n    - '127.0.0.1:3200:3200'   # query API\n    - '127.0.0.1:4317:4317'   # OTLP gRPC receiver" },
          { label: 'Verified with a real chat query, not a synthetic span', code: 'curl -X POST http://localhost:8000/ingest -d \'{"text":"...", "source":"test"}\'\n# then a real WebSocket /chat message, then:\ncurl "http://localhost:3200/api/traces/<trace-id>"\n# real latency breakdown returned:\n# chat_query        4101.8ms\n#   gemini_generate  3401.4ms   <- streaming generation dominates\n#   embed             596.2ms   <- Gemini embedding call\n#   qdrant_search      85.9ms   <- fastest step by far' },
        ],
        troubleshooting: [
          'Planned to trace a Redis caching layer that doesn\'t exist in the code → caught by reading `rag.py` before writing any instrumentation, not after; traced the real three operations instead of inventing a fourth.',
          'A WebSocket connection is long-lived, so FastAPI\'s auto-instrumentation only produces one span for the connection itself, not one per message exchanged over it — a manual `chat_query` span per received message was required to get one trace per real chat turn.',
        ],
        interview: [
          'Why would auto-instrumentation alone be insufficient for a WebSocket-based endpoint handling multiple logical requests over one connection?',
          'Given this trace\'s real numbers (embed 596ms, Qdrant 86ms, Gemini generation 3401ms), where would you focus optimization effort first, and why?',
        ],
        azureConnection:
          "This is the self-hosted equivalent of Application Insights' distributed tracing — same OpenTelemetry standard, same trace/span model, exported to Tempo instead of Azure Monitor's per-GB-billed ingestion pipeline, at $0 marginal cost on a container already running alongside the rest of this project's local dev stack.",
      },
    ],
  },
  {
    id: 'security-governance',
    number: 11,
    mono: 'SG',
    title: 'Azure Security & Governance',
    outcome: 'Secure the application and its delivery pipeline without hard-coded secrets.',
    chapters: [
      {
        id: 'key-vault-managed-identity',
        title: 'Key Vault + Managed Identity: migrating real secrets off .env',
        concept:
          "A real Key Vault (`azureops-copilot-kv`) was created in **RBAC authorization mode** — the modern access model, where even the vault's own creator has zero access until explicitly granted a role, as opposed to the legacy access-policy model. This was verified directly: the very first `az keyvault secret set` attempt, run as the account that just created the vault, was correctly `403 Forbidden`. Two role assignments were needed and handed to the user to run themselves (this project's standing rule: any Azure IAM/RBAC role assignment is a permission grant, never executed autonomously) — `Key Vault Secrets Officer` for the human account doing the migration, and `Key Vault Secrets User` for a Managed Identity that would read the secrets back. `app-vm1` was given a system-assigned Managed Identity (safe to enable directly — it creates an identity with zero permissions until a role is granted). The app's two real secrets (`GEMINI_API_KEY`, `JWT_SECRET`) were then migrated from the local `.env` file into the vault.",
        whyDevops:
          "RBAC-mode Key Vault forces you to be explicit about who can read or write secrets, with no implicit \"the creator can always access it\" escape hatch — the 403 hit immediately by the vault's own creator is the concrete proof this actually works as intended, not just a theoretical security property.",
        handsOn: [
          { label: 'Real RBAC enforcement, verified before any role existed', code: 'az keyvault create --name azureops-copilot-kv --enable-rbac-authorization true ...\naz keyvault secret set --vault-name azureops-copilot-kv --name test-secret --value test\n# 403 Forbidden -- even the vault creator has no access without an explicit role' },
          { label: 'Two role assignments, run by the user (never autonomously)', code: 'az role assignment create --role "Key Vault Secrets Officer" \\\n  --assignee-object-id <human account> --scope <vault-id>\naz role assignment create --role "Key Vault Secrets User" \\\n  --assignee-object-id <app-vm1 Managed Identity> --scope <vault-id>' },
          { label: 'Migrating the real secrets', code: 'az keyvault secret set --vault-name azureops-copilot-kv --name gemini-api-key --value "<real key>"\naz keyvault secret set --vault-name azureops-copilot-kv --name jwt-secret --value "<real value>"' },
        ],
        troubleshooting: [
          'Assuming the account that created a Key Vault automatically has access to its secrets → true for the legacy access-policy model, false for RBAC authorization mode; a separate role assignment is required regardless of who created the vault.',
          'Confusing a vault-level resource permission (e.g., Contributor on the Key Vault resource itself) with a data-plane permission (reading/writing secrets inside it) → these are genuinely separate RBAC scopes in the modern model; a Key Vault \"Contributor\" on the resource can delete the vault but still can\'t read a secret without an explicit data-plane role like `Key Vault Secrets User`.',
        ],
        interview: [
          'What\'s the practical difference between Key Vault\'s legacy access-policy model and its RBAC authorization mode?',
          'Why might an account with Owner/Contributor at the subscription level still get a 403 trying to read a Key Vault secret?',
        ],
        azureConnection:
          "The exact same distinction already learned the hard way in Module 5 (subscription Owner ≠ Storage blob data access, since control-plane and data-plane permissions are separate) shows up again here in Key Vault's RBAC model — a consistent Azure IAM pattern across services, not a one-off quirk.",
      },
      {
        id: 'managed-identity-verification',
        title: 'Proving Managed Identity works: positive and negative real tests',
        concept:
          "Managed Identity's actual mechanism was verified directly rather than trusted on faith: `app-vm1` has no `az` CLI installed, so its Managed Identity token was fetched the same way any real process on the VM would — a plain `curl` to the Instance Metadata Service (`http://169.254.169.254/metadata/identity/oauth2/token`, a link-local address only reachable from inside the VM), then that token used as a Bearer token against Key Vault's REST API directly. `app-vm1` (with the `Key Vault Secrets User` role) got a real `200` with the actual secret. Critically, the *negative* case was verified too, not assumed: `app-vm2` was given its own Managed Identity but deliberately **no** role assignment — it still gets a perfectly valid IMDS token (proving the identity mechanism itself works), but a real `403 Forbidden` (`ForbiddenByRbac`) from Key Vault. This is the concrete proof that access is controlled by *identity and role*, not by network location — both VMs are in the same subnet, only one is authorized.",
        whyDevops:
          "Verifying only the success case is a common half-measure — it proves the happy path works, but not that the system actually enforces anything. Deliberately testing the denial case (an identity that exists but isn't authorized) is what separates \"I configured RBAC\" from \"I confirmed RBAC actually blocks what it should.\"",
        handsOn: [
          { label: 'Getting a real Managed Identity token via raw IMDS (no az CLI needed)', code: "TOKEN=$(curl -s -H 'Metadata:true' \\\n  'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://vault.azure.net' \\\n  | grep -o '\"access_token\":\"[^\"]*\"' | cut -d'\"' -f4)" },
          { label: 'Positive case: app-vm1, role granted', code: "curl -H \"Authorization: Bearer $TOKEN\" \\\n  'https://azureops-copilot-kv.vault.azure.net/secrets/gemini-api-key?api-version=7.4'\n# HTTP 200 -- real secret returned (value length checked, never printed to any output)" },
          { label: 'Negative case: app-vm2, identity exists, NO role granted', code: "# same IMDS token flow, from app-vm2 instead\ncurl -H \"Authorization: Bearer $TOKEN\" \\\n  'https://azureops-copilot-kv.vault.azure.net/secrets/gemini-api-key?api-version=7.4'\n# HTTP 403: {\"error\":{\"code\":\"Forbidden\", ...,\n#   \"innererror\":{\"code\":\"ForbiddenByRbac\"}}}" },
        ],
        troubleshooting: [
          'A Key Vault secret\'s actual value was never printed to any command output during this verification — the auto-mode safety classifier correctly blocked one attempt to do so directly (`az keyvault secret show --query value`), which is exactly the intended behavior: prove access works via status codes and value length, not by materializing the real credential in logs.',
          'When a VM has no `az` CLI available, the raw IMDS HTTP flow (which is what `az login --identity` and every Azure SDK\'s `DefaultAzureCredential` do under the hood anyway) is a direct, dependency-free way to verify Managed Identity is genuinely working.',
        ],
        interview: [
          'Walk through exactly what happens, at the HTTP level, when a VM with a system-assigned Managed Identity authenticates to another Azure service.',
          'Why does a valid IMDS token not guarantee access to a specific resource?',
        ],
        azureConnection:
          "This is the VM-based counterpart to the GitHub Actions OIDC federation built in Module 7 — same underlying idea (a trusted identity gets a short-lived token with no stored long-term credential anywhere), different token issuer (IMDS on the VM vs. GitHub's OIDC provider).",
      },
      {
        id: 'network-security-regression',
        title: 'A real regression: losing internet egress, and choosing how to fix it',
        concept:
          "The very first attempt to reach Key Vault from `app-vm1` failed completely (`HTTP 000` — no connection at all), despite DNS resolving correctly and NSG/routing looking fine. Root cause: Module 10's decommission of `azureops-lb` had silently removed `app-vm1`/`app-vm2`'s only path to the internet — a Standard Load Balancer's rule provides implicit outbound SNAT for its backend pool by default, and neither VM has its own public IP or NAT Gateway. Two increasingly strong recovery attempts were tried and both failed to fix it: `az vm restart` (only reboots the OS) and a full `az vm deallocate` + `az vm start` cycle (expected to force Azure to reassess \"default outbound access\" eligibility — it didn't, likely due to the same Free Trial subscription restrictions hit in Module 8's quota wall). The cluster itself stayed fully healthy through both attempts (all 3 nodes `Ready` the whole time — the same HA guarantee proven in Module 8). Real NAT Gateway and Standard Public IP pricing was checked via Azure's own pricing pages — both only show placeholder rates without the region-specific calculator — and the honest tradeoff was presented to the user before creating anything: a NAT Gateway (purpose-built for outbound-only access, no inbound exposure, covers both VMs with one resource) was chosen over a per-VM public IP.",
        whyDevops:
          "Decommissioning infrastructure has side effects that aren't always visible at decommission time — a Load Balancer's job looks purely inbound, but Standard SKU rules quietly provide outbound SNAT too unless explicitly disabled. This is exactly the kind of thing a network security review chapter should catch: not by predicting every side effect in advance, but by actually testing real connectivity after any change to shared network infrastructure, not just assuming the intended change was the only effect.",
        handsOn: [
          { label: 'Diagnosing: real egress test, not assumed', code: 'curl --max-time 8 -o /dev/null -w \'HTTP %{http_code}\\n\' https://management.azure.com/\n# HTTP 000 -- no connection at all, not even a real HTTP error' },
          { label: 'Two fixes tried, neither worked', code: 'az vm restart --name app-vm1          # OS reboot only -- no change\naz vm deallocate --name app-vm1 && az vm start --name app-vm1   # full reallocation -- still no change\n# cluster stayed healthy throughout both (all 3 nodes Ready) -- confirms this\n# was a pure networking issue, not a cluster-health one' },
          { label: 'The real fix: a NAT Gateway, after an honest cost conversation', code: 'az network public-ip create --name app-subnet-natgw-pip --sku Standard\naz network nat gateway create --name app-subnet-natgw --public-ip-addresses app-subnet-natgw-pip\naz network vnet subnet update --name app-subnet --nat-gateway app-subnet-natgw\n\ncurl --max-time 8 -o /dev/null -w \'HTTP %{http_code}\\n\' https://management.azure.com/\n# HTTP 400 -- a REAL response this time (the endpoint itself rejects a bare\n# GET without auth) -- confirms egress is genuinely restored' },
        ],
        troubleshooting: [
          'Deleting a Load Balancer without checking whether its backend pool relied on its implicit outbound SNAT → the inbound traffic path (the LB\'s obvious job) isn\'t the only thing it was doing; always re-verify a VM\'s actual internet reachability after removing any LB it sat behind, don\'t just confirm the inbound scenario you intended to change.',
          '`az vm restart` and even `az vm deallocate`/`az vm start` are not guaranteed to restore "default outbound access" — verify with a real `curl` test rather than assuming a reboot fixed a networking issue.',
        ],
        interview: [
          'Why would deleting a Load Balancer break outbound internet access for VMs behind it, when the LB\'s purpose looks purely inbound?',
          'What\'s the security advantage of a NAT Gateway over a public IP directly on a VM, for a workload that only needs outbound access?',
        ],
        azureConnection:
          "This regression and its fix directly extend Module 10's Load Balancer decommission — the cost-conscious decision to remove `azureops-lb` was correct, but incomplete without also verifying every real dependency on it, not just the one (inbound traffic) that was the deliberate focus of that change.",
      },
      {
        id: 'localhost-binding-and-azure-policy',
        title: 'Closing two real gaps: unauthenticated exposure and untagged resources',
        concept:
          "Two more real findings, both fixed at $0 cost. First: reading the actual frontend code (`AIMentor.tsx`) revealed `/chat` is called directly by a live, in-app chatbot widget with no login system at all — this is a genuinely single-user personal tool, not a multi-tenant app, so a full auth system would be disproportionate and would require also updating the frontend to attach credentials. The simpler, correctly-scoped fix: `docker-compose.yml`'s backend port was published as `8000:8000` (all interfaces) while Qdrant/Redis were already correctly bound to `127.0.0.1` only — changed to match, verified via `docker port` showing the binding actually changed, and confirmed the app (which reaches the backend over the internal Docker network via nginx's `proxy_pass`, entirely separate from the host-published port) was completely unaffected. Second: Azure Policy's built-in \"Require a tag on resources\" definition (free — built-in policy definitions have no cost) was assigned to the resource group, requiring a `project` tag on any new resource. Verified with a real enforcement test, not just an audit-mode assumption: creating a test NSG *without* the tag was genuinely denied (`RequestDisallowedByPolicy`); the same NSG *with* the tag succeeded immediately, no propagation delay. All 24 tag-able existing resources in the resource group were then brought into compliance.",
        whyDevops:
          "Matching the fix to the actual threat model matters as much as fixing the gap at all — a full login system for an app with no concept of \"users\" would be complexity theater, not real security. The localhost-binding fix is the proportionate answer to \"who can currently reach this,\" the same way the NAT Gateway was the proportionate (not maximal) answer to the egress regression.",
        handsOn: [
          { label: 'The disproportionate-fix trap, avoided', code: "# /chat is called directly by AIMentor.tsx with no login UI anywhere --\n# adding JWT auth would mean EITHER updating the frontend to attach a\n# token (real added complexity for a single-user tool) OR silently\n# breaking the one feature that already works. Chose the proportionate\n# fix instead: stop anything outside this machine from reaching it." },
          { label: 'docker-compose.yml: matching the existing Qdrant/Redis pattern', code: "backend:\n  ports:\n    - '127.0.0.1:8000:8000'   # was '8000:8000' -- all interfaces before\n\n# verified: docker port devops-tut-backend-1\n# 8000/tcp -> 127.0.0.1:8000  (was 0.0.0.0:8000)\n# frontend unaffected -- it reaches backend:8000 over the internal\n# Docker network via nginx proxy_pass, not through this host port at all" },
          { label: 'Azure Policy: a real deny test, not an assumption', code: 'az policy assignment create --name require-project-tag \\\n  --policy "Require a tag on resources" --params \'{"tagName":{"value":"project"}}\'\n\naz network nsg create --name policy-test-nsg-notag\n# RequestDisallowedByPolicy -- denied immediately, no propagation delay\n\naz network nsg create --name policy-test-nsg-tagged --tags project=azureops-copilot\n# succeeds -- confirms the policy discriminates correctly, not a blanket block' },
        ],
        troubleshooting: [
          'Reaching for a full authentication system as the default "secure it" answer → check who can actually reach the thing and what it would cost to add real auth (including whether the frontend needs updating too) before assuming the heaviest option is the right one; a network-level fix was correct and sufficient here.',
          'Assuming an Azure Policy assignment needs time to propagate before it\'s enforced → tested directly instead of waiting on faith, and it was already blocking real resource creation immediately.',
        ],
        interview: [
          'How would you decide between fixing an exposure at the network layer versus the application layer?',
          'What\'s the actual cost of Azure Policy itself, and why does that make tagging governance an easy default to turn on?',
        ],
        azureConnection:
          "Both fixes are $0: the port-binding change is pure Docker Compose config, and built-in Azure Policy definitions carry no charge — a reminder that not every security/governance gap needs paid tooling (Defender for Cloud, Azure Policy's paid guest-configuration add-ons) to close.",
      },
      {
        id: 'shared-responsibility',
        title: 'Shared responsibility, grounded in what this project actually built',
        concept:
          "Azure's shared responsibility model splits security obligations between Microsoft and the customer, and where the line falls shifts with the service model — IaaS (the VMs this project runs on) leaves the most on the customer; PaaS (Key Vault, Storage) shifts more to Azure. Made concrete with this project's own real examples rather than the generic version: for `app-vm1`/`app-vm2`/`azureops-vm01` (IaaS), Azure is responsible for the physical hosts, the hypervisor, and physical datacenter security — this project is responsible for OS patching, NSG rules, what runs on the VM (k3s, the app), and every credential/RBAC decision made on top of it. For Key Vault (PaaS), Azure is responsible for the vault's own infrastructure, encryption at rest, and the HSM backing it — this project is still responsible for who gets which RBAC role on it (the exact work done in the Key Vault chapters), and for not leaking a fetched secret value into logs (the auto-mode classifier catching one such attempt this session is a concrete example of that boundary being enforced).",
        whyDevops:
          "Misunderstanding this split is a real, common cause of breaches — assuming a managed service like Key Vault \"handles security\" and therefore skipping RBAC configuration, or assuming Azure patches a VM's guest OS automatically when it doesn't. Every real security decision made in this module (RBAC scoping, NSG rules, secret handling discipline) exists specifically on the customer side of this line.",
        handsOn: [
          { label: 'The split, mapped to real resources in this project', code: "# IaaS -- app-vm1, app-vm2, azureops-vm01\n# Azure: physical host, hypervisor, datacenter\n# THIS PROJECT: guest OS patching, NSG rules, k3s + app config, all RBAC\n\n# PaaS -- Key Vault, Storage Account\n# Azure: vault/storage infrastructure, encryption at rest, HSM\n# THIS PROJECT: who gets which RBAC role, never logging a real secret value\n# (the auto-mode classifier blocking a value-printing attempt this session\n#  is the customer-side responsibility being enforced in practice)" },
        ],
        troubleshooting: [
          'Assuming a managed PaaS service is automatically secure end-to-end → Key Vault\'s own infrastructure is Azure\'s responsibility, but a real 403 was hit this module because RBAC roles still had to be explicitly configured — the service being "managed" only covers Azure\'s half of the line.',
        ],
        interview: [
          'Where does the shared responsibility line fall differently between an IaaS VM and a PaaS service like Key Vault?',
          'Give a real example from this project of a security control that lives entirely on the customer side of that line.',
        ],
        azureConnection:
          "Every real incident and fix in this module — RBAC 403s, the NAT Gateway egress regression, the port-binding exposure fix, secret-value handling discipline — happened entirely on this project's side of the shared responsibility line, not Azure's; that's the concrete evidence for where the line actually falls, not just the textbook description of it.",
      },
      {
        id: 'entra-id-rbac-audit',
        title: 'A real RBAC audit: one good example, one real over-permission finding',
        concept:
          "Rather than describe RBAC in the abstract, the subscription's actual role assignments were listed and audited. The good example: Key Vault's RBAC (from earlier this module) is scoped tightly — the human account has `Key Vault Secrets Officer` *only* on the vault itself, and `app-vm1`'s Managed Identity has `Key Vault Secrets User` *only* on the same vault, nothing broader. The real finding: the GitHub Actions OIDC identity (`azureops-copilot-github-oidc`, built in Module 7) holds **`Contributor` over the entire resource group**, but the CI workflow's actual `deploy` job only runs read-only verification (`az account show`, `az resource list`) — it doesn't deploy anything yet. That's a real, live example of an identity holding meaningfully more power than it uses, the opposite of the Key Vault roles right next to it. Also found: a genuinely redundant duplicate `Owner` role assignment for the same human account at subscription scope (two separate assignment IDs, same role, same scope) — doesn't grant extra privilege since it's the same role, but is unnecessary clutter an RBAC audit should still catch.",
        whyDevops:
          "An RBAC audit isn't about assuming misconfiguration exists — it's about actually listing real assignments and checking each one against what that identity genuinely needs, which is exactly how this real, live over-permission was found instead of assumed. CI/CD identities are a common real-world blind spot: they're created once during pipeline setup and rarely revisited as the pipeline's actual scope changes.",
        handsOn: [
          { label: 'The actual audit commands run this session', code: 'az role assignment list --query "[].{principal:principalName, role:roleDefinitionName, scope:scope}"\n# found: subscription-level Owner (human), a DUPLICATE identical assignment,\n# and Contributor at resource-group scope for azureops-copilot-github-oidc\n\naz role assignment list --scope <key-vault-id>\n# contrast: Key Vault Secrets Officer / Secrets User, both correctly scoped\n# to just the vault -- the RBAC pattern done right' },
        ],
        troubleshooting: [
          'A CI/CD identity granted broad permissions during initial pipeline setup, then never revisited as the pipeline\'s real scope became clear → exactly what was found here; the fix (not yet applied, a deliberate decision) would be downgrading to the narrowest role the actual workflow steps require, e.g. Reader for the current read-only verification.',
          'Confusing "no extra privilege granted" with "nothing to fix" → the duplicate Owner assignment grants no additional access since it\'s the same role/scope, but redundant role assignment objects are still worth cleaning up as a matter of tidy, auditable governance.',
        ],
        interview: [
          'Why might a CI/CD pipeline\'s service identity end up more permissioned than it needs to be, even without anyone making an obvious mistake?',
          'What\'s the risk of a CI/CD identity holding write/delete permissions it never actually uses in its current workflow?',
        ],
        azureConnection:
          "This is a genuinely live, unresolved finding in this real subscription, not a hypothetical — `azureops-copilot-github-oidc` currently holds more power than the Module 7 workflow uses, a real decision point for whenever real automated deployment through this identity is actually built.",
      },
      {
        id: 'secret-rotation',
        title: 'Secret rotation, demonstrated for real against the live app',
        concept:
          "Key Vault versions every secret automatically — `az keyvault secret set` on an existing name doesn't overwrite, it creates a new version while keeping prior ones retrievable (confirmed: two distinct version timestamps after one rotation). Rotation was tested against the actual live backend pod, not a throwaway example: `jwt-secret`'s value was rotated in the vault, the live pod was deleted, and the replacement pod's logs showed the same `\"Loaded secrets from Key Vault\"` line — confirming the fresh value gets fetched at startup. This also surfaces a real architectural property worth naming explicitly: this app loads secrets *once, at process startup*, not on a refresh interval — rotating a secret in the vault has **zero effect** on an already-running pod until it restarts. For an app needing zero-downtime rotation, that would mean either a periodic in-app refresh or subscribing to Key Vault's Event Grid change notifications; neither was needed here since a full pod restart is cheap and already the deploy model.",
        whyDevops:
          "Assuming \"I rotated the secret in the vault\" means \"the running app is now using the new value\" is a genuine, easy mistake — this app's actual behavior (startup-only fetch) was verified directly rather than assumed, and the gap between vault-side rotation and app-side pickup is exactly the kind of thing that causes real incidents (an old, revoked credential still working somewhere because nothing ever restarted).",
        handsOn: [
          { label: 'Real rotation against the live pod, verified end to end', code: "az keyvault secret set --vault-name azureops-copilot-kv --name jwt-secret --value \"<new value>\"\naz keyvault secret list-versions --vault-name azureops-copilot-kv --name jwt-secret\n# two versions now, both retrievable -- old one not destroyed\n\nkubectl delete pod -n azureops-copilot -l app=backend\nkubectl logs -n azureops-copilot -l app=backend --tail 10\n# \"Loaded secrets from Key Vault azureops-copilot-kv (Managed Identity)\"\n# -- fresh fetch confirmed, not assumed" },
          { label: 'Confirmed the live app kept working through the restart', code: 'curl http://20.235.48.180/\n# HTTP 200\ncurl -X POST http://20.235.48.180/ingest -d \'{"text":"...", "source":"rotation-test"}\'\n# real ingest still succeeds after the rotation-triggered restart' },
        ],
        troubleshooting: [
          'Rotating a secret in Key Vault and assuming a running application immediately uses the new value → check how and when that specific app actually reads its secrets (startup-only vs. periodic refresh vs. event-driven) before assuming rotation took effect; verified here by checking real pod logs after a real restart, not assumed.',
        ],
        interview: [
          'What actually happens to an already-running process\'s in-memory secret value when you rotate that secret in Key Vault?',
          'What are the tradeoffs between startup-only secret loading and a periodic refresh, for an app that needs to survive rotation without a restart?',
        ],
        azureConnection:
          "Key Vault's automatic secret versioning (every write creates a new version, nothing is destroyed until explicitly purged) is what makes rotation safe to test against a live system — the previous `jwt-secret` value stayed retrievable throughout, so this test carried zero risk of permanent loss even though it targeted the real running deployment.",
      },
      {
        id: 'security-scanning-ci',
        title: 'Security scanning in CI: what\'s already there, and a real incident it caught',
        concept:
          "This project's CI pipeline (Module 7) already runs real security scanning on every push: `gitleaks` (secret-leak detection, both as a pre-commit hook and a CI job) and Trivy (container image vulnerability scanning, gated to fail the build on HIGH/CRITICAL findings). This isn't hypothetical coverage — Trivy genuinely caught a real vulnerability later in the project's life: when Module 10 added OpenTelemetry packages, their transitive dependency resolution pulled in `protobuf 4.25.9`, and Trivy correctly failed the build over `CVE-2026-0994` (HIGH severity, fixed in 5.29.6+). The fix (upgrading the whole OTel dependency set to a version compatible with a patched protobuf) was verified by rebuilding clean and confirming the exact same real functionality (a traced `/chat` query) still worked afterward — the scanner did its job exactly as intended: block a real vulnerable dependency from shipping, without silently ignoring it via a blanket `.trivyignore` entry.",
        whyDevops:
          "Security scanning in CI only has value if it's actually gating merges, not just running and being ignored — this project has a real, dated example of exactly that gate doing its job on a dependency nobody was specifically watching, which is a stronger demonstration than any amount of describing the tooling in the abstract.",
        handsOn: [
          { label: 'The real incident this scanning caught (Module 10)', code: '# Trivy build output at the time:\n# protobuf 4.25.9\n# CVE-2026-0994\n# Severity: HIGH\n# Fixed in: 5.29.6 or 6.33.5\n\n# exit-code: 1 in .github/workflows/ci.yml -- build correctly FAILED,\n# not just warned\n\n# fix: upgraded opentelemetry-api/sdk/exporter to 1.44.0 (from 1.27.0),\n# which resolves cleanly against protobuf>=5.29.6 -- re-verified clean\n# install AND a real traced /chat query still worked before merging' },
        ],
        troubleshooting: [
          'A new dependency pulling in a vulnerable transitive package isn\'t always obvious from the direct `pip install` line you wrote — the real fix here required tracing the dependency graph (`opentelemetry-exporter-otlp-proto-grpc` → `opentelemetry-proto` → capped `protobuf<5.0`) rather than just reading the top-level requirements.txt addition.',
          'Reaching for `.trivyignore` as the first response to a scan failure → only appropriate when a fix genuinely isn\'t available or the finding is a real false positive with documented reasoning (this project\'s existing `.trivyignore` entries are exactly that); here a real fixed version existed, so upgrading was the correct response, not suppressing the finding.',
        ],
        interview: [
          'Walk through what should happen when a CI security scan fails a build over a transitive dependency\'s vulnerability, versus one in a direct dependency.',
          'When is adding an entry to a scanner\'s ignore list the right call, and when is it just hiding a real problem?',
        ],
        azureConnection:
          "No Azure service is involved in this scanning at all (gitleaks/Trivy run entirely in GitHub Actions) — a reminder that meaningful security tooling doesn't require an Azure-native product (Defender for DevOps, etc.) to already be delivering real, verified value in a pipeline.",
      },
      {
        id: 'least-privilege-synthesis',
        title: 'Least privilege and threat-aware architecture: the real pattern across this whole module',
        concept:
          "Synthesizing every real decision made across Module 11 into one pattern: scope every identity to exactly what it needs, verify both the allow and the deny case, and reduce attack surface at the layer where it actually lives. The evidence, all real: (1) Key Vault RBAC — the human account and `app-vm1`'s Managed Identity each hold a role scoped to *only* the vault, verified with both a positive test (`app-vm1` gets a real secret) and a negative one (`app-vm2`, deliberately given no role, gets a real `403`). (2) The CI/CD identity — found holding `Contributor` over the whole resource group while its actual workflow only reads; documented as a real, live over-permission rather than quietly ignored. (3) Network exposure — the backend's Docker port was open to the whole LAN by default; fixed with the narrowest change that solved the actual problem (bind to localhost) rather than the broadest one (a full auth system). (4) The public app itself — rate limiting added *before* going live, not after seeing abuse, specifically because a real, usage-billed API sat behind it. Threat-aware architecture isn't a separate checklist from least privilege here — it's the same discipline (what does this specific thing actually need, and what's the realistic cost of it being wrong) applied at every layer: identity, network, and application.",
        whyDevops:
          "The throughline across every real finding this module — from the Key Vault 403 to the CI over-permission to the rate limiter — is the same question asked at a different layer: does this identity/port/API call have exactly the access it needs, no more. That's a more durable skill than memorizing any single Azure security feature, because it transfers to services and platforms this project never touched.",
        handsOn: [
          { label: 'The pattern, verified at every layer this module touched', code: '# Identity layer: positive AND negative RBAC tests\n# app-vm1 (granted role)    -> HTTP 200, real secret\n# app-vm2 (no role granted) -> HTTP 403, ForbiddenByRbac\n\n# CI/CD layer: found, not fixed (documented as a live decision point)\n# azureops-copilot-github-oidc: Contributor on the whole RG,\n# but workflow only does read-only verification today\n\n# Network layer: narrowest fix for the actual exposure\n# docker-compose.yml: 8000:8000 -> 127.0.0.1:8000:8000\n\n# Application layer: rate limiting added BEFORE going public\n# 10 ingests/min, 20 chat messages/5min per client IP' },
        ],
        troubleshooting: [
          'Treating least privilege as an identity-only concern → this module\'s real findings span identity (Key Vault RBAC), network (the port-binding fix), and application (rate limiting) — the same "minimum necessary access" question applies at every layer, not just IAM role assignments.',
          'Fixing every finding immediately as a reflex → the CI over-permission was deliberately left as a documented, live decision rather than auto-fixed, since tightening it now might conflict with real deployment automation being built soon; least privilege is a real tradeoff against future velocity, not a rule to apply blindly everywhere at all times.',
        ],
        interview: [
          'Describe three different layers (not just IAM) where a least-privilege decision was made in this project, and what each one protects against.',
          'When might deliberately leaving a known over-permission in place, rather than immediately tightening it, be the right call?',
        ],
        azureConnection:
          "This closes Module 11's outcome directly: every real secret this app needs now comes from Key Vault via Managed Identity, not a hard-coded value, and every access to it — human or workload — was verified against both what it should and shouldn't be able to do.",
      },
      {
        id: 'defender-for-cloud-free-tier',
        title: 'Defender for Cloud: the free tier is real, and it found real findings',
        concept:
          "Defender for Cloud's pricing is genuinely two-tier, and it's easy to assume the whole product is paid. **Foundational CSPM** — Secure Score, security recommendations, compliance benchmark mapping (NIST/CIS/PCI DSS), asset inventory — is completely free and, as of late 2026, moving to opt-in for *new* subscriptions but staying free regardless. The confusingly-named API field (`pricingTier: \"Standard\"` for the `FoundationalCspm` plan) is a historical naming artifact, not a sign it bills — verified via Microsoft's own current documentation before trusting it, not assumed from the CLI output alone. The **paid** plans are separate, explicitly-named ones (Defender for Servers, Storage, Key Vault, Containers, Resource Manager, APIs, etc.) that this project deliberately left off. Enabling the free tier surfaced a real Secure Score of **2.0/26 (7.7%)** on this subscription and a real list of unhealthy recommendations — some free and worth fixing (no security contact email configured, no high-severity alert notifications), some just upsells for the paid Defender plans this project isn't buying, and some genuine hardening opportunities logged rather than acted on immediately (NSG port restrictions, VM backup, disk encryption).",
        whyDevops:
          "A near-zero Secure Score isn't a failure state to be embarrassed by — it's exactly the kind of concrete, quantified signal that makes security posture legible instead of a vague feeling; the real value here is that this number and its underlying recommendations are backed by actual configuration on actual resources, not a checklist filled in from memory.",
        handsOn: [
          { label: 'Confirming the free tier is genuinely free before trusting it', code: 'az security pricing show --name FoundationalCspm\n# pricingTier: "Standard" -- looks paid, but this specific plan name\'s\n# "Standard" tier IS the free one (confirmed against Microsoft\'s current\n# docs, not assumed); the genuinely paid plan has a different name\n# entirely ("Defender CSPM"), and isn\'t present on this subscription' },
          { label: 'Real Secure Score and real findings, not a demo', code: 'az security secure-scores list\n# Current: 2.0  Max: 26  Percentage: 7.69%\n\naz security assessment list --query "[?status.code==\'Unhealthy\'].displayName"\n# real findings included:\n# "Subscriptions should have a contact email address for security issues"\n# "Email notification for high severity alerts should be enabled"\n# "Microsoft Defender for Servers should be enabled" -- paid upsell, skipped' },
          { label: 'Acted on the free, quick ones', code: 'az security contact create --name default \\\n  --emails "<real address>" \\\n  --alert-notifications state=On minimalSeverity=High \\\n  --notifications-by-role state=On roles=["Owner"]\n# real config change, confirmed via the API response -- the assessment\n# itself takes hours to re-run and flip to Healthy, not instant like an\n# RBAC test' },
        ],
        troubleshooting: [
          'Trusting a CLI field name (`pricingTier: Standard`) at face value without checking current documentation → this exact field looks like it indicates a paid tier, but for the `FoundationalCspm` plan specifically it doesn\'t; verified against real, current Microsoft documentation before writing this chapter rather than guessing from the API shape alone.',
          'Expecting a Defender for Cloud recommendation to flip to "Healthy" immediately after fixing the underlying config → its assessment engine runs on a periodic schedule (hours), unlike a live RBAC check that\'s enforced instantly on the next API call; the fix was verified via the real config API response instead of waiting on the recommendation status.',
        ],
        interview: [
          'How would you verify whether a specific Defender for Cloud plan is actually free, rather than trusting a field name in the API response?',
          'Why might a security recommendation stay "Unhealthy" for a while even after you\'ve genuinely fixed the underlying issue?',
        ],
        azureConnection:
          "Real, deliberate cost-conscious decision consistent with the rest of this project: the free Foundational CSPM tier delivers genuine value (a real Secure Score and real findings on this actual subscription) without paying for any of the per-resource Defender plans this small project doesn't need.",
      },
      {
        id: 'waf-self-hosted-k8s',
        title: 'WAF: rebuilding the self-hosted pattern as a real Kubernetes workload',
        concept:
          "Real Azure WAF pricing was checked before deciding anything: Application Gateway v2 with WAF enabled runs roughly **$32.85/month fixed** (`$0.045/gateway-hour`) plus capacity-unit and data-transfer charges — a real, meaningful ongoing cost for a personal project. Module 6 had already proven the $0 alternative works (a self-hosted `owasp/modsecurity-crs` container blocking a real SQL-injection payload), but that container was decommissioned along with `azureops-lb` in Module 10. Rebuilt here as a genuine Kubernetes workload instead of a VM-level container: `waf-proxy` (Deployment + Service) sits between Traefik and `frontend`, and the live Ingress's `/` rule was repointed from `frontend` directly to `waf-proxy` — so every real request to the public app now passes through WAF inspection first, not as a parallel, bypassable path. Verified in two stages, not one: first internally (a throwaway pod hitting the WAF Service directly, confirming a normal request returns `200` and an SQLi-style payload returns `403`) *before* touching the live Ingress, then again against the actual public IP after the cutover — including the real WebSocket `/chat` path, which is the part most likely to break silently behind a reverse proxy and wasn't assumed to work without testing.",
        whyDevops:
          "Testing a new proxy layer internally before routing real, live public traffic through it is the same deploy-verify-cutover discipline already used for the Module 10 Load Balancer decommission — never point live traffic at something you haven't independently confirmed works, especially something that could silently break the WebSocket path that a plain HTTP test wouldn't catch.",
        handsOn: [
          { label: 'Deployed and verified internally first, before any live cutover', code: "kubectl apply -f waf.yaml   # Deployment + Service, BACKEND points at frontend\n\n# internal test, NOT yet in the live path:\nkubectl run waf-test --image=curlimages/curl -n azureops-copilot --rm -i -- \\\n  curl -s -o /dev/null -w 'HTTP %{http_code}\\n' 'http://waf-proxy/?id=1%27%20OR%20%271%27=%271'\n# HTTP 403 -- confirmed working before touching the live Ingress" },
          { label: 'Only then: reroute the live Ingress', code: '# Ingress "/" path: frontend -> waf-proxy\nkubectl apply -f ingress.yaml' },
          { label: 'Verified against the real public IP, including WebSocket', code: 'curl "http://20.235.48.180/?id=1%27%20OR%20%271%27=%271"\n# HTTP 403 -- real attack blocked on the live, public endpoint\n\ncurl -X POST http://20.235.48.180/ingest -d \'{"text":"...", "source":"waf-test"}\'\n# real ingest still works\n\n# real WebSocket /chat through the WAF -- the riskiest part to assume works\n# -> got a real, correct Gemini-generated response, upgrade path intact' },
        ],
        troubleshooting: [
          'Assuming a reverse-proxy WAF will transparently pass through a WebSocket upgrade just because plain HTTP works → verified explicitly with a real `/chat` query after the cutover, specifically because this is exactly the kind of thing that silently breaks with a naive reverse-proxy config and a plain `curl` test to `/` wouldn\'t catch.',
          'Rerouting live production Ingress traffic to a new backend before independently verifying that backend → tested internally first (pod-to-Service, no public exposure) and only touched the live Ingress after that passed, limiting the blast radius of a bad config to zero real traffic.',
        ],
        interview: [
          'Why test a new proxy layer from inside the cluster before routing real external traffic to it, rather than testing directly against production?',
          'What specifically about a WebSocket connection makes it a higher-risk thing to silently break behind a new reverse proxy, compared to a plain HTTP request?',
        ],
        azureConnection:
          "Directly mirrors Module 6's original WAF chapter (self-hosted ModSecurity chosen over Application Gateway's WAF SKU) and Module 10's Load Balancer decommission discipline (deploy new, verify new, only then cut over) — the same real cost-conscious decision and the same real deployment safety pattern, both proven twice now in this project.",
      },
    ],
  },
  {
    id: 'front-door-production-edge',
    number: 12,
    mono: 'FD',
    title: 'Azure Front Door & Production Edge',
    outcome: 'Understand when and how Front Door fits into a global Azure application.',
    chapters: [
      {
        id: 'front-door-subscription-block',
        title: 'A real, hard blocker: Front Door and this subscription type',
        concept:
          "Before writing this chapter, the plan was to actually provision real Front Door Standard (~$35/month base, verified via Azure's pricing page in Module 11) in front of the live app, specifically to get genuine hands-on configuration experience even though this project's own Module 6 chapter had already concluded Front Door isn't functionally justified for a single-origin app. That plan hit a real, hard wall: `az afd profile create` failed immediately with `(BadRequest) Free Trial and Student account is forbidden for Azure Frontdoor resources` — not a quota limit, not a region restriction, not a missing resource provider (those were checked and ruled out first: the `cdn` CLI extension was installed, `Microsoft.Cdn` was registered) — a flat, subscription-type-level restriction with zero workaround short of an actual subscription upgrade. This is the same category of hard wall hit in Module 8 (the vCPU quota block on Free Trial subscriptions), not a first occurrence.",
        whyDevops:
          "Real Azure subscriptions have real, sometimes surprising restrictions tied to their commercial type, not just their configured quotas — a production engineer needs to distinguish \"this needs different config\" from \"this needs a different subscription entirely,\" and the only way to tell them apart reliably is hitting the real error rather than assuming a workaround exists.",
        handsOn: [
          { label: 'The real, exact failure', code: "az extension add --name cdn\naz afd profile create --resource-group <rg> --profile-name <name> \\\n  --sku Standard_AzureFrontDoor\n# ERROR: (BadRequest) Free Trial and Student account is forbidden for\n# Azure Frontdoor resources.\n# -- no SKU, region, or quota change fixes this; it's the subscription type itself" },
        ],
        troubleshooting: [
          'Assuming a failed resource-creation call is always a config, quota, or region problem → check the exact error message class first; `BadRequest` with subscription-type language (as opposed to `QuotaExceeded` or `ResourceNotAvailableForOffer`, both hit earlier in this project for different reasons) means no amount of parameter tuning will fix it.',
        ],
        interview: [
          'What\'s the practical difference between a quota-related Azure error and a subscription-type-related one, and how would you tell them apart from the error message alone?',
          'Given Front Door couldn\'t be built, what would you check to confirm a hands-on chapter genuinely can\'t be completed versus assuming it can\'t without trying?',
        ],
        azureConnection:
          "Consistent with this project's standing practice (Module 8's quota wall, Module 9's deliberate AKS comparison-only chapter): when a real, hard constraint blocks hands-on work, the honest response is documenting the real blocker and building a comparison chapter instead of faking or skipping the content entirely.",
      },
      {
        id: 'tls-custom-domain-real',
        title: 'Connecting the real domain: DNS + Traefik instead of Front Door',
        concept:
          "With Front Door genuinely unavailable, the module's real deliverable — actually connecting `devopspk.online`, reserved and untouched since Module 6 — was built a different way: Azure DNS (already proven safe to build ahead of delegation in Module 6) plus Traefik's own free Let's Encrypt integration, already running as the cluster's Ingress controller since Module 8. A real DNS zone was created (blocked once by Module 11's own tag-enforcement Azure Policy — genuine, live proof that policy is still active — retried with the tag), with an `A` record pointing `@` at the live cluster's public IP and a `www` CNAME, both verified resolving correctly by querying Azure's own nameserver directly. Traefik was reconfigured via a `HelmChartConfig` (the correct way to customize k3s's Helm-managed Traefik, rather than editing its Deployment directly) to run a real ACME `certificatesResolvers` config against Let's Encrypt, with persistent storage for the issued certificate so it survives pod restarts.",
        whyDevops:
          "TLS termination and DNS delegation are the actual, concrete work behind \"connecting a domain\" — Front Door (or Application Gateway, or any edge product) is one place that work can live, but it's not the only place, and a single-origin app gets the same end-user outcome (a real domain, real HTTPS) from a self-hosted Ingress controller's built-in ACME support at $0 instead of ~$35+/month.",
        handsOn: [
          { label: 'Real DNS zone, blocked once by real policy, then created correctly', code: 'az network dns zone create --name devopspk.online\n# RequestDisallowedByPolicy -- Module 11\'s tag policy, still enforced\n\naz network dns zone create --name devopspk.online --tags project=azureops-copilot\n# succeeds -- 4 real Azure nameservers assigned\n\naz network dns record-set a add-record --zone-name devopspk.online \\\n  --record-set-name "@" --ipv4-address 20.235.48.180\n\nnslookup devopspk.online ns1-01.azure-dns.com\n# resolves correctly -- Azure-side DNS confirmed working, independent\n# of whether the registrar has delegated yet' },
          { label: "Traefik's real Let's Encrypt config, via k3s's HelmChartConfig", code: '# HelmChartConfig named "traefik" in kube-system -- the supported way\n# to customize k3s\'s bundled, Helm-managed Traefik\nadditionalArguments:\n  - "--certificatesresolvers.letsencrypt.acme.email=<real email>"\n  - "--certificatesresolvers.letsencrypt.acme.storage=/data/acme.json"\n  - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"\npersistence:\n  enabled: true\n  path: /data\n  size: 128Mi\n# applied -- new Traefik pod rolled out alongside the old one, zero downtime' },
          { label: 'A real regression, caught and fixed within minutes', code: '# added tls.hosts to the EXISTING catch-all Ingress (no host: field) --\ncurl http://20.235.48.180/\n# HTTP 404 -- bare-IP access broken immediately, a real regression\n\n# root cause: Traefik restricts a router\'s WHOLE rule (HTTP included)\n# to the tls.hosts list when the Ingress rule itself has no host field\n\n# fix: split into two Ingress objects\n# - azureops-copilot-ingress      (unchanged, catch-all, no TLS)\n# - azureops-copilot-ingress-tls  (host: devopspk.online + TLS, separate)\n\ncurl http://20.235.48.180/          # HTTP 200 -- fixed\ncurl -k --resolve devopspk.online:443:20.235.48.180 https://devopspk.online/\n# HTTP 200 -- domain HTTPS path works, tested via SNI override' },
          { label: "Update: real cert issued -- and a second real bug found on the way there", code: '# once DNS genuinely propagated, first ACME attempt still failed:\n# Let\'s Encrypt\'s own validator got a 404 for ITS OWN just-issued token\n#\n# root cause: two separate host-based Ingress rules (apex + www) each\n# independently triggered a CONCURRENT Let\'s Encrypt request through the\n# same Traefik resolver -- the two in-flight challenges raced each other\n#\n# isolated by testing apex alone first (succeeded immediately), confirming\n# the two-domain concurrency -- not DNS, not the WAF -- was the real cause\n#\n# real fix: ONE Traefik IngressRoute, ONE rule for both hosts, ONE\n# tls.domains block (main + sans) -- requests a single SAN cert, no race\napiVersion: traefik.io/v1alpha1\nkind: IngressRoute\nspec:\n  routes:\n  - match: Host(`devopspk.online`) || Host(`www.devopspk.online`)\n  tls:\n    certResolver: letsencrypt\n    domains:\n    - main: devopspk.online\n      sans: [www.devopspk.online]\n\n# verified for real: openssl s_client shows issuer=Let\'s Encrypt, both\n# hostnames in the SAN list; https://devopspk.online and .../ingest and\n# a real wss://.../chat query all succeeded over genuine, trusted HTTPS' },
        ],
        troubleshooting: [
          'Adding a `tls.hosts` list to an Ingress rule with no explicit `host` field → Traefik\'s Kubernetes Ingress provider narrows the *entire* generated router to those hosts, silently breaking any other traffic (like bare-IP access) that same Ingress used to catch. Split TLS-scoped and catch-all routing into separate Ingress objects whenever they need different host scopes.',
          'Registrar NS delegation not propagating instantly → confirmed via TWO independent resolvers (a local one and Google\'s `8.8.8.8`) before concluding propagation genuinely hadn\'t happened yet, rather than trusting a single, possibly-cached lookup.',
          'A live site serving a self-signed "TRAEFIK DEFAULT CERT" for a configured domain isn\'t a config bug → it means the ACME HTTP-01 challenge hasn\'t succeeded yet, almost always because the domain doesn\'t resolve publicly to the origin yet; verified directly with `openssl s_client -servername <domain>` rather than assuming the cert resolver config was wrong.',
          'A cert-resolver annotation on a Kubernetes `Ingress` applies to every router that Ingress generates, not just the hosts listed in its `tls.hosts` block → removing a hostname from `tls.hosts` alone didn\'t stop a second, concurrent ACME request for it, because a separate `host` rule for that same name still existed and still inherited the resolver annotation at the whole-Ingress level.',
          'Two concurrent ACME requests through the same Traefik resolver instance can race and both fail, even though each looks like an independent, well-formed request in the logs → the fix isn\'t "wait and retry," it\'s requesting one SAN certificate (via a single `IngressRoute` with a combined host match) instead of N separate concurrent ones for related hostnames.',
        ],
        interview: [
          'Why does adding TLS configuration for specific hosts risk breaking traffic for hosts that were never mentioned in that config?',
          'What has to be true, end to end, before Let\'s Encrypt\'s HTTP-01 challenge can succeed for a domain pointed at a new origin?',
          'Why might requesting TLS certificates for two related hostnames as two separate, concurrent ACME transactions fail, when requesting them as one SAN certificate succeeds?',
        ],
        azureConnection:
          "The real cost comparison this chapter actually demonstrates: Front Door Standard (~$35/month, and genuinely unavailable on this subscription anyway) versus Azure DNS (a few cents/month) plus a self-hosted Ingress controller's free ACME integration — the same functional outcome (a real domain, real TLS, now genuinely live and verified on both `devopspk.online` and `www.devopspk.online`) for a fraction of the cost, once the multi-origin/global-edge value Front Door specifically adds isn't actually needed.",
      },
      {
        id: 'reverse-proxy-edge-concepts',
        title: 'Reverse proxy and edge delivery: what this project already has vs. what Front Door adds',
        concept:
          "A reverse proxy sits in front of one or more backend services, terminating client connections and forwarding requests on their behalf — this project has had one running in production since Module 8: Traefik, k3s's bundled Ingress controller, now doing real TLS termination, path-based routing (`/` to the app, `/grafana` to Grafana), and — since Module 12's DNS work — real ACME certificate management. \"Edge delivery\" in the Front Door/CDN sense means something more specific: anycast entry points distributed globally, so a user's connection terminates at the *nearest* point of presence rather than always reaching one specific datacenter, with caching and WAF inspection happening at that edge before traffic ever reaches the origin network. This project's Traefik reverse proxy runs at exactly one place (the k3s cluster, spanning centralindia and southindia) — genuinely a reverse proxy, but not edge delivery in the global-anycast sense, since every user's connection terminates at the same regional location regardless of where they are.",
        whyDevops:
          "Conflating \"I have a reverse proxy\" with \"I have edge delivery\" is a common category error — they solve different problems (routing/TLS/WAF at one location vs. global proximity and origin offload), and this project is concrete proof of the distinction: everything Traefik does here is genuinely valuable and already running, but it doesn't reduce latency for a user on the other side of the world the way real edge presence would.",
        handsOn: [
          { label: "What Traefik already does here, for real", code: "kubectl get ingress -n azureops-copilot\n# azureops-copilot-ingress       -- catch-all, HTTP, any host\n# azureops-copilot-ingress-tls   -- devopspk.online / www, real TLS\n\n# reverse proxy responsibilities Traefik already fulfills:\n# - TLS termination (real Let's Encrypt cert, Module 12)\n# - Path-based routing (/  vs  /grafana)\n# - Backend health awareness (readiness probes)\n# NOT fulfilled (this is the edge/CDN-specific gap):\n# - Global points of presence\n# - Edge caching\n# - DDoS absorption at internet scale" },
        ],
        troubleshooting: [
          'Assuming a reverse proxy automatically provides edge/CDN benefits → check whether it runs at one location or many; Traefik here runs entirely within this project\'s single k3s cluster, so every user\'s connection — regardless of their location — terminates at the same regional network, unlike a true CDN/edge product.',
        ],
        interview: [
          'What specifically does "edge" mean in a CDN/Front Door context that a single-location reverse proxy doesn\'t provide?',
          'Name three things this project\'s Traefik setup and Azure Front Door both do, and one significant thing only Front Door does.',
        ],
        azureConnection:
          "This project's real reverse proxy (Traefik) already delivers most of what a team actually needs day to day (routing, TLS, WAF via Module 11's self-hosted layer) — the remaining gap (true global edge presence) is exactly the piece Front Door would add, and exactly the piece this project's single-region-effective user base doesn't currently need enough to justify its cost.",
      },
      {
        id: 'front-door-architecture-concepts',
        title: "Front Door's architecture: endpoints, routes, origins, origin groups",
        concept:
          "Even without a built resource, Front Door's architecture maps cleanly onto real decisions this project already made elsewhere. An **endpoint** is a public hostname Front Door exposes — conceptually the same role `devopspk.online` plays pointed at Traefik directly. A **route** maps a path pattern on that endpoint to an **origin group** — the same job this project's two separate Ingress objects do (`/` and `/grafana` routing to different backend Services). An **origin group** is Front Door's failover unit: it holds one or more real origins (an App Service, a VM's public IP, another Front Door, a storage static site) and health-probes each one, routing only to healthy ones — this is the piece that has no real analog in this project's setup, because there's only ever been one origin (the k3s cluster's public IP) to route to. A **health probe** at the origin-group level is what makes automatic failover possible — without at least two real origins behind one group, a health probe can only ever tell you \"the one origin is up or down,\" not meaningfully redirect traffic anywhere else.",
        whyDevops:
          "Understanding Front Door's architecture in terms of concepts already built (endpoints ≈ a domain pointed at an Ingress, routes ≈ path-based Ingress rules, origin groups ≈ the piece genuinely missing without a second real origin) makes the abstract product concrete, and makes it obvious exactly what would need to exist before Front Door's core value — automatic origin failover — could ever actually engage for this specific app.",
        handsOn: [
          { label: 'This project\'s real equivalents to Front Door\'s pieces', code: '# Front Door concept        -> this project\'s real equivalent\n# Endpoint                  -> devopspk.online, pointed at Traefik\n# Route (path -> backend)   -> Ingress rules (/  and  /grafana)\n# Origin                    -> the k3s cluster\'s single public IP\n# Origin GROUP (failover)   -> genuinely absent -- would need a 2nd\n#                              real origin (e.g. a second cluster in\n#                              a different region) to mean anything' },
        ],
        troubleshooting: [
          'Configuring an origin group with only one real origin and expecting failover behavior → a health probe on a single-origin group can only report up/down, it has nothing to fail over TO; this is exactly this project\'s current architecture, and exactly why Front Door\'s core value doesn\'t apply yet.',
        ],
        interview: [
          'What\'s the minimum real infrastructure that would need to exist before an Azure Front Door origin group\'s failover behavior actually does anything useful?',
          'Map Front Door\'s endpoint/route/origin-group model onto a Kubernetes Ingress\'s host/path/Service model — where do they line up, and where do they genuinely differ?',
        ],
        azureConnection:
          "This mapping is the honest answer to \"why wasn't Front Door built here\": every piece of it that this project could use today (endpoint, route) already has a working, $0 equivalent; the one piece that would add real value (a genuine origin group with 2+ real origins) doesn't exist yet because this project doesn't have a second real deployment to fail over to.",
      },
      {
        id: 'caching-and-edge-waf-concepts',
        title: "Caching and WAF at the edge: why this app's shape limits both",
        concept:
          "Front Door's caching sits in front of an origin and serves repeat requests for the same URL without hitting the origin at all — genuinely valuable for static or slowly-changing content (images, CSS, a marketing page). This app's real traffic shape works against that: `/ingest` and `/chat` are both inherently dynamic (a POST and a WebSocket, neither cacheable by definition), and the curriculum browser's content, while static-ish, is served as a single-page app bundle already cached client-side by the browser via normal HTTP caching headers — there's very little repeat-origin-hit traffic here for edge caching to meaningfully reduce. WAF at the edge (Front Door's or Application Gateway's WAF SKU) inspects requests before they reach any origin at all — this project already has a real, functionally equivalent WAF layer (Module 11's self-hosted `owasp/modsecurity-crs`), just one layer further in (at the Ingress, not a global edge network) — the actual attack-blocking behavior (a verified real `403` on a SQL-injection payload) is the same; only the network location and cost differ.",
        whyDevops:
          "Not every app benefits equally from edge caching — recognizing that this app's real traffic pattern (dynamic API calls, a small SPA bundle) doesn't have much for a cache to hold onto is a more useful skill than reflexively adding a CDN in front of everything regardless of whether it helps.",
        handsOn: [
          { label: "This app's real traffic shape, and why caching wouldn't help much", code: '# /              -- SPA shell + JS bundle, browser-cached already (immutable asset hashes)\n# /ingest         -- POST, mutates state, never cacheable\n# /chat            -- WebSocket, inherently dynamic, never cacheable\n# /grafana         -- authenticated dashboards, per-user, not cacheable\n\n# WAF: already real and verified (Module 11), one layer in instead of at a global edge\ncurl "http://20.235.48.180/?id=1%27%20OR%20%271%27=%271"\n# HTTP 403 -- same attack-blocking outcome as Front Door/App Gateway WAF,\n# at $0 instead of a real per-month cost' },
        ],
        troubleshooting: [
          'Adding an edge cache in front of an app whose traffic is mostly dynamic API calls → check the actual request mix first; caching a WebSocket or a state-mutating POST is a category error, not a misconfiguration to debug.',
        ],
        interview: [
          'What characteristics make a request cacheable at the edge, and does this app\'s real traffic have much of that shape?',
          'What\'s functionally different between a WAF running at a global edge network versus one running at a single cluster\'s Ingress layer, for the same attack payload?',
        ],
        azureConnection:
          "Module 11's self-hosted WAF decision and this chapter's caching analysis are the same underlying judgment applied twice: match the tool to the app's actual traffic shape and threat model, rather than defaulting to the most feature-complete (and expensive) edge product available.",
      },
      {
        id: 'edge-product-comparison-final',
        title: 'Front Door vs. Application Gateway vs. Load Balancer vs. Traffic Manager: the real comparison',
        concept:
          "Four Azure products that all sound like they overlap, actually solving different problems at different layers, with real pricing gathered across this project rather than assumed: **Load Balancer** (Standard SKU, decommissioned in Module 10) — Layer 4, regional, real cost (roughly $0.03/hour combined with its public IP when it existed here), no HTTP awareness at all. **Application Gateway** — Layer 7, regional, WAF-capable, real cost verified in Module 11 (~$32.85/month fixed for v2 + WAF alone, plus capacity and data charges) — the \"Front Door but regional, not global\" option. **Traffic Manager** — DNS-level failover only, no data-plane proxying at all (it just answers DNS queries differently based on origin health), priced per-DNS-query with no fixed base — the cheapest multi-region option, but the least capable (no WAF, no caching, no path routing, and DNS TTLs mean failover isn't instant). **Front Door** — Layer 7, *global* edge, real WAF and caching, real cost (~$35/month Standard, ~$330/month Premium) — the only one of the four with actual global points of presence, and correspondingly the only one genuinely blocked on this Free Trial subscription.",
        whyDevops:
          "These four products form a real decision ladder by scope and cost, not a random menu — Load Balancer for L4/regional, Application Gateway for L7/regional/WAF, Traffic Manager for cheap DNS-level multi-region failover, Front Door for the full global-edge package — and every rung of that ladder has now been either built for real or priced for real in this single project.",
        handsOn: [
          { label: 'The real comparison, grounded in this project\'s own numbers', code: "# Load Balancer      -- L4, regional.       ~$0.03/hr + IP  (Module 6, decommissioned Module 10)\n# Application Gateway -- L7, regional, WAF.  ~$32.85/mo+     (priced, Module 11, not built)\n# Traffic Manager     -- DNS only, global.   ~$0.54/M queries (priced, Module 6, not built)\n# Front Door          -- L7, GLOBAL edge, WAF, cache. ~$35-330/mo (blocked, this subscription)\n\n# this project's real choice: Traefik (L7, regional) + self-hosted WAF (Module 11)\n# + Let's Encrypt TLS (Module 12) = Application Gateway's functional equivalent, at $0" },
        ],
        troubleshooting: [
          'Choosing Front Door "because it\'s the most capable option" without checking whether its specific capability (global edge presence) is actually needed → this project needed L7 routing + WAF + TLS, all of which Application Gateway (or, as built here, a self-hosted equivalent) already provides at a fraction of Front Door\'s cost.',
        ],
        interview: [
          'Walk through the decision tree between these four products for a team that needs HTTP-level routing and a WAF, but is currently single-region.',
          'Why is Traffic Manager\'s DNS-only failover both its cheapest and its least capable property?',
        ],
        azureConnection:
          "This comparison is the direct payoff of building (or pricing) every rung of this ladder for real across the project instead of describing them abstractly — the numbers in this chapter came from an actual decommissioned Load Balancer, an actual priced-but-not-built Application Gateway, and an actual blocked Front Door attempt, not a pricing page skim.",
      },
      {
        id: 'multi-region-and-failure-testing',
        title: "Multi-region architecture and failure testing: what this project actually has",
        concept:
          "This project's k3s cluster genuinely spans two Azure regions — `app-vm1`/`app-vm2` in centralindia, `azureops-vm01` in southindia, connected by real VNet peering (Module 8) — which sounds like multi-region architecture, but is a materially different thing from what Front Door's multi-region value proposition assumes. Front Door expects multiple **independent origins**, each capable of serving the full application on its own, with Front Door routing/failing over between them. This project's cross-region spread is **cluster-internal HA** — one single Kubernetes control plane and one single application deployment, whose *control-plane* members happen to be split across regions for etcd quorum resilience, not multiple independent copies of the app itself. The real failure test already run (Module 8: stopping a node, watching etcd quorum and pod scheduling survive with the remaining 2) proves *cluster* resilience — it says nothing about what would happen if the *entire region* containing the cluster's public-facing node (`azureops-vm01`, southindia) went down, since there's only one Traefik entry point and it lives on that one node's public IP.",
        whyDevops:
          "Distinguishing \"my infrastructure spans multiple regions\" from \"my application has multi-region failover\" is exactly the kind of nuance that matters in a real incident — this project has real resilience against a single node failing, genuinely verified, but not against the specific region hosting its public entry point going down, and conflating the two would be a dangerous assumption to carry into a postmortem.",
        handsOn: [
          { label: 'What was actually tested (Module 8) vs. what Front Door multi-region would test', code: '# Already tested, real, verified (Module 8):\n# stop one etcd/control-plane node -> cluster survives, scheduling continues\n# -- this is CLUSTER resilience, node-level\n\n# NOT tested, and structurally can\'t be with the current architecture:\n# the entire southindia region (where azureops-vm01\'s public IP lives) goes down\n# -- Traefik\'s public entry point has no failover target; there is no second\n#    independent origin for anything to fail over TO' },
        ],
        troubleshooting: [
          'Assuming "my cluster spans two regions" is equivalent to "my app has regional failover" → check whether there are multiple independent, full copies of the application (multi-origin) versus one deployment whose control-plane members are merely spread across regions for internal HA — this project genuinely has the second, not the first.',
        ],
        interview: [
          'What\'s the difference between a Kubernetes cluster whose control-plane nodes span two regions, and an application with true multi-region failover?',
          'What specifically would need to be built before this project could run a real Front-Door-style regional failover test?',
        ],
        azureConnection:
          "This is the honest, load-bearing reason Front Door's core value doesn't apply here yet, stated as precisely as possible: real multi-region *infrastructure* exists (Module 8's VNet peering and 3-node spread), but not multi-region *application deployment* — the single missing ingredient, a second full, independent origin, is also exactly what would eventually justify actually paying for Front Door.",
      },
      {
        id: 'production-design-review',
        title: 'Production design review: the honest architecture decision record',
        concept:
          "Closing Module 12 the way a real production design review would: stating the decision, the reasoning, and the conditions that would change it — not just what was built. **Decision**: `devopspk.online` connects via Azure DNS + Traefik's self-hosted Let's Encrypt integration, not Azure Front Door. **Reasoning**: (1) Front Door is genuinely blocked on this subscription's Free Trial tier — a hard constraint, not a preference; (2) even if it weren't blocked, this project's own architecture (one real origin) doesn't yet exercise Front Door's core differentiator (multi-origin failover across a global edge); (3) the functional needs that remain — HTTP routing, TLS, WAF — already have real, $0 equivalents built in Modules 8, 11, and 12. **What would change this decision**: a second, fully independent deployment of this app in a different Azure region (not just cluster nodes spread across regions, a genuinely separate origin), enough real user traffic that global edge latency actually matters, or a compliance/SLA requirement specifically demanding Front Door's guarantees. Until any of those become true, the current architecture is the correct one, not a compromise being tolerated.",
        whyDevops:
          "A production design review that only says \"here's what we built\" is incomplete — the more valuable output is \"here's what would need to change before this decision should be revisited,\" because that's what actually prevents both premature over-engineering now and a stale decision going unquestioned later.",
        handsOn: [
          { label: 'The real decision record for this project', code: '# DECISION: devopspk.online -> Azure DNS + Traefik Let\'s Encrypt (not Front Door)\n#\n# WHY:\n# 1. Front Door blocked on this subscription (hard constraint, verified)\n# 2. Single real origin -- Front Door\'s core value (multi-origin failover)\n#    doesn\'t apply yet regardless of #1\n# 3. Routing/TLS/WAF needs already met at $0 (Modules 8, 11, 12)\n#\n# REVISIT WHEN:\n# - a second, independent regional deployment of this app exists\n# - real traffic volume/geography makes edge latency measurably matter\n# - a compliance/SLA requirement specifically needs Front Door' },
        ],
        troubleshooting: [
          'Treating an architecture decision as permanent rather than conditional → every real decision in this module was made with an explicit "revisit when X" condition, not stated as a final, unquestionable answer.',
        ],
        interview: [
          'Walk through this project\'s decision not to use Front Door as if presenting it in a real design review — what\'s the decision, the reasoning, and the conditions that would change it?',
          'Why is stating the conditions that would reverse a decision as important as the decision itself?',
        ],
        azureConnection:
          "This closes Module 12's actual outcome — \"understand when and how Front Door fits\" — with a real, specific answer grounded in this exact project's constraints and traffic shape, rather than a generic \"it depends\": it doesn't fit yet, here's precisely why, and here's precisely what would make it fit later.",
      },
    ],
  },
  {
    id: 'system-architecture',
    number: 14,
    mono: 'AR',
    title: 'System Architecture',
    outcome: 'See the complete, real architecture of AzureOps Copilot as it actually runs today — the big picture, every layer, and each component broken down.',
    chapters: [
      {
        id: 'architecture-why-not-3d',
        title: 'Why these diagrams are 2D, not Three.js',
        concept:
          "Every diagram in this module is plain SVG — rectangles, paths, and text, styled to match this app's own dark theme — not a 3D engine. Architecture diagrams are fundamentally 2D relationship information: \"the frontend talks to the backend,\" \"the backend authenticates to Key Vault.\" A 3D scene adds real costs to represent that: a WebGL context, camera controls, lighting, raycasting for interactivity, and a meaningfully heavier bundle — and it makes the actual information *harder* to read, since the viewer has to fight camera angles to see what connects to what, instead of just looking at a flowchart. Every serious architecture-diagramming tool in real use (draw.io, Lucidchart, the Azure/AWS reference architecture diagrams, Mermaid) is 2D for exactly this reason. The one place animation genuinely helps — showing a request's real path and order — is handled with plain SVG `<animateMotion>` and a CSS `stroke-dashoffset` animation (Chapter 5), which needed zero new dependencies and stays fully readable at a glance.",
        whyDevops:
          "Choosing the simplest tool that actually serves the reader, instead of the most impressive-looking one, is the same judgment applied throughout this whole project (self-hosted WAF over Application Gateway, DNS+Traefik over Front Door) — here applied to a UI decision instead of an infrastructure one, but it's the identical question: does this added complexity buy real value, or just visual novelty.",
        handsOn: [
          { label: 'The actual diagram stack used here', code: "// frontend/src/components/diagrams/ -- plain React + inline SVG\n// DiagramShared.tsx   -- shared Node/DbNode/GroupBox/Arrow primitives,\n//                        color tokens matching this app's own theme\n// 8 diagram components, one per chapter in this module\n// Animation: native SVG <animateMotion> + CSS stroke-dashoffset --\n// no charting library, no Three.js, no new dependency added at all" },
        ],
        troubleshooting: [
          'Reaching for the most visually impressive tool (3D, heavy animation libraries) before checking whether the content actually needs it → architecture/flow diagrams are 2D relationship data; a 3D scene doesn\'t make "A calls B" any more understandable, it just adds navigation friction on top of it.',
        ],
        interview: [
          'When would 3D visualization genuinely add value over a 2D diagram, and why does a software architecture diagram not fall into that category?',
          'What are the real costs (bundle size, accessibility, maintainability) of adding a 3D rendering library just for visual polish?',
        ],
        azureConnection:
          "This module documents the real, current architecture built across Modules 1-13 — the diagram technology choice itself is a small but genuine example of the same cost/complexity-consciousness applied to every infrastructure decision in this project, just applied to frontend tooling instead.",
      },
      {
        id: 'architecture-system-overview',
        title: 'The complete system, in one picture',
        diagramId: 'system-overview',
        concept:
          "Everything built across Modules 1-13, shown as one diagram: a visitor's browser, the Azure subscription (with the k3s cluster and networking/identity layer each collapsed to one box — the next chapters expand both), and the one external dependency, Google's Gemini API. This is deliberately the highest possible zoom level — enough to see how the major pieces relate, not enough to see individual pods or NSG rules.",
        whyDevops:
          "Being able to draw the whole system from memory, at this level of zoom, is what separates \"I built a bunch of Azure resources\" from \"I understand the system I built\" — every chapter after this one exists to justify one box or one arrow in this picture with real detail.",
        handsOn: [
          { label: 'How to read this diagram', code: '// green  = self-hosted, $0 marginal cost (Traefik, k3s, the app itself)\n// blue   = Azure-managed (Key Vault, NAT Gateway, DNS, GitHub OIDC target)\n// red    = external, usage-billed (Gemini API)\n//\n// every arrow in this diagram is a real, currently-live connection --\n// verified end to end with real curl/wss requests, not just declared\n// in a manifest' },
        ],
        troubleshooting: [],
        interview: [
          'Walk through this diagram from memory: what are the major pieces, and what does each arrow represent?',
        ],
        azureConnection:
          "Every box in this diagram is a real, currently-running thing — no placeholder, no 'planned' component — because this project's whole practice has been building and verifying each piece before documenting it.",
      },
      {
        id: 'architecture-k8s-cluster',
        title: 'Inside the Kubernetes cluster',
        diagramId: 'k8s-cluster',
        concept:
          "Expanding the 'k3s Cluster' box from the previous chapter: the real 3-node HA cluster (Module 8), two namespaces, and — labeled explicitly, not just as generic boxes — the two real databases running in it: Qdrant (the vector database backing retrieval) and Loki (the log database backing Grafana's log view). Traefik sits in front of both namespaces on one public IP, routing by path (`/` to the app, `/grafana` to monitoring).",
        whyDevops:
          "Distinguishing an application workload from a database, at a glance, in a diagram, mirrors a distinction that matters operationally too — a database holds state that can't just be recreated from a Deployment spec, so it gets different backup/persistence/scaling treatment than a stateless pod, and a diagram that doesn't visually separate the two teaches the wrong mental model.",
        handsOn: [
          { label: 'Verifying this diagram against the real cluster', code: 'kubectl get pods -n azureops-copilot -o wide\nkubectl get pods -n monitoring -o wide\n# every box in this diagram maps to a real, currently-Running pod --\n# this isn\'t a planned architecture, it\'s what kubectl actually returns' },
        ],
        troubleshooting: [],
        interview: [
          'Why does this diagram use a different shape for Qdrant and Loki than for the application pods?',
          'What would you check first if traffic to /grafana stopped working but / kept working fine?',
        ],
        azureConnection:
          "This is the cluster built by hand in Module 8 specifically to learn what a managed control plane (AKS) would have hidden — every box here was provisioned, debugged, and verified manually at least once across this project.",
      },
      {
        id: 'architecture-networking-identity',
        title: 'Azure networking and identity',
        diagramId: 'networking-identity',
        concept:
          "The Azure-side infrastructure underneath the cluster: 3 VMs across 2 peered regions, the NAT Gateway giving them real internet egress (added after decommissioning the Load Balancer broke it — Module 11), Key Vault, and DNS. The dashed arrow shows the actual secret-fetch mechanism: `app-vm1`'s Managed Identity requests a token from IMDS and uses it to read secrets from Key Vault — no credential is ever stored anywhere in this picture.",
        whyDevops:
          "This is the layer where real incidents in this project actually happened (the egress regression, the RBAC 403s, the VNet peering) — a diagram of it is only useful if it reflects the real, debugged topology, not an idealized one drawn before any of that was discovered.",
        handsOn: [
          { label: 'Confirming the Managed Identity path is real, not diagrammed as a guess', code: "# from inside a pod on app-vm1:\ncurl -H 'Metadata:true' \\\n  'http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://vault.azure.net'\n# real token, used to fetch GEMINI_API_KEY / JWT_SECRET at backend startup" },
        ],
        troubleshooting: [],
        interview: [
          'Why does app-vm2 not have an arrow to Key Vault in this diagram, even though it\'s in the same cluster?',
        ],
        azureConnection:
          "Every resource in this diagram was created, and in several cases broken and fixed, in this exact project — the NAT Gateway specifically exists because deleting the Load Balancer silently removed this VNet's only path to the internet, a real regression documented in Module 11.",
      },
      {
        id: 'architecture-request-flow',
        title: 'Watch a real request travel through the system',
        diagramId: 'request-flow',
        concept:
          "The one place in this module where motion actually adds information: a real `/chat` request's path, animated. The moving dot isn't decorative — it traces the literal sequence a request takes today: browser → Traefik/WAF → backend (rate-limit check) → Qdrant (vector search) → Gemini (generation) → back to the browser, streamed token by token. Key Vault is shown with a dashed connection since that fetch happens once at pod startup, not on every request.",
        whyDevops:
          "Static diagrams are good at showing *what exists*; this one is good at showing *what happens, in what order* — a genuinely different question, and the reason this is the only chapter in the module that animates anything.",
        handsOn: [
          { label: 'The real flow, verified end to end this session', code: 'curl -X POST https://devopspk.online/ingest -d \'{"text":"...", "source":"..."}\'\n# real WebSocket /chat query -- rate limiter checked, Qdrant searched,\n# Gemini streamed the answer back -- the exact sequence this diagram shows' },
        ],
        troubleshooting: [
          'Assuming Key Vault is hit on every request → it\'s only read once, at pod startup (`config.py`); a request never touches Key Vault directly, which is exactly why that connection is drawn dashed and off the main animated path.',
        ],
        interview: [
          'Why is the Key Vault connection in this diagram dashed while the rest of the request path is a solid, animated line?',
          'What would this diagram look like differently for a cached, repeat request versus a first-time one? (Trick question — walk through why there\'s no cache in this path at all.)',
        ],
        azureConnection:
          "This is the literal execution path verified with real `curl`/WebSocket requests throughout Modules 10-12 — not a description of intended behavior, the actual, tested request lifecycle of the live app.",
      },
      {
        id: 'architecture-cicd',
        title: 'How code gets from a merge to production',
        diagramId: 'cicd-pipeline',
        concept:
          "The pipeline from a merged PR to a live change at `devopspk.online`, including the auto-redeploy step added after a real incident: for a while, a fresh image published to `ghcr.io` never actually reached the running pods, so Module 12's content sat stale in production until someone manually restarted them. `deploy`'s approval gate (Module 7) still requires a human to say go; what changed is what happens automatically once they do.",
        whyDevops:
          "A CI/CD diagram that stops at 'image published' is describing Continuous Integration, not Continuous Delivery — the real gap this project hit (a published image nobody told the cluster to pull) is exactly the kind of thing that's invisible until a real diagram, or a real user, forces you to trace the whole path.",
        handsOn: [
          { label: 'The real fix this diagram reflects', code: '# .github/workflows/ci.yml, deploy job, after the approval gate:\naz vm run-command invoke --name app-vm1 --command-id RunShellScript --scripts \\\n  "kubectl rollout restart deployment backend -n azureops-copilot\n   kubectl rollout restart deployment frontend -n azureops-copilot"\ncurl -sf https://devopspk.online/health   # real post-deploy verification' },
        ],
        troubleshooting: [],
        interview: [
          'Why does "the image is published" not mean "the change is live," and what closed that gap in this project?',
        ],
        azureConnection:
          "This is a real, dated fix (added the same day the gap was found live on `devopspk.online`), using the OIDC identity's existing `Contributor` role — flagged as broader than necessary in Module 11's RBAC audit, and deliberately kept for exactly this kind of later automation.",
      },
      {
        id: 'architecture-component-backend',
        title: 'Component breakdown: the backend',
        diagramId: 'component-backend',
        concept:
          "One level deeper than the system diagrams: what's actually inside a `backend` pod. `config.py` fetches secrets once at boot; `rate_limit.py` checks every `/ingest` and `/chat` call before any real work happens; `rag.py` does the actual RAG pipeline (embed → search Qdrant → generate via Gemini); `tracing.py` wraps all of it in OpenTelemetry spans sent to Tempo. This is the same information as the request-flow chapter, but organized by *module*, not by *request sequence*.",
        whyDevops:
          "Knowing both views — request-sequence and code-module — is what lets you answer both \"what happens when a user sends a message\" and \"which file do I open to fix the rate limiter\" without re-deriving one from the other every time.",
        handsOn: [
          { label: "The real files this diagram maps to", code: 'backend/\n  config.py      # secrets: Key Vault via Managed Identity, or .env locally\n  rate_limit.py  # sliding-window limiter, per client IP\n  main.py        # FastAPI routes: /health, /ingest, /chat\n  rag.py         # embed(), retrieve() -> Qdrant, generate() -> Gemini\n  tracing.py     # OpenTelemetry setup, exports to Tempo' },
        ],
        troubleshooting: [],
        interview: [
          'If a real user reported "the chat feature is slow," which of these components would you check first, and why?',
        ],
        azureConnection:
          "Every one of these files exists in the real repo and was independently built, tested, and in several cases debugged live across Modules 4, 10, and 11 — this diagram is a map of real code, not an idealized one.",
      },
      {
        id: 'architecture-component-frontend',
        title: 'Component breakdown: the frontend',
        diagramId: 'component-frontend',
        concept:
          "The `frontend` pod is a single nginx container serving the built React SPA (this exact curriculum browser and the AI Mentor widget) and doubling as the internal reverse proxy: `nginx.conf`'s `proxy_pass` rules forward `/ingest` and `/chat` to `backend:8000` over the cluster's internal network — the browser never talks to the backend pod directly, and the backend's Service is never exposed outside the cluster at all.",
        whyDevops:
          "This exact pattern — one container serving static assets and proxying API calls — has been in this project since Module 4's Docker Compose setup; nothing about moving it into Kubernetes changed the pattern, only where it runs.",
        handsOn: [
          { label: 'The real nginx.conf rules this diagram reflects', code: 'location /chat {\n  proxy_pass http://backend:8000;\n  proxy_http_version 1.1;\n  proxy_set_header Upgrade $http_upgrade;   # WebSocket upgrade\n  proxy_set_header Connection "upgrade";\n}' },
        ],
        troubleshooting: [],
        interview: [
          'Why does the WebSocket proxy rule need explicit Upgrade/Connection headers when the plain HTTP proxy rules for /ingest don\'t?',
        ],
        azureConnection:
          "This is why the backend's Kubernetes Service never needed its own Ingress rule at all — every external request reaches it exclusively through this nginx proxy layer, one hop inside the cluster.",
      },
      {
        id: 'architecture-component-monitoring',
        title: 'Component breakdown: monitoring and tracing',
        diagramId: 'component-monitoring',
        concept:
          "The self-hosted PLG (Prometheus/Loki/Grafana) stack plus Tempo, all real data paths: node-exporter and kube-state-metrics feed Prometheus; Promtail feeds Loki; the backend's own OTel SDK feeds Tempo; Prometheus feeds Alertmanager, which feeds a real webhook receiver. Grafana ties all three databases together as datasources at `/grafana`. Every one of these arrows was independently verified this project — including the real incident (Module 10) where a Helm chart's own auto-generated datasource silently conflicted with this exact wiring.",
        whyDevops:
          "A monitoring stack diagram that only shows \"metrics go to Grafana\" hides the actual failure modes — this one shows the real collectors, the real storage backends, and the real alert-routing path, because that's the level of detail needed to actually debug it when something in this chain breaks.",
        handsOn: [
          { label: 'Verifying this exact wiring against the real stack', code: "curl -s http://<grafana-ip>/api/datasources\n# Alertmanager, Loki, Prometheus (default), Tempo -- all four,\n# exactly as this diagram shows, confirmed via the real Grafana API" },
        ],
        troubleshooting: [],
        interview: [
          'Trace the path a single log line takes from a pod\'s stdout to being visible in Grafana, using this diagram.',
        ],
        azureConnection:
          "$0 marginal cost for this entire stack — reusing compute already paid for since Module 8, the direct payoff of every self-hosted decision made across Modules 10 and 11.",
      },
    ],
  },
]

export const stubModules: { number: number; title: string; outcome: string }[] = [
  { number: 7, title: 'CI/CD with GitHub Actions', outcome: 'Create a repeatable build-test-scan-deploy pipeline.' },
  { number: 8, title: 'Kubernetes Fundamentals', outcome: 'Understand the core Kubernetes control model before using AKS.' },
  { number: 9, title: 'Azure Kubernetes Service (AKS)', outcome: 'Deploy and operate a realistic workload on managed Kubernetes.' },
  { number: 13, title: 'Infrastructure as Code with Terraform', outcome: 'Capture everything built across Modules 1-12 as code, and prove it by rebuilding from Terraform alone.' },
]
