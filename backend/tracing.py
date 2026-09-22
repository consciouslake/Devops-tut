"""OpenTelemetry setup — traces the /chat path (embed -> Qdrant search -> Gemini
generation) to a self-hosted Tempo instance. No Application Insights, no per-GB
billing: Tempo runs as a plain container in docker-compose, same cost-conscious
pattern as the rest of this project's observability stack.
"""

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from config import settings

_tracer = trace.get_tracer("azureops-copilot")


def setup_tracing(app) -> None:
    if not settings.otel_enabled:
        return
    provider = TracerProvider(resource=Resource.create({"service.name": "azureops-copilot-backend"}))
    provider.add_span_processor(
        BatchSpanProcessor(OTLPSpanExporter(endpoint=settings.otel_exporter_otlp_endpoint, insecure=True))
    )
    trace.set_tracer_provider(provider)
    FastAPIInstrumentor.instrument_app(app)


def get_tracer():
    return _tracer
