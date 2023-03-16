import { $Kits } from "@/consts.js"
import { Directory, EntityTypes } from "filic"

export default function fetchKitNames() {
    const KitsDirectories = $Kits.listSync().filter(kit => {
        if (kit.type === EntityTypes.DIR) { return true }
        return false;
    }) as Directory[]

    return KitsDirectories.map($kit => {
        return $kit.dirname;
    })
}