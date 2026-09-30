export class CertificateState {
  enter(context) {
    context.actions.showCertificate(context.event?.winner);
  }
}
