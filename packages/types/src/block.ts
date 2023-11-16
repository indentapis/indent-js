export type Block = {
  displayName?: string
  spaceName?: string
  name?: string
  exec?: BlockExec
  spec?: BlockSpec
  state?: any
  props?: any
  labels?: BlockLabels
  ui?: BlockUI
  on?: any
}

export type BlockExec = {
  name?: string
}

export type BlockSpec = Record<string, BlockSpecValue>

export type BlockLabels = Record<string, string>

export type BlockSpecValue = {
  val?: any
  expr?: string
  block?: Block
}

export type BlockUI = {
  resolve: string
  props?: Record<string, any>
}