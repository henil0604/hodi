import inquirer from "inquirer"

export default async function prompt(data: any) {
    const res = await inquirer.prompt([{
        ...data,
        name: "answer"
    }])
    return res.answer
}