ƒ = require "prelude-ls"
{exec} = require "shelljs"
{prompt} = require "inquirer"
co = require "co"
{red} = require "chalk"

log = (a, ...b) ~>
  console.log ...[a, ...b]
  return b.0

get-installed = (type) ->
  exec "brew #{type}" {+silent}
  |> (.stdout)
  |> (.trim!)
  |> (/ "\n")

remove-formulae = do ->
  i = 0

  co.wrap (formulae) !->*
    formulae-string = formulae * ", "
    formulae-command-list = formulae * " "
    inquiry =
      prompt [{
        type: \confirm
        name: \answer
        message: "Step #{++i}: Going to remove #{red formulae-string}"
        default: yes
      }]
    if (yield inquiry).answer is no
      process.exit!
    exec "brew uninstall #{formulae-command-list}"

co ->*
  installed-leaves = get-installed \leaves
  installed-all = get-installed \ls

  inquiry =
    prompt [{
      type: \checkbox
      name: \remove
      message: "Choose formulae to remove"
      choices: installed-leaves
    }]

  will-remove-leaves = (yield inquiry).remove
  will-keep-leaves = ƒ.difference installed-leaves, will-remove-leaves

  until will-remove-leaves.length is 0
    yield remove-formulae will-remove-leaves
    will-remove-leaves = ƒ.difference (get-installed \leaves), will-keep-leaves

  ƒ.difference installed-all, (get-installed \ls)
  |> (* ", ")
  |> red

.then log "Finished"
.catch log "Error"
