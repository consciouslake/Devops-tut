import { DCOLORS, DiagramFrame, Node, DbNode, GroupBox, Arrow, ArrowMarkerDefs } from './DiagramShared'

export function BackendComponentDiagram() {
  return (
    <DiagramFrame
      title="Component: backend (FastAPI)"
      description="What actually happens inside one backend pod, in order: secret loading at boot, then per-request rate limiting, retrieval, and generation."
      minWidth={880}
    >
      <svg viewBox="0 0 880 340" width="100%" height="340">
        <ArrowMarkerDefs />
        <GroupBox x={20} y={20} w={840} h={300} label="backend pod — main.py / rag.py / config.py" />

        <Node x={50} y={55} w={190} h={50} label="config.py" sub="boot: fetch secrets" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={280} y={55} w={190} h={50} label="Key Vault" sub="Managed Identity" color={DCOLORS.azure} bg={DCOLORS.azureBg} />

        <Node x={50} y={140} w={190} h={50} label="rate_limit.py" sub="sliding window, per IP" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={280} y={140} w={190} h={50} label="/ingest, /chat" sub="main.py routes" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />

        <Node x={280} y={220} w={190} h={50} label="rag.py: embed()" sub="Gemini embeddings" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <DbNode x={520} y={140} w={160} h={60} label="Qdrant" sub="VECTOR DATABASE" />
        <Node x={520} y={220} w={160} h={50} label="rag.py: generate()" sub="Gemini chat, streamed" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={720} y={55} w={130} h={50} label="tracing.py" sub="OTel → Tempo" color={DCOLORS.db} bg={DCOLORS.dbBg} />

        <Arrow x1={240} y1={80} x2={280} y2={80} />
        <Arrow x1={145} y1={105} x2={145} y2={140} />
        <Arrow x1={375} y1={190} x2={375} y2={220} />
        <Arrow x1={470} y1={245} x2={520} y2={170} label="search" />
        <Arrow x1={680} y1={245} x2={520} y2={245} />
        <Arrow x1={470} y1={165} x2={720} y2={80} dashed />
      </svg>
    </DiagramFrame>
  )
}
