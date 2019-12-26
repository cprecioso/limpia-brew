import { DGraph } from "@thi.ng/dgraph"
import chalk from "chalk"
import enquirer from "enquirer"
import execa from "execa"
import { InstalledFormula } from "./types"

function* depsOfFormula(formula: InstalledFormula) {
  yield* formula.dependencies
  yield* formula.optional_dependencies
  yield* formula.recommended_dependencies
}

interface Formula extends InstalledFormula {
  keep: boolean
}

function keepSubtree<T extends { keep: boolean }>(graph: DGraph<T>, node: T) {
  node.keep = true
  for (const dep of graph.transitiveDependencies(node)) {
    dep.keep = true
  }
}

function getUnkeptNodes<T extends { keep: boolean }>(graph: DGraph<T>) {
  return [...graph.nodes().values()].filter(f => !f.keep)
}

enum Choice {
  Continue = "y",
  Abort = "n",
  Edit = "e"
}

const indicator = () => ({ on: "◉", off: "◯" })

void (async function main() {
  const { stdout } = await execa("brew", ["info", "--installed", "--json"])
  const data = JSON.parse(stdout) as InstalledFormula[]
  const formulaeMap = new Map(
    data.map(f => [f.name, { ...f, keep: false } as Formula])
  )

  const dgraph = new DGraph<Formula>()
  for (const formula of formulaeMap.values()) {
    dgraph.addNode(formula)
    for (const depName of depsOfFormula(formula)) {
      if (formulaeMap.has(depName)) {
        dgraph.addDependency(formula, formulaeMap.get(depName)!)
      }
    }
  }

  const selectedLeaves = new Set<string>(
    (
      await enquirer.prompt({
        type: "multiselect",
        name: "selectedLeaves",
        message: "Choose formulae to remove",
        // @ts-ignore
        indicator,
        choices: [...dgraph.leaves()].map(l => l.name)
      })
    ).selectedLeaves
  )

  if (selectedLeaves.size === 0) process.exit(0)

  for (const leaf of dgraph.leaves()) {
    if (!selectedLeaves.has(leaf.name)) {
      keepSubtree(dgraph, leaf)
    }
  }

  const removeNodes = await confirmNodes(dgraph, formulaeMap)
  if (removeNodes.length === 0) process.exit(0)

  await execa("brew", ["uninstall", ...removeNodes.map(n => n.full_name)], {
    stdio: "inherit"
  })
})()

async function confirmNodes(
  dgraph: DGraph<Formula>,
  formulaeMap: Map<string, Formula>
): Promise<Formula[]> {
  const formulaeToRemove = getUnkeptNodes(dgraph)

  if (formulaeToRemove.length === 0) return []

  console.log(`
I will remove the following formulae
${formulaeToRemove
  .map(f => chalk.red("\t" + f.name))
  .sort()
  .join("\n")}`)

  const { confirmation } = await enquirer.prompt({
    type: "select",
    name: "confirmation",
    message: "Uninstall?",
    choices: Object.keys(Choice).map(choiceName => {
      const choiceValue = Choice[choiceName as keyof typeof Choice]
      return {
        name: choiceValue,
        message: choiceName,
        value: choiceValue
      }
    })
  })

  switch (confirmation) {
    case Choice.Abort: {
      return []
    }
    case Choice.Edit: {
      const whitelist = new Set<string>(
        (
          await enquirer.prompt({
            type: "multiselect",
            name: "whitelist",
            message: "Choose formulae to keep",
            // @ts-ignore
            indicator,
            choices: formulaeToRemove.map(f => ({ name: f.name }))
          })
        ).whitelist
      )
      for (const nodeName of whitelist) {
        keepSubtree(dgraph, formulaeMap.get(nodeName)!)
      }
      return confirmNodes(dgraph, formulaeMap)
    }
    case Choice.Continue: {
      return formulaeToRemove
    }
    default: {
      return []
    }
  }
}
