#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import os from "os";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { program } from "commander";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const REPO_ROOT = path.resolve(__dirname, "..");

// Helper to expand user home directory shortcut (~)
function expandHomeDir(filepath) {
  if (filepath === "~") {
    return os.homedir();
  }
  if (filepath.startsWith("~/") || filepath.startsWith("~" + path.sep)) {
    return path.join(os.homedir(), filepath.slice(2));
  }
  return filepath;
}

// Helper to ask questions in terminal
async function askQuestion(rl, question, defaultValue) {
  const ans = await rl.question(`${question} [${defaultValue}]: `);
  return ans.trim() || defaultValue;
}

// Helper to resolve template includes recursively
async function compileTemplate(filePath, sharedDir) {
  let content = await fs.readFile(filePath, "utf-8");
  const includeRegex = /\{\{\s*INCLUDE:\s*(.*?)\s*\}\}/g;
  let match;

  while ((match = includeRegex.exec(content)) !== null) {
    const includePath = path.resolve(sharedDir, match[1]);
    try {
      // Trailing newlines of the include would add a blank line to the surrounding markdown
      const includeContent = (await fs.readFile(includePath, "utf-8")).replace(
        /\n+$/,
        "",
      );
      content = content.replace(match[0], includeContent);
    } catch (err) {
      console.warn(
        `Warning: Could not include ${match[1]} from ${includePath}: ${err.message}`,
      );
      content = content.replace(
        match[0],
        `<!-- Failed to include ${match[1]} -->`,
      );
    }
    // Reset regex index because we modified content length
    includeRegex.lastIndex = 0;
  }
  return content;
}

// Dynamic Module Loader on top of skills.json manifest
async function loadModules() {
  const manifestPath = path.join(
    REPO_ROOT,
    "template",
    "skills",
    "skills.json",
  );
  const manifestContent = await fs.readFile(manifestPath, "utf-8");
  const { skills } = JSON.parse(manifestContent);

  return skills.map((s, index) => ({
    id: String(index + 1), // "1", "2", "3" etc. for interactive indexing backward compatibility
    key: s.id, // e.g. "core-behavioral-baseline"
    name: s.file, // e.g. "01-core-behavioral-baseline.md"
    desc: s.description,
    required: s.required,
    version: s.version,
    tags: s.tags,
  }));
}

// Helper to compile and install a single skill
async function installSingleSkill(
  moduleItem,
  targetDir,
  overwriteMode,
  modules,
) {
  const templateSkills = path.join(REPO_ROOT, "template", "skills");
  const templateShared = path.join(REPO_ROOT, "template", "shared");
  const destAgents = path.join(targetDir, ".agents");

  const isGlobalInstall = path.basename(targetDir).startsWith(".");
  const destSkills = isGlobalInstall
    ? path.join(targetDir, "skills")
    : path.join(destAgents, "skills");

  await fs.mkdir(destSkills, { recursive: true });

  const file = moduleItem.name;
  const srcFile = path.join(templateSkills, file);
  const skillDirName = moduleItem.key;
  const skillTargetDir = path.join(destSkills, skillDirName);
  const destFile = path.join(skillTargetDir, "SKILL.md");

  // Explicitly wipe the old skill directory to guarantee a clean, non-polluted replacement and prevent orphaned files
  await fs.rm(skillTargetDir, { recursive: true, force: true });
  await fs.mkdir(skillTargetDir, { recursive: true });

  // Compile and write SKILL.md
  const compiled = await compileTemplate(srcFile, templateShared);
  await fs.writeFile(destFile, compiled);
  console.log(`✓ Compiled and wrote skill: ${skillDirName}/SKILL.md`);

  // Check if there are associated assets/scripts inside the template folder
  const srcAssetDir = path.join(templateSkills, skillDirName);
  let srcAssetDirExists = false;
  try {
    await fs.access(srcAssetDir);
    srcAssetDirExists = true;
  } catch {}

  if (srcAssetDirExists) {
    await fs.cp(srcAssetDir, skillTargetDir, { recursive: true });
    console.log(`   ↳ Copied associated assets/scripts for ${skillDirName}`);
  }
}

// Complete Uninstaller Logic
async function runUninstaller(targetDir, skipPrompt) {
  // Resolve redirection block and list of rule files
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

  const redirectComment = `\n\n# ==============================================================================\n#                 Universal AI Agent & Copilot Redirection\n# ==============================================================================\n# This workspace utilizes a unified cognitive rule-structure. To prevent context \n# drift, hallucinations, or anti-hallucination rule violations, ALL AI agents \n# (Cursor, Copilot, Windsurf, Gemini, Cline, Roo Code, etc.) working inside this\n# codebase MUST read, internalize, and strictly prioritize:\n# \n# 1. The master root mandates in: AGENTS.md\n# 2. The compiled, flattened specialized skills in: .agents/skills/\n# ==============================================================================\n`;

  if (!skipPrompt) {
    const rl = readline.createInterface({ input, output });
    try {
      const confirm = await askQuestion(
        rl,
        `This will delete .agents/, AGENTS.md, .aiignore and strip redirection from rule files in:\n  ${targetDir}\nProceed with uninstallation? (y/n)`,
        "n",
      );
      if (confirm.toLowerCase() !== "y") {
        console.log("Uninstallation cancelled.");
        rl.close();
        return;
      }
    } catch (err) {
      console.error(`✗ Prompt error: ${err.message}`);
      rl.close();
      process.exit(1);
    } finally {
      rl.close();
    }
  }

  try {
    // 1. Remove .agents/
    const destAgents = path.join(targetDir, ".agents");
    try {
      await fs.rm(destAgents, { recursive: true, force: true });
      console.log("✓ Removed .agents/ directory");
    } catch (err) {
      console.warn(`⚠ Could not remove .agents/ directory: ${err.message}`);
    }

    // 2. Remove AGENTS.md
    const destAgentsMd = path.join(targetDir, "AGENTS.md");
    try {
      await fs.rm(destAgentsMd, { force: true });
      console.log("✓ Removed AGENTS.md");
    } catch (err) {
      console.warn(`⚠ Could not remove AGENTS.md: ${err.message}`);
    }

    // 3. Remove .aiignore
    const destAiignore = path.join(targetDir, ".aiignore");
    try {
      await fs.rm(destAiignore, { force: true });
      console.log("✓ Removed .aiignore");
    } catch (err) {
      console.warn(`⚠ Could not remove .aiignore: ${err.message}`);
    }

    // 4. Strip redirection from rule files
    for (const ruleFile of agentRuleFiles) {
      const destRulePath = path.join(targetDir, ruleFile);
      let ruleFileExists = false;
      try {
        await fs.access(destRulePath);
        ruleFileExists = true;
      } catch {}

      if (!ruleFileExists) continue;

      try {
        let ruleContent = await fs.readFile(destRulePath, "utf-8");
        if (ruleContent.includes(redirectComment)) {
          ruleContent = ruleContent.replace(redirectComment, "");
        } else {
          // Regex fallback
          const redirectRegex =
            /\r?\n\r?\n# =+[\s\S]*?Universal AI Agent & Copilot Redirection[\s\S]*?# =+\r?\n?/g;
          ruleContent = ruleContent.replace(redirectRegex, "");
        }

        ruleContent = ruleContent.trim();
        if (ruleContent === "") {
          await fs.rm(destRulePath, { force: true });
          // Clean up empty directories if left behind (like .github/)
          if (ruleFile.includes("/")) {
            const parentDir = path.dirname(destRulePath);
            try {
              const remainingFiles = await fs.readdir(parentDir);
              if (remainingFiles.length === 0) {
                await fs.rmdir(parentDir);
                console.log(
                  `✓ Removed empty parent directory: ${path.basename(parentDir)}`,
                );
              }
            } catch {}
          }
          console.log(`✓ Removed empty rule file: ${ruleFile}`);
        } else {
          await fs.writeFile(destRulePath, ruleContent + "\n");
          console.log(`✓ Stripped redirection from: ${ruleFile}`);
        }
      } catch (err) {
        console.warn(
          `⚠ Could not process ${ruleFile} during uninstall: ${err.message}`,
        );
      }
    }

    console.log("\n=============================================");
    console.log("   Uninstallation completed successfully!    ");
    console.log("=============================================\n");
  } catch (err) {
    console.error(`✗ Uninstallation failed: ${err.message}`);
    process.exit(1);
  }
}

// Main Interactive/Headless Installer Action
async function runInstaller(options, modules) {
  console.log("\n=============================================");
  console.log("    Universal Agent Scaffolding Installer    ");
  console.log("=============================================\n");

  const originalCwd = process.env.INIT_CWD || process.cwd();
  let targetDir = originalCwd;

  if (options.uninstall) {
    const targetInput = options.target || ".";
    targetDir = path.resolve(originalCwd, expandHomeDir(targetInput));
    await runUninstaller(targetDir, options.yes);
    return;
  }

  let overwriteMode = false;
  let selectedFiles = [];

  const isHeadless = !!(
    options.target ||
    options.mode ||
    options.skills ||
    options.yes
  );

  if (isHeadless) {
    // ------------------ HEADLESS MODE ------------------
    console.log("Running in Headless (Non-Interactive) Mode...\n");

    // 1. Resolve target
    const targetInput = options.target || ".";
    targetDir = path.resolve(originalCwd, expandHomeDir(targetInput));

    // 2. Resolve mode
    const modeInput = options.mode || "safe";
    overwriteMode = modeInput.toLowerCase() === "overwrite";

    // 3. Resolve skills
    const skillsInput = options.skills || "all";
    if (skillsInput.toLowerCase() === "all") {
      selectedFiles = modules.map((m) => m.name);
    } else {
      const selectedIds = skillsInput.split(",").map((s) => s.trim());
      selectedFiles = modules
        .filter(
          (m) =>
            selectedIds.includes(m.id) ||
            selectedIds.includes(m.name) ||
            selectedIds.includes(m.key),
        )
        .map((m) => m.name);
    }

    if (!options.yes) {
      console.error(
        "Error: Headless mode requires the --yes or -y flag to confirm execution.",
      );
      process.exit(1);
    }
  } else {
    // ------------------ INTERACTIVE MODE ------------------
    const rl = readline.createInterface({ input, output });

    try {
      // 1. Ask Target Directory
      const targetInput = await askQuestion(
        rl,
        "Enter target installation directory",
        ".",
      );
      targetDir = path.resolve(originalCwd, expandHomeDir(targetInput));

      // 2. Ask Integration Mode
      console.log("\nSelect Installation Mode:");
      console.log(
        " 1) Safe Merge (Append rules to existing AGENTS.md, merge skills without deleting others)",
      );
      console.log(
        " 2) Overwrite (Wipe and replace existing .agents/ and AGENTS.md)",
      );
      const modeChoice = await askQuestion(rl, "Enter choice (1 or 2)", "1");
      overwriteMode = modeChoice === "2";

      // 3. Display Modules
      console.log("\nAvailable Skill Modules:");
      modules.forEach((m) => {
        console.log(`  ${m.id}) ${m.key.padEnd(28)} - ${m.desc}`);
      });

      const selectChoice = await askQuestion(
        rl,
        'Enter IDs to install (comma-separated, e.g. 1,2,3,5) or "all"',
        "all",
      );
      if (selectChoice.toLowerCase() === "all") {
        selectedFiles = modules.map((m) => m.name);
      } else {
        const selectedIds = selectChoice.split(",").map((s) => s.trim());
        selectedFiles = modules
          .filter(
            (m) =>
              selectedIds.includes(m.id) ||
              selectedIds.includes(m.key) ||
              selectedIds.includes(m.name),
          )
          .map((m) => m.name);
      }

      // 4. Confirm install
      console.log(`\nTarget Location : ${targetDir}`);
      console.log(
        `Mode            : ${overwriteMode ? "OVERWRITE" : "SAFE INTEGRATE"}`,
      );
      console.log(`Skills to Copy  : ${selectedFiles.length} files`);

      const confirm = await askQuestion(
        rl,
        "Proceed with installation? (y/n)",
        "y",
      );
      if (confirm.toLowerCase() !== "y") {
        console.log("Installation cancelled.");
        rl.close();
        return;
      }
    } catch (err) {
      console.error(`✗ Prompt error: ${err.message}`);
      rl.close();
      process.exit(1);
    } finally {
      rl.close();
    }
  }

  // ------------------ EXECUTION ENGINE ------------------
  try {
    const templateRoot = path.join(REPO_ROOT, "template", "root");
    const templateScripts = path.join(REPO_ROOT, "template", "scripts");
    const destAgents = path.join(targetDir, ".agents");
    const destArtifacts = path.join(destAgents, "artifacts");
    const destState = path.join(destAgents, "state");
    const destScripts = path.join(destAgents, "scripts");

    // Ensure basic folders exist
    await fs.mkdir(destAgents, { recursive: true });
    await fs.mkdir(destArtifacts, { recursive: true });
    await fs.mkdir(destState, { recursive: true });

    // Create gitignored keep files
    await fs.writeFile(path.join(destArtifacts, ".keep"), "");
    await fs.writeFile(path.join(destState, ".keep"), "");

    // Handle Root Files (.aiignore)
    const srcAiignore = path.join(templateRoot, ".aiignore");
    const destAiignore = path.join(targetDir, ".aiignore");
    let aiignoreContent = "";
    try {
      aiignoreContent = await fs.readFile(srcAiignore, "utf-8");
    } catch {
      // Fallback default
      aiignoreContent = `# Agent standard ignores\nnode_modules/\nbuild/\ndist/\n.git/\n\n# Unignore agent directories explicitly so tools can index them\n!.agents/\n!.agents/**/*\n!AGENTS.md\n`;
    }
    await fs.writeFile(destAiignore, aiignoreContent);
    console.log("✓ Wrote .aiignore (configured to unignore .agents/)");

    // AGENTS.md
    const srcAgentsMd = path.join(templateRoot, "AGENTS.md");
    const destAgentsMd = path.join(targetDir, "AGENTS.md");
    let agentsMdContent = await fs.readFile(srcAgentsMd, "utf-8");

    let agentsMdExists = false;
    try {
      await fs.access(destAgentsMd);
      agentsMdExists = true;
    } catch {}

    if (agentsMdExists && !overwriteMode) {
      // Safe Merge mode
      let existingContent = await fs.readFile(destAgentsMd, "utf-8");
      if (existingContent.includes("UNIVERSAL AGENT DIRECTIVES")) {
        console.log(
          "! AGENTS.md already contains the universal directives block. Skipping merge.",
        );
      } else {
        const mergedContent = `${existingContent}\n\n# --- UNIVERSAL AGENT DIRECTIVES ---\n\n${agentsMdContent}`;
        await fs.writeFile(destAgentsMd, mergedContent);
        console.log(
          "✓ Integrated universal directives into existing AGENTS.md",
        );
      }
    } else {
      // Overwrite/Write new
      await fs.writeFile(destAgentsMd, agentsMdContent);
      console.log("✓ Wrote AGENTS.md");
    }

    // Handle Agent-Typical Rule Files Redirection
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

    const redirectComment = `\n\n# ==============================================================================\n#                 Universal AI Agent & Copilot Redirection\n# ==============================================================================\n# This workspace utilizes a unified cognitive rule-structure. To prevent context \n# drift, hallucinations, or anti-hallucination rule violations, ALL AI agents \n# (Cursor, Copilot, Windsurf, Gemini, Cline, Roo Code, etc.) working inside this\n# codebase MUST read, internalize, and strictly prioritize:\n# \n# 1. The master root mandates in: AGENTS.md\n# 2. The compiled, flattened specialized skills in: .agents/skills/\n# ==============================================================================\n`;

    for (const ruleFile of agentRuleFiles) {
      const destRulePath = path.join(targetDir, ruleFile);
      let ruleFileExists = false;
      try {
        await fs.access(destRulePath);
        ruleFileExists = true;
      } catch {}

      // ONLY process files that already exist to prevent polluting the workspace with unused rule files!
      // EXCEPTION: .github/copilot-instructions.md is created even if it doesn't exist.
      if (!ruleFileExists && ruleFile !== ".github/copilot-instructions.md")
        continue;

      try {
        // Ensure parent directory exists (e.g. for .github/copilot-instructions.md)
        await fs.mkdir(path.dirname(destRulePath), { recursive: true });

        if (!overwriteMode && ruleFileExists) {
          // Safe Merge: Append redirection if not already present
          let existingRuleContent = await fs.readFile(destRulePath, "utf-8");
          if (
            !existingRuleContent.includes(
              "Universal AI Agent & Copilot Redirection",
            )
          ) {
            await fs.writeFile(
              destRulePath,
              existingRuleContent + redirectComment,
            );
            console.log(
              `✓ Merged redirection pointer into existing ${ruleFile}`,
            );
          } else {
            console.log(
              `! ${ruleFile} already contains redirection. Skipping.`,
            );
          }
        } else {
          // Overwrite mode or new file creation: Replace/write completely with redirection pointer
          await fs.writeFile(destRulePath, redirectComment);
          if (ruleFileExists) {
            console.log(
              `✓ Overwrote existing ${ruleFile} with clean redirection pointer`,
            );
          } else {
            console.log(
              `✓ Created new ${ruleFile} with clean redirection pointer`,
            );
          }
        }
      } catch (err) {
        console.warn(
          `\n⚠ WARNING: Could not write redirection to ${ruleFile}: ${err.message}`,
        );
        console.warn(
          `Please manually paste the following redirection block into your ${ruleFile} file:\n`,
        );
        console.warn(redirectComment);
      }
    }

    // Handle Skills (Compile with Includes and Copy Assets)
    for (const file of selectedFiles) {
      const moduleItem = modules.find((m) => m.name === file || m.key === file);
      if (moduleItem) {
        await installSingleSkill(moduleItem, targetDir, overwriteMode, modules);
      }
    }

    // Handle Scripts if exist
    let scriptsCopied = 0;
    try {
      const files = await fs.readdir(templateScripts);
      if (files.length > 0) {
        await fs.mkdir(destScripts, { recursive: true });
        for (const file of files) {
          const srcPath = path.join(templateScripts, file);
          const destPath = path.join(destScripts, file);
          await fs.copyFile(srcPath, destPath);
          await fs.chmod(destPath, 0o755); // Make scripts executable
          scriptsCopied++;
        }
        console.log(
          `✓ Copied ${scriptsCopied} utility scripts to .agents/scripts/`,
        );
      }
    } catch {}

    console.log("\n=============================================");
    console.log("   Installation completed successfully!      ");
    console.log("=============================================\n");
  } catch (err) {
    console.error(`✗ Installation failed: ${err.message}`);
    process.exit(1);
  }
}

// Main Orchestrator and Commander Entry Point
async function main() {
  let modules;
  try {
    modules = await loadModules();
  } catch (err) {
    console.error(`✗ Failed to load skills manifest: ${err.message}`);
    process.exit(1);
  }

  program
    .name("agent-setup")
    .description(
      "Deterministic, universal agent scaffolding and modular skills installer",
    )
    .version("1.0.0");

  // Root level options for the default/init flow to maintain exact backwards compatibility
  program
    .option("-t, --target <directory>", "target installation directory")
    .option("-m, --mode <mode>", "installation mode (safe | overwrite)")
    .option(
      "-s, --skills <skills>",
      "comma-separated list of skill IDs or 'all'",
    )
    .option("-y, --yes", "skip interactive confirmation prompt")
    .option("-u, --uninstall", "uninstall agent setup from target directory")
    .action(async (options) => {
      await runInstaller(options, modules);
    });

  const skillCmd = program
    .command("skill")
    .description("Manage skills within the project");

  skillCmd
    .command("list")
    .description("List all available skills from the manifest")
    .action(() => {
      console.log("\n=============================================");
      console.log("           Available Skill Modules           ");
      console.log("=============================================\n");
      modules.forEach((m) => {
        console.log(
          `- ID: ${m.key.padEnd(28)} (Index: ${m.id}) [v${m.version}]`,
        );
        console.log(`  Description: ${m.desc}`);
        console.log(`  Tags:        ${m.tags.join(", ")}`);
        console.log(`  Required:    ${m.required ? "Yes" : "No"}\n`);
      });
    });

  skillCmd
    .command("add <id>")
    .description("Install a specific skill directly into the target project")
    .action(async (id) => {
      const globalOpts = program.opts();
      const originalCwd = process.env.INIT_CWD || process.cwd();
      const targetDir = path.resolve(
        originalCwd,
        expandHomeDir(globalOpts.target || "."),
      );
      const overwriteMode =
        (globalOpts.mode || "safe").toLowerCase() === "overwrite";

      // Match selected ID/Key or numeric Index
      const moduleItem = modules.find((m) => m.key === id || m.id === id);
      if (!moduleItem) {
        console.error(`✗ Error: Skill "${id}" not found in the manifest.`);
        process.exit(1);
      }

      console.log(`Installing skill "${moduleItem.key}" into ${targetDir}...`);
      await installSingleSkill(moduleItem, targetDir, overwriteMode, modules);
      console.log("✓ Done.");
    });

  skillCmd
    .command("update")
    .description("Re-compile and update all currently installed skills")
    .action(async () => {
      const globalOpts = program.opts();
      const originalCwd = process.env.INIT_CWD || process.cwd();
      const targetDir = path.resolve(
        originalCwd,
        expandHomeDir(globalOpts.target || "."),
      );

      const destAgents = path.join(targetDir, ".agents");
      const isGlobalInstall = path.basename(targetDir).startsWith(".");
      const destSkills = isGlobalInstall
        ? path.join(targetDir, "skills")
        : path.join(destAgents, "skills");

      try {
        await fs.access(destSkills);
      } catch {
        console.error(
          `✗ Error: No installed skills folder found at ${destSkills}. Run init first.`,
        );
        process.exit(1);
      }

      console.log(`Scanning installed skills in ${destSkills}...`);
      const installedFolders = await fs.readdir(destSkills);
      let updatedCount = 0;

      for (const folder of installedFolders) {
        // Find matching skill by directory name (which matches the key)
        const moduleItem = modules.find((m) => m.key === folder);
        if (moduleItem) {
          console.log(`Updating skill: ${folder}...`);
          await installSingleSkill(moduleItem, targetDir, true, modules); // Always overwrite on update
          updatedCount++;
        }
      }

      if (updatedCount === 0) {
        console.log("No recognized skills found to update.");
      } else {
        console.log(`\n✓ Successfully updated ${updatedCount} skill(s).`);
      }
    });

  await program.parseAsync(process.argv);
}

main();
