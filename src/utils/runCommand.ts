import { Directory } from "filic";
import { $ } from 'execa';
import chalk from "chalk";

export default async function runCommand($target: Directory, command: string) {

    const $$ = await $({ stdio: 'inherit', cwd: $target.absolutePath, shell: true });

    console.log(`\n> ${command}`)

    try {
        await $$`${command}`;
    } catch (e) {
        console.log(chalk.red(`\nFailed to run ${chalk.redBright(command)}`))
    }

}