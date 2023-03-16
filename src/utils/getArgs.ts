import Yargs from "yargs";
import { hideBin } from "yargs/helpers";

export function getArgs() {
    return Yargs(hideBin(process.argv)).parseSync();
}