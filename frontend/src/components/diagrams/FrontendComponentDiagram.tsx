import { DCOLORS, DiagramFrame, Node, GroupBox, Arrow, ArrowMarkerDefs } from './DiagramShared'

export function FrontendComponentDiagram() {
  return (
    <DiagramFrame
      title="Component: frontend (React + nginx)"
      description="A static SPA build served by nginx, which also acts as the internal reverse proxy to the backend — the same nginx.conf pattern since Module 4."
      minWidth={820}
    >
      <svg viewBox="0 0 820 260" width="100%" height="260">
        <ArrowMarkerDefs />
        <GroupBox x={20} y={20} w={780} h={220} label="frontend pod" />

        <Node x={50} y={60} w={200} h={50} label="nginx" sub="serves built SPA" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={300} y={60} w={200} h={50} label="React app" sub="ModuleOverview / ChapterDetail" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={300} y={140} w={200} h={50} label="AIMentor.tsx" sub="WebSocket client" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={550} y={60} w={210} h={50} label="proxy_pass /ingest, /chat" sub="→ backend:8000, internal" color={DCOLORS.db} bg={DCOLORS.dbBg} />

        <Arrow x1={250} y1={85} x2={300} y2={85} label="static assets" />
        <Arrow x1={400} y1={110} x2={400} y2={140} />
        <Arrow x1={500} y1={165} x2={550} y2={90} label="wss://" />
        <Arrow x1={150} y1={60} x2={550} y2={60} dashed />
      </svg>
    </DiagramFrame>
  )
}
