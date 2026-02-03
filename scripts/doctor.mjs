const cwd = process.cwd();
const isOneDrive = /OneDrive/i.test(cwd);

if (isOneDrive) {
  console.warn(
    "\n[doctor] WARNING: This project is running inside a OneDrive folder. Next.js build artifacts (.next) can be corrupted by sync or Files-On-Demand.\n" +
      "Prefer moving the repo to C:\\dev\\..., or mark the folder 'Always keep on this device' and add a Defender exclusion for this path.\n"
  );
}
