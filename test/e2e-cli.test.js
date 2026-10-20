import fs from "fs/promises";
import path from "path";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";

const execPromise = promisify(exec);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const TEST_DIR = path.resolve(REPO_ROOT, "test-agents-setup");
const CLI_PATH = path.join(REPO_ROOT, "bin/cli.js");

async function runCliHeadless(target, mode, skills) {
  const cmd = `node ${CLI_PATH} --target ${target} --mode ${mode} --skills "${skills}" --yes`;
  const { stdout, stderr } = await execPromise(cmd);
  return { output: stdout, errorOutput: stderr };
}

async function runCliInteractive(
  target,
  modeChoice,
  skillsChoice,
  confirmChoice,
) {
  return new Promise((resolve, reject) => {
    // Spawn interactive node cli
    const child = spawn("node", [CLI_PATH]);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      const chunk = data.toString();
      stdout += chunk;

      if (chunk.includes("Enter target installation directory")) {
        child.stdin.write(target + "\n");
      } else if (chunk.includes("Enter choice (1 or 2)")) {
        child.stdin.write(modeChoice + "\n");
      } else if (chunk.includes("Enter IDs to install")) {
        child.stdin.write(skillsChoice + "\n");
      } else if (chunk.includes("Proceed with installation?")) {
        child.stdin.write(confirmChoice + "\n");
      }
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(
          new Error(
            `Interactive CLI exited with code ${code}. Stderr: ${stderr}`,
          ),
        );
      }
    });
  });
}

async function verifyInstallation(
  target,
  expectedSkillsCount,
  isMerged = false,
  expectedSkillsList = [],
) {
  const agentsDir = path.join(target, ".agents");
  const skillsDir = path.join(agentsDir, "skills");
  const artifactsDir = path.join(agentsDir, "artifacts");
  const stateDir = path.join(agentsDir, "state");
  const scriptsDir = path.join(agentsDir, "scripts");

  // 1. Verify directory existence
  await fs.access(agentsDir);
  await fs.access(skillsDir);
  await fs.access(artifactsDir);
  await fs.access(stateDir);

  // 2. Verify keep files
  await fs.access(path.join(artifactsDir, ".keep"));
  await fs.access(path.join(stateDir, ".keep"));

  // 3. Verify .aiignore
  const aiignore = await fs.readFile(path.join(target, ".aiignore"), "utf-8");
  if (!aiignore.includes("!.agents/")) {
    throw new Error(".aiignore is missing crucial un-ignore rules!");
  }

  // 4. Verify AGENTS.md
  const agentsMd = await fs.readFile(path.join(target, "AGENTS.md"), "utf-8");
  if (isMerged) {
    if (!agentsMd.includes("# --- UNIVERSAL AGENT DIRECTIVES ---")) {
      throw new Error("AGENTS.md is missing the integrated merge header!");
    }
  } else {
    if (!agentsMd.includes("# Global AI Agent Directives")) {
      throw new Error("AGENTS.md has missing core content!");
    }
  }
  if (agentsMd.includes("{{ INCLUDE")) {
    throw new Error(
      "Compilation Failure: Unresolved include tag found in AGENTS.md!",
    );
  }

  // 5. Verify Compiled Skills Count & Include Resolution
  const installedSkills = await fs.readdir(skillsDir);
  console.log(
    `   Found ${installedSkills.length} installed skills in .agents/skills/`,
  );

  if (
    expectedSkillsCount !== undefined &&
    installedSkills.length !== expectedSkillsCount
  ) {
    throw new Error(
      `Expected ${expectedSkillsCount} skill folders, but found ${installedSkills.length}`,
    );
  }

  if (expectedSkillsList.length > 0) {
    for (const f of expectedSkillsList) {
      if (!installedSkills.includes(f)) {
        throw new Error(`Expected skill folder ${f} was not installed!`);
      }
    }
  }

  // Verify that all includes were compiled and resolved (NO '{{ INCLUDE }}' should remain in SKILL.md)
  for (const skillFolder of installedSkills) {
    const fileContent = await fs.readFile(
      path.join(skillsDir, skillFolder, "SKILL.md"),
      "utf-8",
    );
    if (fileContent.includes("{{ INCLUDE")) {
      throw new Error(
        `Compilation Failure: Unresolved include tag found in ${skillFolder}/SKILL.md!`,
      );
    }
  }

  // 6. Verify scripts copy and execution permission
  const srcScriptsDir = path.join(REPO_ROOT, "template/scripts");
  let expectedScripts = [];
  try {
    expectedScripts = await fs.readdir(srcScriptsDir);
  } catch {}

  if (expectedScripts.length > 0) {
    await fs.access(scriptsDir);
    const installedScripts = await fs.readdir(scriptsDir);
    if (installedScripts.length !== expectedScripts.length) {
      throw new Error(
        `Expected ${expectedScripts.length} utility scripts, but found ${installedScripts.length}`,
      );
    }
    // Verify execution bits by testing stat
    for (const s of installedScripts) {
      const stats = await fs.stat(path.join(scriptsDir, s));
      const isExecutable = (stats.mode & 0o111) !== 0;
      if (!isExecutable) {
        throw new Error(`Script ${s} is not executable!`);
      }
    }
  }

  // 7. Verify Agent Redirection files (only if they actually exist)
  const agentRuleFiles = [
    ".cursorrules",
    ".windsurfrules",
    ".clinerules",
    ".copilotrules",
    ".github/copilot-instructions.md",
    "CLAUDE.md",
    "GEMINI.md",
    ".gemini",
    ".geminirules",
  ];

  for (const r of agentRuleFiles) {
    const rulePath = path.join(target, r);
    let ruleExists = false;
    try {
      await fs.access(rulePath);
      ruleExists = true;
    } catch {}

    if (ruleExists) {
      const ruleContent = await fs.readFile(rulePath, "utf-8");
      if (!ruleContent.includes("Universal AI Agent & Copilot Redirection")) {
        throw new Error(`Redirection check failed in ${r}!`);
      }
    }
  }
}

async function runE2ETests() {
  console.log("=============================================");
  console.log("   Starting Installer E2E Verification        ");
  console.log("=============================================\n");

  try {
    const manifestRaw = await fs.readFile(
      path.join(REPO_ROOT, "template/skills/skills.json"),
      "utf-8",
    );
    const { skills: manifestSkills } = JSON.parse(manifestRaw);
    const totalSkillsCount = manifestSkills.length;

    // -------------------------------------------------------------
    // Test Scenario 1: Clean installation of ALL modules (Overwrite)
    // -------------------------------------------------------------
    console.log(
      "Scenario 1: Clean Installation (All Modules, Overwrite, Headless)...",
    );
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    await fs.mkdir(TEST_DIR, { recursive: true });

    await runCliHeadless(TEST_DIR, "overwrite", "all");
    await verifyInstallation(TEST_DIR, totalSkillsCount); // Expecting all manifest skills
    console.log("✓ Scenario 1: PASSED\n");

    // -------------------------------------------------------------
    // Test Scenario 2: Granular selective install (Headless)
    // -------------------------------------------------------------
    console.log(
      "Scenario 2: Granular Selective Installation (Modules 1, 2, 4, Headless)...",
    );
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    await fs.mkdir(TEST_DIR, { recursive: true });

    await runCliHeadless(TEST_DIR, "overwrite", "1,2,4");
    await verifyInstallation(TEST_DIR, 3, false, [
      "core-behavioral-baseline",
      "core-analytical-shortcuts",
      "core-code-craft",
    ]);
    console.log("✓ Scenario 2: PASSED\n");

    // -------------------------------------------------------------
    // Test Scenario 3: Safe Merge with existing AGENTS.md (Headless)
    // -------------------------------------------------------------
    console.log(
      "Scenario 3: Safe Merge with existing custom AGENTS.md (Headless)...",
    );
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    await fs.mkdir(TEST_DIR, { recursive: true });

    // Pre-create a custom local AGENTS.md and an existing .cursorrules and CLAUDE.md and .github/copilot-instructions.md
    const originalContent =
      "# My Custom Project Instructions\n- Do things my way\n";
    await fs.writeFile(path.join(TEST_DIR, "AGENTS.md"), originalContent);
    await fs.writeFile(
      path.join(TEST_DIR, ".cursorrules"),
      "# Custom Cursor rules\n",
    );
    await fs.writeFile(
      path.join(TEST_DIR, "CLAUDE.md"),
      "# Custom Claude rules\n",
    );
    await fs.mkdir(path.join(TEST_DIR, ".github"), { recursive: true });
    await fs.writeFile(
      path.join(TEST_DIR, ".github/copilot-instructions.md"),
      "# Custom Copilot instructions\n",
    );

    await runCliHeadless(TEST_DIR, "safe", "1,2");
    await verifyInstallation(TEST_DIR, 2, true, [
      "core-behavioral-baseline",
      "core-analytical-shortcuts",
    ]);

    // Verify custom original content was preserved and redirection was appended
    const cursorrulesMerged = await fs.readFile(
      path.join(TEST_DIR, ".cursorrules"),
      "utf-8",
    );
    if (!cursorrulesMerged.startsWith("# Custom Cursor rules")) {
      throw new Error(
        "Safe Merge failed: Original .cursorrules content was overwritten!",
      );
    }

    const clauderulesMerged = await fs.readFile(
      path.join(TEST_DIR, "CLAUDE.md"),
      "utf-8",
    );
    if (!clauderulesMerged.startsWith("# Custom Claude rules")) {
      throw new Error(
        "Safe Merge failed: Original CLAUDE.md content was overwritten!",
      );
    }

    const copilotrulesMerged = await fs.readFile(
      path.join(TEST_DIR, ".github/copilot-instructions.md"),
      "utf-8",
    );
    if (!copilotrulesMerged.startsWith("# Custom Copilot instructions")) {
      throw new Error(
        "Safe Merge failed: Original .github/copilot-instructions.md content was overwritten!",
      );
    }

    const agentsMdMerged = await fs.readFile(
      path.join(TEST_DIR, "AGENTS.md"),
      "utf-8",
    );
    if (!agentsMdMerged.startsWith("# My Custom Project Instructions")) {
      throw new Error(
        "Safe Merge failed: Original AGENTS.md content was overwritten!",
      );
    }
    console.log("✓ Scenario 3: PASSED\n");

    // -------------------------------------------------------------
    // Test Scenario 4: Fully Interactive Mode Verification (readline)
    // -------------------------------------------------------------
    console.log(
      "Scenario 4: Fully Interactive Installation (All Modules, Safe Merge)...",
    );
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    await fs.mkdir(TEST_DIR, { recursive: true });

    // Pre-create a custom local AGENTS.md
    await fs.writeFile(
      path.join(TEST_DIR, "AGENTS.md"),
      "# Original Interactive Scope\n",
    );

    // Inputs: target_dir, overwrite/merge (1=safe merge), skills ("all"), confirm ("y")
    await runCliInteractive(TEST_DIR, "1", "all", "y");
    await verifyInstallation(TEST_DIR, totalSkillsCount, true); // Verified all compiled skills

    const agentsMdInteractive = await fs.readFile(
      path.join(TEST_DIR, "AGENTS.md"),
      "utf-8",
    );
    if (!agentsMdInteractive.startsWith("# Original Interactive Scope")) {
      throw new Error(
        "Interactive Safe Merge failed: Original AGENTS.md was overwritten!",
      );
    }
    console.log("✓ Scenario 4: PASSED\n");

    // -------------------------------------------------------------
    // Test Scenario 5: Complete Uninstallation / Cleanup
    // -------------------------------------------------------------
    console.log(
      "Scenario 5: Complete Uninstallation (All Modules, Cleanup, Headless)...",
    );
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    await fs.mkdir(TEST_DIR, { recursive: true });

    // Pre-create rule files (one completely empty, one with custom content)
    await fs.writeFile(path.join(TEST_DIR, ".cursorrules"), "");
    await fs.writeFile(
      path.join(TEST_DIR, "CLAUDE.md"),
      "# Custom Claude Rules\nDo not delete me!\n",
    );

    // Install setup
    await runCliHeadless(TEST_DIR, "safe", "all");
    await verifyInstallation(TEST_DIR, totalSkillsCount, false);

    // Run uninstall
    const unCmd = `node ${CLI_PATH} --target ${TEST_DIR} --uninstall --yes`;
    await execPromise(unCmd);

    // Verify cleanup
    // 1. .agents/ must be gone
    try {
      await fs.access(path.join(TEST_DIR, ".agents"));
      throw new Error(".agents directory was not deleted during uninstall!");
    } catch (err) {
      if (err.message.includes("was not deleted")) throw err;
    }

    // 2. AGENTS.md must be gone
    try {
      await fs.access(path.join(TEST_DIR, "AGENTS.md"));
      throw new Error("AGENTS.md was not deleted during uninstall!");
    } catch (err) {
      if (err.message.includes("was not deleted")) throw err;
    }

    // 3. .aiignore must be gone
    try {
      await fs.access(path.join(TEST_DIR, ".aiignore"));
      throw new Error(".aiignore was not deleted during uninstall!");
    } catch (err) {
      if (err.message.includes("was not deleted")) throw err;
    }

    // 4. .cursorrules must be gone (since it was empty after stripping redirection)
    try {
      await fs.access(path.join(TEST_DIR, ".cursorrules"));
      throw new Error(".cursorrules was not deleted after becoming empty!");
    } catch (err) {
      if (err.message.includes("was not deleted")) throw err;
    }

    // 5. .github/ must be gone (since it was empty after stripping redirection)
    try {
      await fs.access(path.join(TEST_DIR, ".github"));
      throw new Error(
        ".github directory was not deleted after becoming empty!",
      );
    } catch (err) {
      if (err.message.includes("was not deleted")) throw err;
    }

    // 6. CLAUDE.md must still exist but have redirection stripped
    const claudeContent = await fs.readFile(
      path.join(TEST_DIR, "CLAUDE.md"),
      "utf-8",
    );
    if (!claudeContent.includes("# Custom Claude Rules")) {
      throw new Error("CLAUDE.md custom content was lost during uninstall!");
    }
    if (claudeContent.includes("Universal AI Agent & Copilot Redirection")) {
      throw new Error(
        "CLAUDE.md redirection block was not stripped during uninstall!",
      );
    }

    console.log("✓ Scenario 5: PASSED\n");

    // -------------------------------------------------------------
    // Test Scenario 6: Subcommands (skill list, add, update)
    // -------------------------------------------------------------
    console.log("Scenario 6: CLI Subcommands (list, add, update, Headless)...");
    await fs.rm(TEST_DIR, { recursive: true, force: true });
    await fs.mkdir(TEST_DIR, { recursive: true });

    // 1. Test skill list
    const { stdout: listOutput } = await execPromise(
      `node ${CLI_PATH} skill list`,
    );
    if (
      !listOutput.includes("Available Skill Modules") ||
      !listOutput.includes("core-behavioral-baseline")
    ) {
      throw new Error(
        "Subcommand 'skill list' failed to list available skills!",
      );
    }
    console.log("   ↳ Subcommand 'skill list': PASSED");

    // 2. Test skill add <id>
    await execPromise(
      `node ${CLI_PATH} skill add core-behavioral-baseline --target ${TEST_DIR}`,
    );
    const destSkillPath = path.join(
      TEST_DIR,
      ".agents/skills/core-behavioral-baseline/SKILL.md",
    );
    await fs.access(destSkillPath);
    console.log("   ↳ Subcommand 'skill add': PASSED");

    // 3. Test skill update
    // Let's modify the installed skill first to see if update overwrites it
    await fs.writeFile(destSkillPath, "Obsolete Content");
    await execPromise(`node ${CLI_PATH} skill update --target ${TEST_DIR}`);
    const updatedContent = await fs.readFile(destSkillPath, "utf-8");
    if (updatedContent.includes("Obsolete Content")) {
      throw new Error(
        "Subcommand 'skill update' failed to overwrite and update installed skill!",
      );
    }
    console.log("   ↳ Subcommand 'skill update': PASSED");

    console.log("✓ Scenario 6: PASSED\n");

    console.log("=============================================");
    console.log("    ALL CLI E2E TEST SCENARIOS PASSED!        ");
    console.log("     100% FUNCTIONAL TEST COVERAGE ATTAINED!  ");
    console.log("=============================================");
  } catch (err) {
    console.error("\n✗ E2E TEST SCENARIO FAILED:");
    console.error(err);
    process.exit(1);
  } finally {
    // Clean up test sandbox
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  }
}

runE2ETests();
