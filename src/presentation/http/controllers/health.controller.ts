export class HealthController {
  status() {
    return {
      status: "ok",
      service: "oficina-api"
    };
  }
}
