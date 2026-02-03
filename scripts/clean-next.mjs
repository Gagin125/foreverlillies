import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const cwd = process.cwd();
const isOneDrive = /OneDrive/i.test(cwd);

if (isOneDrive) {
  console.warn(
    "\n[clean-next] WARNING: Running Next.js from OneDrive can corrupt .next output. Prefer C:\\dev\\... or mark the folder 'Always keep on this device' and exclude .next from sync.\n"
  );
}

const baseTargets = [
  ".next",
  path.join("node_modules", ".cache"),
  ".turbo",
  ".swc"
];

const hardTargets = ["node_modules", "package-lock.json"];
const useHard = process.argv.includes("--hard");
const targets = useHard ? baseTargets.concat(hardTargets) : baseTargets;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function clearAttrib(target) {
  try {
    await execFileAsync("cmd", ["/c", "attrib", "-R", "-S", "-H", "/S", "/D", `${target}\\*`]);
  } catch {
    // ignore
  }
}

async function rmWithRetry(target) {
  const maxAttempts = 10;
  let delay = 200;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await fs.rm(target, { recursive: true, force: true });
      return true;
    } catch (err) {
      const code = err?.code;
      if (["EPERM", "EBUSY", "ENOTEMPTY"].includes(code) && attempt < maxAttempts) {
        await sleep(delay);
        delay = Math.min(delay * 2, 2000);
        continue;
      }
      return false;
    }
  }
  return false;
}

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

const failures = [];

for (const target of targets) {
  if (!(await exists(target))) {
    console.log(`[clean-next] skip ${target} (not found)`);
    continue;
  }

  await clearAttrib(target);
  const removed = await rmWithRetry(target);

  if (removed && !(await exists(target))) {
    console.log(`[clean-next] removed ${target}`);
  } else {
    console.warn(`[clean-next] FAILED to remove ${target}`);
    failures.push(target);
  }
}

if (failures.length > 0) {
  console.error("\n[clean-next] Some paths could not be removed:");
  failures.forEach((p) => console.error(` - ${p}`));
  console.error("\nClose the dev server and try again. If needed, kill node.exe or restart your PC.");
  process.exit(1);
}
