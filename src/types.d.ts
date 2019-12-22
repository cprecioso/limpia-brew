export interface InstalledFormula {
  name: string
  full_name: string
  oldname?: string
  aliases: string[]
  versioned_formulae: string[]
  desc: string
  homepage: string
  versions: Versions
  revision: number
  version_scheme: number
  bottle: Bottles
  keg_only: boolean
  bottle_disabled: boolean
  options: Option[]
  build_dependencies: string[]
  dependencies: string[]
  recommended_dependencies: string[]
  optional_dependencies: string[]
  uses_from_macos: string[]
  requirements: Requirement[]
  conflicts_with: string[]
  caveats?: string
  installed: Installed[]
  linked_keg?: string
  pinned: boolean
  outdated: boolean
}

export interface Versions
  extends Record<"stable" | "devel" | "head", string | null> {
  bottle: boolean
}

export interface Bottles extends Record<string, Bottle> {}

export interface Bottle {
  rebuild: number
  cellar: string
  prefix: string
  root_url: string
  files: Files
}

export interface Files extends Record<string, File> {}

export interface File {
  url: string
  sha256: string
}

export interface Option {
  option: string
  description: string
}

export interface Requirement {
  name: string
  cask: any
  download: any
}

export interface Installed {
  version: string
  used_options: any[]
  built_as_bottle: boolean
  poured_from_bottle: boolean
  runtime_dependencies?: RuntimeDependency[]
  installed_as_dependency: boolean
  installed_on_request: boolean
}

export interface RuntimeDependency {
  full_name: string
  version: string
}
