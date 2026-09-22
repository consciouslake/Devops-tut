import { DCOLORS, DiagramFrame, Node, ArrowMarkerDefs } from './DiagramShared'

// Animated with plain SVG (animateMotion + a dashed, scrolling stroke) --
// no charting or 3D library. See Module 14 Chapter 1 for why Three.js
// was considered and rejected for this: this is 2D relationship/flow
// information, and a moving dot along a path reads instantly, no camera
// controls or WebGL needed.
const PATH = 'M 90 190 L 230 190 L 230 100 L 380 100 L 380 190 L 530 190 L 530 100 L 680 100 L 680 190 L 830 190'

function FlowLine({ d }: { d: string }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={DCOLORS.db}
      strokeWidth={2}
      strokeDasharray="6 6"
      opacity={0.55}
      className="flow-line"
    />
  )
}

export function RequestFlowDiagram() {
  return (
    <DiagramFrame
      title="Request Flow — a real /chat query"
      description="One real chat query, end to end. The moving dot traces the actual path a request takes right now on the live site."
      minWidth={900}
    >
      <svg viewBox="0 0 900 260" width="100%" height="260">
        <ArrowMarkerDefs />
        <FlowLine d={PATH} />
        <circle r={5} fill={DCOLORS.db}>
          <animateMotion dur="6s" repeatCount="indefinite" path={PATH} />
        </circle>

        <Node x={20} y={165} w={140} h={50} label="Browser" sub="wss://devopspk.online" color={DCOLORS.textDim} bg="rgba(255,255,255,0.03)" />
        <Node x={160} y={75} w={140} h={50} label="Traefik + WAF" sub="TLS, ModSecurity" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={310} y={165} w={140} h={50} label="backend pod" sub="rate limit check" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={460} y={75} w={140} h={50} label="Key Vault" sub="secrets (at boot)" color={DCOLORS.azure} bg={DCOLORS.azureBg} />
        <Node x={610} y={165} w={140} h={50} label="Qdrant" sub="vector search" color={DCOLORS.db} bg={DCOLORS.dbBg} />
        <Node x={760} y={75} w={130} h={50} label="Gemini API" sub="generate answer" color={DCOLORS.ext} bg={DCOLORS.extBg} />
      </svg>
    </DiagramFrame>
  )
}
