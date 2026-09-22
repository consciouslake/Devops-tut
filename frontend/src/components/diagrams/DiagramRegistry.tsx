import { SystemOverviewDiagram } from './SystemOverviewDiagram'
import { KubernetesClusterDiagram } from './KubernetesClusterDiagram'
import { NetworkingIdentityDiagram } from './NetworkingIdentityDiagram'
import { CiCdDiagram } from './CiCdDiagram'
import { RequestFlowDiagram } from './RequestFlowDiagram'
import { BackendComponentDiagram } from './BackendComponentDiagram'
import { FrontendComponentDiagram } from './FrontendComponentDiagram'
import { MonitoringComponentDiagram } from './MonitoringComponentDiagram'

const REGISTRY: Record<string, React.ComponentType> = {
  'system-overview': SystemOverviewDiagram,
  'k8s-cluster': KubernetesClusterDiagram,
  'networking-identity': NetworkingIdentityDiagram,
  'cicd-pipeline': CiCdDiagram,
  'request-flow': RequestFlowDiagram,
  'component-backend': BackendComponentDiagram,
  'component-frontend': FrontendComponentDiagram,
  'component-monitoring': MonitoringComponentDiagram,
}

export function Diagram({ id }: { id: string }) {
  const C = REGISTRY[id]
  if (!C) return null
  return <C />
}
