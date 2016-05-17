#!/usr/bin/env coffee

require "shelljs/global"
require "colors"
Q = require "q"
inquirer = require "inquirer"

union = (arrs...) ->
  acc = []
  for arr in arrs
    acc = acc.concat arr or []
  acc
subtract = (main, arr) -> el for el in main when el not in arr
intersect = (one, two) -> el for el in one when el in two

Q.spawn ->
  graph = {}
  for formula in JSON.parse (exec "brew info --json=v1 --installed", silent: yes).stdout
    graph[formula.full_name] = formula
  
  installed = (formula for formula of graph)
  leaves = (exec "brew leaves", silent: yes).stdout.trim().split("\n")
  
  {keep} = yield inquirer.prompt
    name: "keep"
    type: "checkbox"
    message: "Choose formulae to keep"
    choices: leaves
    default: leaves
  
  remove = subtract leaves, keep
  console.log "\nGoing to remove", remove.join(" ").yellow
  
  keepAllSet = new Set keep or []
  prevSize = keepAllSet.size
  i = 0
  
  loop
    for name in Array.from keepAllSet.values()
      formula = graph[name]
      continue if not formula?
      
      deps = union formula.dependencies, formula.recommended_dependencies, formula.optional_dependencies
      for dep in deps
        keepAllSet.add dep
    
    if keepAllSet.size isnt prevSize
      prevSize = keepAllSet.size
      continue
    else
      break
  
  keepAll = Array.from keepAllSet
  removeAll = subtract installed, keepAll
  
  console.log "Please run"
  console.log "$", " brew uninstall --force #{removeAll.join " "}".magenta
  