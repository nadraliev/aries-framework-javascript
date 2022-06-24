import type { DIDDoc, DIDResolver } from 'didcomm'
import { Lifecycle, scoped } from 'tsyringe'
import { AriesFrameworkError } from '../../../error'
import { DidCommService, DidCommV2Service, DidResolverService, IndyAgentService, VerificationMethod } from '../../../modules/dids'

@scoped(Lifecycle.ContainerScoped)
export class DIDResolverService implements DIDResolver {
  private resolverService: DidResolverService

  public constructor(resolverService: DidResolverService) {
    this.resolverService = resolverService
  }

  public async resolve(did: string): Promise<DIDDoc | null> {
    const result = await this.resolverService.resolve(did)
    if (!result.didDocument || !result.didDocument.verificationMethod.length) {
      throw new AriesFrameworkError(`Unable to resolve DIDDoc for ${did}`)
    }

    const verificationMethods = result.didDocument.verificationMethod.map((verificationMethod) =>
      DIDResolverService.mapVerificationMethod(verificationMethod)
    )

    const services = result.didDocument.service.map((service) => ({
      id: service.id,
      kind: service instanceof DidCommService || service instanceof DidCommV2Service
        ? {
          "DIDCommMessaging": {
            service_endpoint: service.serviceEndpoint,
            accept: service.accept || [],
            route_keys: service.routingKeys || [],
          }
        }
        : service instanceof IndyAgentService
          ? {
            "DIDCommMessaging": {
              service_endpoint: service.serviceEndpoint,
              accept: [],
              route_keys: service.routingKeys || [],
            }
          }
          : {
            "Other": {
              type: service.type,
              serviceEndpoint: service.serviceEndpoint,
            }
          }
    }))

    const didDod: DIDDoc = {
      did: result.didDocument.id,
      verification_methods: verificationMethods,
      services: services,
      key_agreements: [],
      authentications: [],
    }

    for (const keyAgreement of result.didDocument.keyAgreement) {
      if (typeof keyAgreement === 'string') {
        didDod.key_agreements.push(keyAgreement)
      } else {
        didDod.key_agreements.push(keyAgreement.id)
        didDod.verification_methods.push(DIDResolverService.mapVerificationMethod(keyAgreement))
      }
    }

    for (const authentication of result.didDocument.authentication) {
      if (typeof authentication === 'string') {
        didDod.authentications.push(authentication)
      } else {
        didDod.authentications.push(authentication.id)
        didDod.verification_methods.push(DIDResolverService.mapVerificationMethod(authentication))
      }
    }

    return didDod
  }

  private static mapVerificationMethod(verificationMethod: VerificationMethod) {
    return {
      id: verificationMethod.id,
      type: verificationMethod.type,
      controller: verificationMethod.controller,
      verification_material: verificationMethod.publicKeyBase58
        ? { format: 'Base58', value: verificationMethod.publicKeyBase58 }
        : verificationMethod.publicKeyMultibase
        ? { format: 'Multibase', value: verificationMethod.publicKeyMultibase }
        : verificationMethod.publicKeyHex
        ? { format: 'Hex', value: verificationMethod.publicKeyHex }
        : verificationMethod.publicKeyJwk
        ? { format: 'JWK', value: verificationMethod.publicKeyJwk }
        : {
            format: 'Other',
            value:
              verificationMethod.publicKeyPem ||
              verificationMethod.publicKeyBase64 ||
              verificationMethod.blockchainAccountId ||
              verificationMethod.ethereumAddress,
          },
    }
  }
}
