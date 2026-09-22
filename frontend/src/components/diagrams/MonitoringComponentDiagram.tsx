import { DCOLORS, DiagramFrame, Node, DbNode, GroupBox, Arrow, ArrowMarkerDefs } from './DiagramShared'

export function MonitoringComponentDiagram() {
  return (
    <DiagramFrame
      title="Component: the self-hosted PLG + tracing stack"
      description="Every arrow here is a real, verified data path — metrics, logs, traces and alerts, all self-hosted at $0 marginal cost."
      legend={[{ color: DCOLORS.workload, label: 'Collector / UI' }, { color: DCOLORS.db, label: 'Storage' }]}
      minWidth={880}
    >
      <svg viewBox="0 0 880 300" width="100%" height="300">
        <ArrowMarkerDefs />

        <Node x={30} y={40} w={150} h={46} label="node-exporter ×3" sub="host metrics" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={30} y={120} w={150} h={46} label="kube-state-metrics" sub="k8s object state" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={30} y={200} w={150} h={46} label="Promtail ×3" sub="log shipping" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={30} y={250} w={150} h={40} label="backend OTel SDK" sub="traces" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />

        <DbNode x={250} y={40} w={140} h={60} label="Prometheus" sub="METRICS DB" />
        <DbNode x={250} y={190} w={140} h={60} label="Loki" sub="LOG DATABASE" />
        <DbNode x={250} y={250} w={140} h={40} label="Tempo" sub="TRACE DB" />

        <Node x={470} y={70} w={150} h={46} label="Alertmanager" sub="routes alerts" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={470} y={150} w={150} h={46} label="webhook receiver" sub="real notification" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={680} y={110} w={170} h={60} label="Grafana" sub="/grafana — 3 datasources" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />

        <Arrow x1={180} y1={63} x2={250} y2={63} />
        <Arrow x1={180} y1={143} x2={250} y2={70} />
        <Arrow x1={180} y1={223} x2={250} y2={220} />
        <Arrow x1={180} y1={270} x2={250} y2={270} />
        <Arrow x1={320} y1={100} x2={320} y2={190} label="alerts" />
        <Arrow x1={390} y1={93} x2={470} y2={93} />
        <Arrow x1={545} y1={116} x2={545} y2={150} />
        <Arrow x1={390} y1={70} x2={680} y2={130} />
        <Arrow x1={390} y1={220} x2={680} y2={150} />
        <Arrow x1={390} y1={270} x2={680} y2={165} />
      </svg>
    </DiagramFrame>
  )
}
