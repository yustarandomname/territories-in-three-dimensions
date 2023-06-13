import type { HyperParameters } from "./gpuStore";

export function convertToCSV<T extends Object>(arr: T[]) {
    const keys = [Object.keys(arr[0]).toString()];

    const values = arr.map(it => {
        return Object.values(it).toString()
    })

    return keys.concat(values).join('\n');
}

export function convertToCSVAndDownload<T extends Object>(arr: T[], hyperParamers: HyperParameters) {
    const csv = convertToCSV(arr)

    let j = document.createElement("a")
    j.download = hyperParamers.toString() + ".csv"
    j.href = URL.createObjectURL(new Blob([csv]))
    j.click();
    j.remove();
}