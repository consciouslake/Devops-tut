import { DCOLORS, DiagramFrame, Node, DbNode, GroupBox, Arrow, ArrowMarkerDefs } from './DiagramShared'

export function KubernetesClusterDiagram() {
  return (
    <DiagramFrame
      title="Inside the k3s Cluster"
      description="The self-managed 3-node HA cluster, spanning app-vm1, app-vm2 (centralindia) and azureops-vm01 (southindia). Two namespaces, real databases called out explicitly."
      legend={[
        { color: DCOLORS.workload, label: 'Application workload' },
        { color: DCOLORS.db, label: 'Database / data store' },
      ]}
      minWidth={920}
    >
      <svg viewBox="0 0 920 460" width="100%" height="460">
        <ArrowMarkerDefs />

        <Node x={370} y={20} w={200} h={50} label="Traefik Ingress" sub="one public IP, path/host routed" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />

        <GroupBox x={30} y={100} w={430} h={340} label="namespace: azureops-copilot" />
        <Node x={60} y={130} w={170} h={46} label="waf-proxy" sub="ModSecurity CRS" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={280} y={130} w={150} h={46} label="frontend ×2" sub="React + nginx" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={280} y={200} w={150} h={46} label="backend ×2" sub="FastAPI, app-vm1 only" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <DbNode x={60} y={280} w={150} h={60} label="Qdrant" sub="VECTOR DATABASE" />
        <Node x={60} y={360} w={150} h={46} label="tempo" sub="trace storage" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />

        <GroupBox x={490} y={100} w={400} h={340} label="namespace: monitoring" />
        <Node x={520} y={130} w={150} h={46} label="Prometheus" sub="metrics" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={700} y={130} w={150} h={46} label="Grafana" sub="/grafana, PVC-backed" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={520} y={200} w={150} h={46} label="Alertmanager" sub="+ webhook receiver" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={700} y={200} w={150} h={46} label="Promtail ×3" sub="1 per node" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <DbNode x={520} y={280} w={150} h={60} label="Loki" sub="LOG DATABASE" />

        <Arrow x1={470} y1={70} x2={280} y2={130} label="/" />
        <Arrow x1={470} y1={70} x2={700} y2={130} label="/grafana" />
        <Arrow x1={145} y1={176} x2={355} y2={153} />
        <Arrow x1={355} y1={176} x2={355} y2={200} />
        <Arrow x1={355} y1={246} x2={135} y2={295} label="search" />
        <Arrow x1={355} y1={246} x2={135} y2={375} label="traces" />
        <Arrow x1={595} y1={280} x2={595} y2={246} />
        <Arrow x1={775} y1={200} x2={595} y2={310} />
        <Arrow x1={595} y1={176} x2={775} y2={176} />
      </svg>
    </DiagramFrame>
  )
}
