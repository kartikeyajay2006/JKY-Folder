# Parser host policy

Production runs unprivileged bubblewrap with fresh user, process, IPC, network and mount namespaces. Only `/usr`, available loader libraries, `node_modules`, the worker program and one read-only original enter the namespace. `/proc` is empty; it never exposes the API process environment. Temporary writes use a bounded 256 MiB filesystem. Worker output is capped at 8 MiB and parsed against a strict schema. CPU time is 30 seconds, wall time 45 seconds and the V8 heap 192 MiB. Docker additionally limits the complete service to 2 GiB, two CPUs and 256 processes. Heap and wall limits alone are not a kernel memory guarantee outside Docker.

The application retains no host capabilities, cannot gain privileges and uses a read-only root filesystem. `parser-host-seccomp.json` derives from [Moby profiles seccomp/v0.2.1](https://github.com/moby/profiles/tree/seccomp/v0.2.1), under Apache-2.0. Its additional allow rule permits namespace setup (`unshare`, `mount`, `umount2`, `pivot_root`, `setns`, `clone`). Existing syscall restrictions remain; this is not `seccomp=unconfined`. Kernel capability checks still prohibit privileged host mounts. The configuration needs independent security review.

On Ubuntu 24.04+ hosts with AppArmor 4, load the supplied policy and use the Compose override:

```sh
sudo apparmor_parser -r -W deploy/jky-parser-host.apparmor
docker compose -f docker-compose.yml -f deploy/compose.apparmor.yml --profile https --profile scan up -d --build
```

SELinux and other host policies may need an independently reviewed deployment-specific rule. Never turn off those policies or grant `SYS_ADMIN` to make startup pass. The startup probe rejects incompatible namespace/security settings before opening the API, and there is no unsandboxed production fallback. Run the probe on the actual host after changes.

Linux requires bubblewrap and util-linux, with Node installed under `/usr`. The Docker image supplies those dependencies. Development remains usable with process mode. A supported production deployment has one API process and a local filesystem with working POSIX locks; a kernel `flock` prevents duplicate runtime owners. PostgreSQL/shared-object-storage and distributed coordination remain a separate scaling project.
