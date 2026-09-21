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
]

export const stubModules: { number: number; title: string; outcome: string }[] = [
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
