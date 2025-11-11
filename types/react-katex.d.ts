declare module 'react-katex' {
  import { Component } from 'react'

  export interface KatexProps {
    children?: string
    math?: string
    block?: boolean
    errorColor?: string
    renderError?: (error: Error | TypeError) => React.ReactNode
    settings?: {
      displayMode?: boolean
      throwOnError?: boolean
      errorColor?: string
      macros?: object
      colorIsTextColor?: boolean
      maxSize?: number
      maxExpand?: number
      strict?: boolean | string | Function
      trust?: boolean | Function
      fleqn?: boolean
      leqno?: boolean
      output?: 'html' | 'mathml' | 'htmlAndMathml'
    }
  }

  export class InlineMath extends Component<KatexProps> {}
  export class BlockMath extends Component<KatexProps> {}
}
