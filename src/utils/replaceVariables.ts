import getAllFilesInDirectory from "@/utils/getAllFilesInDirectory.js";
import chalk from "chalk";
import { Directory, File } from "filic";

export default function replaceVariables($dest: Directory, vars: { [key: string]: string }) {

    const files: File[] = getAllFilesInDirectory($dest);

    for (const varE in vars) {
        const value = vars[varE] as string;

        for (const file of files) {

            const pattern = `#${varE}#`

            if (file.readRawSync().includes(pattern)) {

                file.updateSync((content) => {
                    let newContent = content.replace(new RegExp(pattern, 'g'), value);
                    return newContent;
                })

                console.log(`Replaced ${chalk.cyanBright(pattern)} in ${chalk.cyanBright(file.absolutePath)} with ${chalk.cyanBright(vars[varE])}`);
            }

        }

    }

}