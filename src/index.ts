#!/usr/bin/env node

/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */
import fetchKitNames from '@/utils/fetchKitNames.js'
import prompt from '@/utils/prompt.js';
import { $Kits, fs } from '@/consts.js';
import ora from 'ora';
import chalk from 'chalk';
import fetchKit, { Ask } from '@/utils/fetchKit.js';
import replaceVariables from '@/utils/replaceVariables.js';
import copyAllSyncWithOverride from '@/utils/copyAllSyncWithOverride.js';
import runCommand from '@/utils/runCommand.js';

// Spinner
const Spinner = ora();

/* ----------------------------- Asking Location ---------------------------- */

const LocationAnswer = await prompt({
    type: "input",
    message: "Where do you want to create your project?",
    default: "."
})

const $Project = fs.openDir(LocationAnswer, { autoCreate: false })

if (LocationAnswer !== "." && $Project.exists) {

    const Confirm = await prompt({
        type: "confirm",
        message: "Directory already exists! Do you wanna remove it and continue?",
        default: false
    })

    if (Confirm) {
        Spinner.start(`Deleting ${chalk.blueBright($Project.absolutePath)}`)
        $Project.deleteSelf();
        Spinner.stop();
    }

    if (!Confirm) {
        console.log(chalk.redBright('ABORTING'))
        process.exit();
    }

}

/* --------------------------------- Action --------------------------------- */

let Action: string = '';
if (LocationAnswer === "." && $Project.listSync().length > 0) {
    Action = await prompt({
        type: 'list',
        message: "Current Directory is not empty!",
        choices: [
            {
                name: `Clean the Directory and Continue ${chalk.blueBright("(Recommended)")}`,
                value: "CLEAN_AND_CONTINUE"
            },
            {
                name: "Override files if conflicts",
                value: "OVERRIDE"
            },
            {
                name: "Abort",
                value: "ABORT"
            }
        ],
        default: "CLEAN_AND_CONTINUE"
    })

    if (Action === 'ABORT') {
        console.log(chalk.redBright('ABORTING'))
        process.exit();
    }

}

if (!$Project.exists) {
    $Project.createSync();
}


/* -------------------------------- Choosing Kit ------------------------------- */

const KitNames = fetchKitNames();

if (KitNames.length === 0) {
    console.log(`No Kits were found! Please Add kit at ${chalk.cyanBright($Kits.absolutePath)}`)
    console.log(chalk.redBright('ABORTING'))
    process.exit();
}

const KitAnswer = await prompt({
    type: 'list',
    message: "Choose Kit",
    choices: [
        ...KitNames.map(kitName => {
            const kit = fetchKit(kitName)
            return {
                name: `${kit?.config?.name || kitName}${kit?.config?.description ? ` - (${kit.config.description})` : ""}`,
                value: kitName
            }
        })
    ],
})

const kit = fetchKit(KitAnswer);

if (!kit) {
    console.log(chalk.redBright('No Kit Found! ABORTING'))
    process.exit();
}

if (Action === 'CLEAN_AND_CONTINUE') {
    Spinner.start(`Cleaning ${chalk.blueBright($Project.absolutePath)}`)
    $Project.clearSync();
    Spinner.stop();
}

Spinner.start("Copying Kit");
kit.$kit.copyAllSync($Project)
if (Action === 'OVERRIDE') {
    copyAllSyncWithOverride(kit.$kit, $Project)
}

Spinner.text = `Removing ${chalk.cyanBright("hodi.json")}`
$Project.openFile("hodi.json").deleteSync();

Spinner.stop();

/* -------------------------- Asking For Variables -------------------------- */

if (kit.config?.variables) {
    const variables: { [key: string]: string } = {}

    for (const varName in kit.config.variables) {
        if (Object.prototype.hasOwnProperty.call(kit.config.variables, varName)) {
            const e = kit.config.variables[varName];
            if (!e || !e.message) { continue }

            const value = await prompt({
                message: e.message,
                validate: (value: string) => {
                    if (e?.required && value === "") {
                        return `This Field is required`;
                    }
                    return true;
                },
                default: e.required === false ? e.default : undefined
            })

            variables[varName] = value;
        }
    }

    replaceVariables($Project, variables)
}


/* ------------------------------- Ask Blocks ------------------------------- */

async function askForCommand(ask: Ask) {
    if (!ask || !ask.command) return;

    const confirm = await prompt({
        type: "confirm",
        message: `Do you want to run ${chalk.cyanBright(ask.command)}?`,
        default: ask.default
    })

    if (confirm) {
        await runCommand($Project, ask.command)
    }

    return confirm;
}


if (kit.config?.ask) {
    for (let i = 0; i < kit.config.ask.length; i++) {
        const ask = kit.config.ask[i];
        if (!ask) continue;

        if (ask.type === 'command') {
            if (!ask.command) continue;
            kit.config.ask[i] = {
                ...ask,
                _answer: await askForCommand(ask),
            }
        }

    }
}


if (kit.config?.postCommand) {
    await runCommand($Project, kit.config.postCommand)
}

/* -------------------------------------------------------------------------- */
/*                                    DONE                                    */
/* -------------------------------------------------------------------------- */


console.log(`
${chalk.cyanBright(kit.name)} was Initialized in ${chalk.cyanBright($Project.absolutePath)}
`)