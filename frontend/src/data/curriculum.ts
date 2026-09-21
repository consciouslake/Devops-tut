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
          "`azureops-lb` now genuinely load-balances `app-vm1`/`app-vm2` on port 8080 behind a public frontend on port 80 (moved from 8000 in Chapter 7 once the WAF layer went in front), and it took real debugging to get there: a mangled health-probe path (Git Bash path-mangling, the same bug class as Module 4/5), a missing NSG rule for actual client traffic vs. probe traffic, and a redundant auto-created NIC-level NSG stacking on the intended subnet-level one. Failover was verified for real too — stopping `pyapp` on `app-vm1` made all 8 test requests land on `app-vm2` within ~20s, and restarting it brought both back into rotation automatically, no manual re-registration needed.\n\nAfter this chapter, a real cost conversation happened: should this managed LB be replaced with a software one? The decision made was to keep `azureops-lb` running for a few extra days specifically to compare it side-by-side against the cost-conscious choices made in Chapter 7 — worth being precise about what that comparison actually is: Chapter 7's `owasp/modsecurity-crs` containers are a software WAF/reverse-proxy running independently on each VM, not a software load balancer replacing `azureops-lb` — Azure's Load Balancer is still the only thing actually distributing traffic between `app-vm1` and `app-vm2` today. A true managed-vs-software Load Balancer comparison (e.g. HAProxy doing the cross-VM distribution itself) would be a genuine follow-up exercise, not something this session built.",
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
          "This project deliberately built the self-hosted path instead of Azure Application Gateway, as a direct cost-conscious decision made mid-session: `app-vm1`/`app-vm2` each run an `owasp/modsecurity-crs:nginx` container proxying to the local app, with `azureops-lb`'s health probe and load-balancing rule re-pointed to port 8080 so every request now passes through WAF inspection. Verified end-to-end through the full real path (internet -> Load Balancer -> WAF -> app): a normal request returned `Hello from app-vm1`, and a SQL-injection-style payload (`?id=1' OR '1'='1`) was blocked with HTTP 403 before ever reaching the Python app — the same protection Application Gateway's WAF SKU would provide, at zero additional Azure cost.",
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
          'A real deliberate failure was injected into `app-subnet-nsg` this session (`Allow-Internet-8080` flipped to Deny), confirmed via the browser (`ERR_TIMED_OUT`) and `curl`, diagnosed correctly in two steps (app-health check ruled out the application layer, NSG rule listing found the actual cause), fixed, and recovery confirmed with a real request returning `Hello from app-vm2` through the full WAF-protected path again — the complete lifecycle of a real incident, run end-to-end in a safe, reversible environment.',
      },
    ],
  },
]

export const stubModules: { number: number; title: string; outcome: string }[] = [
  { number: 7, title: 'CI/CD with GitHub Actions', outcome: 'Create a repeatable build-test-scan-deploy pipeline.' },
  { number: 8, title: 'Kubernetes Fundamentals', outcome: 'Understand the core Kubernetes control model before using AKS.' },
  { number: 9, title: 'Azure Kubernetes Service (AKS)', outcome: 'Deploy and operate a realistic workload on managed Kubernetes.' },
  { number: 10, title: 'Monitoring & Observability', outcome: 'Detect, investigate, and explain production behavior.' },
  { number: 11, title: 'Azure Security & Governance', outcome: 'Secure the application and its delivery pipeline without hard-coded secrets.' },
  { number: 12, title: 'Azure Front Door & Production Edge', outcome: 'Understand when and how Front Door fits into a global Azure application.' },
  { number: 13, title: 'Infrastructure as Code with Terraform', outcome: 'Capture everything built across Modules 1-12 as code, and prove it by rebuilding from Terraform alone.' },
]
