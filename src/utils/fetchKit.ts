import { $Kits } from "@/consts.js";
import { Directory, File } from "filic";

export interface Variable {
    message: string
    required?: boolean,
    default?: string
}

export interface Ask {
    type: 'command',
    command?: string,
    default?: boolean,
    _answer?: boolean
}

export interface KitConfig {
    name?: string
    description?: string,
    variables?: {
        [key: string]: Variable
    },
    ask?: Ask[],
    devCommand?: string,
    postCommand?: string
}

export interface Kit {
    name: string,
    $kit: Directory,
    $config: File,
    config: Partial<KitConfig>
}

export default function fetchKit(kitName: string) {

    const $kit = $Kits.openDir(kitName, {
        autoCreate: false
    })

    if ($kit.exists === false) return null;

    const $config = $kit.openFile("hodi.json", {
        autoCreate: false
    })

    if ($config.exists === false || $config.readRawSync() === "") {
        $config.createSync().writeSync({});
    }

    const kit: Kit = {
        name: kitName,
        $kit,
        $config,
        config: $config.readSync().toJSON() || {}
    };

    return kit;
}